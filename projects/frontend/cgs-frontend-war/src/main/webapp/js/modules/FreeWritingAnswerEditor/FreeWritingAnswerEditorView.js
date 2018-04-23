define(['jquery', 'BasePropertiesView', 'text!modules/FreeWritingAnswerEditor/templates/FreeWritingAnswerEditor.html'],
function($, BasePropertiesView, template) {

	var FreeWritingAnswerEditorView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'FreeWritingAnswerEditorView'});

	return FreeWritingAnswerEditorView;

});
