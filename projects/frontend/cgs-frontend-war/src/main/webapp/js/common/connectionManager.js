'use strict';

define(['lodash', 'websocket', 'restDictionary', 'dao'], function(_, websocket, restDictionary, dao) {

    /******
     This manager is used for sending requests and getting the job progress information back.
     It uses websocket and job poller as a fallback.

     How to use
     ******
     var ch = connectionManager.init({
        postUrl: ..., // The url of the post request.
        websocketTopic: // Websocket topic to listen (optional).
     });
     ch.setPostData(...); // JSON object of post data.
     ch.setEventListener(...); // The callback function where you receive the job progress event.
     ch.open();  //Send the request.
     ******

     Response event structure
     ******
     {
        connectionType: xhr, job, websocket
        status: ERROR, PROGRESS, ABORTED, LOADED, COMPLETED
        body: // JSON object with response from the backend.
              // The response may be different for each connection type.
     }
     *******/

    var chInstance = null;
    const MAX_CONNECTION_ATTEMPTS = 5; // maximum attempts for connecting to the websocket
    const MAX_WAIT_TIME = 2; // maximum time of the websocket not responding in seconds

    // public constructor
    var initialization = function(config) {
        chInstance = new connectionManager(config);
        return chInstance;
    };

    // service constructor
	var connectionManager = function(config) {
        if (config) this.config = config;
        this.state = stateHandler.init();
    };

    // public methods
    connectionManager.prototype = {
        config: {
            postUrl: null,
            websocketTopic: null,
            isJson: false
        },
        getConfig: function() { return this.config; },
        postData: {}, // key-value pairs
        setPostData: function(postData) {
            this.postData = postData;
        },
        open: function() {
            var xhr = new XMLHttpRequest();
            xhr.addEventListener("load", xhrChangeHandler.bind(this));
            xhr.addEventListener("progress", xhrChangeHandler.bind(this));
            xhr.addEventListener("error", xhrChangeHandler.bind(this));
            xhr.addEventListener("abort", xhrChangeHandler.bind(this));
            xhr.upload.addEventListener("loadend", xhrChangeHandler.bind(this));
            xhr.upload.addEventListener("progress", xhrChangeHandler.bind(this));
            // var formData = new FormData();
            // for (var i in this.postData) {
            //     formData.append(i, this.postData[i]);
            // }
            var formData = JSON.stringify(this.postData);
            if (this.config.postUrl != null) {
                stateHandler.set({ connectionType: "xhr" });
                xhr.open("POST", this.config.postUrl);
                xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                xhr.send(formData);
                logger.info(logger.category.CONNECTION, 'XHR Request started.');
            } else {
                throw Error("No post url defined!");
            }
        },
        setEventListener: function(callback) {
            this.eventListener = callback;
        },
        abort: function() {
            jobHandler.clearPoller();
            websocketHandler.disconnect();
            //TODO: call abort api
        }
	};

	// private function
    var xhrChangeHandler = function(event) {
        if ((event.target.status >= 400 && event.target.status < 600) || event.type == "error") {
            logger.info(logger.category.CONNECTION, 'XHR post failed.');
            stateHandler.set({
                status: "ERROR",
                body: event
            });
        } else if (event.type == "progress") {
            stateHandler.set({
                status: "PROGRESS",
                body: event
            });
        } else if (event.target.status == 200 && event.type == "load") {
            var jobId = event.target.response;
            stateHandler.set({
                status: "LOADED",
                body: event
            });
            if (jobId) {
                jobHandler.setJobId(jobId);
                // start websocket
                websocketHandler.init(chInstance.config.websocketTopic, jobId);
            } else {
                stateHandler.set({
                    status: "ERROR",
                    body: "No job id found."
                });
            }
        } else if (event.type === "abort") {
            stateHandler.set({
                status: "ABORTED",
                body: event
            });
        }
    };

    //the handler for the job poller
    var jobHandler = {
    	pollerId: null,
    	config: {
    		path: restDictionary.paths.CHECK_JOB_PROGRESS,
			pathParams: {
				jobId: null
			}
    	},
        setJobId: function(id) {
            if (id != null) {
                this.config.pathParams.jobId = id;
            }
        },
    	init: function() {
			if (this.config.pathParams.jobId) {
                if (this.pollerId) this.clearPoller();
                websocketHandler.disconnect();
                logger.info(logger.category.CONNECTION, 'Job poller trying to start.');
                this.pollerId = setInterval(this.poller.bind(this), 500);
            }
        },
    	poller: function() {
			require("dao").remote(this.config, this.onSuccess.bind(this), this.onError.bind(this));
    	},
    	clearPoller: function() {
    		if (this.pollerId) {
    			clearInterval(this.pollerId);
    			this.pollerId = null;
                logger.info(logger.category.CONNECTION, 'Job poller cleared.');
            }
    	},
        isPollerActive: function() {
            return !!this.pollerId;
        },
        getJobId: function() {
          return this.config.pathParams.jobId;
        },
    	onSuccess: function(data) {
    		stateHandler.set({ connectionType: "job" });
            switch (data.status) {
                case 'ERROR':
                case 'FAILED':
                    stateHandler.set({
                        status: "ERROR",
                        body: data
                    });
                    this.clearPoller();
                    break;
                case 'COMPLETED':
                    stateHandler.set({
                        status: "COMPLETED",
                        body: data
                    });
                    this.clearPoller();
                    break;
                default:
                    stateHandler.set({
                        status: "PROGRESS",
                        body: data
                    });
            }
    	},
    	onError: function(message) {
            logger.info(logger.category.CONNECTION, 'Job poller error: ' + message);
            stateHandler.set({
                status: "ERROR",
                body: message
            });
            this.clearPoller();
        }
    };

    //the handler for the websocket
    var websocketHandler = {
    	topic: null,
    	jobId: null,
        connectionAttempts: 0,
        timeoutId: null,
    	init: function(topic, jobId) {
    		if (!topic) {
    			jobHandler.init();
    		}
			if (topic && jobId && this.connectionAttempts <= MAX_CONNECTION_ATTEMPTS) {
				this.topic = topic;
				this.jobId = jobId;
				this.connect();
			}
    	},
    	connect: function() {
            logger.info(logger.category.CONNECTION, 'Websocket trying to connect.');
            this.connectionAttempts++;
    		if (this.topic && this.jobId && this.connectionAttempts <= MAX_CONNECTION_ATTEMPTS) {
				if (!websocket.isConnected) {
					websocket.connect(function (isConnected) {
						if (isConnected) {
							websocket.subscribe(this.topic + '/' + this.jobId, function(){}, this.onError.bind(this));
                            this.setTimer()
						} else {
							this.connect();
						}
					}.bind(this));
				} else {
                    websocket.subscribe(this.topic + '/' + this.jobId, this.listen.bind(this), this.onError.bind(this));
                    this.setTimer();
				}
    		} else {
                jobHandler.init();
            }
    	},
    	listen: function(message) {
            if (jobHandler.isPollerActive() && this.isConnected()) {
                jobHandler.clearPoller();
            }
			switch (message.body.status) {
				case "COMPLETED":
					stateHandler.set({
                        connectionType: "websocket",
                        status: "COMPLETED",
                        body: message.body
					});
					this.disconnect();
					break;
				case "ERROR":
                case "FAILED":
					stateHandler.set({
                        connectionType: "websocket",
						status: "ERROR",
                        body: message.body
					});
					this.disconnect();
					break;
				default:
					stateHandler.set({
                        connectionType: "websocket",
						status: "PROGRESS",
						body: message.body
					});
			}
			this.setTimer();
    	},
        onError: function(message) {
            // If there is an error on websocket, fallback to the poller
            logger.info(logger.category.CONNECTION, 'Websocket connection failed: ' + message);
            jobHandler.init();
            this.disconnect();
        },
    	disconnect: function() {
            logger.info(logger.category.CONNECTION, 'Websocket disconnected.');
            if (this.timeoutId) clearTimeout(this.timeoutId);
    		websocket.disconnect();
    	},
        isConnected: function() {
            return websocket.isConnected;
        },
        setTimer: function() {
            // Clear connection in case of the websocket not responding
            if (this.timeoutId) clearTimeout(this.timeoutId);
            this.timeoutId = setTimeout(function() {
                logger.info(logger.category.CONNECTION, 'Websocket timeout.');
                this.disconnect();
                jobHandler.init();
            }.bind(this), MAX_WAIT_TIME * 1000);
        }
    };

    //the handler for the progress event
    var stateHandler = {
        state: {},
        init: function() {
            this.state = {};
            return this.state;
        },
        get: function() { return this.state; },
        set: function(state) {
            var isChanged = false;
            for (var i in state) {
                if (state.hasOwnProperty(i)) {
                    if (this.state[i] !== state[i]) {
                        isChanged = true;
                        break;
                    }
                }
            }
            if (isChanged) {
                Object.assign(this.state, state);
                if (chInstance.eventListener && typeof chInstance.eventListener === "function" && this.state.status) chInstance.eventListener(this.state);
            }
        }
    };

	return {
        init: initialization
    };
});
