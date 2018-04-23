define(['jquery', 'BasePropertiesView', 'text!modules/SharedContentEditor/templates/SharedContentEditor.html'],
function($, BasePropertiesView, template) {

	var SharedEditorView = BasePropertiesView.extend({

		el: '#props_base',

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'SharedEditorView'});

	return SharedEditorView;

});
