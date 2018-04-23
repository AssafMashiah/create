define(['modules/Dialogs/BaseDialogView', 'text!modules/Dialogs/types/standardErrorDialog/standardErrorDialog.html'],
function( BaseDialogView, template) {

	var standardErrorView = BaseDialogView.extend({

		tagName:'div',
		className:'css-dialog',
		
		initialize:function (options) {
			this.customTemplate = template;
			this._super(options);
		},

		render:function ($parent) {
			this._super($parent, this.customTemplate);
		}

	}, {type: 'standardErrorView'});

	return standardErrorView;

});