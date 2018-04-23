define(['jquery', 'modules/MathfieldEditor/MathfieldStageView',
	'text!modules/AnswerFieldTypeMathfieldEditor/templates/AnswerFieldTypeMathfieldStage.html'],
function($, MathfieldStageView, template) {

	var AnswerFieldTypeMathfieldStageView = MathfieldStageView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		},
		render: function(val){
			this._super(val);
			// add class to answer field, to look different than regular field
			if(!this.controller.record.data.isNoncheckable){
				this.$el.addClass('AnswerField');
			}
		},

		setFieldWidth: function(val) {
			this.$('.answerFieldTypeMathfield_content').attr('fieldWidth', val);
		}

	}, {type: 'AnswerFieldTypeMathfieldStageView'});

	return AnswerFieldTypeMathfieldStageView;

});
