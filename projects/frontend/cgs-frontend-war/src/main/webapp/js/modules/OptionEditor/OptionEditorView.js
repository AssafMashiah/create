define(['jquery', 'BasePropertiesView','text!modules/OptionEditor/templates/OptionProps.html'],
function($, BasePropertiesView, template) {

	var OptionEditorView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'OptionEditorView'});

	return OptionEditorView;

});
