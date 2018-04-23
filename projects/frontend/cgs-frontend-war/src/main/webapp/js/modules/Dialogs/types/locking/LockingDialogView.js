define(['lodash','jquery', 'BaseView', 'mustache', 'events', 'modules/Dialogs/BaseDialogView', 'text!modules/Dialogs/types/locking/LockingDialog.html'],
function(_, $, BaseView, Mustache, events, BaseDialogView, template) {

	var LockingDialogView = BaseDialogView.extend({

		tagName:'div',
		className:'css-dialog',
		
		filePath: "",

		initialize:function f653(options) {
			this.customTemplate = template;
			this._super(options);
		},

		render:function f654($parent) {
			this._super($parent, this.customTemplate);
		}

	}, {type: 'LockingDialogView'});

	return LockingDialogView;

});