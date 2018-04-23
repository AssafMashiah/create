define(['jquery', 'BasePropertiesView', 'text!modules/InstructionEditor/templates/InstructionEditor.html'],
function($, BasePropertiesView, template) {

	var InstructionEditorView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'InstructionEditorView'});

	return InstructionEditorView;

});
