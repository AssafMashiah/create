define([ 'modules/Dialogs/BaseDialogView', 'text!modules/Dialogs/types/uploadFontDone/uploadFontDone.html'],
function(BaseDialogView, template) {

	var uploadFontDoneDialogView = BaseDialogView.extend({

		tagName:'div',
		className:'css-dialog fontUpload',

		initialize:function f653(options) {
			this.customTemplate = template;
			this._super(options);
		},

		render:function f654($parent) {
			this._super($parent, this.customTemplate, this.options.config.data);
		}

	}, {type: 'uploadFontDoneDialogView'});

	return uploadFontDoneDialogView;

});