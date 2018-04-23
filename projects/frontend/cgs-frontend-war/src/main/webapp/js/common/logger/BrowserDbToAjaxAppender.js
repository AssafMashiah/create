define(['jquery', 'lodash', 'log4javascript', 'browserDb', 'common/logger/config'],
    function ($, _, log4javascript, browserDb, config) {

        // BrowserDbToAjaxAppender stores log lines in browser database and sends it to server on timer.
        function BrowserDbToAjaxAppender() {
            this.init();
        }

        BrowserDbToAjaxAppender.prototype = _.extend(new log4javascript.Appender(), {
            layout: new log4javascript.NullLayout(),

            // Only for initialization - We set the level in userModel.init on main.js
            threshold: log4javascript.Level[config.logLevel],

            toString: function () {
                return "BrowserDbToAjaxAppender";
            },

            init: function () {
                this.server = null;
                var dbConsts = config.db;

 	            function afterServerResponseCallback(xmlhttp){
		            if(!xmlhttp) {
			            return;
		            }
		            var dateStr = xmlhttp.getResponseHeader('Date');
		            var serverTimeMillisUTC = Date.parse(new Date(Date.parse(dateStr)).toUTCString());
		            var localMillisUTC = Date.parse(new Date().toUTCString());

		            this.serverTimeOffset = (serverTimeMillisUTC - localMillisUTC);

		            browserDb.open({
			            server: dbConsts.name,
			            version: dbConsts.version,
			            schema: dbConsts.schema
		            }).done(function _browserDbOpen(server) {
			            this.server = server;

			            // Send whatever logs we already have on browser db to server
			            this.sendLogsToServer();

			            // Start the timer that sends log to the server
			            this.resetTimer();
		            }.bind(this));
	            }

	            this.initServerTime(afterServerResponseCallback.bind(this));
            },

            initServerTime: function (callback) {
                this.serverTimeOffset = 0;

                // We use the response to get server time, regardless of response contents
                var xmlhttp = new XMLHttpRequest();

	            xmlhttp.onreadystatechange = function() {
		            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			            callback(xmlhttp);
		            } else {
			            callback(null);
		            }
	            };

                xmlhttp.open("GET", [location.origin, config.serverTimeSyncUrl].join('/'));
                xmlhttp.send();
            },

            getServerTime: function () {
                var date = new Date();

                date.setTime(date.getTime() + this.serverTimeOffset);

                return date;
            },

            sendLogsToServer: function () {
                if (!this.server) {
                    console.warn('Cannot send logs to server - browser db server is not loaded!');
                } else {
                    // Get all log entries
                    this.server.logs
                        .query()
                        .all()
                        .execute()
                        .done(function (logs) {
                            if (logs.length) {
                            	logs = logs.slice(0, Math.min(logs.length, 6));
                                // Prepare a batch of logs for server ajax
                                var batchLogsIds = []; // This will be used to delete the sent logs from browser db
                                _.each(logs, function (logItem) {
                                    batchLogsIds.push(logItem.id);
                                    delete logItem.id;
                                });

                                var logAjaxConfig = {
                                    url: '/cgs/logging/logFrontEndData',
                                    type: 'POST',
                                    dataType: 'json',
                                    contentType: 'application/json',
                                    data: JSON.stringify(logs)
                                };

                                // Send the batch to server
                                $.ajax(logAjaxConfig)
                                    .done(function () {
                                        // Remove the batch from database
                                        _.each(batchLogsIds, function (batchLogsId) {
                                            this.server.logs.remove(batchLogsId);
                                        }.bind(this));
                                    }.bind(this))
                                    .always(function () {
                                        // Reset timer
                                        this.resetTimer();
                                    }.bind(this));
                            } else { // logs.length == 0
                                this.resetTimer();
                            }
                        }.bind(this));
                }
            },

            resetTimer: function () {
                clearTimeout(this.timer);

                // Send logs to server when timer hits
                this.timer = setTimeout(function () {
                    this.sendLogsToServer();
                }.bind(this), config.flushInterval);
            },

            // This is called when logger is used
            append: function (loggingEvent) {
                if (!this.server) {
                    console.warn('Cannot append logs to server - browser db server is not loaded!');
                } else {

                    try {
                        // Check that logger was used correctly
                        if (loggingEvent.messages && loggingEvent.messages.length == 2) {
                            var loggingCategory = loggingEvent.messages[0];
                            var data = loggingEvent.messages[1];

                            if (_.isString(data)) {
                                data = { message: data };
                            }

                            _.extend(data, {
                                courseId: require('courseModel').courseId,
                                lessonId: require('lessonModel').lessonId
                            });

                            var userModel = require('userModel');

                            // Store log in browser database
                            var log = {
                                accountId: userModel.account.accountId,
                                data: JSON.stringify(data, function(key, value){
                                    //file system contains a circular reference, so we dont want to have it in the stringfy function, to avoid error
                                    if(key == "filesystem"){
                                       return undefined;
                                    }
                                    return value;
                                }),
                                loggingCategory: loggingCategory,
                                logLevel: loggingEvent.level.name,
                                username: userModel.user.username,
                                currentUtcTime: this.getServerTime()
                            };

                            this.server.logs.add(log);

                        } else { // Wrong params in log call
                            logger.error(logger.category.LOGGER, "Wrong use of logger params: use log.error/warn/debug/...(logger.category.[category], data)")
                        }
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
            }
        });

        log4javascript.BrowserDbToAjaxAppender = BrowserDbToAjaxAppender;
    });
