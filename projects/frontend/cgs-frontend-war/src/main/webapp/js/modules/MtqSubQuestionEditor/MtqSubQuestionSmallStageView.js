define(['jquery', 'BaseStageContentView', 'text!modules/MtqSubQuestionEditor/templates/MtqSubQuestionSmallStage.html'],
function($, BaseStageContentView, template) {

	var MtqSubQuestionSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'MtqSubQuestionSmallStageView'});

	return MtqSubQuestionSmallStageView;

});
