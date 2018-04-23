define(['lodash', 'cryptojs', 'cryptojs_sha1', 'canvas_blob'],
function(_, CryptoJS) {

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
	var QUOTA = 1 << 30, // 1 gigabyte
		PS = '/' // path separator char

	// --- Internal functions: ---

	function _error(err) {
		if(err.code) {
			require('busyIndicator').stop('all');
			if(err.path) {
				console.error('Not found file:' + err.path);
			}
			require('showMessage').clientError.show({errorId: 'FILES' + err.code, 'srcMessage' : err.path});
		} else {
			console.error("Local storage error:", err);
		}
	}

	function _readBlob(blob, callback, is_text, is_binary) {
		var reader = new FileReader

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

	function files() {
		this.fs = null;
	}

	function fileNameOptimizer(fName) {

		var chars = fName.split(" ")

		return chars.join("_")
	}

    files.prototype.setFileSizeLimits = function (settings){

        _.each(settings, function (item){
            fileSizeLimit[item.mimeType] = item.size;
        });
    };

	/** Sanity test. */
	files.prototype._test = function() {
		if (!this.fs) {
			throw new Error("Local storage: not allocated");
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
			name += originalFilename.replace(/.+?([^.]+)$/, ".$1") // {.ext}
			callback.call(this, name, originalFilename, blob);
		})
	}

	/** Make directories. */
	files.prototype._makeDirs = function(dirs, callback) {
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
						console.log("Local storage: saved file", f.toURL())
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
		console.log(arguments);
        this._test()

        if (createPath) {
            this._makeDirs(path, _.bind(this._continueSaveFile, this,
                filename, originalFilename, data, path[0], callback));
            return;
        }

        this._continueSaveFile(filename, originalFilename, data, path, callback)
	}

    files.prototype._continueSaveFile = function(filename /* or null for SHA-1 */, originalFilename, data, path, callback) {

        this._cd(path, function(dir) {
            // `originalFilename` is used to set file extension when `filename` is null

            if (!filename) {
                this._getAssetName(data, originalFilename, function(assetName) {



                    assetName = _fmtAssetName(assetName)

                    this._makeDirs([
                        [path, assetName.substr(0, 2)].join(PS),
                        [path, assetName.substr(0, 5)].join(PS)
                    ], _.bind(function() {

                        this._save(dir, assetName, data, callback)

                    }, this))
                })
            }
            else {

                this._save(dir, fileNameOptimizer(filename), data, callback)
            }
        });
    }
	// --- Public interface: ---

	/** Allocate storage. */
	files.prototype.allocate = function(callback, context) {
		var self = this;

		navigator.webkitPersistentStorage.requestQuota(QUOTA, function(bytes) {
			webkitRequestFileSystem(PERSISTENT, bytes, function(fs) {
				console.log("Local storage:", fs.name);

				self.fs = fs;
				if (typeof callback === "function") callback.call(context, fs);
			}, _error);
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

	/** Download remote asset and store it locally. */
	files.prototype.downloadAsset = function(baseUrl, publisherId, courseId, assetName, callback) {
		if (baseUrl[baseUrl.length - 1] !== PS) {
			throw new Error("downloadAsset: baseUrl should end with /.")
		}

		var path = [this.coursePath(publisherId, courseId), assetName
					/*'media', _fmtAssetName(assetName)*/].join(PS),
			// _fmtAssetName returns complex path, so we join it and then split back.
			filename = path.split(PS).pop(),
			dirname = path.substr(0, path.length - filename.length),
			url = baseUrl + path,
			req = new XMLHttpRequest,
			// Create 2 levels path for media references (/media/xx/xx and /media/xx)
			path1 = path.substr(0, path.lastIndexOf(PS)),
			path2 = path1.substr(0, path1.lastIndexOf(PS))

		this._makeDirs([
			path2,
			path1
			// dirname.substr(0, dirname.length - 4),
			// dirname.substr(0, dirname.length - 1)
		], _.bind(function() {
			req.responseType = 'blob'

			req.onload = _.bind(function(event) {
				this._saveFile(filename, url, req.response, dirname, callback)
			}, this)

			req.open('get', url)
			req.send()
		}, this))
	}

	/** Download remote asset and store it locally (2). */
	files.prototype.downloadAssetWithPath = function(baseUrl, assetPath, callback) {
		if (assetPath.charAt(0) !== PS) assetPath = PS + assetPath;
		// e.g. /publishers/pid/courses/cid/media/43/ad/97d80af60a29b68e704dcb060b1f7663b1c7.jpg
		this.fileExists(assetPath, function(dont) {
			if (dont) {
				// Don't download.
				console.log("Don't download:", assetPath)
				if (typeof callback === "function") { callback(true) }
				return
			}

			var parts = assetPath.match(/(?:(.+?)(?=\/))/g);
			parts = _.map(parts, function (p) { return p.substr(1); });
			parts.push( assetPath.match(/([^\/]+?)$/)[0] );
			// e.g. ["publishers", "pid", "courses", "cid", "media", "43", "ad", "97d80af60a29b68e704dcb060b1f7663b1c7.jpg"]

			parts.shift();
			var pid = parts.shift();

			parts.shift();
			var cid = parts.shift();

			// parts.shift();
			var assetName = parts.join("/");

			this.downloadAsset(baseUrl, pid, cid, assetName, callback);
		}.bind(this))
	}

	/**
	 * Download remote file and store it locally
	 * (under publishers/publisherId/courses/courseId/)
	 */
	files.prototype.downloadFile = function(url, publisherId, courseId, filename, dirname, callback) {
		if (typeof dirname === "function") {
			callback = dirname
			dirname = ""
		}

		var dir = this.coursePath(publisherId, courseId, dirname),
			req = new XMLHttpRequest

		req.responseType = 'blob'

		req.onload = _.bind(function(event) {
			this._saveFile(filename, url, req.response, dir, callback)
		}, this)

		req.open('get', url)
		req.send()
	}

	/*
	********* Get asset from user and store it locally. *********
	** @param event_files - files to save (from upload event)
	** @param publisherId (optional)
	** @param courseId (optional)
	** @param callback - successfull callback (optional)
	** @param is_ref (optional)
	** @param newName - save the file with specific name, not SHA-1 (optional)
	** @param ignoreSizeLimit - ignore size limitation (optional)
	** @param errorCallback - file size limitation callback (optional)
	*/
	files.prototype.saveAsset = function(options) {
		if (!options.event_files) {
			throw new Error("Bad `event` object, or this feature isn't supported " +
				"by the Internet Explorer 6 you're using.");
		}

		var dir = this.coursePath(options.publisherId, options.courseId, options.is_ref? "cgsData": "media")

		for (var i = 0, f; f = options.event_files[i]; ++i) {
			if (!options.ignoreSizeLimit) {
				if (fileSizeLimit[f.type]) {
					if (f.size > fileSizeLimit[f.type]) {
						if (typeof options.errorCallback == 'function') {
							options.errorCallback('FILES6');
						}
						else {
							require('showMessage').clientError.show({errorId: 'FILES6'});
						}
						return false;
					}
				} else {
					if (f.size > fileSizeLimit['default']) {
						if (typeof options.errorCallback == 'function') {
							options.errorCallback('FILES6');
						}
						else {
							require('showMessage').clientError.show({errorId: 'FILES6'});
						}
						return false;
					}
				}
			}

			var reader = new FileReader;

			reader.onload = function(f) {
                //@REMOVE
                var count = 0;
				return _.bind(function(event) {
					var result = event.target.result;
                    //@REMOVE
                    console.log(count++);
					if (!result) {
						throw new Error("FileReader didn't produce result.");
					}

					var blob = new Blob([new DataView(result)])

					this._saveFile(options.is_ref ? (options.newName ? options.newName : f.name) : null, f.name, blob, dir, options.callback);
                    //@REMOVE
                    console.log('end saveAsset reader.onload internal function');
				}, this)

			}.call(this, f)
            //@REMOVE
            console.log('end of function');
			reader.readAsArrayBuffer(f);
		}
	}

	/** Save blob as asset named like `filename`. */
	files.prototype.saveBlobAsAsset = function(blob, filename, publisherId, courseId, callback, is_ref) {
		if (typeof blob === "string") {
			blob = new Blob([blob], {type: 'text/plain'})
		}
		var dir = this.coursePath(publisherId, courseId, is_ref? "cgsData": "media")
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
			errObj.path = self.path;
			_error(errObj)
		}, self));
	};

	/** Get file object (for upload, etc.) */
	files.prototype.getFile = function(/* optional */ publisherId, /* optional */ courseId, filename, callback) {
		var filePath, self = this;

		if (typeof filename === "undefined" && typeof callback === "undefined") {
			/* Shift optional args. */
			filePath = publisherId;
			callback = courseId;
		}
		else {
			filePath = this.coursePath(publisherId, courseId, filename);
		}

		this.fs.root.getFile(filePath, {create: 0}, function(f) {
			self.path = filePath; //for debugging purposes

			f.file(function(g) {
				if (typeof callback === "function") callback(g)
			})
		}, _.bind(function(errObj) {
			errObj.path = self.path;
			_error(errObj)
		}, self));
	}

	/** Upload file to server. */
	files.prototype.putFile = function(path, url, callback) {
		var pid = require("userModel").getPublisherId(),
			cid = require("courseModel").getCourseId();

		path = this.coursePath(pid, cid, path);

		this.getFile(path, function(f) {
			var fd = new FormData()
			fd.append("file", f)

			var req = new XMLHttpRequest()

			req.onload = function() {
				console.log("File uploaded:", url)
				if (typeof callback === "function") callback()
			}

			req.onerror = function() {
				console.log("File upload failed:", url)
				require('busyIndicator').stop('all');
				require('showMessage').clientError.show({errorId: 'FILES7', srcMessage : url});
			}

			req.open("POST", url)
			req.send(fd)
		})
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
		var self = this;
		self.path = filePath; //for debugging purposes

		this.fs.root.getFile(filePath, {create: 0}, function(f) {
			f.remove(callback, _error);
		}, _.bind(function(errObj) {
			errObj.path = self.path;
			_error(errObj);
		}, self));
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

	return new files;

});
