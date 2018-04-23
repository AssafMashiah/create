define(['lodash','events','dao','userModel','courseModel', 'lessonModel','restDictionary','dialogs', 'moment'],
	function f1979(_, events, dao, userModel, courseModel, lessonModel, restDictionary, dialogs, moment) {
	/*
		Definition for locking objects

		get dao paths for set/get the locked object
		get events id's for lock success and release
		get method the return the dao path parameters 
	*/
	var LockModelData = {
		'course': {
			paths: {
				getLock: restDictionary.paths.GET_LOCK_COURSE,
				setLock: restDictionary.paths.SET_LOCK_COURSE
			},
			events: {
				'lock_success': 'lock_course_success',
				'release_success': 'released_course_success'
			},
			get: function f1980() {
				return {
					// base config
					pathParams: {
						publisherId: userModel.getPublisherId(),
						courseId: courseModel.getCourseId(),
						lastModifiedDate: courseModel.getLastModified()
					}
				};
			}
		},
		'lesson': {
			paths: {
				getLock: restDictionary.paths.GET_LOCK_TOC_ITEM,
				setLock: restDictionary.paths.SET_LOCK_TOC_ITEM
			},
			events: {
				'lock_success': 'lock_lesson_success',
				'release_success': 'released_lesson_success'
			},
			get: function f1981() {
				return {
					pathParams: {
						// base config
						publisherId: userModel.getPublisherId(),
						courseId: courseModel.getCourseId(),
						lessonId: lessonModel.getLessonId(),
						lastModifiedDate: lessonModel.getLastModified(),
						itemType: 'lesson'
					}
				}
			}
		},
		'assessment': {
			paths: {
				getLock: restDictionary.paths.GET_LOCK_TOC_ITEM,
				setLock: restDictionary.paths.SET_LOCK_TOC_ITEM
			},
			events: {
				'lock_success': 'lock_lesson_success',
				'release_success': 'released_lesson_success'
			},
			get: function f1982() {
				return {
					pathParams: {
						// base config
						publisherId: userModel.getPublisherId(),
						courseId: courseModel.getCourseId(),
						lessonId: lessonModel.getLessonId(),
						lastModifiedDate: lessonModel.getLastModified(),
						itemType: 'assessment'
					}
				}
			}
		}
	};

	var LockModel = (function f1983() {
		var locked_object = { 
			'course': {
				lockStatus: 'unlocked'
			},
			'lesson': {
				lockStatus: 'unlocked'
			},
			'assessment': {
				lockStatus: 'unlocked'
			}
		};

		var config = {
			LOCK_TYPES: {
				LOCKED_SELF: 'self',
				LOCKED_OTHER: 'other',
				UNLOCKED: 'unlocked'
			},
			LOCK_TYPES_HANDLER: {
				'self': function f1984(type) {
					ready(type);
				},
				'other': function f1985(type) {
					ready(type);
				},
				'unlocked': function f1986(type) {
					lock(type, true);
				}
			}
		};

		var updateAquireDate = false;


		function constructor() {
			//get locked object event
			events.register('get_locking_object', getLockingObject, this);
			//lock the object event
			events.register('lock', handleLock, this);
			//release lock
			events.register('release_lock', release, this);
		};

	/**
			entry point for lock request

			recived the lock object through getLockingObject
			and then execute the onLockRecived handler with the results
		*/
		function handleLock(type) {
			//onLockRecived make the locking action according to the status of the object
			return getLockingObject(type, onLockRecieved)
		};

		//running when lock request is recieved (handler for getLockingObject) and set the lock
		function onLockRecieved(type, lockingObj) {
			return config.LOCK_TYPES_HANDLER[lockingObj.lockStatus].call(this, type);
		};

		
		function lock(type, notify) {
			return setLock("acquire", onLockSuccess.bind(this, notify, type), type);
		};

		// get base config for each mode (lesson/course)
		function getBaseConfig(type) {
			if (_.isUndefined(type)) {
				throw new TypeError("No Object Choose for return configuration");
				return false;
			}
			// checking that we have this type of object inside LockModelData
			if (_.isArray(LockModelData) &&
				LockModelData[type] && 
				_.isFunction(LockModelData[type].get)) {
				return LockModelData[type].get();
			}
		};

		function abortLessonLockRemoteRequest () {
			if (this.remoteRequest['lesson']) {
	            logger.debug(logger.category.LOCK, 'Aborting lesson lock remote request');
	            this.remoteRequest['lesson'].abort(); // this will invoke the ajax error method
	            this.remoteRequest['lesson'] = null;
			}
		}

		/**
		  locking object is: 
			send request to the server to get the current locked object
			sample for the return json
			{
				"entityId":"b6b62816-43e5-4028-8714-a91d18fcc364",
				"entityType":"COURSE"/"LESSON",
				"entityName":"New Course/Lesson",
				"userName":"[username]",
				"userEmail":"userNamePattern@something.com",
				"userPublisherId":1,
				"lockDate":"2013-02-27T13:56:55.517+0200"
			} 
		 	 @type {[type]}
		 */
		function getLockingObject(type, callback ) {
			var lockModel = require('lockModel');

			//check if we have this type of object
			if (!LockModelData[type]) {
				throw new TypeError(type + ' not exists in LockModelData');
				return false;
			}
			
			// If there's lock request in progress, return
			if (lockModel.remoteRequest[type] && lockModel.remoteRequest[type].readyState != 4) {
				return lockModel.remoteRequest[type];
			}

			var data = LockModelData[type].get();

            // Listen to lock abort event
            if (type == 'lesson' || type == 'assessment') {
            	events.register('lock.lesson.abortRemoteRequest', abortLessonLockRemoteRequest, lockModel);
            }

			// build configuration (extend the base config with the correct REST URL)
			// request the locked object from the server and bind method with (function, context, args..)
			lockModel.remoteRequest[type] = dao.remote(
				_.extend({ path: LockModelData[type].paths.getLock },data),
				setLockData.bind(this, callback, type),
				lockError.bind(this, callback, type),
				true
			);
			return require('lockModel').remoteRequest[type];
		};

		function publishRemoteRequestAborted() {
            logger.debug(logger.category.LOCK, 'Lock remote request aborted successfully');
            _.defer(function () {
	            var eventName = 'lockModel.remoteRequestAborted';
	            if (events.exists(eventName)) {
		            events.fire(eventName);
	            }
            });
		}

		function lockError(callback, type, response){
			events.unbind('lock.lesson.abortRemoteRequest');
			require('lockModel').remoteRequest[type] = null;
            if (response.statusText == 'abort') {
            	publishRemoteRequestAborted();
            }
			else if(!response.status || response.status == 423){ // If someone else has lock
				return _.isFunction(callback) ? callback.call(this, type, locked_object[type]) : ready(type);			
			}
			else {
				require('showMessage').serverError.show(response);
			}
		};

		/* 
			@param action:
				acquire - set the lock in the server
				release - release the lock in the server
		*/
		function setLock(action, callback, type, data) {
			var lockModel = require('lockModel');

			// If there's lock request in progress, return
			if (lockModel.remoteRequest[type] && lockModel.remoteRequest[type].readyState != 4) {
				return lockModel.remoteRequest[type];
			}


			var objectData = data ? data : LockModelData[type].get();

			logger.debug(logger.category.LOCK, ['Lock', action, 'for', type, type == 'course' ? objectData.pathParams.courseId : objectData.pathParams.lessonId].join(' '));

            // Listen to lock abort event
            if (type == 'lesson') {
            	events.register('lock.lesson.abortRemoteRequest', abortLessonLockRemoteRequest, lockModel);
            }

			lockModel.remoteRequest[type] = dao.remote(
				_.extend({ 
					path: LockModelData[type].paths.setLock,
					data: {
						action: action,
						'last-modified': objectData.pathParams.lastModifiedDate
					}
				}, objectData), 
				function() {
					logger.info(logger.category.LOCK, 'Lock ' + action + ' succeed');
					events.unbind('lock.lesson.abortRemoteRequest');
					lockModel.remoteRequest[type] = null;
					if (_.isFunction(callback)) callback();
				},
				function(xhr) {
					logger.error(logger.category.LOCK, 'Lock ' + action + ' failed');
					events.unbind('lock.lesson.abortRemoteRequest');
					lockModel.remoteRequest[type] = null;

		            if (xhr.statusText == 'abort') {
						publishRemoteRequestAborted();
		            }
					else if (xhr.status == 0) {
						require('showMessage').serverError.show(xhr);
					}
					else {
						require('showMessage').clientError.show({errorId: 4000});
					}
				}
			);

			return lockModel.remoteRequest[type];
		};

		/*
			@param type
				object type (course / lesson.. )
			@param notify - if notify true
				if we bind success event so we fire this event!

		*/
		function onLockSuccess(notify, type){
			if (!type || !locked_object[type]) {
				throw new TypeError('No such type ' + type);
				return false;
			}

			locked_object[type].lockStatus = config.LOCK_TYPES.LOCKED_SELF;
			locked_object[type].lockingUser = userModel.getUserName();

			if(notify){
				events.fire(LockModelData[type].events.lock_success,locked_object[type]);
			}

			return true;
		};

		/**
		 * onReleaseSuccess
		 * @param type
		 * @param callback - optional, if exists don't go to default callback - "ready" function
		 * @return {*}
		 */
		function onReleaseSuccess(type, callback) {
			events.fire(LockModelData[type].events.release_success);
			locked_object[type].lockStatus = config.LOCK_TYPES.UNLOCKED;
			//after releasing a lock don't update lock aquire date until user clicks enable editing
			require('lockModel').updateAquireDate = false;

			return _.isFunction(callback) ? callback(type) : ready(type);
		};

		function ready(type) {
			return events.fire('lock_ready', locked_object[type]);
		};

		function getLockingStatus(type) {
			if(locked_object[type.toLowerCase()] && locked_object[type.toLowerCase()].entityType) {
				return (locked_object[type.toLowerCase()].entityType.toUpperCase() !== type.toUpperCase()) ? false : locked_object[type.toLowerCase()].lockStatus;
			} else {
				return false;
			}
		};

		function release(type, callback,data) {
			return setLock("release", onReleaseSuccess.bind(this, type, callback),  type,data) ;
		};

		function runWhenServerReady(callback) {
			return (_.isFunction(callback)) ? dao.runOnAvailable(callback) : false;
		};

		function setLockData(callback, type, response) {
			var lockModel = require('lockModel');
			events.unbind('lock.lesson.abortRemoteRequest');
			lockModel.remoteRequest[type] = null;

			//reset the locked object data to default values
			locked_object[type] = { lockStatus: config.LOCK_TYPES.UNLOCKED };

			//check if we recieved response and if it's object type
			if (response && _.isObject(response)) {
				//set the response to our local object
				locked_object[type].lockingUser = response.userName;
				locked_object[type].entityType = response.entityType;
				locked_object[type].entityId = response.contentId;
				//don't update lock aquire date for the first time - this is a system lock request
				if(!lockModel.updateAquireDate) {
					locked_object[type].aquireDate = 0;
				} else {
					locked_object[type].aquireDate = moment().format('HH:mm:ss');
				}
			} else {
				//only change the entity type (lesson/course)
				locked_object[type].entityType = type;
			}


			if (!response || !locked_object[type].lockingUser){
				//if the object doesn't have lock on the server change the local status to unlocked
				locked_object[type].lockStatus = config.LOCK_TYPES.UNLOCKED;
			} else {
				//if the object is lock on our user
				if (locked_object[type].lockingUser == userModel.getUserName())
					locked_object[type].lockStatus = config.LOCK_TYPES.LOCKED_SELF;
				else
					locked_object[type].lockStatus = config.LOCK_TYPES.LOCKED_OTHER;
			}

			return _.isFunction(callback) ? callback.call(this, type, locked_object[type]) : ready(type);			
		};		

        function showLockingDialog(title, data) {
            var dialogConfig = {
                title: title,
                data: data,
                closeOutside: false,
                buttons:{
                    closeDialog	:	{ label : 'Close'}
                }
            };

            dialogs.create('locking', dialogConfig);
        }
		//initialize the events
		constructor();

		return {
			updateAquireDate    : updateAquireDate,
			config 				: config,
			runWhenServerReady 	: runWhenServerReady,
			getLockingStatus 	: getLockingStatus,
            showLockingDialog 	: showLockingDialog,
            remoteRequest 		: {}
		}
	})();

	return LockModel;
});