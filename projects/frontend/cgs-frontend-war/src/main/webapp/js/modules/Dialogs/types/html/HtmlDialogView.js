define(['lodash','jquery', 'BaseView', 'mustache', 'events', 'modules/Dialogs/BaseDialogView', 'text!modules/Dialogs/types/html/HtmlDialog.html'],
function(_, $, BaseView, Mustache, events, BaseDialogView, template) {

	var HtmlDialogView = BaseDialogView.extend({

		tagName : 'div',
		className : 'css-dialog',

		
		initialize: function(options) {
			
			this.customTemplate = template;
			
			this._super(options);

		},

		render: function( $parent ) {
			this._super($parent, this.customTemplate);
		}

	}, {type: 'HtmlDialogView'});

	return HtmlDialogView;

});
