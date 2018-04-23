define(['jquery', 'BasePropertiesView', 'text!modules/AssessmentQuestionEditor/templates/AssessmentQuestionProps.html'],
function($, BasePropertiesView, template) {

	var AssessmentQuestionEditorView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'AssessmentQuestionEditorView'});

	return AssessmentQuestionEditorView;

});
