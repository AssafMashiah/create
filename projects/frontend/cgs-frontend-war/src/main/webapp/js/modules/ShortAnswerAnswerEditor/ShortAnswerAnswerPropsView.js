define(['jquery', 'BasePropertiesView', 'lessonModel',
	'text!modules/ShortAnswerAnswerEditor/templates/ShortAnswerAnswerProps.html'],
function($,  BasePropertiesView, lessonModel, template) {

	var ShortAnswerAnswerPropsView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},
		render : function(){
			this._super();
			this.$("#field_FractionOverFraction").on('change', this.controller.onMathfieldHeightChange.bind(this.controller));
		},
		isLessonModeAssessment: function(){
			return lessonModel.isLessonModeAssessment();
		},
		fractionOverFraction: function(){
			return this.controller.record.data.mathfield_height =='secondLevel';
		}

	}, {type: 'ShortAnswerAnswerPropsView'});

	return ShortAnswerAnswerPropsView;

});
