define(['events', 'jquery', 'mustache', 'repo', 'courseModel', 'lockModel', 'configModel', 'dialogs', 'validate', 'showMessage', 'types', 'cgsUtil', 'busyIndicator', 'json2xml', 'repo2livePage', 'files', 'zip_js', 'repo_controllers', 'assets'],

    function f1824(events, $, Mustache, repo, courseModel, lockModel, configModel, dialogs, validate, showMessage, types, cgsUtil, busy, json2xml, repo2livePage, files, ZipJS, repo_controllers, assets) {

        function cgsModel() {
            this.reference_template = '{{#references}}<li class="{{fileType}}"><a href="{{#server-path}}{{path}}{{/server-path}}" target="_blank">{{fileName}}</a></li>{{/references}}';
            this.doLogOut = false;
            this.bindEvents();

            $(window).bind('beforeunload', function f1825() {
                // Send all remaining logs to server
                logger.sendLogsToServer();

                if (require('lessonModel').lessonId && require('lessonModel').getDirtyFlag()) {
                    logger.info(logger.category.GENERAL, 'Window before unload event fired with unsaved lesson');
                    return "Lesson was changed, all unsaved data will be lost.";
                }

                if (courseModel.courseId && courseModel.getDirtyFlag()) {
                    logger.info(logger.category.GENERAL, 'Window before unload event fired with unsaved course');
                    return "Course was changed, all unsaved data will be lost.";
                }
            })
                .bind('unload', function f1826() {
                    logger.info(logger.category.GENERAL, 'Window unload event');

                    _.each(['lesson', 'assessment', 'course'], function f1827(lockType) {
                        if (lockModel.getLockingStatus(lockType) == lockModel.config.LOCK_TYPES.LOCKED_SELF) {
                            events.fire('release_lock', lockType);
                        }
                    });

                    require('router').activeScreen.dispose && require('router').activeScreen.dispose(); //dispose active screen before window reload
                });
        }

        cgsModel.prototype = {

            init: function f1828() {

            },

            bindEvents: function f1829() {
                events.register('cgs_logout', this.cgsLogout, this);
                events.register('cgs_preview', this.cgsPreview, this);
                events.register('cgs_settings', this.cgsSettings, this);
                events.register('cgs_validate', this.cgsValidate, this);
                events.register('cgs_help', this.cgsHelp, this);
                events.register('cgs_about', this.cgsAbout, this);
                events.register("released_lesson_success");
            },
            cgsAbout: function () {

                var dialogConfig = {
                    title: "About Content Generation Studio",

                    content: {
                        text: require('translate').tran("Version: ") + require('configModel').getVersion(),
                        icon: 'warn'
                    },

                    buttons: {
                        'ok': { label: 'Close', value: true }
                    }
                };

                var dialog = dialogs.create('simple', dialogConfig);
                dialog.show();
            },

            cgsHelp: function f1830() {
               // open a new tab linking to time to know's HOW site
                window.open('http://www.timetoknowhow.com/#!create/c24db','_blank');
            },
            showCourseReferences: function f1832() {
                var record = repo.get(repo._courseId),
                    list = $('#course_reference_menu'),
	                html_references = "";

                if (list.length && record && record.data.references) {
                    if (!!record.data.references.length) {
                        html_references = Mustache.render(this.reference_template,
                            {'references': _.sortBy(record.data.references,
                                function f1833(reference) {
                                    var extension = reference['fileName'].substr((reference['fileName'].lastIndexOf('.') + 1)),
                                        allowedMedia = ["mp3", "mp4", "avi", "mpa", "wma", "wav",
                                            "mid", "mpg", "swf", "wmv", "vob", "flv", "asf", "vob", "mpeg"].join(),

                                        allowedImages = ["bmp", "gif", "jpeg", "jpg", "tif", "psd", "png"].join();


                                    if (allowedMedia.indexOf(extension) != -1) {
                                        reference = _.extend(reference, {fileType: "media-file"});
                                    }
                                    if (allowedImages.indexOf(extension) != -1) {
                                        reference = _.extend(reference, {fileType: "img-file"});
                                    }

                                    return reference['fileName'];
                                }
                            )});
                    }
                }

	            if(list.length) {
	                list[0].innerHTML = html_references;
	            }
            },

            logOut: function f1834() {
                require('courseModel').remove();
                events.unbind('cgs_logout', this.cgsLogout);
                window.location.href = configModel.configuration.logoutPath;
            },

            cgsLogout: function f1835() {
                //trigger [ yes-no] popup
                var dialogConfig = {
                    title: "Logout",

                    content: {
                        text: "Are you sure you want to exit?",
                        icon: 'warn'
                    },

                    buttons: {
                        'i_agree': { label: 'Yes', value: true },
                        'no_agree': { label: 'No', value: false }
                    }
                };

                events.register('saveAndExit', this.saveAndExit, this);

                var dialog = dialogs.create('simple', dialogConfig, 'saveAndExit');
                dialog.show();
            },

            releaseLockOfCourseAndLesson: function f1836() {
                var self = this;

                function onEndReleaseLesson() {
                    if (self.doLogOut) {
                        self.logOut();
                    }
                }

                function onEndReleaseCourse() {
                    self.doLogOut = true;

                    // fire release lesson only if locked by this user
                    if (lockModel.getLockingStatus('LESSON') == lockModel.config.LOCK_TYPES.LOCKED_SELF) {
                        events.fire('release_lock', 'lesson', onEndReleaseLesson);
                    } else if (lockModel.getLockingStatus('assessment') == lockModel.config.LOCK_TYPES.LOCKED_SELF) {
                        events.fire('release_lock', 'assessment', onEndReleaseLesson);
                    } else {
                        onEndReleaseLesson();
                    }
                }

                // fire release Course only if locked by this user
                if (lockModel.getLockingStatus('COURSE') == lockModel.config.LOCK_TYPES.LOCKED_SELF) {
                    events.fire('release_lock', 'course', onEndReleaseCourse);
                } else {
                    onEndReleaseCourse();
                }
            },

            saveAndExit: function f1837(response) {
                if (!!response) {
                    if (courseModel.courseId) {
                        cgsUtil.unsavedCourseNotification(this.releaseLockOfCourseAndLesson.bind(this));
                    } else {
                        this.logOut();
                    }
                }
            },

            restartCGS: function f1838() {
                courseModel.remove();
                require('router').load('');
            },

            ////////////////////////////////////////CGS Content Validation//////////////////////////////////////
            cgsValidate: function f1839() {
                var router = require('router');

                var record = router.activeEditor.record,
                    elementId = record.id,
                    validJson = validate.isEditorContentValid(elementId),
                    item;

                if (!validJson.valid) {
                    var message = '';
                    for (item in validJson.report) {
                        if (validJson.report[item].msg) {
                            message += "," + validJson.report[item].msg;
                        }
                    }
                    showMessage.clientError.show({errorId: "C003", srcMessage: message});  //Content is not valid
                }
            },
	        ///////////////////////////////////////CGS Preview//////////////////////////////////////////////////

	        convertRepoData: function(options) {
		        //switch cases: sequence preview / task preview
		        //in case of sequence: remove not valid tasks from the preview
		        //in case of task - don't open preview for not valid task
		        //content validation
		        var router = require('router');

		        var data, showPreview = true;
		        var id, elementType, elementId, record;

		        if (options) {
			        id = options.seqId;
			        elementType = options.type;
			        elementId = options.seqId;
			        record = options.record || repo.get(elementId);
		        } else {
			        record = router.activeEditor.record;
			        elementType = record.type;
			        elementId = record.id;
			        id = record.id;
			        options = {};
		        }

		        var parentId = record.parent, typeObj = types[elementType];
		        var validJson = validate.isEditorContentValid(elementId, true);

		        switch (elementType) {
			        case "lesson" :
			        case "lo" :
			        case "quiz" :
			        case "page":
				        showPreview = true;
				        data = true;
				        break;

			        case "differentiatedSequenceParent":
				        showPreview = true;
				        data = true;
				        break;

			        case "sequence" :
				        var data = {};
				        repo.filterDataById(data, elementId);

				        //remove not valid tasks
				        var arr_children = _.clone(data[elementId].children);


				        var arr_children_length = arr_children.length;

				        // if there is a header, decrease from arr_children_length.
				        // priview will be valid only if there is at least one valid task
				        var child_type = '';
				        _.each(arr_children, function f1841(item) {
					        child_type = repo.get(item).type;
					        if (child_type == 'header') arr_children_length--;
					        if (child_type == 'sharedContent') arr_children_length--;
					        if (child_type == 'help') arr_children_length--;
				        });

				        showPreview = arr_children_length > 0;

				        if (showPreview) {
					        if (!repo.get(elementId).convertedData || repo.get(elementId).is_modified) {
						        //if sequence is valid to preview get it's converted data and update repo
						        var _converted_xml = json2xml.getXML(data, elementId);

						        if (_converted_xml.hasError) {
							        repo.updateProperty(elementId, 'convertedData', null, true, false);
						        } else if (repo.get(elementId).is_modified || !repo.get(elementId).convertedData) {
							        repo.updateProperty(elementId, 'convertedData', _converted_xml.xml_data, true, false);
						        }
					        }
				        } else if (repo.get(elementId).convertedData) { //if sequence is not valid to preview remove old converted data
					        repo.updateProperty(elementId, 'convertedData', null, true, false);
				        }

				        data[elementId] = repo.get(elementId);  //update sequence row inside data array

				        break;

			        case "html_sequence" :
				        var livePageElements = _.filter(repo.getChildren(elementId), function (child) {
					        return child.type.indexOf('livePage') == 0;
				        });
				        if (livePageElements.length) {
					        var data = {}; //input/output param
					        if (validJson.valid) {
						        repo.filterDataById(data, elementId);
						        if (!repo.get(elementId).convertedData) {
							        //if item is valid to preview get it's converted data and update repo
							        var _converted_json = repo2livePage.convert(data, elementId);

							        if (_converted_json.hasError) {
								        repo.updateProperty(elementId, 'convertedData', null, true, false);
							        } else {
								        repo.updateProperty(elementId, 'convertedData', _converted_json.json_data, true, false);
							        }
						        }
					        } else {
						        showPreview = false;
						        if (repo.get(elementId).convertedData) { //if item is not valid to preview remove old converted data
							        repo.updateProperty(elementId, 'convertedData', null, true, false);
						        }
					        }
					        data[elementId] = repo.get(elementId); //update sequence row inside data array
					        break;
				        }
			        // else - no break, convert like regular sequence
			        case "url_sequence" :
			        case "separator" :
				        var data = {}; //input/output param
				        if (validJson.valid) {
					        repo.filterDataById(data, elementId);
					        var repoElement = repo.get(elementId);
					        if (!repoElement.convertedData || repoElement.is_modified) {
						        //if item is valid to preview get it's converted data and update repo
						        var _converted_xml = json2xml.getXML(data, elementId);

						        if (_converted_xml.hasError) {
							        repo.updateProperty(elementId, 'convertedData', null, true, false);
						        } else {
							        repo.updateProperty(elementId, 'convertedData', _converted_xml.xml_data, true, false);
						        }
					        }
				        } else {
					        showPreview = false;
					        if (repo.get(elementId).convertedData) { //if item is not valid to preview remove old converted data
						        repo.updateProperty(elementId, 'convertedData', null, true, false);
					        }
				        }
				        data[elementId] = repo.get(elementId); //update sequence row inside data array
				        break;
			        case "pluginContent":
				        showPreview = true;
				        var data = {};

				        repo.filterDataById(data, elementId);

				        if (data[elementId]) {
					        var pluginClassManager = require("pluginModel").getPluginByPath(data[elementId].data.path);
					        options.playerConfig = pluginClassManager.manifest.playerConfig;
					        data[elementId].convertedData = pluginClassManager.invokeDataToPlayerConversion(data);
					        repo.updateProperty(elementId, 'convertedData', data[elementId].convertedData, true, false);
				        }
				        break;
			        default : //tasks


				        // Find parent of type sequence
				        var parent = repo.get(parentId);
				        var currentChild = record;
				        while (parent && !~["sequence", "pluginContent"].indexOf(parent.type)) {
					        parentId = parent.parent;
					        currentChild = parent;
					        parent = repo.get(parentId);
				        }

				        // Sequence parent found
				        if (parent) {
					        id = parentId;
					        if (parent.type === "pluginContent") {
						        var data = {};

						        repo.filterDataById(data, parentId);

						        if (data[parentId]) {
							        var pluginClassManager = require("pluginModel").getPluginByPath(data[parentId].data.path);
							        options.playerConfig = pluginClassManager.manifest.playerConfig;
							        data[parentId].convertedData = pluginClassManager.invokeDataToPlayerConversion(data);
						        }
					        } else {

						        var data = {}; //input/output param
						        data[parentId] = require('cgsUtil').cloneObject(repo.get(parentId)); //sequence element

						        //remove all other tasks but current task, because we are now on task preview
						        data[parentId].children = data[parentId].children.filter(function f1842(child) {
							        return child == currentChild.id || repo.get(child).type == 'help';
						        });


						        _.each(data[parentId].children, function f1843(id) {
							        repo.filterDataById(data, id);
						        });


						        //previewing only one task from sequence - remove shared type
						        data[parentId].data.type = 'simple';

						        //update converted data of sequence, because we want to preview sequence with this task only
						        var _converted_xml = json2xml.getXML(data, parentId);

						        if (_converted_xml.hasError) {
						        } else {
							        data[parentId].convertedData = _converted_xml.xml_data;
						        }
					        }
				        }
				        else {
					        showPreview = false;
				        }


				        break;
		        }

		        return {'showPreview': showPreview, 'data': data, 'id': id, 'options': options}

	        },

	        cgsPreview: function f1840(options) {
		        //fire end editing before opening preview
		        events.fire('setActiveEditorEndEditing');

				//***** Loop on every page that is virtual and create a blob for preview (so it will be visible)
				var lessonId = require('lessonModel').getLessonId();
				var pages = repo.getChildrenByTypeRecursive(lessonId, 'page');
				var vpm = require('VirtualPageManager');
				var virtualPageManager = new vpm();
				pages.forEach(function(page) {
					if (page.data.virtualData) {
						var newHref = virtualPageManager.getVirtualPage(page.data.virtualData, page.data.href);
						repo.updateProperty(page.id, 'href', newHref);
					}
				});

		        var _response = this.convertRepoData(options);

                // run preview for screen preview (regular)
		        if (_response.showPreview && !!_response.data) {
			        require('preview').showPreviewDialog(_response.data, _response.id, _response.options);
		        } else { //in case on task not valid we cant show it's preview
			        // show client error
			        showMessage.clientError.show({errorId: "C003"});  //Content not valid for preview
		        }
            },

            setCreativeWrapper: function f1847(seqId, path, callback) {
                //publisher id
                var pid = require('userModel').getPublisherId(),
                //course id
                    cid = require('courseModel').getCourseId(),
                //the course path where we save the files
                    path = files.coursePath(pid, cid, path),
                //allowed files
                    allowedFiles = ['thumbnail', 'footer_big', 'footer_small', 'margin'],
                    record = repo.get(seqId),
                    self = this,
                    assetName,
                    itreator = 0;

                if (!record) return;

                ZipJS.workerScriptsPath = 'js/libs/zipjs/';

                repo.startTransaction();

                //create the repo property for store the files
                repo.updateProperty(record.id, 'creativeWrapper', {});

                busy.start();

                //load the zip file as blob
                files.loadObject(path, 'blob_hack', function f1848(result) {
                    //start reading the zip file
                    //convert the chunks to valid blob for ZIPJS capable to read it
                    ZipJS.createReader(new ZipJS.BlobReader(new Blob([new DataView(result)])), function f1849(reader) {
                        //get the files entries from the zip
                        reader.getEntries(function f1850(entries) {
                            //iterate through the entries
                            function processItem(item) {
                                if (item) {
                                    //asset name from the file name to compare it with the allowedFiles
                                    assetName = item.filename.substring(0, item.filename.lastIndexOf("."));
                                    //check if we if the entry has a valid name
                                    if (allowedFiles.indexOf(assetName) !== -1) {
                                        //get the entry blob content
                                        item.getData(new ZipJS.BlobWriter(), function f1852(blob) {

                                            files._getAssetName(blob, item.filename, function f1853(SHA1, originalFileName, blobContent) {
                                                //original file name without extension
                                                var noExtOriginalFileName = originalFileName.substring(0, originalFileName.lastIndexOf("."));
                                                var creativeWrapperId = SHA1.replace(/\..*/, '');
                                                //set to repo the file type (look at allowedFiles for availible types)
                                                repo.updatePropertyObject(record.id, 'creativeWrapper', creativeWrapperId, {
                                                    type: noExtOriginalFileName,
                                                    path: null
                                                });

                                                var updateRepoAfterUpload = function f1854(uploadResponse ) {

                                                    // take only the relative path for the uploded file, drop the /publishers/XX/course/YYY
                                                    var filePath =  "/media/" + uploadResponse.filePath.split("/media/")[1];
                                                    var fileSha1 = creativeWrapperId;

                                                    //if we doesn't update the repo object with the SHA1 index as key we log it as error (not a real ERROR!!!)

                                                    if (!record.data.creativeWrapper[fileSha1]) {
                                                        logger.error(logger.category.GENERAL, 'Can\'t set creative wrapper,' + fileSha1 + ' not exists');
                                                    }

                                                    //get the relative course path (without the filesystem://.../persistent/);
                                                    var obj = require('cgsUtil').cloneObject(record.data.creativeWrapper[fileSha1]);
                                                    obj.path = filePath;
                                                    repo.updatePropertyObject(record.id, 'creativeWrapper', fileSha1, obj);

                                                    //if the asset name is thumbnail update the view with the image
                                                    if (record.data.creativeWrapper[fileSha1] && record.data.creativeWrapper[fileSha1].type === 'thumbnail') {
                                                        var editor = repo_controllers.get(record.id);
                                                        if (editor && editor.view && typeof editor.view.update_wrapper_thumbnail == 'function') {
                                                            editor.view.update_wrapper_thumbnail(record.data.creativeWrapper[fileSha1].path);
                                                        }
                                                    }

                                                    //reverse the object from

                                                    /*
                                                     object[SHA1] = { type: *, path: * }

                                                     to:

                                                     object[type] = path;
                                                     */
                                                    repo.updatePropertyObject(record.id, 'creativeWrapper', record.data.creativeWrapper[fileSha1].type, record.data.creativeWrapper[fileSha1].path);

                                                    //delete the old pointer from the repo
                                                    repo.deletePropertyObject(record.id, 'creativeWrapper', fileSha1);

                                                    processItem(entries.shift());

                                                }.bind(creativeWrapperId);

                                                //save the blob content as real file
                                                assets.uploadImageBlob(blobContent, updateRepoAfterUpload);
                                            });
                                        })
                                    }
                                    else {
                                        processItem(entries.shift());
                                    }
                                }
                                else {
                                    busy.stop();
                                    repo.endTransaction();
                                    if (typeof callback == 'function') callback();
                                }
                            }

                            processItem(entries.shift());
                        });
                    });
                });
            },

            deleteCreativeWrapper: function (seqId) {
                // Check that the record exists
                var record = repo.get(seqId);
                if (!record) return;

                // Delete the creative wrapper
                repo.deleteProperty(seqId, 'creativeWrapper');

                // We should have also deleted the actual files from the file system but
                // for some reason we don't do that in CGS :)
            },

            /////////////////////////////////////CGS Settings////////////////////////////////////////////////////////////
            cgsSettings: function f1855() {
                //trigger [ yes-no] popup
                var dialogConfig = {
                    title: "Settings",

                    content: {
                        text: "Settings",
                        icon: 'warn'
                    },

                    buttons: {
                        'a': { label: 'A', value: true },
                        'b': { label: 'B', value: false }
                    }
                };

                // TODO: all
                events.register('onOpenCgsSettings', this.onOpenCgsSettings, this);

                var dialog = dialogs.create('simple', dialogConfig, 'onOpenCgsSettings');
                dialog.show();
            },

            onOpenCgsSettings: function f1856(response) {
                if (!!eval(response)) {
                    // TODO: change newtab.location link
                }
            }

        };

        return new cgsModel();

    });