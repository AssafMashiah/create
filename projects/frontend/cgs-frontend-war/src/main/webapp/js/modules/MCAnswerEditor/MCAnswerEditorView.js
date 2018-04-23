define(['jquery','BasePropertiesView', 'lessonModel',
	'text!modules/MCAnswerEditor/templates/MCAnswerProps.html'],
function($, BasePropertiesView, lessonModel, template) {

	var MCAnswerEditorView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},
		isLessonModeAssessment: function(){
			return lessonModel.isLessonModeAssessment();
		}

	}, {type: 'MCAnswerEditorView'});

	return MCAnswerEditorView;

});
