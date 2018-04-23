define([
	'lodash',
	'events',
	'restDictionary',
	'dao',
	'repo',
	'translate',
	'NotificationsService',
	'modules/Notifications/NotificationsModel',
	'modules/Notifications/NotificationsButtonView',
	'modules/Notifications/NotificationsFlyoutView',
	'cgsUtil'
	],
	function(_, events, restDictionary, dao, repo, translate, NotificationsService, NotificationsModel, NotificationsButtonView, NotificationsFlyoutView, cgsUtil) {

	var NotificationsController = function() {
		this.model = NotificationsModel;
		
		this.registerEvents();
	};

	_.extend(NotificationsController.prototype, {
		registerEvents: function() {
            events.register('initCGS', this.initialize.bind(this));
            events.register('end_load_of_menu', this.initViews.bind(this));
            events.register('showNotifications', this.onShowNotifications.bind(this));
            events.register('publishStarted', this.onPublishStarted.bind(this));
			events.register('share_a_link', cgsUtil.openShareALinkDialog);

			events.register(NotificationsService.NotificationTypes.PUBLISH, this.onPublishNotification.bind(this));
		},

		initialize: function() {
			this.publisherId = require('userModel').getPublisherId();
		},

		initViews: function() {
            // Dispose events of any older views
            this.buttonView ? this.buttonView.dispose() : $.noop;
            this.notificationsFlyoutView ? this.notificationsFlyoutView.dispose() : $.noop;

            // Render when menu has been loaded
			this.buttonView = new NotificationsButtonView({
				controller: this,
				model: this.model,
				parentEl: '#btn_notifications'
			});

			this.notificationsFlyoutView = new NotificationsFlyoutView({
				controller: this,
				model: this.model,
				parentEl: '#notificationsFlyoutWrapper'
			});

		},

		onPublishNotification: function(packages) {
			var newNotificationsArr = [];
			var newPackage;
			var newPackageStepsSize = 4;
			var newPackagePercentSum;
			var newPackagePercent;
			var newPackageCurrentStep;

			_.each(packages, function(package) {
				newPackagePercentSum = 0;
				newPackageCurrentStep = 0;
				var isPublishToUrl = package.publishTarget == 'COURSE_TO_URL' || package.publishTarget == 'LESSON_TO_URL';
				newPackage = {
					id: package.packageId,
					courseId: package.courseId,
					name: package.courseName,
					packageId: package.packageId,
					courseVersion : package.courseVersion,
					tinyKey: package.tinyKey,
					isPublishToUrl: isPublishToUrl
				};
				//publish a single lesson support
				if (package.selectedTocItems && package.selectedTocItems.length) {
					newPackage.name += " / " + package.selectedTocItems[0].title;
				}

				switch(package.packagePhase) {
					case 'IN_PROGRESS':
						_.each(package.componentsProgressInPercent, function(stepPercent) {
							newPackagePercentSum += stepPercent;
						});

						newPackagePercent = Math.round(newPackagePercentSum / newPackageStepsSize);
						newPackageCurrentStep = Math.floor(newPackagePercentSum / 100) + 1;

						newPackage.status = 'inProgress';
						//if the percents are 0, we set the first value to 1, because that 0 is not displayed in the template rendering
						newPackage.statusPercent = newPackagePercent !== 0 ? newPackagePercent : 1;

						var notification = _.find(this.model.notifications, { packageId: newPackage.packageId });
						if (notification && notification.isCancelling) {
							newPackage.statusText = translate.tran('publish.indication.statusText.cancelling');
						} else { // Not cancelling
							newPackage.statusText = translate.tran('publish.indication.statusText.percent').format(
								newPackageCurrentStep,
								newPackageStepsSize
							);
						}

						// Disable cancel on step 3,4
						if (newPackageCurrentStep >= 3) {
							newPackage.isCancelDisabled = "disabled";
						}

						break;
					case 'COMPLETED':
						newPackage.status = 'success';
						newPackage.statusText = translate.tran('publish.indication.statusText.success');

						// Download package if we've finished the last step and this is a publish for download
						if (package.zippedFileToDownloadLocation) {
							newPackage.download = true;
						}

						if (package.tinyKey) {
                            newPackage.tinyKey = package.tinyKey;
							newPackage.courseName = package.courseName;
							newPackage.lessonName = package.lessonName;
							if (package.lessonName) {
								newPackage.name = package.courseName + ' / ' + package.lessonName;
							}
						}

						break;
					case 'FAILED':
						newPackage.status = 'error';
						newPackage.statusText = translate.tran('publish.indication.statusText.error');

						// create errors string
						newPackage.details = package.errors;

						break;
					case 'CANCELED':
						newPackage.status = 'cancelled';
						newPackage.statusText = translate.tran('publish.indication.statusText.cancel');

						break;
					case 'PENDING':
						newPackage.status = 'pending';
						newPackage.statusText = translate.tran('publish.indication.statusText.pending');
						break;
					default:
						// We should never get here!!
						newPackage.status = 'error';
						newPackage.statusText = package.packagePhase;
						break;
				}

				newNotificationsArr.push(newPackage);
			}.bind(this));

			this.model.setNotifications(newNotificationsArr);
			if(this.model.notifications.status == 'inProgress') {
				NotificationsService.setPollingInterval(NotificationsService.pollingIntervals.activePublish);
			} else {
				NotificationsService.setPollingInterval(NotificationsService.pollingIntervals.idlePublish);
			}
		},

		onShowNotifications: function() {
			if (this.model.hasNotifications()) {

				var toggleFlyoutView = function(){
					//toggle fly-out view
					this.notificationsFlyoutView.show(!this.notificationsFlyoutView.isVisible());
				}.bind(this);

				//in case we open the notification fly-out view , ask to poll notification
				if(!this.notificationsFlyoutView.isVisible()){
					NotificationsService.pollNotifications();
				}
				toggleFlyoutView();
			}
		},

		onPublishStarted: function() {
			NotificationsService.pollNotifications();
			this.notificationsFlyoutView.show(true);
		},

		hideNotification: function(notificationId) {
			if (notificationId) {
				var daoConfig = {
					path: restDictionary.paths.HIDE_PACKAGE_NOTIFICATION,
					pathParams: {
						publisherId: this.publisherId,
						packageId : notificationId
					}
				};

				logger.audit(logger.category.NOTIFICATIONS, 'Hiding course publish');

				dao.remote(daoConfig, function() {

					var notification = _.find(this.model.notifications, { packageId: notificationId });
					this.model.setNotifications(_.pull(this.model.notifications, notification));

					logger.info(logger.category.NOTIFICATIONS, 'Hidden notification with id:' + notificationId);

				}.bind(this));
			}
		},

		cancelPublish: function(packageId) {
			var notification = _.find(this.model.notifications, { packageId: packageId });
			notification.isCancelling = true;
			notification.statusText = translate.tran('publish.indication.statusText.cancelling');
			notification.isCancelDisabled = "disabled";

			events.fire('cancelPublish', packageId);
		},

		download: function(packageId) {
			events.fire('downloadPublishPackage', packageId);
		},

		tinyUrl: function(data) {
			events.fire('share_a_link', data);
		},

		notificationsHidden: function() {
			NotificationsService.setPollingInterval(NotificationsService.pollingIntervals.idlePublish);
		}
	});

	return new NotificationsController();
});