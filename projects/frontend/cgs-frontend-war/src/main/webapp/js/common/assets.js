define(["events", "files", "configModel", "restDictionary"], function(events, files, configModel, restDictionary) {

	/* Cannot be used in the open dialog. */
	function absPath(path, is_remote, course_id) {
		//replace slash html entity
		path = path.replace('&#x2f;', '/');
		path = path.replace('&#x2F;', '/');

		var basePath = configModel.configuration.cmsBasePath,
			glue = (path.charAt(0) === "/") ? "" : "/";

		if (is_remote) {
			path = path.replace(/cgsData/, "cgsdata");
			if (basePath.lastIndexOf("/") !== basePath.length - 1) {
				basePath += "/";
			}
		}

		return [files.getBasePath(is_remote? [basePath]: void 0, course_id), path].join(glue);
	}

	function uploadAbsPath(path){
		var course_id = require("repo")._courseId;
		//replace slash html entity
		path = path.replace('&#x2f;', '/');
		path = path.replace('&#x2F;', '/');

		var basePath = configModel.configuration.basePath,
			glue = (path.charAt(0) === "/") ? "" : "/";

			path = path.replace(/^cgsData/, "cgsdata");
			if (basePath.lastIndexOf("/") !== basePath.length - 1) {
				basePath += "/";
			}

		return [files.getBasePath([basePath]), path].join(glue);
	}

	function serverPath(path, course_id) {
		return this.absPath(path, true, course_id);
	}

	function normalizePath(path) {
		if (path.charAt(0) === "/") return path.substr(1)
		return path
	}

	function hasResource(path, array) {
		path = normalizePath(path);

		for (var i = 0; i < array.length; ++i) {
			if (path === array[i].href) return true;
		}

		return false;
	}

	function getCourseResources(course_id) {
		var resources = [],
			course = require('repo').get(course_id);

		// Add course cover
		course.data.cover && resources.push(course.data.cover);

		// Add course references
		_.each(course.data.references, function(ref) {
			resources.push(['cgsdata', ref.fileName].join('/'));
		});

		// Add course customization pack files
		if(course.data.customizationPackManifest){
			_.each(course.data.customizationPackManifest.files, function(file) {
				resources.push([course.data.customizationPackManifest.baseDir, file].join('/'));
			});
		}

		return resources;
	}


	/* uploads the image in the blobData to the server, and afterwards saves it to local filesystem and updates lesson manifest
		blobData - image blob to upload
		successCallbackAfterSave - a call back to execute after the upload and local save is complete
		the callback is called with parameters: filePathInsideMediaFolder - the path to the image in local filesystem
	*/
	function uploadBlobAndSaveItLocally(blobData, successCallbackAfterSave, fileExtension) {
		var self = this;

		if(!fileExtension && blobData.type) {
			fileExtension = blobData.type.split('/')[1];
		}

		if(!fileExtension) {
			successCallbackAfterSave(null);
			return;
		}

		var modifiedUploadPath = "media/" + (new Date().getTime()) + "." + fileExtension;
		var url = this.uploadAbsPath(modifiedUploadPath);

		url += "?isSha1=true";
		blobData.name = "foooo";

		// todo: activate busy indicator
		this.uploadAssetToServer({
			file: blobData,
			url: url,
			disableTranscode: true,
			successCallback: function (result) {
				var newFilePath = result.filePath;
				var filePathInsideMediaFolder = "/media" + newFilePath.split("/media")[1];
				var endIndex = filePathInsideMediaFolder.lastIndexOf("/"); // don't take the file name
				var localDir = filePathInsideMediaFolder.substr(1, endIndex);
				var filename = filePathInsideMediaFolder.substr(endIndex + 1);
				this.filePathInsideMediaFolder = filePathInsideMediaFolder;
				// save blob to local file system and update the repo records
				files._saveFile(filename, filename, blobData, newFilePath.substr(1, newFilePath.lastIndexOf("/") - 1), function () {
					successCallbackAfterSave(filePathInsideMediaFolder);
				}, true);

			}
		});
	}

	/* uploads the image in the blobData to the server
	 blobData - image blob to upload
	 successCallbackAfterSave - a call back to execute after the upload and local save is complete
	 */
	function uploadImageBlob(blobData, successCallbackAfterSave){
		var self  = this;
		var fileExtension = "png";
		var modifiedImageUploadPath = "media/"+(new Date().getTime())+"."+fileExtension;
		var url = this.uploadAbsPath(modifiedImageUploadPath);
		url += "?isSha1=true";
		blobData.name = "foooo";
		// todo: activate busy indicator
		this.uploadAssetToServer({
			file: blobData,
			url: url,
			disableTranscode : true,
			successCallback: successCallbackAfterSave
		});
	}

	function uploadBlob(blobData, successCallbackAfterSave, fileExtension){
		var self = this;

		if(!fileExtension && blobData.type) {
			fileExtension = blobData.type.split('/')[1];
		}

		if(!fileExtension) {
			successCallbackAfterSave(null);
			return;
		}

		var modifiedUploadPath = "media/"+(new Date().getTime())+"."+fileExtension;
		var url = this.uploadAbsPath(modifiedUploadPath);
		url += "?isSha1=true";
		blobData.name = "foooo";
		// todo: activate busy indicator
		this.uploadAssetToServer({
			file: blobData,
			url: url,
			disableTranscode : true,
			successCallback: successCallbackAfterSave
		});
	}

	function uploadAssetsReferences(course_id, callback) {
		var daoConfig = {
			path:restDictionary.paths.CHECK_MISSING_RESOURCES,
			pathParams: {
				publisherId: require("userModel").getPublisherId(),
				courseId: course_id
			},
			data: {
				files: getCourseResources(course_id)
			}
		};

		require('dao').remote(daoConfig, function(missingResources) {
			var queue = _.map(missingResources && missingResources.missingFiles, function(res) {
				return files.putFile.bind(files, res, uploadAbsPath(res));
			}),
				total = queue.length,
				counter = 0,
				gotoNext = function () {
					if (queue.length) {
						require('busyIndicator').setData('((Saving course...))', (counter++) * 100.0 / total);
						var fun = queue.shift()
						fun(gotoNext)
					}
					else {
						logger.debug(logger.category.COURSE, 'Course assets uploaded successfully');
						require('busyIndicator').setData('((Saving course...))', 100);
						// done uploading
						if (typeof callback === "function") callback()
					}
				};

			logger.debug(logger.category.COURSE, 'Uploading course assets, ' + total + ' assets for save');

			gotoNext();
		});
	}

	/* Upload this stuff. */
	var MEDIA_FIELDS = [
		"soundButton/sound",
		"audioPlayer/audio",
		"videoPlayer/video",
		"sequence/image",
		"separator/separatorImage",
		"separator/separatorSubTitleNarration",
		"separator/separatorTitleNarration",
		"textViewer/narration",
        "textViewer/multiNarrations",
		"cloze_text_viewer/narration",
		"cloze_text_viewer/multiNarrations",
		"imageViewer/image",
		"imageViewer/sound",
		"imageViewer/captionNarration",
		"html_sequence/image",
		"latex/component_src",
		"MathML/component_src",
		"inlineSound/component_src",
		"inlineImage/component_src",
		"inlineNarration/narrations",
		"applet/files",

		"livePageTextViewerWrapper/iconPath",
		"livePageTextViewerWrapper/livePageThumbnail",
        "livePageImageViewer/iconPath",
        "livePageImageViewer/livePageThumbnail",
        "livePageImageViewer/image",
        "livePageImageViewer/sound",
        "livePageImageViewer/captionNarration",
        "livePageSoundButton/iconPath",
        "livePageSoundButton/livePageThumbnail",
        "livePageSoundButton/sound",
        "livePageAudioPlayer/iconPath",
        "livePageAudioPlayer/livePageThumbnail",
        "livePageAudioPlayer/audio",
        "livePageVideoPlayer/iconPath",
        "livePageVideoPlayer/livePageThumbnail",
        "livePageVideoPlayer/video",
        "livePageAppletWrapper/iconPath",
        "livePageAppletWrapper/livePageThumbnail",
        "livePageMultimedia/iconPath",
        "livePageMultimedia/livePageThumbnail",
        "livePageQuestionOnly/iconPath",
        "livePageQuestionOnly/livePageThumbnail",
        "livePageAppletTask/iconPath",
        "livePageAppletTask/livePageThumbnail",

        "pluginExternal/assets"
	];

	function uploadAssetsForLesson(lesson_id, sequences, callback) {
		var repo = require("repo"),
			assets = [],
			lessonData = repo.getSubtreeRecursive(lesson_id);

		logger.debug(logger.category.LESSON, 'Collecting assets list for server request for missing resources');

		//cut of objects that contains teacherGuide data
		arrOfTeacherGuideData = _.filter(lessonData, function(item) { return !!item.data.teacherGuide } );

		function insertAsset(assetPath) {
			assets.push(assetPath);
		}

		_.each(arrOfTeacherGuideData, function (item, index) {
			//insert into assets array all references files pathes
			_.each(item.data.teacherGuide.files, function (file) {
				insertAsset(file.path);
			});

			//insert into assets array images uploaded into teacher guide html
			if(typeof item.data.teacherGuide.html === "string") {
				_.each($('<div>').html(item.data.teacherGuide.html).find('img'), function (item, index) {
					insertAsset(item.attributes.relative_path.nodeValue);
				}, this);
			}
		}, this);

		_.each(sequences, function (seq) {
			seq.content && _.each(JSON.parse(seq.content), function (rec) {
				rec.data && _.each(rec.data, function (value, field) {

					if (rec.type === 'sequence' && field === 'creativeWrapper') {
						_.each(value, function (paths, key) {
							insertAsset(paths);
						})
					}

					if (value && value.charAt && value.charAt(0) === "/") {
						if (MEDIA_FIELDS.indexOf(rec.type + "/" + field) !== -1)
							insertAsset(value);
					}
					// Array of sources (ex: applets assets)
					else if (value instanceof Array && MEDIA_FIELDS.indexOf(rec.type + "/" + field) !== -1) {
						_.each(value, function(val) {
							if (val && val.path && val.path.charAt && val.path.charAt(0) === "/")
								if (val.hrefs instanceof Array) {
									_.each(val.hrefs, function(href) { insertAsset(val.path + '/' + href); });
								}
								else {
									insertAsset(val.path);
								}
						});
					} else if (_.isObject(value) && MEDIA_FIELDS.indexOf(rec.type + "/" + field) !== -1) {
						_.each(value, function (v) {
							if (_.isString(v)) {
								insertAsset(v);
							} else {
                                if (v && v.component_src) {
	                                insertAsset(v['component_src']);
                                }
							}
						});
					}
				});
			});
		});

		assets = _.map(_.unique(assets), function(asset) {
			return asset.charAt(0) == '/' ? asset.substr(1) : asset;
		});  //remove duplicate assets paths

		var daoConfig = {
			path:restDictionary.paths.CHECK_MISSING_RESOURCES,
			pathParams: {
				publisherId: require('userModel').getPublisherId(),
				courseId: require('courseModel').getCourseId()
			},
			data: {
				files: assets
			}
		};

		var missingResourcesSuccess = function(missingResources) {
			var queue = _.map(missingResources.missingFiles, function(res) {
					return files.putFile.bind(files, res, uploadAbsPath(res));
				}),
				total = queue.length,
				counter = 0,
				gotoNext = function () {
					if (queue.length) {
						require('busyIndicator').setData('((Saving lesson...))', (counter++) * 100.0 / total);

						var fun = queue.shift()
						fun(gotoNext, function () {
							require('lessonModel').saveInProgress = false;
							require('busyIndicator').stop(true);
	                        require('showMessage').clientError.show({ title: 'lesson.save.fail.title', message: 'lesson.save.fail.message'});
	                    })
					}
					else {
						logger.debug(logger.category.LESSON, 'Lesson assets uploaded successfully');
						require('busyIndicator').setData('((Saving lesson...))', 100);


						// done uploading
						if (typeof callback === "function") callback()
					}
				}

			logger.debug(logger.category.LESSON, 'Uploading lesson assets, ' + total + ' assets for save');

			gotoNext();
		};

		missingResourcesError = function (response) {
	        if (events.exists('missingResourcesError')) {
	            events.fire('missingResourcesError');
	        }

			require('showMessage').serverError.show(response);
		};

		logger.debug(logger.category.LESSON, 'Checking for missing resources on server');
		require('dao').remote(daoConfig, missingResourcesSuccess, missingResourcesError);
	}

	function downloadCourseResources(resources, callback) {
		var paths = _(resources)
					.pluck('href')
					.compact()
					.value();

		if (!paths || !paths.length) { return callback(); }

		downloadAssetsPack(paths, callback, function(loaded, total, totalFiles) {
			require('busyIndicator').setData('((course.open.progress.download_resource))', loaded / total * 50);
		}, function(extracted, total) {
			require('busyIndicator').setData('((course.open.progress.extract_resource)) (' + extracted + ' ((of)) ' + total + ')', 50 + extracted / total * 50);
		});
	}

	function downloadCustomizationPack(course_id, callback) {
		var lp = require("repo").get(course_id).data.customizationPackManifest;

		if (!lp || !lp.files) {
			if (typeof callback === "function") callback();
			return;
		}
		
		var nothing = function() {};

		function downloadCustomizationPack() {
			downloadAssetsPack(_.map(lp.files, function(file) { return [lp.baseDir, file].join('/'); }), function() {
				var repo = require("repo");
				var locales = repo.get(repo._courseId).data.contentLocales;
				require("localeModel").setLocale(locales && locales.length && locales[0], function() {
					
					window.customizationPackLoading = false;
					if (events.exists('customizationPack-done-loading')) {
						events.fire('customizationPack-done-loading');
					}
					if (AuthenticationData.user.role.name == 'EDITOR') {
						if (!require("editMode").readOnlyMode) {
							events.fire('enable_menu_item', 'menu-button-export-as-course');
						}
						events.fire('enable_menu_item', 'menu-button-new');
					}

					uploadAssetsReferences(repo._courseId);

				});
			}, nothing, nothing);
		}
		// run the function on the background to save time on opening course.
		window.customizationPackLoading = true;
		setTimeout(downloadCustomizationPack, 0);
		callback();
	}

	function makeDirs(course_id, callback) {
		var pid = require("userModel").getPublisherId();

		files.prepareDirs(pid, course_id, callback)
	}

	function downloadAssetsPack(paths, onComplete, downloadProgressCallback, extractFilesCallback) {
		var filesToDownload = { files: [] },
			ZipJS = require('zip_js'),
			saveFile = function(entry, callback) {
				if (!entry || entry.directory) {
					callback();
					return;
				}
				entry.getData(new ZipJS.BlobWriter(), function f1978(blob) {
                    var path = files.coursePath(undefined, undefined, entry.filename.replace(/^cgsdata/, 'cgsData')),
                        filename = entry.filename.substr(entry.filename.lastIndexOf('/') + 1);

                    path = path.substr(0, path.lastIndexOf('/'));

                    //save the blob content as real file
                    files._makeDirs([path], function() {
                        files._saveFile(filename, 'xxx', blob, path, function(file) {
                            callback();
                        });
                    });
                });
			},
			downloadZip = function() {
				var xhr = new XMLHttpRequest;
				xhr.responseType = 'blob';
				if (typeof downloadProgressCallback == 'function') {
					xhr.onprogress = function(e) {
						if (e.lengthComputable) {
							downloadProgressCallback(e.loaded, e.total, filesToDownload.files.length);
						}
					}
				}
				xhr.onload = function(ev) {
					if (ev.target.status != 200) {
						require('showMessage').serverError.show(ev.target);
						return;
					}

					window.b = ev.target.response;
					ZipJS.createReader(new ZipJS.BlobReader(window.b), function (reader) {
						reader.getEntries(function (entries) {
							// Save all entries to file system
							(function callbackFunction() {
								if (typeof extractFilesCallback == 'function') {
									extractFilesCallback(filesToDownload.files.length - entries.length, filesToDownload.files.length);
								}
								if (entries.length) {
									saveFile(entries.shift(), callbackFunction);
								}
								else {
									if (typeof onComplete == 'function') onComplete();
								}
							})();
						});
					});
				};
				xhr.open('post', [require('configModel').configuration.basePath, require('files').coursePath(), 'zip/asset'].join('/'));
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.send(JSON.stringify(filesToDownload));
			},
			checkPath = function(path) {
				files.fileExists(files.coursePath(undefined, undefined, path), function(exists) {
					if (!exists && path && !~filesToDownload.files.indexOf(path)) {
						path = path.replace(/^cgsData/, 'cgsdata');
						filesToDownload.files.push(path);
					}

					if (paths.length) {
						checkPath(paths.shift());
					}
					else if (filesToDownload.files.length) {
						downloadZip();
					}
					else if (typeof onComplete == 'function') {
						onComplete();
					}
				})
			};

		ZipJS.workerScriptsPath = 'js/libs/zipjs/';

		checkPath(paths.shift());
	}

	/* Config:
	file - File object to upload
	url - Url for file uploading
	disableTranscode - Force file uploading without transcoding
	successCallback - Callback for succeeded action
	abortCallback - Callback for aborted action
	errorCallback - Callback for failed action
	*/
	function uploadAssetToServer(config){
		var isTranscode = false, showMessage = require('showMessage'),
			onError = function(errorData){
				require('busyIndicator').stop('all');

                logger.error(logger.category.FILES, { message: "File upload failed: " + config.url, status: errorData.target.status, response: errorData.target.responseText });

				if(errorData.target.response) {
					showMessage.serverError.show(errorData.target);
				} else {
					showMessage.clientError.show({
						"title": "Server Error",
						"message": "file.upload.fail.message"
					});
				}


				if (_.isFunction(config.errorCallback)) {
					config.errorCallback();
				}
			},
			formData = new FormData(),
			xhr = new XMLHttpRequest(),
			abortUpload = function(){
				xhr.abort();
				logger.info(logger.category.FILES, 'user aborted file upload' );
				events.unbind('busyIndicator.cancel.clicked');
				if(_.isFunction(config.abortCallback)){
					config.abortCallback();
				}
			};

		if (!config.disableTranscode && require("cgsUtil").isMediaNeedTranscode(config.file.name)) {
				config.url = config.url + (config.url.indexOf('?') == -1 ? '?': '&') + 'isTranscode=true';
				isTranscode = true;
			}

		formData.append("file", config.file);

		// Listen to busy indicator cancel action
		events.register('busyIndicator.cancel.clicked', abortUpload);
		events.fire('busyIndicator.enableCancel', true);

		xhr.onload = function(ev) {
			if (this.status == 200) {
				events.unbind('busyIndicator.cancel.clicked');
				events.fire('busyIndicator.enableCancel', false);

				var obj;
				try {
					obj = JSON.parse(ev.target.response);
				}
				catch(e) { }

				if (isTranscode && _.isObject(obj) && obj.processId) {
					config.abortCallback = config.abortCallback || require('busyIndicator').stop.bind(require('busyIndicator'), 'all')
					events.register('busyIndicator.cancel.clicked', cancelTranscoding.bind(this, obj.processId, config.abortCallback));
					events.fire('busyIndicator.enableCancel', true);
					getProcessState({
						processId: obj.processId,
						successCallback: config.successCallback,
						abortCallback: config.abortCallback,
						errorCallback: onError
					});
				}
				else if (_.isFunction(config.successCallback)){
					config.successCallback({
						filePath: ev.target.response,
						isTranscoded: false
					});
				}
			}else{
				onError(ev);
			}
		};

		xhr.onerror = onError;

		xhr.upload.onprogress = function(ev) {
			if (ev.lengthComputable) {
				require('busyIndicator').setData('((upload.file.to.server))', ev.loaded / ev.total * 100 / (isTranscode ? 3 : 1));
			}
		}

		xhr.open("POST", config.url);
		xhr.send(formData);
	}

	function cancelTranscoding(processId, abortCallback, xhr) {
		events.unbind('busyIndicator.cancel.clicked');
		events.fire('busyIndicator.enableCancel', false);

		var daoConfig = {
			path: restDictionary.paths.TRANSCODE_CANCEL,
			pathParams: {
				publisherId: require('userModel').getPublisherId(),
				courseId: require('courseModel').getCourseId(),
				processId: processId
			}
		}

		require('dao').remote(daoConfig);

		if (xhr) {
			xhr.abort();
		}

		if (_.isFunction(abortCallback)) {
			abortCallback();
		}
	}

	function getProcessState(cfg) {
		setTimeout(function() {
			var daoConfig = {
				path: restDictionary.paths.TRANSCODE_POLLING,
				pathParams: {
					publisherId: require('userModel').getPublisherId(),
					courseId: require('courseModel').getCourseId(),
					processId: cfg.processId
				}
			}

			require('dao').remote(daoConfig, function(pollingData) {
				switch (pollingData.status) {
					case 'PENDING':
						require('busyIndicator').setData('((upload.file.pending))', 100 / 3 + (pollingData.progressPercentage || 0) / 3);
						getProcessState(cfg);
						break;
					case 'TRANSCODING':
						require('busyIndicator').setData('((upload.file.transcode))', 100 / 3 + (pollingData.progressPercentage || 0) / 3);
						getProcessState(cfg);
						break;
					case 'DONE':
						var cid = require('courseModel').getCourseId(),
							index = pollingData.convertedFilePath.indexOf(cid),
							filePath = pollingData.convertedFilePath.substr(index > -1 ? index + cid.length + 1 : 0).replace(/\\/g, '/'),
							url = require('assets').serverPath(filePath, cid);

						require('busyIndicator').setData('((upload.file.transcode))', 100 / 3 * 2);

						// Unbind current cancel callback and register again with new parameter 'xhr'
						events.unbind('busyIndicator.cancel.clicked');

						var xhr = files.downloadFile({
							url: url,
							filename: filePath.substr(filePath.lastIndexOf('/') + 1),
							dirname: filePath.substr(0, filePath.lastIndexOf('/')),
							callback: function(file) {
								events.unbind('busyIndicator.cancel.clicked');
								events.fire('busyIndicator.enableCancel', false);
								if (_.isFunction(cfg.successCallback)) {
									cfg.successCallback({
										filePath: filePath,
										isTranscoded: true,
										file: file
									});
								}
							},
							failCallback: function() {
								events.fire('busyIndicator.enableCancel', false);
								if (_.isFunction(cfg.errorCallback)) {
									cfg.errorCallback({ errorId : 'FILES1' });
								}
							},
							progressCallback: function(ev) {
								if (ev.lengthComputable) {
									require('busyIndicator').setData('((upload.file.to.local))', 100 / 3 * (2 + ev.loaded / ev.total));
								}
							}
						});

						events.register('busyIndicator.cancel.clicked', cancelTranscoding.bind(this, pollingData.id, cfg.abortCallback, xhr));
						break;
					case 'FAILED':
						events.unbind('busyIndicator.cancel.clicked');
						events.fire('busyIndicator.enableCancel', false);
						if (_.isFunction(cfg.errorCallback)) {
							var message = pollingData.errors.join('<br>');
							cfg.errorCallback({ title: 'File upload failed', message: message });
						}
						break;
					case 'CANCELED':
						break;
				}
			}, cfg.errorCallback);
		}, 1000);
	}

	return {
		absPath: absPath,
		serverPath: serverPath,
		uploadAssetsReferences: uploadAssetsReferences,
		uploadAssetsForLesson: uploadAssetsForLesson,
		downloadCourseResources: downloadCourseResources,
		downloadCustomizationPack: downloadCustomizationPack,
		makeDirs: makeDirs,
		downloadAssetsPack: downloadAssetsPack,
		uploadAssetToServer: uploadAssetToServer,
		uploadBlobAndSaveItLocally: uploadBlobAndSaveItLocally,
		uploadImageBlob: uploadImageBlob,
		uploadBlob: uploadBlob,
		uploadAbsPath: uploadAbsPath
	};
});