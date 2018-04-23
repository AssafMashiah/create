define(['jquery', 'BasePropertiesView', 'text!modules/TitleEditor/templates/TitleEditorProps.html'],
function($, BasePropertiesView, template) {

	var TitleEditorView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'TitleEditorView'});

	return TitleEditorView;

});
