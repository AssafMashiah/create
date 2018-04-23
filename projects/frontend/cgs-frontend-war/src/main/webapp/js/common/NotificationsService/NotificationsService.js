define([
	'lodash',
	'events',
	'restDictionary',
	'dao',
	'logger',
	'courseModel'
], function(_, events, restDictionary, dao, logger, courseModel) {
	var NOTIFICATION_TYPES = {
		PUBLISH: 'publishNotification'
	};

	var NotificationsService = function() {
		this.NotificationTypes = NOTIFICATION_TYPES;

		this.registerEvents();
	};

	_.extend(NotificationsService.prototype, {
		setPollingInterval: function(intervalMilliseconds) {
			this.pollingInterval = intervalMilliseconds > 0 ? intervalMilliseconds : this.pollingIntervals.idlePublish;
			this.resetTimer();
		},

		resetTimer: function() {
			// Reset the timer
			this.stopTimer();
			this.timer = setTimeout(this.pollNotifications.bind(this), this.pollingInterval);
		},

		stopTimer: function () {
			clearTimeout(this.timer);
		},

		registerEvents: function() {
			// Start the polling when cgs is initiazlied
			events.register('initCGS', this.initPolling.bind(this));
		},

		initPolling: function(){
			var userModel = require('userModel');
			var pollingIntervalsConfiguration = userModel.getConfiguration().pollingIntervals;
			this.publisherId = userModel.getPublisherId();
			this.pollingIntervals = {
				idlePublish: pollingIntervalsConfiguration.idlePublishPollingInterval,
				activePublish: pollingIntervalsConfiguration.activePublishPollingInterval
			};
			
			// default polling interval
			this.setPollingInterval(this.pollingIntervals.idlePublish);
			this.pollNotifications();
		},

		pollNotifications: function(continueCallback) {
			this.stopTimer();
			var daoConfig = {
				path: restDictionary.paths.GET_NOTIFICATIONS,
				pathParams: {
					publisherId: this.publisherId
				}
			};

			dao.remote(daoConfig, this.onPollNotificationsResponse.bind(this, continueCallback) , this.onPollNotificationsError.bind(this), true);
		},


		onPollNotificationsResponse: function(continueCallback, notifications) {
			this.resetTimer();
			if (_.isArray(notifications)) {
				// If a course/lesson is open, refresh lock bar
				if (_.any(notifications, { courseId: courseModel.courseId })
					&& ~['CourseScreen', 'TocScreen'].indexOf(require('router').activeScreen.constructor.type)) {
					
					events.fire("get_locking_object", 'course');
				}

				// This is the only notification we are using so far.
				// In the future we should iterate the notifications and fire events by notification type
				events.fire(this.NotificationTypes.PUBLISH, notifications);
			}
			if(_.isFunction(continueCallback)){
				continueCallback();
			}
			switch (require('router').activeScreen.constructor.type) {
				case 'LessonScreen':
						if (this.isPublishLessonToUrlIsDone(notifications)) {
							events.fire('enable_menu_item', 'menu-button-share-a-link-lesson');
						}
					break;
				case 'CourseScreen':
						if (this.isPublishCourseToUrlIsDone(notifications)) {
							events.fire('enable_menu_item', 'menu-button-share-a-link');
						}
					break;
			}

		},

		isPublishLessonToUrlIsDone: function(notifications) {
			var isDone = false;
			var lessonId = require("lessonModel").getLessonId();
			var courseId = require('repo')._courseId;
			notifications.forEach(function(notification) {
				if (notification.courseId == courseId
					&& notification.lessonId == lessonId
					&& notification.packagePhase == 'COMPLETED'
					&& notification.publishTarget == 'LESSON_TO_URL') {
					isDone = true;
				}
			});
			return isDone;
		},

		isPublishCourseToUrlIsDone: function(notifications) {
			var isDone = false;
			var courseId = require('repo')._courseId;
			notifications.forEach(function(notification) {
				if (notification.courseId == courseId 
					&& notification.packagePhase == 'COMPLETED' 
					&& notification.publishTarget == 'COURSE_TO_URL') {
					isDone = true;
				}
			});
			return isDone;
		},


		onPollNotificationsError: function(jqXhr) {
			this.resetTimer();
			if (jqXhr.status == 403) { // Access denied
				this.stopTimer();
			}

			logger.error(logger.category.NOTIFICATIONS, { arguments: arguments });
			dao.stop(jqXhr);
		}
	});

	return new NotificationsService();
});