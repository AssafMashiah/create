define(['jquery', 'BasePropertiesView','text!modules/QuestionEditor/templates/QuestionProps.html'],
function($, BasePropertiesView, template) {

	var QuestionEditorView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'QuestionEditorView'});

	return QuestionEditorView;

});
