define(['jquery', 'BasePropertiesView', 'text!modules/HelpEditor/templates/HelpProps.html'],
function($, BasePropertiesView, template) {

	var HelpEditorView = BasePropertiesView.extend({

		el: '#props_base',

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'HelpEditorView'});

	return HelpEditorView;

});
