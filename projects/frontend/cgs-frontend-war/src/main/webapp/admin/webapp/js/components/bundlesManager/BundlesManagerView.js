define(['BaseView', "text!./templates/BundlesManagerTableView.html"], function (BaseView, template) {
	var BundlesManagerView = BaseView.extend({
		el: "#T2KBundles",
		clearOnRender: true,
		initialize: function (config) {
			this.controller = config.controller;

			this._super();
		},
		upload: function (e) {
			this.controller.upload();

			this.$("#upload-form").get(0).reset();
		},
		setEvents: function () {
			this.$("#bundle-file").on('change', this.upload.bind(this));
			this.$("[data-action=delete]").on('click', this.confirmation.bind(this, this.delete.bind(this), $.noop));
		},
		confirmation: function (onApprove, onReject, e) {
		    var dialogConfig = {
	            title: "Delete Bundle",
	            content: {
	                text: "Are you sure you want to delete this bundle?",
	                icon: 'warn'
	            },
	            buttons: {
	                "delete": { label: 'Delete' },
	                "cancel": { label: 'Cancel' }
	            }

	        };

	        require('events').once('onDeleteResponse', function (response) {
				amplitude.logEvent('Delete Conformation', {
					userDecision: response
				});
	            switch (response) {
	                case 'cancel' :
	                	onReject(e);
	                    break;
	                case 'delete' :
	                    onApprove(e);
	                    break;
	            }
	        }, this);

	        return require('dialogs').create('simple', dialogConfig, 'onDeleteResponse');
		},
		delete: function (e) {
			var target = $(e.currentTarget);

			this.controller.delete(target.attr('data-id'));
		},
		render: function ($parent) {
			this._super(template);

			this.setEvents();
		}
	})

	return BundlesManagerView;
});