define([
	'lodash',
	'backbone_super',
	'rivets2',
	'mustache',
	'text!./templates/NotificationsFlyoutView.html',
	'text!./templates/NotificationDetails.html'
], function(_, Backbone, rivets2, mustache, template, detailsTemplate) {
	var NotificationsFlyoutView = Backbone.View.extend({

		id: 'notificationsFlyoutView',

		className: 'hidden',

		initialize: function (options) {
			this.model = options.model;
			this.controller = options.controller;
			this.$parentEl = $(options.parentEl);

			this.render();
			this.registerEvents();
		},

		events: {
			'click .notificationHide': 'hideNotification',
			'click .showDetails': 'showDetails',
			'click .cancelPublish:not(.disabled)': 'cancelPublish',
			'click .download': 'download',
			'click .tinyUrl': 'tinyUrl'
		},

		render: function() {
			this.$el.html(mustache.render(template, {}));
			this.$parentEl.append(this.$el);

			rivets2.bind(this.$el, {
				controller: this.controller,
				model: this.model,
				view: this
			});
		},

		onClickDocument: function(e) {
			if (this.isVisible()) {
				var buttonView = this.controller.buttonView.$parentEl;
				if (!this.$el.is(e.target) && // if the target of the click isn't the container
					this.$el.has(e.target).length === 0 && // nor a descendant of the container
					!$('#dialog').is(e.target) &&// nor a dialog
					$('#dialog').has(e.target).length === 0 && // ... nor a descendant of the dialog
					!buttonView.is(e.target) &&// nor is the button view 
					buttonView.has(e.target).length === 0) // not button view decendant
				{
					this.show(false);
				} else {
					this.show(true);
				}
			}
		},

		registerEvents: function() {
			// Handle click outside
			$(document).mousedown($.proxy(this.onClickDocument, this));
		},

		show: function(bShow) {
			if (bShow) {
				this.$el.removeClass('hidden');
			} else { // !bShow || this.isVisible()
				this.$el.addClass('hidden');
				this.controller.notificationsHidden();
			}
		},

		isVisible: function() {
			return this.$el.is(":visible");
		},

		hideNotification: function(e) {
			var notificationId = $(e.target).parents('.notification')[0].id;
			this.controller.hideNotification(notificationId);

			logger.audit(logger.category.NOTIFICATIONS, { 
				message: 'User clicked hide notification',
				notificationId: notificationId
			});

		},

		showDetails: function(e) {
			// Show dialog with publish details
			var notificationId = $(e.target).parents('.notification')[0].id;
			var notification = _.find(this.model.notifications, { id: notificationId });

			logger.audit(logger.category.NOTIFICATIONS, { 
				message: 'User clicked show details',
				notificationId: notificationId
			});

		    var dialogConfig = {
		        title: 'publish.indication.error.dialog.title',
		        html: mustache.render(detailsTemplate, notification),
		        buttons: {
		            'ok': {
		                label: 'OK'
		            }
		        }
		    };

	        require('dialogs').create('html', dialogConfig, '');
		},

		cancelPublish: function(e) {
			// Notify controller to cancel the publish
			var notificationId = $(e.target).parents('.notification')[0].id;
			this.controller.cancelPublish(notificationId);

			logger.audit(logger.category.NOTIFICATIONS, { 
				message: 'User clicked cancel publish',
				notificationId: notificationId
			});
		},

		openInNewTab: function (e) {
			// Notify controller to cancel the publish
			var notificationId = $(e.target).parents('.notification')[0].id;
			this.controller.download(notificationId);

			logger.audit(logger.category.NOTIFICATIONS, {
				message: 'User clicked download',
				notificationId: notificationId
			});
		},

		download: function (e) {
			// Notify controller to cancel the publish
			var notificationId = $(e.target).parents('.notification')[0].id;
			this.controller.download(notificationId);

			logger.audit(logger.category.NOTIFICATIONS, { 
				message: 'User clicked download',
				notificationId: notificationId
			});
		},

		tinyUrl: function(e) {
			var data = {
				tinyKey: e.target.getAttribute('data-url'),
				courseName: e.target.getAttribute('data-course-name'),
				lessonName: e.target.getAttribute('data-lesson-name'),
				type: 'notification'
			};
			
			this.controller.tinyUrl(data);
			this.show(false);
		},

		dispose: function() {
			// Unbind jquery events
			$(document).unbind('mousedown', this.onClickDocument);

			// Remove the backbone view
			this.remove();
		}
	});

	return NotificationsFlyoutView;
});