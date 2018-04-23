define(['repo', 'events', 'assets', 'files', 'zip_js', 'dialogs'], 
	function(repo, events, assets, files, ZipJS, dialogs) {
 
		function appletFilesManager() {};

		appletFilesManager.prototype = {
			/*
			** @param appletId - relevant applet id
			** @param fileMymType - type of file to upload, ('image', 'audio' or 'video')
			** @param allowFiles - array of allowed mime types (ex. ['image/png', 'image/bmp'])
			** @param callback - callback will receive relative path of uploaded file
			*/
			getAsset: function(appletId, fileMymType, allowFiles, callback) {

				if (!appletId) {
					throw new Error('Missing applet id or asset id');
				}

				if (typeof fileMymType == 'function') {
					callback = fileMymType;
					fileMymType = allowFiles = null;
				}

				var dialogConfig = {
					title: "Upload new "+ fileMymType,
					content: {
						text: "Choose file to upload"
					},
					buttons: {
						cancel:	{ label: 'cancel' }
					},
					fileMymType: fileMymType,
					allowFiles: allowFiles
				};

				events.once('onAssetFileUploaded', function(response) {
					
					var applet = repo.get(appletId);
					if (response && response != 'cancel' && applet) {

						var assetId = repo.genId();
						if (applet.data.files instanceof Array) {
							repo.updatePropertyList(appletId, 'files', {
								assetId: assetId,
								path: response.path
							});
						}
						else {
							repo.updateProperty(appletId, 'files', [{
								assetId: assetId, 
								path: response.path
							}]);
						}


						// Invoke callback with received relative path
						if (typeof callback == 'function')
							callback({ assetId: assetId, assetName: response.fileName });
					}
					// Invoke callback with null - no file chosen by user
					else if (typeof callback == 'function')
						callback({ assetId: null, assetName: null });

				}, this);

				dialogs.create('appletFileUpload', dialogConfig, 'onAssetFileUploaded');
			},

			getZipAsset: function(appletId, callback) {

				if (!appletId) {
					throw new Error('Missing applet id or asset id');
				}

				var dialogConfig = {
					title: "Upload new lib file",
					content: {
						text: "Choose file to upload"
					},
					buttons: {
						cancel:	{ label: 'cancel' }
					},
					fileMymType: "zip",
					allowFiles: ["application/zip", "application/x-zip-compressed"]
				};

				events.once('onAssetLibFileUploaded', function(response) {

					ZipJS.workerScriptsPath = 'js/libs/zipjs/';
					var applet = repo.get(appletId),
						assetId = repo.genId();

					if (response && response != 'cancel' && response.blob && applet) {

						require('busyIndicator').start();

						response.blob.file(function(fileBlob) {
							ZipJS.createReader(new ZipJS.BlobReader(fileBlob), function (reader) {
								reader.getEntries(function (entries) {
									var total = entries.length,
										fileNames = [];

				                    (function saveFile(item) {
				                        if (!item) {
				                            reader.close();
				                            
				                            if (applet.data.files instanceof Array) {
												repo.updatePropertyList(appletId, 'files', {
													assetId: assetId,
													type: 'lib',
													path: '/media/' + assetId,
													hrefs: fileNames
												});
											}
											else {
												repo.updateProperty(appletId, 'files', [{
													assetId: assetId,
													type: 'lib',
													path: '/media/' + assetId,
													hrefs: fileNames
												}]);
											}

											require('busyIndicator').stop();

											// Invoke callback with received relative path
											if (typeof callback == 'function')
												var lessonModel = require('lessonModel');
												lessonModel.setDirtyFlag(true);
												lessonModel.saveActiveLesson(function () {
													callback({ assetId: assetId, assetName: response.fileName, zipFiles: fileNames });
												})
												
				                            return;
				                        }
			                    		require('busyIndicator').setData('((Saving files))...', (total - entries.length) / total * 100);
				                        if (!item.directory) {
				                        	item.getData(new ZipJS.BlobWriter(), function (blob) {
				                                var path = [files.coursePath(), 'media', assetId, item.filename].join('/'),
				                                    filename = item.filename.substr(item.filename.lastIndexOf('/') + 1),
				                                    index,
				                                    paths = [];

				                                while ((index = path.indexOf('/', index + 1)) != -1) {
				                                    paths.push(path.substr(0, index));
				                                }
				                                path = path.substr(0, path.lastIndexOf('/'));
				                                
				                                //save the blob content as real file
				                                files._makeDirs(paths, function() {
				                                    files._saveFile(filename, 'xxx', blob, path, function(file) {
				                                    	fileNames.push(item.filename.substr(0, item.filename.lastIndexOf('/') + 1) + file.name);
				                                        saveFile(entries.shift());
				                                    });
				                                })
				                            });
				                        }
				                        else {
				                            saveFile(entries.shift());
				                        }
				                    })(entries.shift());
								});
							});
						});

					}
					// Invoke callback with null - no file chosen by user
					else if (typeof callback == 'function')
						callback({ assetId: null, assetName: null });

				}, this);

				dialogs.create('appletFileUpload', dialogConfig, 'onAssetLibFileUploaded');
			},

			/*
			** @param appletId - relevant applet id
			** @param assetId - Id of asset to return it's path
			*/
			getAssetUrl: function(appletId, assetId) {
				var applet = repo.get(appletId);
				if (applet && applet.data.files instanceof Array) {
					// Find the asset in applet assets collection
					var asset = _.find(applet.data.files, function(file) {
							return file.assetId == assetId;
						});
					if (asset) {
						return { assetUrl: assets.serverPath(asset.path) };
					}
				}

				return { assetUrl: null };
			},

			/*
			** @param appletId - relevant applet id
			** @param assetId - applet asset id to delete
			*/
			deleteAsset: function(appletId, assetId) {
				var applet = repo.get(appletId);
				if (applet && applet.data.files instanceof Array) {
					// Remove all instances of assetId from applet files
					var filesArr = _.reject(applet.data.files, function(file) {
							return file.assetId == assetId;
						});

					repo.updateProperty(appletId, 'files', filesArr);
				}
			},

			/*
			** @param appletId - relevant applet id
			** @param data - blob to save
			** @param fileName - original file name
			** @param callback - callback will receive relative path of uploaded file
			*/
			setAsset: function(appletId, data, fileName, callback) {
				var applet = repo.get(appletId);
				if (applet) {
					files.saveBlobAsAsset(data, fileName, undefined, undefined, function(f) {
						var path = files.removeCoursePath(undefined, undefined, f.fullPath);

						var assetId = repo.genId();
						if (applet.data.files instanceof Array) {
							repo.updatePropertyList(appletId, 'files', {
								assetId: assetId,
								path: path
							});
						}
						else {
							repo.updateProperty(appletId, 'files', [{
								assetId: assetId, 
								path: path
							}]);
						}

						// Invoke callback with received relative path
						if (typeof callback == 'function')
							callback({ assetId: assetId, assetName: fileName });
					});
				}
				else if (typeof callback == 'function')
					callback({ assetId: null, assetName: null });
			}

		};

		return new appletFilesManager;
});