define(['modules/Dialogs/BaseDialogView', "./PublishLinkDialog", 'events'],
	function (BaseDialogView, publishLinkDialog, events) {

		var PublishLinkDialogView = BaseDialogView.extend({

			render: function render($parent) {
				this._super($parent);
				publishLinkDialog.render(document.getElementById("dialog"), this.inputHandler.bind(this), this.options.config.publishData);
			},

			inputHandler: function inputHandler(action, args) {
				this.controller.setReturnValue(action, args);
				events.fire("terminateDialog", action);
			}


		}, {type: 'PublishLinkDialogView'});

		return PublishLinkDialogView;

	}
);