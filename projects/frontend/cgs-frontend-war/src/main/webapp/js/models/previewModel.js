define(['lodash', 'jquery', '../player/scp/players/dl/'+ window.scpConfig.dlVersion +'/player',
	'events', 'assets', 'repo', 'localeModel', 'files', 'busyIndicator'],
    function f2005(_, $, player, events, assets, repo, localeModel, files, busyIndicator) {
        var preview = {
            dlhost: null,
            previewDialog: null,
	        players: {},

            showPreviewDialog: function f1844(data, id, options) {
                var dialogConfig = {
                        closeIcon: true,

                        content: {
                        },

                        buttons: {
                        },

                        data: {
                            seqId: id,
                            repo: data
                        },
                        closeOutside: true,
                        playerConfig: options.playerConfig
                    };

                events.once('onPreviewClose', this.onPreviewClose, this);
                this.previewDialog = require('dialogs').create('preview', dialogConfig, 'onPreviewClose', options);
                    
            },

            closePreviewDialog: function f1845() {
                this.previewDialog && this.previewDialog.onDialogTerminated();
            },

            onPreviewClose: function f1846(response) {
                this.previewDialog = null;
                return false;
            },

            /*
            ******** playParams ********
            parent                  - parent DOM element for creating iframe into it
            width                   - player width
            height                  - player height
            data                    - sequence data to play
            seqId                   - sequence id
            localeNarrations        - locale narrations
            customizationPackPath   - customization pack path for design modification player
            playerConfig            - player config override
            */
            playDl: function f2010(playParams) {

                if (this.DLNotLoaded) {
                    require('lessonModel').isDlCrashed = true;
                    if (events.exists('render_next_sequence')) {
                        events.fire('render_next_sequence');
                    }
                    return;
                }

                // create data from sequence level and down, removing all others.
	            this.players[playParams.seqId] = {};
	            this.players[playParams.seqId].data = playParams.data;
	            this.players[playParams.seqId].seqId = playParams.seqId;

                var playerPath = window.location.href.split( "#" )[ 0 ].split('/');
                playerPath.pop();
                playerPath = playerPath.join('/') + "/player/scp/players/dl/" + window.scpConfig.dlVersion;
                var course = repo.get(require('courseModel').getCourseId());

                var playerInitData = _.extend({

                    // new + keep params
	                width: playParams.width,
	                height: playParams.height,
	                scale: 1,
	                volume: null,
	                viewMode: this.getSequenceViewMode(playParams.seqId),
	                basePaths: {
		                player: playerPath,
		                media: playParams.media || assets.serverPath("/"),
		                assetsPath: assets.serverPath("/"),
		                customizationPack: playParams.customizationPackPath || course.data.customizationPackManifest.baseDir + '/',
		                host: location.origin
	                },

                    //old params (get rid off)
                    complay: true,
                    locale: "en_US",
                    apiVersion: '1.0',
                    loId: 'inst_s',
                    isLoggingEnabled: true,
                    userInfo: {
                        role: 'student',
                        localeNarrations: playParams.localeNarrations 
                    }
                }, localeModel.getConfig('preview'));

                _.merge(playerInitData, playParams.playerConfig);

                $(playParams.parent).empty();

                this.dlhost = { api: function() {} };

                var dlPlayer = new player(this.dlhost, playParams.parent);

	            this.players[playParams.seqId].player = dlPlayer;

	            dlPlayer.api({
                    action: 'init',
                    data: playerInitData,
                    success: this.onPlayerInitiated.bind(this, this.players[playParams.seqId]),
                    error: function f2011() {
                        alert('player init error');
                    }
                });
            },

            onPlayerInitiated: function f2012(playerData) {

                var cleanData = {};

                cleanData[playerData.seqId] = playerData.data[playerData.seqId];

                console.log("[DL Simulator Data] --> " + JSON.stringify(cleanData));

                var playConfig = {
                    data: cleanData[playerData.seqId].convertedData,
                    id: playerData.seqId,
                    state: null,
	                firstTaskNumber: playerData.player.initData.firstTaskNumber
                };

                this.playSequence(playerData.player, playConfig);
            },

            playSequence: function f2013(player, playConfig) {
                player.api({
                    action: 'playSequence',
                    data: playConfig,
                    success: _.bind(function f2014(config) {
                        require('busyIndicator').stop();
                        return;
                    }, this),
                    error: function f2018(msg) {
                        logger.warn(logger.category.GENERAL, "preview error: " + msg);
                    }
                });
            },

            api: function f2019(config) {
                try {
                    console.log("API call from player --> " + JSON.stringify(config, null, '\t'));
                } catch (e) {
                    console.log("API call from player --> " + config);
                }
            },

            /**
             * returns the sequence view mode type
             */
            getSequenceViewMode: function f2020(seqId) {
                return require('lessonModel').isAssessmentClosure(seqId) ? 'ASSESSMENT_RUNTIME' : "NORMAL";
            },

	        /*
	         "taskNumbering": [
	         {"taskCid": "afb683eb-dd4a-4d16-af8e-9e2c7362e583", "taskNumber": "1"},
	         {"taskCid": "05c2d728-fa78-4c6c-814c-6f19af420e2f", "taskNumber": "2"}
	         ]
	         */
	        setTaskNumbering: function(dlPlayer, taskNumbering, callback) {
		        dlPlayer.api({
			        "action": "setTaskNumbering",
			        "data": {
				        "taskNumbering": taskNumbering
			        },
			        "success": callback,
			        "error": callback
		        });
	        },

            terminateSequence: function(dlPlayer, callback) {
                try {
	                dlPlayer.api({
                        action: 'terminateSequence',
                        data: null,
                        success: function() {
                            if (typeof callback == 'function') callback();
                        },
                        error: function(){
                            logger.warn(logger.category.GENERAL, { message: 'Sequence termination failed!', errorData: arguments });
                            if (typeof callback == 'function') callback();
                        }
                    });
                }
                catch(e) {
                    logger.warn(logger.category.GENERAL, { message: 'Sequence termination failed!', errorData: arguments });
                    if (typeof callback == 'function') callback();
                }
            },

	        terminatePlayer: function (seqId, callback) {

		        if(!this.players || !this.players[seqId]) {
			        callback && callback();
			        return;
		        }

		        var dlPlayer = this.players[seqId].player;

		        this.terminateSequence(dlPlayer, function (seqId) {
			        try {
				        dlPlayer.api({
					        action: 'terminate',
					        data: null,
					        success: function () {
						        delete this.dlhost;
						        delete this.players[seqId];
						        DLPlayerHost = null;
						        dlPlayer = null;
						        if (typeof callback == 'function') callback();
					        }.bind(this),
					        error: function () {
						        logger.warn(logger.category.GENERAL, {
							        message: 'Player termination failed!',
							        errorData: arguments
						        });

						        delete this.dlhost;
						        delete this.players[seqId];
						        DLPlayerHost = null;
						        dlPlayer = null;
						        if (typeof callback == 'function') callback();
					        }.bind(this)
				        });
			        }
			        catch (e) {
				        logger.warn(logger.category.GENERAL, {
					        message: 'Player termination failed!',
					        errorData: arguments
				        });

				        delete this.dlhost;
				        delete this.players;
				        this.players = {};
				        DLPlayerHost = null;
				        dlPlayer = null;
				        if (typeof callback == 'function') callback();
			        }
		        }.bind(this, seqId));
	        },

            terminatePlayers: function(callback) {
	            for (var seqId in this.players) {
		            this.terminatePlayer(seqId, callback);
	            }

	            if ((this.players && !this.players.length) && typeof callback == 'function') {
		            callback();
	            }
            }

        };

        return preview;
    });