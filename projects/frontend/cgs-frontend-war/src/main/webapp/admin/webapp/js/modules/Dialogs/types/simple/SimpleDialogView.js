define(['lodash','jquery', 'BaseView', 'mustache', 'events', 'modules/Dialogs/BaseDialogView', 'text!modules/Dialogs/types/simple/SimpleDialog.html'],
function(_, $, BaseView, Mustache, events, BaseDialogView, template) {

	var SimpleDialogView = BaseDialogView.extend({

		tagName : 'div',
		className : 'css-dialog',

		
		initialize: function(options) {
			
			this.customTemplate = template;
			
			this._super(options);

		},

		render: function( $parent ) {
			console.log('simple dialog view render');
			this._super($parent, this.customTemplate);
		}

	}, {type: 'SimpleDialogView'});

	return SimpleDialogView;

});
