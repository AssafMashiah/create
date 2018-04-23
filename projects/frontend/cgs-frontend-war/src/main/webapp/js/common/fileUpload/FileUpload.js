define(["jquery", "lodash", "files", "mustache", "translate", "busyIndicator", "assets", "events",
		'text!common/fileUpload/orderButton.html',
		'text!common/fileUpload/fileUploadInput.html'
	],
	function ($, _, files, Mustache, i18n, busy, assets, events, _order_buttons, _input_html) {

		// internals
		var placeholders = {
			image: 'media/placeholder.png',
			audio: 'media/placeholder.mp3',
			video: 'media/placeholder.mp4',
			cws: 'media/placeholder.cws'
		};

		// initialize

		/*
		 ** @param activator - the upload button selector [mandatory]
		 ** @param dropzone - the drop zone selector [optional]
		 ** @param options - additional options (file allowed types, ignore size limits, disableTranscode, etc...) [optional]
		 ** @param callback - callback function for file upload [optional]
		 ** @param context - callback context [optional]
		 ** @param recordId - repo record Id [optional]
		 ** @param srcAttr - data src attribute into repo record for uploaded file url [optional]
		 ** @param enableAssetManager - true/false for showing order asset data [optional]
		 ** @param errorCallback - if exists, don't show popup with error, call the callback
		 ** @param enableDelete - the record's attribute can be deleted
		 ** @param deleteButton - a button selector to be used if assetsManager is disabled
		 ** @param enableEdit - the record's attribute can be edited
		 ** @param isNarration - is the asset is narration
		 */
		function FileUpload(config) {

			this.config = config;
			this.init();
		}

		FileUpload.params = {
			'image': {
				fileMymType: "image",
				allowFiles: ["image/png", "image/jpeg", "image/gif", "image/bmp"],
				extensions: ["PNG", "JPG", "JPEG", "GIF", "BMP"],
				display: true,
				title: "Images"
			},
			'import': {
				fileMymType: "import",
				extensions: ["cgscrs"],
				display: true,
				title: "Imported"
			},
			'audio': {
				fileMymType: 'audio',
				allowFiles: ['audio/mp3', 'audio/mpeg', 'audio/mp4'],
				extensions: ["MP3"],
				display: true,
				title: "Sounds"
			},
			'video': {
				fileMymType: 'video',
				allowFiles: ['video/mp4'],
				extensions: ["MP4"],
				display: true,
				title: "Videos"
			},
			'pdf': {
				fileMymType: "pdf",
				allowFiles: ["application/pdf", "application/x-pdf"],
				extensions: ["PDF"],
				display: true,
				title: "Pdf"
			},
			'html': {
				fileMymType: "html",
				allowFiles: ["text/html"],
				extensions: ["HTM", "HTML"],
				display: true,
				title: "Html"
			},
			'unity3d': {
				fileMymType: "unity",
				allowFiles: ["application/vnd.unity"],
				extensions: ["unity3d", "unity"],
				display: true,
				title: "Unity3D"
			},
			'swf': {
				fileMymType: "swf",
				allowFiles: ["application/x-shockwave-flash"],
				extensions: ["SWF"],
				display: true,
				title: "Flash"
			},
			'zip': {
				fileMymType: "zip",
				allowFiles: ["application/zip", "application/x-zip-compressed"],
				extensions: ["ZIP"],
				display: true,
				title: "Zip"
			},
			'all': {
				fileMymType: "attachment",
				allowFiles: ["*"]
			},
			'cws': {
				fileMymType: "cws",
				allowFiles: [".cws"],
				extensions: ["CWS"],
				display: true,
				title: "Creative Wrapper"
			},
			't2kseq': {
				fileMymType: 't2kseq',
				allowFiles: ['.t2kseq', '.zip'],
				extensions: ['T2KSEQ'],
				display: true,
				title: "Sequence"
			}


		};

		FileUpload.prototype = {

			init: function () {
				this.repo = require("repo");
				this.config.options = this.config.options || {};

				var course = require('courseModel').courseId && this.repo.get(require('courseModel').getCourseId());
				if (course && course.data.contentLocales instanceof Array) {
					this.locale = this.repo.get(require('courseModel').getCourseId()).data.contentLocales[0];
				}

				if (this.config.srcAttr && this.config.srcAttr.indexOf(".") !== -1) {
					this.locale = this.getMultiNarrationData(this.config.srcAttr).locale;
				}

				if (this.config.options.allowFiles && !this.config.options.fileMymType || !this.config.options.allowFiles && this.config.options.fileMymType) {
					throw new Error("Both alowFiles array and fileMymType should be in options");
				}

				this.activator = $(this.config.activator);
				this.config.accept_files = this.config.options.allowFiles && this.config.options.allowFiles.length ? this.config.options.allowFiles.join(",") : "";

				// if (this.config.activator is an array - throw)
				if (this.activator.length > 1)
					throw new Error('File upload activator should be a single element');

				if (this.config.dropzone) {
					this.dropzone = $(this.config.dropzone);
				}

				this.render();

			},

			getMessageInvalidFiles: function () {

				var _message = require("translate").tran("file.not.supported.message");
				_message += "<br/>";

				var allowedFileTypes = this.config.options.allowFiles;
				for (var i = 0; i < allowedFileTypes.length; i++) {
					_message += "&#8226&emsp;{0}<br/>".format(allowedFileTypes[i].replace(/(.*\/)(.*)/, "$2"));
				}

				return _message;
			},

			findAssetItem: function () {
				var record = this.repo.get(this.config.recordId);
				return require('cgsUtil').cloneObject(_.find(record.data.assetManager, function (item) {
					return item.srcAttr == this.config.srcAttr && (!this.config.locale || this.config.locale == (item.locale || item.srcAttr.split('.')[1]));
				}, this));
			},

			findAssetIndex: function () {
				var record = this.repo.get(this.config.recordId);
				return _.findIndex(record.data.assetManager, function (item) {
					return item.srcAttr == this.config.srcAttr && (!this.config.locale || this.config.locale == (item.locale || item.srcAttr.split('.')[1]));
				}, this);
			},

			updateAssetItem: function (asset) {
				var record = this.repo.get(this.config.recordId),
					assets = require('cgsUtil').cloneObject(record.data.assetManager);

				assets = _.reject(assets, function (am) {
					return am.srcAttr == asset.srcAttr && am.locale == asset.locale;
				})
				assets.push(asset);
				this.repo.updateProperty(record.id, 'assetManager', assets);
			},

			render: function () {

				// Check if asset is done - checkbox should be checked
				var record = this.repo.get(this.config.recordId);
				var userModel = require('userModel');

				if (record) {
					// Get record's assets manager data
					var assetItem = this.findAssetItem();
					this.config.isDone = assetItem && assetItem.state;
					this.config.isOrder = userModel.account.enableAssetOrdering;
					this.config.isOrderEnabled = (!assetItem || !assetItem.state);
					this.config.isNotOrdered = !assetItem || (assetItem.state === null);
					this.config.disableTTS = (assetItem && assetItem.state) || !require('ttsModel').isTtsServiceEnabledByLocale(this.locale);
					this.config.assetId = assetItem ? assetItem.assetId : null;
					this.config.notes = assetItem && assetItem.notes;
					this.config.asIs = assetItem ? assetItem.asIs : true;
					this.config.narrationText = assetItem && assetItem.narrationText;
					this.config.isTTS = !!(assetItem && assetItem.isTTS) && userModel.account.enableTextToSpeach;

					var localeData = require('configModel').getLocaleData(this.locale);
					this.config.direction = localeData && localeData.direction || 'ltr';
					// if asset was ordered and it's done the activator button should be disabled
					if (this.config.isOrder && (!this.config.isNotOrdered && this.config.isDone)) {
						this.activator.attr({
							canBeDisabled: 'false',
							disabled: true
						});
						this.config.dropzone && this.dropzone.attr({
							canBeDisabled: 'false',
							disabled: true
						});
					}
					else if (!require('editMode').readOnlyMode) {
						this.activator.attr({
							canBeDisabled: false,
							disabled: false
						});

						this.config.dropzone && this.dropzone.attr({
							canBeDisabled: false,
							disabled: false
						});
					}
				}

				// Remove previous elements if exist
				$(this.orderDOM).add($(this.order_button)).add($(this.tts_button)).remove();

				this.orderDOM = $($.parseHTML(Mustache.render(_input_html, this.config))).insertAfter(this.activator);
				this.file_input = this.orderDOM.filter('[type=file]'); // input[type=file]
				if (this.config.deleteButton) {
					this.delete_button = $(this.config.deleteButton);
				} else {
					this.delete_button = this.orderDOM.filter('button.delete');
				}
				this.order_data = this.orderDOM.filter('.order-data');
				// render order and tts buttons and adjust it's margins according to activator
				var buttons = $($.parseHTML(Mustache.render(_order_buttons, this.config))).insertBefore(this.activator);
				this.order_button = buttons.filter('.order-button');
				this.tts_button = buttons.filter('.tts-button');

				this.delete_button.css('margin', this.activator.css('margin'));
				buttons.css('margin', this.activator.css('margin'));
				/*buttons.css('margin-right', '5px');
				 buttons.css('margin-left', '5px');*/

				this.bindEvents();
			},

			bindEvents: function () {

				this.unbindEvents();

				var self = this;
				this.pid = require("userModel").getPublisherId(),
				this.cid = require("courseModel").getCourseId();

				if (self.pid === null || self.cid === null) {
					throw new Error("Cannot upload files without publisher id or course id.");
				}

				// Order button click
				this.order_button.click(function () {
					self.repo.startTransaction();
					self.setAssetData({state: false, isTTS: false});

					self.setPlaceholder.call(self, function (filename) {
						if (self.config.callback instanceof Function) {
							self.config.callback.call(self.config.context || window, filename);
						}
						self.repo.endTransaction();

						self.render();
					});
				});

				this.tts_button.click(function () {
					self.repo.startTransaction();
					self.setAssetData({isTTS: true});

					self.setPlaceholder.call(self, function (filename) {
						if (self.config.callback instanceof Function) {
							self.config.callback.call(self.config.context || window, filename);
						}
						self.repo.endTransaction();

						self.render();
					});
				});

				this.order_data.find('.tts-go-button').click(function () {
					var text;
					require('busyIndicator').start();
					if (self.config.asIs) {
						var record = self.repo.get(self.config.recordId);
						if (record) {
							var assetItem = self.findAssetItem();
							if (!assetItem || !assetItem.narrationText) {
								text = require('cgsUtil').getTextViewerText(record.data.title);
							} else {
								text = self.config.narrationText;
							}
						}
					}
					else {
						text = self.config.narrationText;
					}

					require('ttsModel').go(self.locale, text, function (url) {
						logger.debug(logger.category.FILE_UPLOAD, 'Text to speech service successful, url: ' + url);
						self.repo.startTransaction();
						var record = self.repo.get(self.config.recordId);
						if (record) {
							var assetItem = self.findAssetItem();
							if (assetItem) {
								assetItem.origin = 'tts';
								self.updateAssetItem(assetItem);
							}
						}
						self.fileUploaded(url);
						self.repo.endTransaction();
						require('busyIndicator').stop();
					}, function (ttsService) {
						logger.error(logger.category.FILE_UPLOAD, 'Text to speech service failure for service: ' + ttsService);
						require('busyIndicator').stop();
						require('showMessage').clientError.show({errorId: 3004});
					});
				});

				// Delete the file
				this.delete_button.click(this.deleteAsset.bind(this));

				// Change asset id
				this.order_data.find('.asset-id').change(function () {
					self.repo.startTransaction();
					self.config.assetId = $(this).val();
					self.setAssetId($(this).val());
					self.repo.endTransaction();
				});

				// Change asset notes
				this.order_data.find('.asset-notes').change(function () {
					self.repo.startTransaction();
					self.config.notes = $(this).val();
					self.setNotes($(this).val());
					self.repo.endTransaction();
				});

				// Change asset state
				this.order_data.find('.asset-state').change(function () {
					self.repo.startTransaction();
					var val = !!parseInt($(this).val());
					self.setState(val);

					if (!val) {
						self.setPlaceholder.call(self, function (filename) {
							if (self.config.callback instanceof Function) {
								self.config.callback.call(self.config.context || window, filename);
							}
							self.repo.endTransaction();

							self.render();
						});
					}
					else {
						self.repo.endTransaction();
						self.render();
					}
				});

				// Change if set the narration text as is from text viewer
				this.order_data.find('.chk-as-is').change(function () {
					self.repo.startTransaction();
					var asIs = $(this).is(':checked');
					self.setAsIs(asIs);
					if (!asIs) {
						var record = self.repo.get(self.config.recordId);
						if (record) {
							assetItem = self.findAssetItem();
							if (!assetItem || !assetItem.narrationText) {
								self.setNarrationText(self.config.isMultiNarration ? '' : require('cgsUtil').getTextViewerText(record.data.title));
							}
						}
					}
					else {
						self.setNarrationText('');
					}
					self.repo.endTransaction();
					self.render();
				});

				// Change narration text
				this.order_data.find('.narration-text').change(function () {
					self.repo.startTransaction();
					self.config.narrationText = $(this).val();
					self.setNarrationText($(this).val());
					self.repo.endTransaction();
				});

				// File upload activator click
				this.activator.click(function (event) {
					self.file_input.trigger(event);
				});

				//init event listeners for dropzone
				if (this.config.dropzone) {
					this.dropzone.on("dragover", function (event) {
						event.preventDefault && event.preventDefault();
						this.className = 'hover';
						return false;
					});
					this.dropzone.on("dragend dragleave", function (event) {
						event.preventDefault && event.preventDefault();
						this.className = '';
						return false;
					});

					this.dropzone.on("drop", function (event) {
						event.preventDefault && event.preventDefault();
						this.className = '';
						self.handleUpload.call(self, event);
						return false;
					});
				}

				this.file_input.change(_.bind(this.handleUpload, this));
			},

			handleUpload: function (event) {
				this.activator.blur();
				var allFilesAreAllowed = 0, files_list, self = this;

				//files array after drop event
				if(event.originalEvent && event.originalEvent.dataTransfer) {
					files_list = event.originalEvent.dataTransfer.files;
				}
				//files array after upload via input type file
				if(!files_list) {
					files_list = event.target.files;
				}

				if (!files_list || !files_list.length) return;

				if (self.config.options.allowFiles && self.config.options.fileMymType) { //&& self.config.options.allowFiles.indexOf('*') == -1
					for (var i = 0; i < files_list.length; i++) {
						if (files_list[i].type.toLowerCase().indexOf(self.config.options.fileMymType.toLowerCase()) != -1) {

							if (_.map(self.config.options.allowFiles, function (item) {
									return item.toLowerCase();
								}).indexOf(files_list[i].type.toLowerCase()) < 0) {
								allFilesAreAllowed = 2;
							}
							else if (self.config.options.extensions && self.config.options.extensions.length && files_list[i].name.lastIndexOf('.') > -1) {
								var fileExtension = files_list[i].name.substr(files_list[i].name.lastIndexOf('.') + 1);
								if (!_.any(self.config.options.extensions, function (ext) {
										return ext.toLowerCase() == fileExtension.toLowerCase()
									})) {
									allFilesAreAllowed = 2;
								}
							}
						}
						else {

							// check mymType vs. name, for unrecognisable cgs types (as 'cws')
							if (files_list[i].name.toLowerCase().indexOf(self.config.options.fileMymType.toLowerCase()) == -1) {
								allFilesAreAllowed = 1;
							}
						}

					}

					if (allFilesAreAllowed == 1) {
						self.throwError('C002', true);
						return;
					}
					if (allFilesAreAllowed == 2) {
						self.throwError('C001', true);
						return;
					}
				}

				for (var i = 0; i < files_list.length; i++) {
					if (!files.checkFileSize(files_list[i], self.config.options.ignoreSizeLimit, self.throwError.bind(self))) {
						return;
					}
				}

				busy.start();
				events.fire('busyIndicator.showCancel', true);
				events.fire('busyIndicator.enableCancel', false);

				var chosenFile = files_list[0];
				var chosenFileName = chosenFile.name;
				var uploadAssetToLocal = function (newFileName, splitToFolders) {
					self.file_input.unbind('change');
					busy.setData('((upload.file.to.local))');
					if (self.config.options.rename && _.isFunction(self.config.options.rename)) {
						var newName;
						_.each(files_list, function (item) {
							newName = self.config.options.rename(item.name);
						});
					}

					//prepare course directories
					files.prepareDirs(self.pid, self.cid, function () {

						var originalName = chosenFile ? chosenFile.name : '';

						files.saveAsset({
							inputElement: event.target,
							filesList: files_list,
							publisherId: self.pid,
							courseId: self.cid,
							callback: function (file) {
								self.fileUploaded(files.removeCoursePath(self.pid, self.cid, file.fullPath), (newName || originalName), file, true);
							},
							is_ref: self.config.options.is_ref,
							splitToFolders: splitToFolders,
							fileName: newFileName,
							ignoreSizeLimit: self.config.options.ignoreSizeLimit,
							errorCallback: self.throwError.bind(self)
						});
					});
				};

				//if we decide to keep the file name the user uploaded, need to remove empty spaces (" ")
				if (self.config.options.keepName) {
					chosenFileName = chosenFile.name.replace(/ /g, "_");
				}

				if (self.config.options.uploadFileLocalyOnly) {
					//save data locally without uploading to server
					uploadAssetToLocal(self.config.options.keepName ? chosenFileName : null );
				}

				if(!self.config.options.uploadFileLocalyOnly ||
					self.config.options.uploadFileToServer) {
					var uploadToServerSuccess = function (result) {

						var path = files.removeCoursePath(self.pid, self.cid, result.filePath.replace(/\\/g, '/'));
						//get the new sha1 name generated on server
						var fileLocation = path.split('/');
						var newFileName = fileLocation[fileLocation.length - 1];

						//for teacher references save the display name not in SHA1 (CREATE-4225)
						if(self.config.activator == "#button_upload_reference") {
							newFileName = this.file.name;
						}

						self.fileUploaded(path, newFileName, result.file);

					};
					var uploadToServerFailedOrAborted = function () {
						self.file_input.val('');
						busy.stop("all");
					};

					//upload file to server
					busy.setData('((upload.file.to.server))');
					var url = assets.uploadAbsPath((self.config.options.is_ref ? "cgsdata/" : "media/") + chosenFileName, true);
					url += "?isSha1=" + (self.config.options.keepName ? "false" : "true");

					assets.uploadAssetToServer({
						file: chosenFile,
						url: url,
						disableTranscode: self.config.options.disableTranscode,
						successCallback: uploadToServerSuccess,
						abortCallback: uploadToServerFailedOrAborted,
						errorCallback: uploadToServerFailedOrAborted
					});
				}

			},

			unbindEvents: function () {
				this.order_button.unbind();
				this.orderDOM.find('*').addBack().unbind();
				this.activator.unbind();
				this.config.dropzone && this.dropzone.unbind();
			},

			setState: function (state) {
				this.setAssetData({state: state});
			},

			setAssetId: function (assetId) {
				this.setAssetData({assetId: assetId});
			},

			setNotes: function (notes) {
				this.setAssetData({notes: notes});
			},

			setAsIs: function (asIs) {
				this.setAssetData({asIs: asIs});
			},

			setNarrationText: function (narrationText) {
				this.setAssetData({narrationText: narrationText});
			},

			setAssetData: function (data) {
				data = data || {};
				var record = this.repo.get(this.config.recordId);
				if (record) {
					var assetItem = this.findAssetItem(),
						needUpdateRecord = false;
					if (assetItem) { // The asset manager data already exists for this asset
						_.each(data, function (value, key) {
							if (typeof value != 'undefined' && assetItem[key] != value) {
								assetItem[key] = value;
								needUpdateRecord = true;
							}
						});
						if (needUpdateRecord) {
							this.updateAssetItem(assetItem);
						}
					}
					else { // There is no asset manager data, create it with default values
						this.repo.updatePropertyList(record.id, 'assetManager', {
							srcAttr: this.config.srcAttr,
							assetId: data.assetId || null,
							notes: data.notes,
							state: !!data.state,
							asIs: true,
							narrationText: null,
							isTTS: !!data.isTTS,
							allowFiles: this.config.options.allowFiles,
							fileMymType: this.config.options.fileMymType,
							isNarration: this.config.isNarration
						});
					}
				}
			},

			setPlaceholder: function (callback) {
				// Put placeholder media for ordered asset if srcAttr is still empty
				var ph = placeholders[this.config.options.fileMymType],
					record = this.repo.get(this.config.recordId),
					self = this;

				if (record && ph) {
					var placeholderPath = '/' + ph,
						fileExtension = this.config.options.extensions[0].toLowerCase();

					files.downloadFileToMemory({
						url: ph,
						callback: function _downloadFileToMemory(blob) {
							assets.uploadBlobAndSaveItLocally(blob,
								function _callback(placeholderPath) {
									if (this.config.srcAttr.indexOf(".") !== -1) {
										var repoMapData = this.getMultiNarrationData(this.config.srcAttr);

										this.repo.updatePropertyObject(this.config.recordId, repoMapData.root, repoMapData.locale, placeholderPath);
									} else if (this.config.locale) {
										this.repo.updatePropertyObject(this.config.recordId, this.config.srcAttr, this.config.locale, placeholderPath);
									} else {
										this.repo.updateProperty(this.config.recordId, this.config.srcAttr, placeholderPath);
									}
									if (typeof callback === 'function') {
										callback(placeholderPath);
									}
								}.bind(self), fileExtension);
						}
					});
				}
				else if (typeof callback === 'function') {
					callback(null);
				}
			},

			getMultiNarrationData: function (srcAttr) {
				//is multinarration
				var repo_path_map = srcAttr.split("."),
					multinarration_key = repo_path_map[0],
					multinarration_locale_key = repo_path_map[1];

				return {
					root: multinarration_key,
					locale: multinarration_locale_key
				};
			},

			// After file upload
			fileUploaded: function (filePath, originalName, fileBlob, isLocalUpload) {
				require('busyIndicator').stop();

				this.repo.startTransaction();
				if (this.config.recordId && this.config.srcAttr) {
					if (this.config.srcAttr.indexOf(".") !== -1) {
						var repoMapData = this.getMultiNarrationData(this.config.srcAttr);

						this.repo.updatePropertyObject(this.config.recordId, repoMapData.root, repoMapData.locale, filePath);
					} else if (this.config.locale) {
						this.repo.updatePropertyObject(this.config.recordId, this.config.srcAttr, this.config.locale, filePath);
					} else {
						// Set record property with uploaded file path
						this.repo.updateProperty(this.config.recordId, this.config.srcAttr, filePath);
					}
					// Set asset as done
					this.setState(!this.config.enableEdit);
				}

				if (this.config.callback instanceof Function) {
					this.config.callback.call(this.config.context || window, filePath, originalName, fileBlob, this.config.enableAssetManager, isLocalUpload);
				}
				this.repo.endTransaction();

				this.render();
			},

			// Upload error occurred
			throwError: function (errCode, isInvalidFile, data) {
				this.file_input.val('');

				var showMessage = require('showMessage')
				// If errorCallback exists - don't show popup, call the callback with error message
				if (typeof this.config.errorCallback == 'function') {
					if (_.isObject(isInvalidFile) && isInvalidFile.size) {
						showMessage.clientError.show({
							title: "File is too large",
							message: require('translate').tran("File size limit is") + " " + +isInvalidFile.size + "MB"
						});
					} else if (isInvalidFile) {
						this.config.errorCallback(this.getMessageInvalidFiles());
					} else {
						var err = showMessage.getErrorById(errCode);
						if (err)
							this.config.errorCallback(Mustache.render(err.message, data));
						else
							this.config.errorCallback('Unexpected error!');
					}
				}
				// If errorCallback doesn't exists - show error popup
				else {
					if (isInvalidFile) {
						if (isInvalidFile.size) {
							showMessage.clientError.show({
								title: "File is too large",
								message: require('translate').tran("File size limit is") + " " + +isInvalidFile.size + "MB"
							});
						} else {

							showMessage.clientError.show({
								title: "file.upload.not.supported.format.title",
								message: this.getMessageInvalidFiles().replace(/\n/g, "<br />").replace(/\t/g, "&emsp;").replace(/\*/g, "&bull;")
							});
						}
					} else {
						showMessage.clientError.show(_.extend(data, {errorId: errCode}));
					}
				}
				require('busyIndicator').stop();
			},

			deleteAsset: function () {
				if (!this.config.recordId || !this.config.srcAttr) {
					return;
				}

				this.repo.startTransaction();
				var record = this.repo.get(this.config.recordId);
				if (record) {
					if (this.config.srcAttr.indexOf(".") !== -1) {
						var repoMapData = this.getMultiNarrationData(this.config.srcAttr);

						this.repo.deletePropertyObject(this.config.recordId, repoMapData.root, repoMapData.locale);
					} else if (this.config.locale) {
						this.repo.deletePropertyObject(this.config.recordId, this.config.srcAttr, this.config.locale);
					} else {
						this.repo.deleteProperty(this.config.recordId, this.config.srcAttr);
					}
					//this.repo.updateProperty(record.id, this.config.srcAttr, '');
					var assetIndex = this.findAssetIndex();
					this.repo.updateProperty(record.id, 'assetManager', _.compact(_.map(record.data.assetManager, function (val, ind) {
						return ind != assetIndex && val
					})));
				}

				if (this.config.callback instanceof Function) {
					this.config.callback.call(this.config.context || window);
				}
				this.repo.endTransaction();

				this.render();
			}
		}

		return FileUpload;
	});