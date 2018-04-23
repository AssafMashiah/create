define(['lodash', 'mustache', 'rest', 'files', 'restDictionary', 'showMessage', 'busyIndicator', 'migrationUtil'],
function (_, Mustache, rest, files, restDictionary, showMessage, busy, migrationUtil) {
	
	//use for execute the dao callbacks only when there is no requests on background
	var Queue = (function () {
		//define the callbacks array
		var callbacks = [];

		//register callback on hash
		/*
			callback - funtion type
			context- object "this" reference
			args - arguments for the callback (will pass on apply)
		*/
		function add(callback, context, args) {
			return callbacks.push(_.bind.apply(null, _.isArray(args) ? 
														args.splice(0,0, callback, context) : 
														[callback, context]));
		};

		//run all callbacks
		function runAll() {
			return _.each(callbacks, function (item) {
				return (!_.isFunction(item)) ? false : item.call();
			});
		};

		function clear() {
			return callbacks.splice(0, callbacks.length);
		};

		return {
			clear: clear,
			runAll: runAll,
			add: add
		}
	})();

	var Dao = (function () {
		var isDaoBusy = false;

		//set the dao status to busy
		function setBusy(flag) {
			isDaoBusy = flag;
		};

		//return the state of dao
		function isBusy() {
			return isDaoBusy;
		};

		//convert the config to rest api valid configuration
		function getRestApiValidConfig(config, defaultConfig) {
			//defaults use for set default value as alias to the second parameter properties
			/*
				Sample:
					Object1 - {a: 1, b: 6}
					Object2 - {a: 1, b: 2, c: 3}

				return value will be

				{a: 1, b: 6, c: 3}
			*/

			//invoke the function with the "defaults" object as parameter (instead of using this method
				/*
					var newConfig;
					newConfig = _.defaults(config, defaultConfig);
					newConfig.pathData = restDictionary.getPathData( newConfig.path, newConfig.pathParams ) ;
					return newConfig;
				*/
			//)

			return function (config) {
				//set the path data to the rest dictionary path
				return _.extend(config, { pathData: restDictionary.getPathData(config.path, config.pathParams) });
			}.call(this, _.defaults(config, defaultConfig));
		};


		//dao stop request handler
		function stop(jqXHR) {
			//stop the busy indicator
			busy.stop();
			//show the server error inside a dialog
			showMessage.serverError.show(jqXHR);
		};

		//on server error handler
		function onServerError(callback, jqXHR, textStatus, errorThrown) {
			//set the dao to not busy
			setBusy(false);

			//check if we pass error handler
			if (_.isFunction(callback)) {
				//execute the error handler
				callback(jqXHR);
			} else {
				//default stop handler execute
				stop(jqXHR);
			}

			//if no request sent, execute all the waiting callbacks

			return (!isBusy()) ? Queue.runAll() : false;
		};
		//on dao get response from the server
		function onRemoteResponse(callback, response) {
			//dao isn't busy anymore
			setBusy(false);


			response = migrationUtil.update( response );

			//check if we set a callback and its function type
			if (callback && _.isFunction(callback)) {
				callback(response);
			}

			//if no request start we execute all the Queue callbacks
			//execute all the callbacks and clear the Queue hash

			return (!isBusy()) ? Queue.runAll() && Queue.clear() : false;
		};

		//remote request to the server
		/*
			Config Sample - {
								"path":
									{
										"path":"/publishers/{{publisherId}}/courses/{{courseId}}/lock",
										"method":"POST",
										"sendAs":"url"
									},
								"data":
									{
										"action":"release",
										"last-modified":"2013-03-07T07:03:11.512Z"
									},
								"pathParams":
									{
										"publisherId":1,
										"courseId":"2aa0e4d5-708e-4299-8794-0fe52300a387",
										"lastModifiedDate":"2013-03-07T07:03:11.512Z"
									}
							} 
		*/
		function remote(config, callback, error) {
			setBusy(true);

			var pathData = getRestApiValidConfig(config).pathData;
			this.pathData = pathData;
			return rest.api(pathData,
					config.data, 
					_.bind(onRemoteResponse, this, callback), 
					_.bind(onServerError, this, error));
		};

		function setOnAvailable(callback) {
			return Queue.add(callback, null, null);
		};

		function runOnAvailable(callback){
			return isBusy() ? setOnAvailable(callback) : callback();
		};

		function setLocal(config, callback) {
			files.prepareDirs(config.pathParams.publisherId, config.pathParams.courseId, function () {
				var localPath = getRestApiValidConfig(config).pathData.path;
				//remove path query string
				localPath = localPath.split("?")[0];

				var fullPath = localPath + (config.pathParams.fileSuffix),
				    fileName = _.last(fullPath.split('/')),
					filePath = fullPath.replace(fileName, '');

				files.saveObject(config.data, fileName, filePath, callback, false);
			});
		};

		/**
		 * get content of local file
		 * @param config
		 * @param callback
		 */
		function getLocal(config, callback) {
			//build the file path string
			var localPath = getRestApiValidConfig(config).pathData.path;
			localPath = localPath.split("?")[0];

			var filePath = localPath + (config.pathParams.fileSuffix);

			files.fileExists(filePath, function (file) {
				//check if file is exists
				if (file) {
					files.loadObject(filePath, callback);
				}
				else {
					if (callback && _.isFunction(callback)) {
						callback(null);
					}
				}
			});
		};


		function saveLocalFile(publisherId, courseId, path, data, callback) {
			files.prepareDirs(publisherId, courseId, function () {
				files.saveObject(data, "manifest", path, callback);
			});
		};


		return {
			saveLocalFile: saveLocalFile,
			setLocal: setLocal,
			remote: remote,
			getLocal: getLocal,
			runOnAvailable: runOnAvailable
		}
	})();

	return Dao;
});


