define([ 'BasePropertiesView', 'text!modules/SeparatorEditor/templates/SeparatorProps.html'],
function( BasePropertiesView, template) {

	var SeparatorEditorView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'SeparatorEditorView'});

	return SeparatorEditorView;

});
