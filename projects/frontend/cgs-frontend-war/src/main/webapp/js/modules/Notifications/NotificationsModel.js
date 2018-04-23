// Model is an array of notifications
define(['lodash'], function(_) {
	var NotificationsModel = function() {

		this.notifications = [];

	};

	_.extend(NotificationsModel.prototype, {
		setNotifications: function(notifications) {
			var startTime = performance.now();
            this.notifications = require('cgsUtil').mergeByKey({
                'target': this.notifications,
                'source': notifications,
                'key': 'packageId',
                'propertyToKeep' : 'isCancelling'

            });
			var duration = performance.now() - startTime;
			console.log("setNotifications took " + duration);
            this.setNotificationsStatus();
		},

		setNotificationsStatus: function () {
			var notificationsByStatus = _.groupBy(this.notifications, 'status');
			if (_.isEmpty(notificationsByStatus)) {
				this.notifications.status = 'disabled';
			} else if ('inProgress' in notificationsByStatus) {
				this.notifications.status = 'inProgress';
			} else if ('error' in notificationsByStatus) {
				this.notifications.status = 'error';
			} else { // ('success' in notificationsByStatus)
				this.notifications.status = 'success';
			}
		},

		hasNotifications: function() {
			return this.notifications.length > 0;
		}
	});

	return new NotificationsModel();

});