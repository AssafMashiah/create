define(['jquery', 'BaseStageContentView', 'text!modules/AssessmentQuestionEditor/templates/AssessmentQuestionSmallStage.html'],
function($, BaseStageContentView, template) {

	var AssessmentQuestionSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			//this.options.controller.config.sortChildren = false;
            this._super(options);
            this.template = template;
		}
		
		
	}, {type: 'AssessmentQuestionSmallStageView'});

	return AssessmentQuestionSmallStageView;

});
