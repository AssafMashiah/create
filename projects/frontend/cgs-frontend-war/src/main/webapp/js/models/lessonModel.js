define(["lodash", "repo", "dao", "restDictionary", "cgsUtil", "helpers", "repoValidation",
      'assets', 'events', 'editMode', 'busyIndicator', 'validate', 'json2xml', 'repo2livePage', 'validateUtil'],

    function f1906(_, repo, dao, restDictionary, util, helpers,  repoValidation, assets, events,
        editMode, busy, validate, json2xml, repo2livePage, validateUtil) {

        // How many times to try to acquire lock if lock request is aborted (because it's pending)
        var NUMBER_OF_LOCK_RETRY_ATTEMPTS = 3;

        // How much time to wait for lock server request
        var LOCK_SERVER_REQUEST_TIMEOUT = 20000; // milliseconds

        // How many sequences ids will be inserted in each packet
        var SEQUENCES_IDS_PACKET_MAX_SIZE = AuthenticationData.configuration.maxSequencesToDownloadPerRequestOnLessonOpen;

        /**
         *
         * @param id lesson id
         */
        function convertSequencesToXml(id) {

            logger.debug(logger.category.LESSON, 'Lesson\'s sequences conversion start');
            //merge all the sequences that should be converted to xml
            var sequences = getSequenceArray(id),
                convertedSuccessfully = true;

            var _changed_sequences = _.filter(sequences, function f1912(item) {
                return item.is_modified;
            });

            _.each(_changed_sequences, function f1913(item) {
                var validateJson = validate.isEditorContentValid(item.id, true),
                    data = {},
                    itemValidation = item.type != 'sequence' || !!_.filter(item.children,function (child) {
                        return ['header', 'sharedContent', 'help'].indexOf(repo.get(child).type) == -1;
                    }).length;

                repo.filterDataById(data, item.id);

                repo.startTransaction({ ignore: true });
                var livePageElements = _.filter(item.children, function (childId) {
                    return repo.get(childId).type.indexOf('livePage') == 0;
                });
                if (itemValidation) {
                    if (item.type == 'html_sequence' && livePageElements.length) {
                        var _converted_json = repo2livePage.convert(data, item.id);

                        if (_converted_json.hasError) {
                            repo.updateProperty(item.id, 'convertedData', null, true, false);
                        } else {
                            repo.updateProperty(item.id, 'convertedData', _converted_json.json_data, true, false);
                        }
                    }
                    else if (item.type == 'pluginContent') {
                        var pluginClassManager = require("pluginModel").getPluginByPath(item.data.path);
                        item.convertedData = pluginClassManager.invokeDataToPlayerConversion(data);
                    }
                    else {
                        var _converted_xml = json2xml.getXML(data, item.id);

                        if (_converted_xml.hasError) {
                            repo.updateProperty(item.id, 'convertedData', null, true, false);
                        } else {
                            repo.updateProperty(item.id, 'convertedData', _converted_xml.xml_data, true, false);
                        }
                    }
                }
                else {
                    if (item.convertedData) {
                        repo.updateProperty(item.id, 'convertedData', null, true, false);
                    }
                    convertedSuccessfully = false;
                }

                repo.updateProperty(item.id, 'is_modified', false, true, false);
                repo.endTransaction();

            });
            logger.debug(logger.category.LESSON, 'Lesson\'s sequences conversion end');
            return convertedSuccessfully;
        }

        function getSequenceArray(lessonId) {
            return _.filter(repo.getSubtreeRecursive(lessonId), function (rec) {
                return ['pluginContent', 'sequence', 'html_sequence', 'separator', 'url_sequence' , 'referenceSequence'].indexOf(rec.type) !== -1;
            });
        }

        // Private functions.

        function getLocalLessonFile(id, parseLocalFile) {
            var daoConfig = {
                path: restDictionary.paths.GET_TOC_ITEM,
                pathParams: _.defaults({
                    lessonId: id,
                    itemType: lessonModel.getLessonType(id),
                    fileSuffix: '.json'
                }, lessonModel.getBaseConfig())
            };

            // get local file content
            dao.getLocal(daoConfig, _.bind(function f1917(responseJson) {
                parseLocalFile(responseJson);
            }, lessonModel));
        }

        function getServerLessonFile(id, callback, local_lastModified, local_lessonJson) {
            var daoConfig = {
                    path: restDictionary.paths.GET_TOC_ITEM,
                    pathParams: _.defaults({
                        lessonId: id,
                        itemType: lessonModel.getLessonType(id)
                    }, lessonModel.getBaseConfig()),
                    data: {}
                },
                files = require('files'),
                savePath = files.coursePath(undefined, undefined, 'tocItems');

            if (local_lastModified && local_lastModified.indexOf("1970") == -1) {
                daoConfig.data['last-modified'] = local_lastModified;
            }

            // Start loading lesson.
            dao.remote(daoConfig, function f1918(lessonJson) {
                if (lessonJson) {
                    if (!local_lastModified && local_lessonJson) {
                        local_lessonJson.header = lessonJson.header;
                        lessonModel.setLessonHeader(id, lessonJson.header, true);
                        handleLocaleFile(id, local_lessonJson, function () {
                            callback && callback.apply(this, _.union(arguments, [true]));
                        });
                    }
                    else {
                        lessonModel.setLessonHeader(id, lessonJson.header, false);

                        files.saveObject(lessonJson, id + ".json", savePath, function f1919() {                        
                            downloadSequences(lessonJson, id, callback);
                        });
                    }
                }
                else { //users holds updated version of lesson file
                    handleLocaleFile(id, local_lessonJson, callback);
                }
            });
        }

        function getLocalSequencesFile(id, parseSequences) {
            var daoConfig = {
                path: {'path': '/publishers/{{publisherId}}/courses/{{courseId}}/sequences/{{lessonId}}'},
                pathParams: _.defaults({ lessonId: id, fileSuffix: '.json' }, lessonModel.getBaseConfig())
            };

            // get local file content
            dao.getLocal(daoConfig, _.bind(function f1921(responseJson) {
                parseSequences(responseJson);
            }, this));
        }

        function handleLocaleFile(id, lessonJSON, callback) {
            lessonModel.setLessonId(id);
            lessonModel.setDirtyFlag(false);

            //update lesson header with server data
            lessonModel.setLessonHeader(id, lessonJSON.header, false);

            function parseSequences(sequencesJSON) {
                
                if (sequencesJSON) {
                    downloadAssets(lessonJSON, sequencesJSON, callback);
                } else { //Can't load file from the local filesystem.
                    downloadSequences(lessonJSON, id, callback);
                }
            }

            //get local sequences file
            getLocalSequencesFile(id, parseSequences);
        }

        /**
         * Load lesson from server by id.
         * The control flow should be:
         * downloadLesson() -> downloadSequences() -> downloadAssets() -> callback()
         */
        function downloadLesson(id, server_lastModified, callback) {

            function serverLastModifiedScenario(lessonJson) {
                var localUpdated = false, local_lastModified = null;

                if (lessonJson && lessonJson.header && lessonJson.header["last-modified"]) {
                    // check local file's last modified
                    local_lastModified = lessonJson.header["last-modified"].$date;

                    if (Date.parse(local_lastModified) >= Date.parse(server_lastModified)) { // compare last modified
                        localUpdated = true;
                    }
                }

                if (localUpdated && lessonJson) { // if local lm is updated then server lm use local files
                    handleLocaleFile(id, lessonJson, callback);
                } else { // if server lm is updated then local lm download from server
                    getServerLessonFile(id, callback, local_lastModified, lessonJson);
                }
            }

            function nonServerLastModifiedScenario(lessonJson) {
                var local_lastModified = null;
                if (lessonJson && lessonJson.header && lessonJson.header["last-modified"]) {
                    // check local file's last modified
                    local_lastModified = lessonJson.header["last-modified"].$date;
                }

                //need to get last-modified from server
                getServerLessonFile(id, callback, local_lastModified, lessonJson);
            }

            // get lesson local file
            getLocalLessonFile(id, (!server_lastModified) ? nonServerLastModifiedScenario : serverLastModifiedScenario);
        }

        /**
         * Get sequences from server by lesson's id.
         */
        function downloadSequences(lessonJSON, id, callback) {
			var sequencesIds = lessonModel.getSequencesIds(lessonJSON);
            var files = require('files'),
                savePath = files.coursePath(undefined, undefined, 'sequences'),
                config = {
                    path: restDictionary.paths.GET_SEQUENCES,
                    pathParams: _.defaults({
                        lessonId: id,
                        itemType: lessonModel.getLessonType(id)
                    }, lessonModel.getBaseConfig())
                };

            function getSequencesFromServer() {
                var deferred = $.Deferred();
                dao.remote(config, function f1923(sequencesJSON) {
                    deferred.resolve(sequencesJSON);
                }, function(error) {
                    deferred.reject(error);
                });
                return deferred.promise();
            }

            function onComplete() {
                // Concat all the squences JSONs into one JSON object
                sequencesFromServer = [];
                while(arguments.length > 0) {
                    sequencesFromServer = sequencesFromServer.concat(Array.prototype.shift.apply(arguments));
                }

                // Save local sequences file
                files.saveObject(sequencesFromServer, id + ".json", savePath, function f1924() {
                    downloadAssets(lessonJSON, sequencesFromServer, callback);
                });
            }

            if (sequencesIds.length === 0) {
                files.saveObject([], id + ".json", savePath, function f1924() {
                    downloadAssets(lessonJSON, [], callback);
                });

                return;
            }

            var promises = [];
            for (var i = 0; i < sequencesIds.length ; i += SEQUENCES_IDS_PACKET_MAX_SIZE) {
                config.data = sequencesIds.slice(i, i + SEQUENCES_IDS_PACKET_MAX_SIZE);

                // Start loading sequences.
                promises.push(getSequencesFromServer());
            }

            $.when.apply($, promises).done(onComplete).fail(function(response) {
                require('showMessage').serverError.show(response);
            });
        }

        /**
         * Download assets.
         */
        function downloadAssets(lessonJSON, sequencesJSON, callback) {
            //var paths = _.chain(lessonJSON.resources).filter(function f1927(obj) {
            //        return (obj.type === "media" || obj.type === "attachment") && !obj.href.match(/^sequences\//);
            //    }).pluck("href").value();
            //
           // busy.setData('((Downloading lesson resources))', 0);

            // Start loading assets.
            //assets.downloadAssetsPack(paths, function() {
                busy.setData('((Downloading lesson resources))', 30);
                callback(lessonJSON, sequencesJSON);
            //}, function(loaded, total) {
            //    busy.setData('', loaded / total * 50);
            //}, function(extracted, total) {
            //    busy.setData('((lesson.open.progress.extract_resource)) (' + extracted + ' ((of)) ' + total + ')', 50 + extracted / total * 50);
            //});
        }

        /**
         * Saves the lesson document and the associate components : sequences 
         * @param id
         * @param callback
         */
        function saveJsonWithSequences(id, callback, sequences) {
            //generate save config
            logger.debug(logger.category.LESSON, 'Preparing lesson data for save');
            var params = _.defaults({
                    lessonId: id,
                    itemType: this.getLessonType(id)
                }, this.getBaseConfig()),
                remote = repo.getRemoteJson(),
                payload = _.find(remote.lessonsData, function f1929(obj, obj_id) {
                    return obj_id.indexOf(id) >= 0
                });
            if (payload.learningObjects) {
				for (var i = 0; i < payload.learningObjects.length; i++) {
					var lo = payload.learningObjects[i];
					if (lo.modality != "Class" && lo.modality != "Group" && lo.modality != "Partner" && lo.modality != "Individual") {
						delete lo.modality;
					}
				}
			}
			var config = {
				path: restDictionary.paths.SAVE_TOC_ITEM_CONTENTS,
				pathParams: params,
				data: {
					"courseId": params.courseId,
					"publisherId": params.publisherId,
					"tocItemCid": params.lessonId,
					"tocItemJson": JSON.stringify(payload || {}),
					"sequences": sequences
				}
			}, self = this;
				
				
				
                // Upload lesson jsons: lesson, sequences to the server (remote save)
                logger.info(logger.category.LESSON, 'Saving lesson to server');
                dao.remote(config, function f1933(header) {
                    logger.info(logger.category.LESSON, 'Lesson saved to server successfully');
                    
                    // Set new lesson header
                    lessonModel.setLessonHeader(params.lessonId, header, false);

                    // Update the payload with the new lesson header
                    payload.header = header;

                    // Re-stringify with the new header
                    config.data.tocItemJson = JSON.stringify(payload || {});

                    // update old lesson
                    repo._old_lesson = (payload || null);
                    if (repo._old_lesson) {
                        repo._old_lesson.header = header;
                    }

                    //save local lesson file
                    logger.debug(logger.category.LESSON, 'Save lesson data locally');
                    var daoConfig = {
                        path: restDictionary.paths.SAVE_TOC_ITEM,
                        pathParams: _.defaults({
                            lessonId: params.lessonId,
                            itemType: params.itemType,
                            fileSuffix: ".json"
                        }, self.getBaseConfig()),
                        data: config.data.tocItemJson
                    };

                    //local files saving
                    dao.setLocal(daoConfig, function f1930() {
                        //save sequences local file
                        daoConfig = {
                            path: restDictionary.paths.SAVE_SEQUENCES,
                            pathParams: _.defaults({
                                lessonId: params.lessonId,
                                itemType: params.itemType,
                                fileSuffix: '/' + params.lessonId + ".json"
                            }, self.getBaseConfig()),
                            data: config.data.sequences
                        };

                        dao.setLocal(daoConfig, function f1931() {
                            busy.stop();
                            callback();
                        });
                    });
                }, function f1933(error) {
                    logger.warn(logger.category.LESSON, { message: 'Lesson save failed', error: error && error.responseText || error });

                    self.saveInProgress = false;
                    busy.stop(true);

                    if (self.callbackOnEndOfSaveLesson && self.callbackOnEndOfSaveLesson.length > 0) {
                        self.callbackOnEndOfSaveLesson(true);
                    }

                    // error message
                    var showMessage = require('showMessage');

                    if (error.status != 0) {
                        showMessage.serverError.show(error);
                    }
                    else {
                        var showMessageData;
                        var lessonSaveFailTitle = 'lesson.save.fail.title';

                        try {
                            var responseText = JSON.parse(error.responseText);
                            var responseTextData = JSON.parse(responseText.data);

                            showMessageData = {
                                title:  lessonSaveFailTitle,
                                message: "The course is being published.<br><h5>((Course)):</h5>{0}<h5>((Published by user)):</h5>{1}".format(
                                    repo.get(responseTextData.courseId).data.title,
                                    responseTextData.publishUsername
                                )
                            };
                        } catch (e) {
                            showMessageData = {
                                title: lessonSaveFailTitle,
                                message: 'lesson.save.fail.message'
                            };
                        }

                        showMessage.clientError.show(showMessageData);
                    }

                });
        }

        /**
         * LessonModel is a relatively high-level API for handling lessons.
         */
        function LessonModel() {
            // Active lesson's id.
            this.lessonId = null;

            // Are there unsaved changes.
            this.dirtyFlag = false;

            // Wtf is this.
            this.editMode = editMode;

            // Lesson header.
            this.lessonHeader = {};

            //reference sequence mapping inside the lesson
            this.referenceSequenceMapping = {};

            // Set number of retry attempts for requesting lock during save
            this.lockRetryAttempts = 0;
        }

        // Public methods.
        _.extend(LessonModel.prototype, {

            /**
             * Returns an active lesson's id.
             * Throws Error if there is none.
             */
            getLessonId: function f1934() {
                if (!this.lessonId) {
                    throw new Error("Can't get lesson id.");
                }

                return this.lessonId;
            },
            setHidden: function f1935(val) {
                this.isHidden = !!val;
            },
            isHidden: function f1936() {
                return this.isHidden;
            },

            /**
             * Updates an active lesson's id.
             */
            setLessonId: function f1937(new_id) {
                this.lessonId = new_id;
                this.referenceSequenceMapping = {}; // re-initialize the lesson reference sequecne mapping 
                $.cookie('lessonId', this.lessonId);
            },

            /**
             * Updates an active lesson's original title.
             */
            setOriginalTitle: function f1937(title) {
                this.originalTitle = title;
            },

            /**
             * Reverts lesson title to original
             */
            revertTitle: function f1937() {
                repo.updateProperty(this.lessonId, 'title', this.originalTitle, false, true);
            },

            /**
             * Returns the base config for DAO.
             */
            getBaseConfig: function f1938() {
                var userModel = require("userModel"),
                    courseModel = require("courseModel");

                return {
                    publisherId: userModel.getPublisherId(),
                    courseId: courseModel.getCourseId()
                };
            },

            /**
             * Returns a list of the lesson's sequences ids.
             */
            getSequencesIds: function(lessonJSON) {
                var sequencesIds = [];
                switch(lessonJSON.type) {
                    case 'lesson':
                        if (lessonJSON.hasOwnProperty('learningObjects')) {
                            _.each(lessonJSON.learningObjects, function(lo) {
                                var sequences = [];
                                if (lo.type === 'loItem' && lo.hasOwnProperty('item') && lo.item.hasOwnProperty('sequences')) {
                                    sequences = util.cloneObject(lo.item.sequences);
                                }
                                else if (lo.type === 'lo' && lo.hasOwnProperty('sequences')) {
                                    sequences = util.cloneObject(lo.sequences);
                                }

                                for (var i = sequences.length - 1 ; i >= 0 ; i--) {
                                    sequence = sequences[i];
                                    if (sequence.type === 'differentiatedSequenceParent') {
                                        // remove the differentiatedSequenceParent sequence from the list of sequences we need to fetch from serever because it's not a saved entity
                                        sequences.splice(i, 1);
                                        sequences = sequences.concat(_.pluck(sequence.levels, 'sequence'));
                                    }
                                }
								// add sequnces from Overlay elements
								if (lo && lo.pages && lo.pages.length > 0) {
									lo.pages.forEach(function(page) {
										if (page.overlayElements.length > 0) {
											page.overlayElements.forEach(function(overlayElement) {
												if (overlayElement.content.type == 'DL_SEQUENCE') {
													sequences.push({cid: overlayElement.content.data.cid });
												}
											});
										}
									});
								}

                                sequencesIds = sequencesIds.concat(_.pluck(sequences, 'cid'));
                            })
                        }
                        break;
                    case 'assessment':
                        if (lessonJSON.hasOwnProperty('sequences')) {
                            sequencesIds = _.pluck(lessonJSON.sequences, 'cid');
                        }
                        break;
                }
                
                return sequencesIds;
            },

            /**
             * Download lesson from server by id, with respect to last-modified.
             */
            download: function f1939(id, last_modified, callback) {

                downloadLesson(id, last_modified, callback);

            },

            /**
             * Load lesson from the server by id.
             * @param callback Function to be called after lesson is opened.our
             * @param toRepoOnly Load only, without binding/unbinding events and downloading assets.
             */
            open: function f1940(id, callback, toRepoOnly) {

				//log amplitude
	            var courseRecord = repo.getParent(id);
	            var lessonMode = repo.get(id).data.mode;
	            var lessonType = lessonMode == 'normal'? 'lesson' : 'assessment';

	            amplitude.logEvent('Open existing ' + lessonType, {
		            "Lesson ID": id,
		            "Course ID": courseRecord.id
	            });

                if (typeof callback != 'function') {
                    callback = function f1941() {
                    };
                }

                busy.start();
				busy.setData('Please Wait...', 46);

                if (!toRepoOnly) {
                    require('courseModel').unbindEvents();
                    require('router').activeScreen.components.navbar.lockMessage &&
                    require('router').activeScreen.components.navbar.lockMessage.unbindEvents();

                    this.remove(true); //close prev lesson before opening new one
                }

                // Start downloading stuff.
                downloadLesson(id, null, function f1942(lessonJSON, sequencesJSON, hasLocalChanges) {
                   // busy. - downloading sequences 30 - 100
                    busy.setData('((Downloading lesson resources))', 47);
                    var totalPercentage = 70;
                    lessonModel.setLessonId(id);
                    lessonModel.setHidden(lessonJSON.isHidden);
                    lessonModel.setDirtyFlag(false);

                    repo.startTransaction({ ignore: true });

                    if (lessonJSON) {
                        // When uploading assets on save, current assets' state
                        // should be a reference point.

                        lessonModel.setOriginalTitle(lessonJSON.title);

                        if (!toRepoOnly) {
                            repo._old_lesson = lessonJSON;
                        }

                        var updateData = require("conversionUtil").dataRemoteToRepo(lessonJSON, repo.get(lessonJSON.cid).parent, repo._data);
                        var exclude_types = ['course', 'toc'];

                        if (updateData) {
                            updateData = _.reject(updateData, function f1943(item) {
                                return _.indexOf(exclude_types, item.type) >= 0;
                            });

                            repo.busy(true);
                            repo.update(updateData);
                            repo.busy(false);
                        }
                    }
                    // end if (lessonJSON)

                    if (sequencesJSON) {
                        _.each(sequencesJSON, function f1944(sequence) {

                            // 1) Test that the parent lesson is readily available.
                            var lessonObj = repo.get(sequence.lessonCId);
                            if (lessonObj) {
                                var sequenceObj = repo.get(sequence.seqId);

                                // 2) Load sequence data as JSON...
                                var repoData = JSON.parse(sequence.content);
                                if (repoData) {
                                    repo.busy(true);
                                    // ...and save to repo.
                                    for (var rec in repoData) {
                                        repo.update(repoData[rec]);
                                    }
                                    repo.busy(false);
                                }
                            }

                        });

                        repo.filterData();

                        _.each(updateData, function f1945(item) {
                            var rec = repo.get(item.id);

                            if (rec && item.data.selectedStandards) {
                                repo.updateProperty(rec.id, 'selectedStandards', item.data.selectedStandards, false, true);
                            }

                            // Insert converted teacher guide and rename tg_res_src attribute to src
                            if (rec && item.data.teacherGuide) {
                                var tg = $('<div></div>').html(item.data.teacherGuide.html);
                                $.each(tg.find('[tg_res_src]'), function (ind, el) {
                                    $(el).attr('src', $(el).attr('tg_res_src')).removeAttr('tg_res_src');
                                });
                                item.data.teacherGuide.html = tg.html();
                                repo.updateProperty(rec.id, 'teacherGuide', item.data.teacherGuide, false, true);
                            }
                        });

                        ////////////////////////////////////////////////////////////////////
                        // inject "selectedStandards" property back to repo
                        ////////////////////////////////////////////////////////////////////
                        /*                  var lessonStdMap = conversionUtil.getStdsFromLO( lessonJSON.cid ) ;
                         _.each( lessonStdMap, function( stdList, cid ) {
                         var record = repo.get( cid ) ;
                         record && (record.data.selectedStandards = stdList);
                         }, this ) ;*/
                        ////////////////////////////////////////////////////////////////////

                        repo.endTransaction();

                        //validate lesson
                        var lessonvalidation = repoValidation.validate(id);
                        if (!lessonvalidation.isValid) {
                            require('courseModel').bindEvents();
                            var router = require('router');

                            //load lesson parent
                            router.load(repo.get(id).parent, router._static_data.tab);
                            require('undo').reset();
                            busy.stop();
                            return;
                        }

                        //validate.validatePreviewRecursion(id);
                        if (!toRepoOnly) {
	                        //take a lock of a wanted lesson
	                        events.fire("lock", require("lessonModel").getLessonType());
                            events.fire('end_load_of_sequences');
                        }
                    } else {
                        repo.endTransaction();
                        require('undo').reset();
                        busy.stop();
                    }
                    // end if (sequencesJSON)

                    if (!toRepoOnly) {
                        lessonModel.bindEvents();
                    }


                    // Update applets manifest - check for new applets
                    require('appletModel').updateManifest(function f1947() {
                        require('undo').reset();
                        busy.stop();
                        // Done.

                        if (hasLocalChanges) {
                            var dialogConfig = {
                                title: 'Overwrite Lesson Saved on the Server',
                                content: {
                                    text: 'The lesson updates that are saved on your local computer are more recent than the lesson updates saved on the server. When connected to the internet, save your work again so as to upload it to the server.',
                                    icon: 'warn'
                                },
                                buttons: {
                                    yes: { label: 'OK' }
                                }
                            };
                            require('dialogs').create('simple', dialogConfig);
                        }

                        callback();
                    });
                });

            },

            /**
             * Returns true if there are unsaved changes.
             */
            getDirtyFlag: function f1948() {
                return this.dirtyFlag;
            },

            /**
             * Updates the "dirty flag".
             */
            setDirtyFlag: function f1949(new_value) {
                this.dirtyFlag = (!!require('editMode').readOnlyMode ? false : new_value); //in readOnly mode don't set flag as dirty

                // Enable or disable the save button (in main menu).
                events.fire('setMenuButtonState', 'menu-button-save-lesson',
                    this.dirtyFlag ? 'enable' : 'disable');
            },

            /**
             * Event listener for the repo_changed event.
             */
            repoChanged: function f1950() {
                if (this.editMode && !this.editMode.readOnlyMode) {
                    this.setDirtyFlag(true);
                }
            },

            /**
             * Remove an active lesson's children from the repo.
             */
            remove: function f1951(removeEventsAndRepoOnly) {
                this.unbindEvents();

                if (this.lessonId) {
                    repo.removeChildren(this.lessonId, null);
                }

                if (!removeEventsAndRepoOnly) {
                    this.setLessonId(null);
                    $.removeCookie('lessonId');
                    require("courseModel").bindEvents();
                }
                delete this.overlatInteractionState;

            },

            /**
             * Returns the value of 'last-modified' field ($date), or null.
             */
            getLastModified: function f1952(id) {
                if (!id) {
                    id = this.lessonId;
                }

                if (this.lessonHeader && this.lessonHeader[id] && this.lessonHeader[id]['last-modified'] &&
                    this.lessonHeader[id]['last-modified'].$date) {
                    // Return 'last-modified'.
                    return this.lessonHeader[id]['last-modified'].$date;
                }
                else return null;
            },

            /**
             * Sets lesson header, 'last-modified' field ($date)
             * @param id
             * @param header
             */
            setLessonHeader: function f1953(id, header, updateLocalFile) {
                if (!id) {
                    id = this.lessonId;
                }

                logger.debug(logger.category.LESSON, { message: 'Set new lesson header', header: header });

                var record = repo.get(id), self = this;

                // Update the "last-modified" header.
                if (record && record.data) {
                    repo.startTransaction({ ignore: true });
                    repo.updateProperty(record.id, 'header', header, false, true);
                    repo.endTransaction();
                }

                if (!!updateLocalFile) {
                    //update local file
                    var daoConfig = {
                        path: restDictionary.paths.GET_TOC_ITEM,
                        pathParams: _.defaults({
                            lessonId: id,
                            itemType: this.getLessonType(id),
                            fileSuffix: '.json'
                        }, this.getBaseConfig())
                    };

                    dao.getLocal(daoConfig, function f1954(file) {
                        if (file && file.header) {
                            file.header = header;
                        }

                        daoConfig = {
                            path: restDictionary.paths.SAVE_TOC_ITEM,
                            pathParams: _.defaults({
                                lessonId: id,
                                itemType: self.getLessonType(id),
                                fileSuffix: ".json"
                            }, self.getBaseConfig()),
                            data: file
                        };

                        dao.setLocal(daoConfig, function f1955(response) {

                        });

                    });
                }

                this.lessonHeader[id] = header;
            },
            getSequencesInServerFormat: function(lessonId){

                var sequences = {};
                var lessonSequences = _.filter(repo.getSubtreeRecursive(lessonId), function (rec) {
                    return ['sequence', 'separator', 'url_sequence'].indexOf(rec.type) !== -1;
                });
				//call lesson conversion to get the updated converted data, even if the change is not saved
                convertSequencesToXml(lessonId);

                _.each(lessonSequences, function(seq){
                    sequences[seq.id] = seq;
                });
                return sequences;

            },

            /**
             * Saves the lesson document and the associate components : sequences
             * @param id
             * @param callback
             * @without_assets boolean don't save assets, used on copy/paste
             */
            save: function f1956(id, callback, without_assets) {

                var self = this, sequence_array = getSequenceArray(id), courseId = require('courseModel').getCourseId();

                var stdModel = require('standardsModel');
                /* Get sequences. */
                logger.debug(logger.category.LESSON, 'Preparing sequences data for save');
                var sequences = _.chain(sequence_array).map(function f1957(rec) {
                    return repo.getSubtreeRecursive(rec.id);
                }).map(function f1958(array) {

                        var seq_array = $.extend(true, {}, array);

                        seq_array = helpers.arrayToRepoLikeObject(seq_array);

                        // clean up standards properties
                        stdModel.cleanupSelectedStandards(seq_array);

                        // clean up teacher guide properties and clear xml
                        _.each(seq_array, function (record) {
                            if (record && record.data && record.data.teacherGuide) {
                                delete record.data.teacherGuide;
                            }

	                        if(record.convertedData) {
	                            record.convertedData = json2xml.clearXML(record.convertedData);
	                        }


                        });

                        return {
                            seqId: array[0].id,
                            lessonCId: id,
                            courseId: courseId,
                            content: JSON.stringify(seq_array)
                        };
                    }).value();

                if (!without_assets) {
                    //upload all lesson assets
                    logger.debug(logger.category.LESSON, 'Save lesson data will be performed after saving assets');
                    assets.uploadAssetsForLesson(id, sequences, function f1959() {
                        _.defer(function() {
                            saveJsonWithSequences.apply(self, [id, callback, sequences]);
                        });
                    });
                } else {
                    logger.debug(logger.category.LESSON, 'Save lesson data without saving assets');
                    saveJsonWithSequences.apply(self, [id, callback, sequences]);
                }

            },

            /**
             * saveJsonOnly function
             * @param id
             * @param callback
             * @param is_properties Save only the lesson header (skip sequences)
             */
            saveJsonOnly: function f1960(id, callback, is_properties) {
                busy.start();

                var remoteData = repo.getRemoteJson();

                delete remoteData['lessonsData'][id]['resources'];
                delete remoteData['lessonsData'][id]['learningObjects'];

                var params = _.defaults({
                        lessonId: id,
                        itemType: this.getLessonType(id)
                    }, this.getBaseConfig()),
                    remote = remoteData,
                    payload = _.filter(remote.lessonsData, function f1961(obj, obj_id) {
                        return obj_id.indexOf(id) >= 0
                    }),
                    restConfig = {
                        path: is_properties ? restDictionary.paths.SAVE_TOC_ITEM_PROPERTIES : restDictionary.paths.SAVE_TOC_ITEM,
                        pathParams: params,
                        data: payload.length ? payload[0] : {}
                    }, self = this;

                this.restConfig = $.extend({}, restConfig);
                this.restParams = $.extend({}, params);

                getLocalLessonFile(params.lessonId, function f1962(localJSON) {
                    /////////////////////////////////////////////////////////////
                    // bug fix CGS-1068
                    // merge packages to compensate different repo conversions
                    /////////////////////////////////////////////////////////////
                    if (localJSON) {
                        var stdModel = require('standardsModel'),
                            mergedPackages = !localJSON ? {} : {
                                "standardPackages": stdModel.getMergedPackages(localJSON, restConfig.data)
                            };
                        /////////////////////////////////////////////////////////////

                        //merge local file and updated data
                        var lessonJSON = $.extend({}, localJSON, restConfig.data, mergedPackages);

                        //save local lesson file
                        var localConfig = {
                            path: restDictionary.paths.SAVE_TOC_ITEM,
                            pathParams: _.defaults({
                                lessonId: params.lessonId,
                                itemType: params.itemType,
                                fileSuffix: ".json"
                            }, self.getBaseConfig()),
                            data: lessonJSON
                        };

                        //local files saving
                        dao.setLocal(localConfig, saveRemoteLesson.bind(self));
                    }
                    else {
                        saveRemoteLesson.call(self);
                    }
                });

                function saveRemoteLesson() {
                    /* Upload lesson. */
                    dao.remote(this.restConfig, function f1963(header) {
                        this.setLessonHeader(this.restParams.lessonId, header, true);
                        
                        busy.stop();

                        if (typeof callback === "function") callback();
                    }.bind(this), function() {
                        busy.stop();
                        if (typeof callback === "function") callback(true);
                    });
                }

            },

            /**
             * Save an active lesson, if there are unsaved changes.
             */
            saveActiveLesson: function f1964(callback) {
                if (this.getDirtyFlag()) {
                    $.when(validateUtil.validate({
                        id: this.getLessonId(),
                        type: 'lesson'
                    }), this.getTasksCheckable(this.getLessonId()))
                    .done(function (validationState) {
                        if (validationState == validateUtil.ValidationStates.APPROVED) {
                            busy.start();
                            busy.setData('((lesson.saveProcess.checkingLockStatus))', 0);

                            var router = require('router');
                            if (router && router.activeScreen && router.activeScreen.editor && router.activeScreen.editor.endEditing) {
                                router.activeScreen.editor.endEditing();
                            }

                            var bindEvents = function () {
                                events.register('lock_ready', continueCallback, this);
                                events.register('lock_lesson_success', continueCallback, this);
                                events.register('missingResourcesError', onRemoteRequestError, this);
                                events.register('lockModel.remoteRequestAborted', onLockRemoteRequestAborted, this);
                            };

                            var unbindEvents = function () {
                                events.unbind('lock_ready', continueCallback);
                                events.unbind('lock_lesson_success', continueCallback);
                                events.unbind('lock_lesson_success', continueCallback);
                                events.unbind('lockModel.remoteRequestAborted', onLockRemoteRequestAborted);

                                // reset lock retry attempts
                                this.lockRetryAttempts = 0;
                            };

                            var onRemoteRequestError = function () {
                                unbindEvents.call(this);
                                this.saveInProgress = false;
                            };

                            var onLockRemoteRequestAborted = function () {
                                checkLockStatus.call(this);
                            };

                            var onLockRemoteRequestTimeout = function () {
                                events.fire('lock.lesson.abortRemoteRequest');
                            };

                            var checkLockStatus = function () {
                                // Check lock only if retry attempts has not been exceeded
                                if (this.lockRetryAttempts < NUMBER_OF_LOCK_RETRY_ATTEMPTS) {
                                    ++this.lockRetryAttempts;
                                    logger.debug(logger.category.LESSON, 'Check lesson lock before save, attempt #{0} (of {1})'.format(this.lockRetryAttempts, NUMBER_OF_LOCK_RETRY_ATTEMPTS));
                                    this.lockRemoteRequestTimeout = setTimeout(onLockRemoteRequestTimeout.bind(this), LOCK_SERVER_REQUEST_TIMEOUT);
                                    events.fire("lock", lessonModel.getLessonType());
                                } else { // Lock retry attempts exceeded
                                    logger.error(logger.category.LESSON, 'Lock retry reached the maximum of {0} attempts.'.format(NUMBER_OF_LOCK_RETRY_ATTEMPTS));
                                    unbindEvents.call(this);
                                    clearTimeout(this.lockRemoteRequestTimeout);
                                    require('showMessage').clientError.show({errorId: 2003});
                                }
                            };

                            var continueCallback = function(lockObj) {
                                clearTimeout(this.lockRemoteRequestTimeout);
                                unbindEvents.call(this);

                                if (this.saveInProgress) {
                                    logger.warn(logger.category.LESSON, 'Tried to save lesson during save in progress');
                                    return;
                                }

                                if (lockObj.lockStatus == require('lockModel').config.LOCK_TYPES.LOCKED_SELF) {
                                    this.saveInProgress = true;
                                    var courseModel = require("courseModel");
                                    if (courseModel.getDirtyFlag()) {
                                        this.saveLesson(this.getLessonId(), function() {
                                                courseModel.saveCourse(function() {
                                                        courseModel.setDirtyFlag(false);
                                                        if (_.isFunction(callback)) {
                                                                callback.call(this);
                                                        }
                                                }.bind(this));
                                        }.bind(this));
                                    } else {
                                        this.saveLesson(this.getLessonId(), callback);
                                    }
                                }
                                else {
                                    logger.warn(logger.category.LESSON, 'Lesson is owned by another user');
                                    require('showMessage').clientError.show({errorId: 2001});
                                }
                            };

                            bindEvents.call(this);

                            checkLockStatus.call(this);

                        }
                    }.bind(this));
                }
            },

            /**
             * Saves a lesson according to id
             */
            saveLesson: function f1965(lessonId, callback) {
                this.callbackOnEndOfSaveLesson = callback;

                busy.start();

                if (events.exists("terminateDialog")) {
                    events.fire('terminateDialog');
                }

                function showDlFail(dialogCallback) {
                    var dialogConfig = {
                        title: 'Save Info',
                        content: {
                            text: require('translate').tran('Check lesson for invalid sequences.'),
                            icon: 'warn'
                        },
                        buttons: {
                            yes: { label: 'OK' }
                        }
                    };
                    events.once('onShowDlFail', function () {
                        dialogCallback && dialogCallback();
                    });
                    require('dialogs').create('simple', dialogConfig, 'onShowDlFail');
                }

                function continueSave() {
                    this.save(lessonId, function f1966() {
                        this.setOriginalTitle(repo.get(lessonId).data.title);
                        this.setDirtyFlag(false);
                        this.saveInProgress = false;
                        busy.stop(true);

                        if (this.isDlCrashed) {
                            showDlFail();
                        }

                        if (_.isFunction(this.callbackOnEndOfSaveLesson)) {
                            this.callbackOnEndOfSaveLesson.call(this);
                        }
                    }.bind(this), false);
                }
                _.defer(function () {
                    //convert all sequences that dont have a converted data property.
                    convertSequencesToXml(lessonId);
                    // Continue save
                    continueSave.call(this);
                }.bind(this));

            },

            /**
             * Display unsaved notification (dialog) and either save or discard changes
             * depending on user input. Does nothing if there are no unsaved changes.
             */
            unsavedNotification: function f1967(callback) {
                var activeScreen = require('router').activeScreen;

                if (activeScreen && activeScreen.editor &&
                    activeScreen.editor.endEditing) {
                    // Stop editing before changing screens (triggers a bug in TextViewerEditor).
                    activeScreen.editor.endEditing();
                }

                // if lesson is locked by someone else, do not pop unsaved dialog msg (even if dirty flag is on)
                var lockModel = require("lockModel");
                if (lockModel.getLockingStatus(this.getLessonType()) == lockModel.config.LOCK_TYPES.LOCKED_SELF) {
                    var lockedBySelf = true;
                } else {
                    var lockedBySelf = false;
                }

                if (this.getDirtyFlag() && lockedBySelf) {
                    util.openSaveLessonDialog(callback);
                }
                else {
                    if (typeof callback === 'function') callback();
                }
            },

            bindEvents: function f1968() {
                events.bind('repo_changed', this.repoChanged, this);
                events.register('lesson_save', this.saveActiveLesson, this);
                events.register('lesson_assets', util.openAssetsDialog.bind(util, false));
                events.register('lesson_narrations', util.openAssetsDialog.bind(util, true));
                events.register('tts_report', util.openTTSDialog.bind(util));
                events.register('lesson_comments', util.openCommentsDialog);
            },

            unbindEvents: function f1969() {
                events.unbind('repo_changed', this.repoChanged, this);
                events.unbind('lesson_save', this.saveActiveLesson, this);
                events.unbind('lesson_assets');
                events.unbind('lesson_narrations');
                events.unbind('tts_report');
                events.unbind('lesson_comments');
            },

            /**
             * get the lesson mode- assesment or normal lesson
             * @param  {[type]} id [description]
             * @return {[type]}    [description]
             */
            isLessonModeAssessment: function f1970(id) {
                var lessonRecord = repo.get(id || this.lessonId);

                return !!lessonRecord && !!lessonRecord.data && lessonRecord.data.mode == 'assessment';
            },

            /**
             * return true is the assessment type is auto false if mixed
             * @param  {[type]} id [description]
             * @return {boolean}    [description]
             */
            isAssessmentModeAuto: function f1971(id) {
                var lessonRecord = repo.get(id || this.lessonId);

                return !!lessonRecord && !!lessonRecord.data && lessonRecord.data.pedagogicalLessonType == 'auto';
            },

            /**
             * returns the lesson type much more handy then the ones above
             * if true then  the lesson is assessment
             * @param  {[type]} id [description]
             * @return {[type]}    [description]
             */
            getAssessmentType: function f1972(id) {
                var lessonRecord = repo.get(id || this.lessonId);
                return lessonRecord.data.pedagogicalLessonType;
            },

            /**
             * helper function that checks if the sequence belongs to an assessment lesson
             * this function can be used from inside and outside the scope
             * @param sequenceid
             * @returns {boolean}
             */
            isAssessmentClosure: function (id) {
                if (_.isEmpty(id) || !repo.getAncestorRecordByType(id, 'lesson')) {
                    return false;
                }
                return repo.getAncestorRecordByType(id, 'lesson').data.mode == 'assessment';
            },

            getLessonType: function f1973(id) {
                return this.isLessonModeAssessment(id) ? 'assessment' : 'lesson';
            },

            //get the total tasks score - propery availble only in lesson mode assessment
            getAssessmentTotalScore: function f1974(id) {
                var totalSum = 0,
                    lessonChildren = repo.getSubtreeRecursive(id || this.lessonId);
                var isEqual;

                _.each(lessonChildren, function f1975(record) {
                    if (record.data.score) {
                        if (~record.data.score.toString().indexOf('equal')) {
                            isEqual = true;
                            totalSum += parseInt(record.data.score.split(":")[1]);
                        } else {
                            totalSum += parseInt(record.data.score);
                        }
                    }
                });
                return isEqual ? totalSum + (100 - totalSum) : totalSum;
            },

            /**
             * get the lesson format- NATIVE or EBOOK
             * @param  id [lesson id to test]
             * @return {[boolean]} [returns true if lesson has format "EBOOK", false otherwise ]
             */
            isLessonFormatEbook: function f1975(id) {
                var lessonRecord = repo.get(id || this.lessonId);

                return !!lessonRecord && !!lessonRecord.data && lessonRecord.data.format == 'EBOOK';
            },

            /**
             * Remove tasks with manual checking type from lesson (assessment with mixed to auto change)
             * @param id - lesson id
             */
            adjustAssessmentTypeChanges: function (id) {
                var types = require('types');
                var advencedProgressRecords = repo.getChildrenRecordsByTypeRecursieve(id, 'advancedProgress');
                _.each(advencedProgressRecords, function (item) {
                    repo.updateProperty(item.id, 'checking_enabled', true, false, true);
                });

                // Due to the fact that this checking is not correct (see CREATE-4846) this code is altered
                // var tasksToDelete = _.chain(repo.getSubtreeRecursive(id))
                //     .filter(function (item) {
                //         return  types[item.type] &&
                //                             types[item.type].assessmentEnable &&
                //                             !types[item.type].assessmentEnable['auto'];
                //     })
                //     .pluck('id')
                //     .value();
                //
                // _.each(tasksToDelete, function (taskId) {
                //     repo.remove(taskId);
                // });

                var tasksToDelete = [];
                var allChildren = repo.getSubtreeRecursive(id);
                for (var i = 0; i < allChildren.length; i++) {
                    var child = allChildren[i];
                    switch (child.type) {
                        case "questionOnly":
                        case "FreeWriting":
                            tasksToDelete = tasksToDelete.concat(repo.getSubtreeRecursive(child.id));
                            break;
                        case "appletTask":
                            var appletTaskChildren = repo.getSubtreeRecursive(child.id);
                            var isCheckable = false;
                            for (var j = 0; j < appletTaskChildren.length; j++) {
                                var appletChild = appletTaskChildren[j];
                                if (appletChild.type == "appletAnswer"
                                    && appletChild.data.isCheckable
                                    && appletChild.data.isCheckable == true) {
                                    isCheckable = true;
                                }
                            }
                            if (!isCheckable) {
                                tasksToDelete = tasksToDelete.concat(repo.getSubtreeRecursive(child.id));
                            }
                            break;
                        case "ShortAnswer":
                        case "cloze":
                            if (child.data.task_check_type == "manual") {
                                tasksToDelete = tasksToDelete.concat(repo.getSubtreeRecursive(child.id));
                            }
                            break;
                    }
                }
                if (tasksToDelete.length) {
                    repo.startTransaction();
                    for (var i = 0; i < tasksToDelete.length; i++) {
                        repo.remove(tasksToDelete[i].id);
                    }
                    repo.endTransaction();
                    logger.info(logger.category.LESSON,
                                "Checking type changed to auto, " + tasksToDelete.length + " non-checkable tasks deleted.");
                }
            },

            hasComments: function () {
                var val = _.any(repo.getRepo(), function (item) {
                    var hasComments = item.data.comments && item.data.comments.length && _.pluck(item.data.comments, 'comment').join('');
                    if (hasComments) {
                        return (item.id == this.getLessonId() || repo.getAncestorRecordByType(item.id, 'lesson') && repo.getAncestorRecordByType(item.id, 'lesson').id == this.getLessonId())
                    }
                    return false;
                }, this);
                return val;
            },

            getEBooksIds: function() {
                var lessonRepo = repo.get(this.lessonId);
                if (lessonRepo && lessonRepo.data && lessonRepo.data && lessonRepo.data.eBooksIds) {
                    var map = $.map(lessonRepo.data.eBooksIds, function(el) { 
                        return el;
                    });
                    return map;
                } else {
                    return [];
                }
            },

            // after delete of page / lo -> need to update the list of ebooks saved on the lesson
            updateLessonEbooks: function() {
                var pages = repo.getChildrenRecordsByTypeRecursieve(this.lessonId, "page");
                var lessonEbooks = this.getEBooksIds();
                var currentEbooks = [];

                //get current referenced ebooks in the lesson
                _.each(pages, function(page) {
                    if (currentEbooks.indexOf(page.data.eBookId) == -1) {
                        page.data.eBookId && currentEbooks.push(page.data.eBookId);
                    }
                });

                if (!_.isEqual(currentEbooks.sort(), lessonEbooks.sort())) {
                    //pick from current list only the ebooks that still has a referance from a page
                    var updatedEbooks = _.filter(lessonEbooks, function(ebookId) {
                        return currentEbooks.indexOf(ebookId) > -1;
                    });
                    repo.updateProperty(this.lessonId, 'eBooksIds', updatedEbooks, false, true);
                    require("courseModel").updateEbooks();
                }
            },
            //add ebook attributes to the lesson, under "eBooksIds"
            addLessonEbook: function(ebookId) {
                var lessonEbooks = this.getEBooksIds();
                var hasChange = false;
                if (lessonEbooks.indexOf(ebookId) == -1) {
                    lessonEbooks.push(ebookId);
                    hasChange = true;
                }
                if (hasChange) {
                    repo.updateProperty(this.lessonId, 'eBooksIds', lessonEbooks, false, true);
                }
                require("courseModel").addEbook(ebookId);
            },

	        onModified: function (id, onModifiedCallback, onNoModifiedChangesCallback) {
		        // local file content - for later
		        var localFile = null, self = this;

		        function parseLocalFile(file) {
			        var lastModified = null;

			        if (file && file.header && file.header["last-modified"]) {
				        // save for later
				        localFile = file;
				        lastModified = file.header["last-modified"].$date;
			        }

			        var daoConfig = {
				        path: restDictionary.paths.GET_TOC_ITEM,
				        pathParams: _.defaults({
					        lessonId: id,
					        itemType: self.getLessonType(id),
					        fileSuffix: '.json'
				        }, self.getBaseConfig()),
				        data:{
				        }
			        };

			        if (lastModified && lastModified.indexOf("1970") == -1) {
				        daoConfig.data['last-modified'] = lastModified;
			        }

			        dao.remote(daoConfig, function f1864(data) {
				        if (data) {
					        onModifiedCallback();
				        } else {
					        onNoModifiedChangesCallback();
				        }
			        }, function f1866() {
				        onNoModifiedChangesCallback();
			        });
		        }

		        // get local course data from file system
		        getLocalLessonFile.call(this, id, parseLocalFile);
	        },
            getChildrenByAssessmentRecursive: function(id, ret_arr, level) {
                var self = this;
                var parent = repo.get(id), child_obj;
                if(!ret_arr) ret_arr = [];
                if(!parent) return ret_arr;
                $.map(parent.children, function (child, i) {
                    child_obj = repo.get(child);
                    if (!level) level = 0;
                    child_obj.level = level;
                    if (child_obj && (child_obj.data.mode == "assessment")) {
                        ret_arr.push(child_obj);
                    } else {
                        if(child_obj && child_obj.children && child_obj.children.length > 0){
                            self.getChildrenByAssessmentRecursive(child, ret_arr, level + 1);
                        }
                    }
                });
                return ret_arr;
            },
            getTasksCheckable: function(id) {
            	var lesson = repo.get(id);
            	var requireCheckable = false
				if (lesson && lesson.data.mode === 'assessment' && lesson.data.pedagogicalLessonType === 'auto') requireCheckable = true;
				if (!requireCheckable) return true;
                var uncheckable = [];
                var allChildren = repo.getSubtreeRecursive(id);
                for (var i = 0; i < allChildren.length; i++) {
                    var child = allChildren[i];
                    switch (child.type) {
                        case "questionOnly":
                        case "FreeWriting":
                            uncheckable.push(child.id);
                            break;
                        case "appletTask":
                            var appletTaskChildren = repo.getSubtreeRecursive(child.id);
                            var isCheckable = false;
                            for (var j = 0; j < appletTaskChildren.length; j++) {
                                var appletChild = appletTaskChildren[j];
                                if (appletChild.type == "appletAnswer"
                                    && appletChild.data.isCheckable
                                    && appletChild.data.isCheckable == true) {
                                    isCheckable = true;
                                }
                            }
                            if (!isCheckable) {
                                 uncheckable.push(child.id);
                            }
                            break;
                        case "ShortAnswer":
                        case "cloze":
                            if (child.data.task_check_type == "manual") {
                                uncheckable.push(child.id);
                            }
                            break;
                    }
                }
                
                if (requireCheckable && uncheckable.length) {
					p = $.Deferred() 
					var dialogConfig = {
						title: 'Uncheckable tasks found',
						content: {
							text: 'Unckeble tasks will be removed if you continue, otherwise cancel and change the checking type',
							icon: 'warn'
						},
						buttons: {
							yes: { label: 'OK' },
							no: { label: 'Cancel' }
						}
					};
					events.once('onDialogClosed', function (e) {
						
						if (e == 'yes') {
								repo.startTransaction();
								for (var i = 0; i < uncheckable.length; i++) {
									repo.remove(uncheckable[i]);
								}
								repo.endTransaction();
								logger.info(logger.category.LESSON,
											"Saved lesson with checking required, " + uncheckable.length + " non-checkable tasks deleted.");
											
								var router = require('router');
								router.load(router.activeEditor.elementId);
							p.resolve();
						} else {
							p.reject();
						}
					});
					require('dialogs').create('simple', dialogConfig, 'onDialogClosed');
					return p;
				 }
				 return true;
               
            }

        });

        var lessonModel = new LessonModel;

        return lessonModel;
    });