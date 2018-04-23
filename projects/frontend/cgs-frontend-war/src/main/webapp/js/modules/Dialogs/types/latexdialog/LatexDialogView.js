define(['lodash','jquery', 'BaseView', 'mustache', 'events', 'modules/Dialogs/BaseDialogView', 'text!modules/Dialogs/types/latexdialog/LatexDialog.html'],
function(_, $, BaseView, Mustache, events, BaseDialogView, template) {

	var LatexDialogView = BaseDialogView.extend({

		tagName : 'div',
		className : 'css-dialog',

		
		initialize: function(options) {
			
			this.customTemplate = template;
			
			this._super(options);

		},
		setReturnValueCallback: {
			"yes": function f647() {
				return this.$el.find('#latex_format').val();
			}
		},
		render: function( $parent ) {
			this._super($parent, this.customTemplate);
			this.$el.find('textarea').focus();
		}

	}, {type: 'LatexDialogView'});

	return LatexDialogView;

});
