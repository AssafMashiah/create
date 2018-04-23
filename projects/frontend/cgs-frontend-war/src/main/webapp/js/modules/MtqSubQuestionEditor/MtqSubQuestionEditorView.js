define(['jquery', 'BasePropertiesView','text!modules/MtqSubQuestionEditor/templates/MtqSubQuestionProps.html'],
function($, BasePropertiesView, template) {

	var MtqSubQuestionEditorView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'MtqSubQuestionEditorView'});

	return MtqSubQuestionEditorView;

});
