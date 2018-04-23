define(['lodash', 'cryptojs', 'cryptojs_sha1', 'canvas_blob', 'browserDb'],
function(_, CryptoJS, cryptojs_sha1, canvas_blob, browserDb) {

	// add FileError object to window
    window.FileError = {
        ABORT_ERR: 20,
        DATA_CLONE_ERR: 25,
        DOMSTRING_SIZE_ERR: 2,
        HIERARCHY_REQUEST_ERR: 3,
        INDEX_SIZE_ERR: 1,
        INUSE_ATTRIBUTE_ERR: 10,
        INVALID_ACCESS_ERR: 15,
        INVALID_CHARACTER_ERR: 5,
        INVALID_MODIFICATION_ERR: 13,
        INVALID_NODE_TYPE_ERR: 24,
        INVALID_STATE_ERR: 11,
        NAMESPACE_ERR: 14,
        NETWORK_ERR: 19,
        NOT_FOUND_ERR: 8,
        NOT_SUPPORTED_ERR: 9,
        NO_DATA_ALLOWED_ERR: 6,
        NO_MODIFICATION_ALLOWED_ERR: 7,
        QUOTA_EXCEEDED_ERR: 22,
        SECURITY_ERR: 18,
        SYNTAX_ERR: 12,
        TIMEOUT_ERR: 23,
        TYPE_MISMATCH_ERR: 17,
        URL_MISMATCH_ERR: 21,
        VALIDATION_ERR: 16,
        WRONG_DOCUMENT_ERR: 4
    };


    // file size limits are being fetched from server. see setFileSizeLimits
    var fileSizeLimit = {};

	/**
	 * UUID v4 generator in JavaScript (RFC4122 compliant)
	 * (this was copied from repo.js to reduce coupling)
	 */
	function _uuid() {
		var uuid = "", i, random;

		for (i = 0; i < 32; i++) {
			random = Math.random() * 16 | 0;

			if (i == 8 || i == 12 || i == 16 || i == 20) {
				uuid += '-'
			}
			uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
		}
		return uuid;
	}

	// Check for the File API support.
	var _missing = (window.Blob && window.DataView && window.JSON && window.File && window.FileReader) ?  true : false;

	if (!_missing) {
		var err = 'The File API is not supported in this browser.';
		alert(err);
		throw new Error(err);
	}

	// Settings
	var QUOTA = 10737418240, // 10 gigabyte
		PS = '/' // path separator char

	// --- Internal functions: ---

	function _error(err) {
		if(err.code) {
			require('busyIndicator').stop('all');
			logger.error(logger.category.FILES, 'File not found: ' + err.path);
			require('showMessage').clientError.show({errorId: 'FILES' + err.code, 'srcMessage' : err.path});
		} else {
			logger.error(logger.category.FILES, 'Local storage error: ' + err);
		}
	}

	function _readBlob(blob, callback, is_text, is_binary) {
		var reader = new FileReader;

		reader.onload = function(event) {
			// `result` can be an empty string: uploading an empty file is perfectly fine
			var result = event.target.result

			if (typeof callback === "function") callback(result)
		}

		reader.onerror = _error;

		if (is_binary) reader.readAsArrayBuffer(blob)
		else if (is_text) reader.readAsText(blob)
		else reader.readAsBinaryString(blob)
	}

	function _fmtAssetName(assetName) {
		/* old code
		var chars = assetName.split("")

		chars.splice(4, 0, PS)
		chars.splice(2, 0, PS)

		return chars.join("")*/
		return assetName.substring(0,2).concat(PS,assetName.substring(2,4),PS,assetName);
	}

	// --- Private interface: ---

	function files(callback) {
		this.fs = null;
		// this.allocate(callback);
	}

	function fileNameOptimizer(fName) {

		var chars = fName.split(" ")

		return chars.join("_")
	}

	function initDb(fs, callback) {
		logger.debug(logger.category.FILES, 'Initialize IndexDB t2k-lastOpened server');
		browserDb.open({
            version: 1, // Number should always increase if we're changing the schema, otherwise it will not work.
            server: 't2k-lastOpened',
            schema: {
                lastOpened: {
                    key: {
                        keyPath: 'courseId'
                    }
                }
            }
        })
        .done(function(server) {
        	this.server = server;

        	this.server.lastOpened
        		.query()
        		.all()
        		.map()
        		.count()
        		.execute()
        		.done(function(count) {
        			if (!count) {
        				logger.debug(logger.category.FILES, 'Add all existing course in file system to t2k-lastOpened server with current date');
        				getAllCoursesIds.call(this, initLastOpened.bind(this, callback.bind(this, fs)));
        			}
        			else if (typeof callback == 'function') {
        				callback(fs);
        			}
        		}.bind(this));

        }.bind(this));
	}

	function getAllCoursesIds(callback) {
		var self = this,
			idsList = [];

		// Get publishers directory
		self.fs.root.getDirectory('publishers', { create: 0 }, function(publishersDir) {
			// Get all publishers ids directories
			publishersDir.createReader().readEntries(function(entries) {
				function readEntryCourses(entry) {
					if (entry) {
						self.fs.root.getDirectory('publishers/' + entry.name + '/courses' , { create: 0 }, function(coursesDir) {
							coursesDir.createReader().readEntries(function (coursesDirs) {
								_.each(coursesDirs, function(courseDir) {
									if (courseDir.isDirectory && courseDir.name.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/)) {
										idsList.push({ publisherId: entry.name, courseId: courseDir.name });
									}
								})
								readEntryCourses(entries.shift());
							}, function() {
								readEntryCourses(entries.shift());
							});
						}, function() {
							readEntryCourses(entries.shift());
						});
					}
					else {
						if (typeof callback == 'function') callback(idsList);
					}
				}

				readEntryCourses(entries.shift());
			}, function() {
				if (typeof callback == 'function') callback(idsList);
			});
		}, function() {
			if (typeof callback == 'function') callback(idsList);
		})
	}

	function initLastOpened(callback, coursesData) {
		var insertCourse = function(courseData) {
			if (courseData) {
				this.server.lastOpened
					.query()
					.filter('courseId', courseData.courseId)
					.execute()
					.done(function(results) {
						if (!results || !results.length) {
							this.server.lastOpened
								.add(_.extend({ openDate: (new Date).toISOString() }, courseData))
								.done(function() {
									insertCourse(coursesData.shift());
								});
						}
						else {
							insertCourse(coursesData.shift());
						}
					}.bind(this));
			}
			else if (typeof callback == 'function') {
				callback();
			}
		}.bind(this);

		insertCourse(coursesData.shift());
	}

    files.prototype.setFileSizeLimits = function (settings){
    	_.each(settings, function (item){
    		if (!item.mimeTypes.length) {
    			fileSizeLimit[item.type] = {
    				size: item.size,
    				type: item.type
    			};
    		}
    		else {
				_.each(item.mimeTypes, function(mimeType) {
					fileSizeLimit[mimeType] = {
						size: item.size,
	    				type: item.type
	    			};
				});
    		}
		});
    };

	/** Sanity test. */
	files.prototype._test = function() {
		if (!this.fs) {
			logger.error(logger.category.FILES, 'Local storage: not allocated');
		}
	}

	/** Read blob to string. */
	files.prototype._readBlob = function(blob, callback) {
		this._test() // It should be safe to remove calls to _test from the production build
		_readBlob(blob, _.bind(callback, this)) // Private methods are bound to the same object
	}

	/** Get asset name: {SHA-1 of the data blob} + {.ext} */
	files.prototype._getAssetName = function(blob, originalFilename, callback) {
		this._readBlob(blob, function(result) {
			var alg = CryptoJS.algo.SHA1.create(),
				length = 2 << 18;

			if (result.length > (length << 2)) {
				alg.update(result.substr(0, length));
				alg.update(result.substr(result.length - length, length));
			}
			else {
				alg.update(result);
			}

			var name = alg.finalize(); // {SHA-1 of the data blob}
			name += originalFilename.replace(/.+?([^.]+)$/, ".$1").toLowerCase() // {.ext}
			callback.call(this, name, originalFilename, blob);
		})
	}

	/** Make directories. */
	files.prototype._makeDirs = function(dirs, callback) {
		dirs = _.chain(dirs)
				.map(function(dir) {
					var all = []
					do {
						all.push(dir);
					} while (dir.lastIndexOf(PS) > -1 && (dir = dir.substr(0, dir.lastIndexOf(PS))));
					return all;
				})
				.flatten()
				.compact()
				.unique()
				.sortBy(function(dir) {
					return (dir.match(new RegExp(PS, "g")) || []).length;
				})
				.value();

		var root = this.fs.root
		/* Make dirs recursively */
		function mkdir_recur() {
			if (dirs.length) root.getDirectory(dirs.shift(), {create: 1}, mkdir_recur, _error)
			// This callback isn't internal, so we don't care about the context it gets
			else if (typeof callback === "function") callback()
		}

		mkdir_recur()
	}

	/** Change directory. */
	files.prototype._cd = function(path, callback) {
		this._test();

		this.path = path; //for debugging purposes

		try{
        this.fs.root.getDirectory(path, {create: 0}, _.bind(callback, this), _.bind(function(errObj) {

            errObj.path = this.path;
			_error(errObj)
		}, this));
        }catch(exception){

        }
	}

	/** Save file (low-level). */
	files.prototype._save = function(dir, filename, data, callback) {
		this.path = filename; //for debugging purposes

		dir.getFile(filename, {create: 1}, function(f) {

            f.createWriter(function(file) {

				// Called after truncate()
				file.onwriteend = function() {

					// Called after write()
					file.onwriteend = function() {
						// This callback isn't internal, so we don't care about the context it gets
						if (typeof callback === "function") callback(f)
					}

					file.write(data)
				}

				file.truncate(0)
			}, _error)
		}, _error)
	}

	/** Save file. */
	files.prototype._saveFile = function(filename /* or null for SHA-1 */, originalFilename, data, path, callback,createPath) {
        this._test()

        this._makeDirs([path], _.bind(this._continueSaveFile, this,
            filename, originalFilename, data, path, callback));
	}

    files.prototype._continueSaveFile = function(filename /* or null for SHA-1 */, originalFilename, data, path, callback) {

        this._cd(path, function(dir) {
            // `originalFilename` is used to set file extension when `filename` is null

            if (!filename) {
                this._getAssetName(data, originalFilename, function(assetName) {

                    assetName = _fmtAssetName(assetName);

                    this._makeDirs([[path, assetName.substr(0, 5)].join(PS)],
						function() {
							this._save(dir, assetName, data, callback);
                    }.bind(this));
                });
            }
            else {
                this._save(dir, fileNameOptimizer(filename), data, callback);
            }
        });
    }
	// --- Public interface: ---

	/** Allocate storage. */
	files.prototype.allocate = function(callback) {
		var self = this;

		navigator.webkitPersistentStorage.requestQuota(QUOTA, function(bytes) {
			//check if user approve permission

			if (bytes !== QUOTA) {
				$(".modal").hide();
				require("events").once('approve_permission', function () {
					location.reload();
				});

                require('dialogs').create('simple', {
                    title: "Loading Notification",
                    buttons: {
                        cancel: {label: 'OK'}
                    },
                    content: {
                    			text: "When working in the application, files are saved on your desktop.<br /> Click OK on the permission prompt to allow this process and to successfully load the CGS. If you click Cancel, the system returns to the Login screen."
                    		},
                    closeOutside: false
                }, 'approve_permission');
			} else {
				webkitRequestFileSystem(PERSISTENT, bytes, function(fs) {
					self.fs = fs;
					initDb.call(self, fs, callback);
				}, _error);
			}
		}, _error);
	};

	/** Prepare directory structure for course. */
	files.prototype.prepareDirs = function(publisherId, courseId, callback) {
		var dirs = [
			'publishers',
			'publishers/' + publisherId,
			'publishers/' + publisherId + '/courses',
			'publishers/' + publisherId + '/courses/' + courseId
		], prefix = dirs[dirs.length - 1]

		/* Leaf directories */
		_.each("cgsData css lessons tocItems media schema sequences standards customizationPack".split(' '),
			function(value) {
				dirs.push(prefix + PS + value)
			})

			this._makeDirs(dirs, callback)
	};

	/** Get the course's local path. */
	files.prototype.coursePath = function(publisherId, courseId, /* optional */ filename) {
		if (typeof publisherId === "undefined") {
			publisherId = require("userModel").getPublisherId()
		}
		if (typeof courseId === "undefined") {
			courseId = require("courseModel").getCourseId()
		}
		var cs = ['publishers', publisherId, 'courses', courseId]
		if (typeof filename === "string") cs.push(filename)
		return cs.join(PS);
	}

	files.prototype.removeCoursePath = function(pid, cid, fullPath) {
		var cpath = this.coursePath(pid, cid, "")
		return fullPath.replace(cpath, "")
	}

	/**
	 * Download remote file and store it locally
	 * (under publishers/publisherId/courses/courseId/)
	 * config:
	 * config.url - url to download
	 * config.publisherId - publisher id (optional)
	 * config.courseId - course id (optional)
	 * config.filename - save as filename (optional, empty for SHA-1)
	 * config.dirname - dirname
	 * config.fileExtension - fileExtension (optional)
	 * config.callback - success callback
	 * config.failCallback - fail callback
	 * config.progressCallback - progress callback
	 */
	files.prototype.downloadFile = function(config) {
		var dir = this.coursePath(config.publisherId, config.courseId, config.dirname),
			req = new XMLHttpRequest;

		req.responseType = 'blob';

		req.onload = function(event) {
			if (['4', '5'].indexOf(event.target.status.toString()[0]) == -1) {
				this._saveFile(config.filename,
                    config.fileExtension ? '.' + config.fileExtension : config.url,
                    req.response,
                    dir,
                    config.callback,
                    true);
			}
			else if (typeof config.failCallback == 'function') {
				config.failCallback();
			}
		}.bind(this);

		req.onerror = config.failCallback;

		req.onprogress = config.progressCallback;

		req.open('get', config.url);
		req.send();

		return req;
	}


	/**
	 * Download remote file and store it locally
	 * (under publishers/publisherId/courses/courseId/)
	 * config:
	 * config.url - url to download
	 * config.publisherId - publisher id (optional)
	 * config.courseId - course id (optional)
	 * config.filename - save as filename (optional, empty for SHA-1)
	 * config.dirname - dirname
	 * config.fileExtension - fileExtension (optional)
	 * config.callback - success callback
	 * config.failCallback - fail callback
	 * config.progressCallback - progress callback
	 */
	files.prototype.downloadFileToMemory = function(config) {
		var	req = new XMLHttpRequest;

		req.responseType = 'blob';

		req.onload = function(event) {
			if (['4', '5'].indexOf(event.target.status.toString()[0]) == -1) {
				config.callback(req.response, config);
			}
			else if (typeof config.failCallback == 'function') {
				config.failCallback();
			}
		}.bind(this);

		req.onerror = config.failCallback;

		req.onprogress = config.progressCallback;

		req.open('get', config.url);
		req.send();

		return req;
	}


	/*
    *** Copy file from one directory to other ***
    ** @param src - source directory
    ** @param destination - destination directory
    ** @param deleteSource - boolean (delete source after copy)
    */

    files.prototype.copyFile = function (file, destination, deleteSource) {
        this.fs.root.getFile(file,{ create: 0 }, function (copyFile) {
            this.fs.root.getDirectory(destination, null, function (directoryEntry) {
                copyFile.copyTo(directoryEntry, null,function () {
                    deleteSource && copyFile.remove($.noop);
                });
            });
        }.bind(this));
    }

    /*
    *** Copy file from one directory to other ***
    ** @param src - source directory
    ** @param destination - destination directory
    ** @param deleteSource - boolean (delete source after copy)
    */
    files.prototype.copyFileAndRename = function (file, destination, newName, callback) {
        this.fs.root.getFile(file,{ create: 0 }, function (copyFile) {
            this.fs.root.getDirectory(destination, null, function (directoryEntry) {
                copyFile.copyTo(directoryEntry, newName, callback);
            });
        }.bind(this));
    }

	/*
	********* Get asset from user and store it locally. *********
	** @param inputElement - input element with files to save (from upload event)
	** @param filesList - list of uploaded files (optional)
	** @param publisherId (optional)
	** @param courseId (optional)
	** @param callback - successful callback (optional)
	** @param is_ref (optional)
	** @param fileName (optional) - save the file with specific name, not SHA-1 (optional)
	** @param splitToFolders(optional) - split the recieved new name to sub folders as in sha1
	** @param ignoreSizeLimit - ignore size limitation (optional)
	** @param errorCallback - file size limitation callback (optional)
	*/
	files.prototype.saveAsset = function(options) {
		var filesList = options.filesList;

		if(!filesList) {
			filesList = options.inputElement.files;
		}

		if (!filesList) {
			logger.error(logger.category.FILES, 'There is no files in event object for saveAsset function');
			throw new Error("Bad `event` object, or this feature isn't supported " +
				"by the Internet Explorer 6 you're using.");
		}

		var dir = options.directory ? options.directory : this.coursePath(options.publisherId, options.courseId, options.is_ref? "cgsData": "media")

		for (var i = 0, f; f = filesList[i]; ++i) {
			if (!this.checkFileSize(f, options.ignoreSizeLimit, options.errorCallback)) {
				return false;
			}

			//asset name might be null, in this case, sha1 name will be generated
			var assetName = options.fileName;

			if(options.splitToFolders){
				//use a function that saves the name with folder system (1dfgy2125656.png - > 1d/fg/1dfgy2125656.png )
				assetName = _fmtAssetName(options.fileName);
			}

			var reader = new FileReader,
				self = this;

			reader.onload = function(f, event) {
				var result = event.target.result;
                //@REMOVE
				if (!result) {
					logger.error(logger.category.FILES, "FileReader didn't produce result: " + f.name);
					throw new Error("FileReader didn't produce result.");
				}

				var blob = new Blob([new DataView(result)]);
				function saveAssest(){
					self._saveFile(assetName , f.name, blob, dir, function(file) {
						if (typeof options.callback == 'function') {
							options.callback(file);
						}
					});
				}

				if(options.splitToFolders){
					//sha1 recieved from server, need to create the missing folders under "media"
					this._makeDirs([
						[dir, assetName.substr(0, 5)].join(PS)
					], saveAssest);
				}else{
					//dont need to create folders- the file is saved with its original name
					saveAssest();
				}

			}.bind(this, f);

			reader.readAsArrayBuffer(f);
		}
	}

	files.prototype.checkFileSize = function(file, ignoreSizeLimit, errorCallback) {
		if (!ignoreSizeLimit) {
			if (fileSizeLimit[file.type]) { // Test file type
				if (file.size > fileSizeLimit[file.type].size) {
					logger.info(logger.category.FILES, 'File size limit exceeded, can\'t save the file' );
					if (typeof errorCallback == 'function') {
						errorCallback(3001, null, {size : (fileSizeLimit[file.type].size / 1048576).toFixed(2), isImage: fileSizeLimit[file.type].type == 'image'});
					}
					else {
						require('showMessage').clientError.show({errorId: 3001,size : (fileSizeLimit[file.type].size / 1048576).toFixed(2), isImage: fileSizeLimit[file.type].type == 'image'});
						require('busyIndicator').stop();
					}
					return false;
				}
			} else {
				var fileExtension;
				// Get file extension
				var filenameSplit = file.name.split('.');
				if (filenameSplit.length > 1) {
					var fileExtension = filenameSplit.pop().toLowerCase();
				}

				if (fileExtension == 'unity3d') {
					var selectedFileSizeLimit = fileSizeLimit['application/vnd.unity'];
					if (file.size > selectedFileSizeLimit.size) {
						logger.info(logger.category.FILES, 'File size limit exceeded, can\'t save the file' );
						if (typeof errorCallback == 'function') {
							errorCallback(3001, null, {size : selectedFileSizeLimit.size / 1048576, isImage: false});
						}
						else {
							require('showMessage').clientError.show({errorId: 3001,size : selectedFileSizeLimit.size / 1048576, isImage: false});
							require('busyIndicator').stop();
						}
						return false;
					}
				} else {
					if (file.size > fileSizeLimit['default'].size) {
						logger.info(logger.category.FILES, 'File size limit exceeded, can\'t save the file' );
						if (typeof errorCallback == 'function') {
							errorCallback(3001, null, {size : fileSizeLimit['default'].size / 1048576, isImage: false});
						}
						else {
							require('showMessage').clientError.show({errorId: 3001,size : fileSizeLimit['default'].size / 1048576, isImage: false});
							require('busyIndicator').stop();
						}
						return false;
					}
				}
			}
		}
		else if (file.size > require('configModel').configuration.maxFileSize) {
			logger.info(logger.category.FILES, 'File size limit exceeded, can\'t save the file' );
			if (typeof errorCallback == 'function') {
				errorCallback(3001, null, {size : require('configModel').configuration.maxFileSize / 1048576, isImage: false});
			}
			else {
				require('showMessage').clientError.show({errorId: 3001,size : require('configModel').configuration.maxFileSize / 1048576, isImage: false});
				require('busyIndicator').stop();
			}
			return false;
		}
		return true;
	}

	/** Save blob as asset named like `filename`. */
	files.prototype.saveBlobAsAsset = function(blob, filename, publisherId, courseId, callback, is_ref) {
		if (typeof blob === "string") {
			blob = new Blob([blob], {type: 'text/plain'})
		}
		var dir = this.coursePath(publisherId, courseId, is_ref ? "cgsData" : "media")
		this._saveFile(is_ref? filename: null, filename, blob, dir, callback)
	}

	/** Save object or string to file. */
	files.prototype.saveObject = function(obj, filename, path, callback, createPath) {
		if (typeof obj !== "string") {
			obj = JSON.stringify(obj)
		}

		var blob = new Blob([obj], {type: 'application/json'})
		this._saveFile(filename, "foo.json", blob, path, callback, createPath)
	}

	/** Load object or string from file. */
	files.prototype.loadObject = function(filePath, /* optional */ dontParse, callback) {
		var delegate, self = this;

		if (typeof dontParse === "function") {
			/* Shift optional args. */
			callback = dontParse
			dontParse = false
		}

		if (dontParse) {
			/* Don't parse JSON. */
			delegate = callback
		}
		else {
			/* Parse JSON. */
			delegate = (function(f) {
				return function(string) {
					try { var obj = JSON.parse(string) }
					catch (error) { var obj = {} }
					f(obj)
				}
			})(callback)
		}

		this.fs.root.getFile(filePath, {create: 0}, function(f) {
			self.path = filePath; //for debugging purposes

			f.file(function(g) {
				_readBlob(g, delegate, true, dontParse === "blob_hack");
			})
		}, _.bind(function(errObj) {
			errObj.path = filePath;
			_error(errObj)
		}, self));
	};

	/** Get file object (for upload, etc.) */
	files.prototype.getFile = function(/* optional */ publisherId, /* optional */ courseId, filename, callback, onFailed) {
		var filePath, self = this;

		if (typeof callback === "undefined" && typeof onFailed === "undefined") {
			/* Shift optional args. */
			filePath = publisherId;
			callback = courseId;
			onFailed = filename;
		}
		else {
			filePath = this.coursePath(publisherId, courseId, filename);
		}

		self.path = filePath; //for debugging purposes
		this.fs.root.getFile(filePath, {create: 0}, function(f) {

			f.file(function(g) {
				if (typeof callback === "function") callback(g)
			})
		}, _.bind(function(errObj) {
			if (typeof onFailed === "function") {
				onFailed();
			}
			else {
				errObj.path = self.path;
				_error(errObj)
			}
		}, self));
	}

	/** Upload file to server. */
	files.prototype.putFile = function(path, url, callback, onFailed) {
		var pid = require("userModel").getPublisherId(),
			cid = require("courseModel").getCourseId();

		path = this.coursePath(pid, cid, path);

		this.getFile(path, function(f) {
			var fd = new FormData()
			fd.append("file", f)

			var req = _.extend(new XMLHttpRequest(), {
				onload: function() {
	                if (this.status == 200) {
	                    if (typeof callback === "function") callback();
	                }
					else if (_.isFunction(onFailed)) {
						onFailed();
					}
					else {
	                    logger.error(logger.category.FILES, { message: "File upload failed: " + url, status: this.status, response: this.responseText });
	                    require('busyIndicator').stop('all');
	                    require('showMessage').serverError.showErrorMessageByHttpStatus(this.status);
	                }
	            },
				onerror: _.isFunction(onFailed) ? onFailed : function() {
					logger.error(logger.category.FILES, { message: "File upload failed: " + url, status: this.status, response: this.responseText });
					require('busyIndicator').stop('all');
					require('showMessage').clientError.show({errorId: 'FILES0', srcMessage : url});
				}
			});

			req.open("POST", url);
			req.send(fd);
		}, onFailed);
	}

	/** Test that file exists, returns `File` obj or false. */
	files.prototype.fileExists = function(filePath, callback) {
		this.fs.root.getFile(filePath, {create: 0}, callback,
					function() {
						if (typeof callback === "function") callback(false);
					});
	};

	/** Delete file from disk, failing if not successful. */
	files.prototype.deleteFile = function(filePath, callback) {
		this.path = filePath; //for debugging purposes
		callback = callback || function() {};

		this.fs.root.getFile(fileNameOptimizer(filePath), {create: 0}, function(f) {
			f.remove(callback, _error);
		}, function(errObj) {
			errObj.path = this.path;
			_error(errObj);
		}.bind(this));
	};

	/** Delete file from disk, failing if not successful. */
	files.prototype.emptyDir = function(dirPath, callback) {
		this.fs.root.getDirectory(dirPath, null, function(d) {
			var reader = d.createReader();
			reader.readEntries(function(entries) {
				function removeEntry(entry) {
					if (!entry) {
						if (typeof callback == 'function') callback();
						return;
					}
					if (entry.isDirectory && entry.removeRecursively) {
						entry.removeRecursively(function() {
							removeEntry(entries.shift());
						}, function() {
							removeEntry(entries.shift());
						});
					}
					else {
						entry.remove(function() {
							removeEntry(entries.shift());
						}, function() {
							removeEntry(entries.shift());
						});
					}
				}

				removeEntry(entries.shift());
			});
		}, function(errObj) {
			if (errObj.code == FileError.NOT_FOUND_ERR) {
				if (typeof callback == 'function') callback();
				return;
			}
			errObj.path = dirPath;
			_error(errObj);
		}.bind(this));
	};

	/** Base path used to address files with `filesystem:` protocol. */
	files.prototype.getBasePath = function(prefix, course_id) {
		var pid = require("userModel").getPublisherId(),
			cid = course_id || require("courseModel").getCourseId();

		if (pid === null || cid === null) {
			throw new Error("Cannot call getBasePath() without publisher id or course id.");
		}

		if (typeof prefix === "undefined" ||
			typeof prefix.constructor === "undefined" ||
			prefix.constructor !== Array) {

			/* Using the default `filesystem:` prefix. */
			prefix = [
				"filesystem:",
				location.protocol,
				"//",
				location.host,
				"/persistent/"
			]
		}

		prefix.push(this.coursePath(pid, cid))

		return prefix.join("")
	};
	/* rename a directory or file entry
			DirectoryEntry parentDirectory, - parent directory to move the file under
            optional DOMString newName - optional new name for the file,
            optional EntryCallback successCallback,
            optional ErrorCallback errorCallback
	*/
	files.prototype.rename = function(parentDirectoryName, oldName, newName, callback){
		var self = this;
        this.fs.root.getDirectory([parentDirectoryName, oldName].join("/"), {}, function(dirEntry){
            self.fs.root.getDirectory(parentDirectoryName, {}, function(parentDirectory){
				self.fs.root.getDirectory([parentDirectoryName, newName].join("/"), {}, function(dirToCreate){
					//check if the new folder dont exist, if it exists : delete it and then copy the new one
                    self.removeDirectoryRecursive([parentDirectoryName, newName].join("/"), function(){
						dirEntry.moveTo(parentDirectory, newName, callback, _error);
					});
                //error callback on getting the new folder, if it dont exists just copy it
                },function(){
					dirEntry.moveTo(parentDirectory, newName, callback, _error);
                });
            },_error);
        },_error);
    };

	files.prototype.moveDirectory = function(originalDirectoryPath , parentDirectoryPath, name, callback){
		this.fs.root.getDirectory(originalDirectoryPath, {}, _.bind(function(dirEntry){
			this.fs.root.getDirectory(parentDirectoryPath, { create: 1 }, function(parentDirectory){
				dirEntry.moveTo(parentDirectory, name, callback, _error);
			})
		}, this), callback);

	};
	files.prototype.moveFile = function(originalPath , newPath, name, callback){
		this.fs.root.getFile(originalPath, {}, function(fileEntry){
			this.fs.root.getDirectory(newPath, { create: 1 }, function(dirEntry){
				fileEntry.moveTo(dirEntry, name, callback);
			})
		}.bind(this));

	};


	files.prototype.copyDirectory = function(originalDirectoryPath , parentDirectoryPath, name, callback){
		this.fs.root.getDirectory(originalDirectoryPath, {}, function(dirEntry){
			this.fs.root.getDirectory(parentDirectoryPath, { create: 1 }, function(parentDirectory){
				dirEntry.copyTo(parentDirectory, name, callback, _error);
			})
		}.bind(this), callback);
	}

	// Copy whole folder content to another folder
	files.prototype.copyFiles = function(sourceDirectory, targetDirectory, callback) {
		var self = this;
		self.fs.root.getDirectory(sourceDirectory, {}, function(dirEntry){
			self.fs.root.getDirectory(targetDirectory, { create: 1 }, function(parentDirectory){
				dirEntry.createReader().readEntries(function(entries) {
					(function copyEntry(entry) {
						if (!entry) {
							if (typeof callback == 'function') callback();
						}
						else if (entry.isFile) {
							var ename = entry.name;
							entry.copyTo(parentDirectory, null, copyEntry.bind(this, entries.shift()), function() { console.log(ename); });
						}
						else if (entry.isDirectory) {
							self.copyFiles(entry.fullPath, targetDirectory + PS + entry.name, copyEntry.bind(this, entries.shift()));
						}
					})(entries.shift());
				});
			});
		}, function() {
			if (typeof callback == 'function') callback();
		});
	};

	files.prototype.getFilesList = function(directoryPath, callback) {
		var list = [];

		function getDirFilesList(dirEntry, dirCallback) {
			dirEntry.createReader().readEntries(function(entries) {
				_.each(entries, function(entry) {
					if (entry.isFile) {
						var name = entry.fullPath.replace(directoryPath, '');
						while (name[0] == PS) name = name.substr(1);
						list.push(name);
					}
				});

				var dirs = _.filter(entries, { isDirectory: true });

				(function cb() {
					if (dirs.length) {
						getDirFilesList(dirs.shift(), cb);
					}
					else if (typeof dirCallback == 'function') {
						dirCallback(list);
					}
				})();
			});
		}

		this.fs.root.getDirectory(directoryPath, {}, function(dirEntry) {
			getDirFilesList(dirEntry, callback);
		}, _error);
	};

	files.prototype.removeDirectoryRecursive = function(entryPathToRemove, callback){
		this.fs.root.getDirectory(entryPathToRemove,{}, function(dirEntry){
			dirEntry.removeRecursively(callback, _error);
		}, function(err) {
			if (err.code == FileError.NOT_FOUND_ERR) {
				callback && callback();
			}
			else {
				_error(err);
			}
		})
	}

	/*
	********* Get asset from user and store it locally. *********
	** @param maxAllowedPercentage - maximum allowed usage percentage of file system, trigger for cleanup
	** @param desiredPercentage - desired used percentage after cleanup process
	** @param exceptions - list of exceptions: courses that wouldn't be deleted
	** @param progressCallback - progress callback
	** @param callback - callback will be called after cleanup process completed
	*/
	files.prototype.fileSystemCleanup = function(config) {
		config.maxAllowedPercentage = 1;
		config.desiredPercentage = 1;

		var self = this,
			getUsagePercentage = function(callback) {
				navigator.webkitPersistentStorage.queryUsageAndQuota(function(used, total) {
					if (typeof callback == 'function') callback(used / total * 100);
				});
			},
			setPercentage = function(percentage) {
				if (typeof config.progressCallback == 'function') config.progressCallback(percentage);
			},
			getCoursesIdsByDate = function(callback) {
				self.server.lastOpened
					.query()
					.all()
					.execute()
					.done(function(results) {
						if (typeof callback == 'function') {
							var courses = _(results)
											.sortBy(function(rec) { return new Date(rec.openDate) })
											.filter(function(rec) { return config.exceptions.indexOf(rec.courseId) == -1 })
											.value();
							callback(courses);
						}
					});
			},
			cleanOldestCourse = function(coursesData) {
				var courseToDelete = coursesData.shift();
				if (courseToDelete) {
					getUsagePercentage(function(usedPercentage) {
						var progress = (config.maxAllowedPercentage - usedPercentage) /  (config.maxAllowedPercentage - config.desiredPercentage) * 100;
						progress = progress > 100 ? 100 : (progress < 0 ? 0 : progress);
						setPercentage(progress);
						if (usedPercentage > config.desiredPercentage) {
							var coursePath = ['publishers', courseToDelete.publisherId, 'courses', courseToDelete.courseId].join('/');
							logger.debug(logger.category.FILES, 'Remove course from local file system, id:' + courseToDelete.courseId);
							self.removeDirectoryRecursive(coursePath, function() {
								self.server.lastOpened
									.remove(courseToDelete.courseId)
									.done(cleanOldestCourse.bind(this, coursesData));
							});
						}
						else {
							logger.debug(logger.category.FILES, 'File system cleanup finished');
							if (typeof config.callback == 'function') config.callback();
						}
					});
				}
				else {
					setPercentage(100);
					logger.debug(logger.category.FILES, 'File system cleanup finished');
					if (typeof config.callback == 'function') config.callback();
				}
			};

		logger.debug(logger.category.FILES, 'Check if file system cleanup is needed');
		config.exceptions = config.exceptions || [];
		if (!_.isArray(config.exceptions)) {
			config.exceptions = [config.exceptions];
		}

		getUsagePercentage(function(usedPercentage) {
			if (usedPercentage >= config.maxAllowedPercentage) {
				setPercentage(0);
				logger.debug(logger.category.FILES, 'Run file system cleanup');
				getCoursesIdsByDate(cleanOldestCourse);
			}
			else if (typeof config.callback == 'function') {
				config.callback();
			}
		});
	}

	files.prototype.updateCourseLastOpened = function(courseId, publisherId, callback) {
		logger.debug(logger.category.FILES, 'Update last opened date of course');
		this.server.lastOpened
			.remove(courseId)
			.done(function() {
				this.server.lastOpened
					.add({
						openDate: (new Date).toISOString(),
						publisherId: publisherId.toString(),
						courseId: courseId
					})
					.done(callback);
			}.bind(this));
	}

	return new files;

});
