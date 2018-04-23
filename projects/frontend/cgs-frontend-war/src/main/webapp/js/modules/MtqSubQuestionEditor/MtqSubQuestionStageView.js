define(['jquery', 'BaseNormalStageContentView', 'text!modules/MtqSubQuestionEditor/templates/MtqSubQuestionNormalStage.html'],
function($, BaseNormalStageContentView, template) {

	var MtqSubQuestionStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'MtqSubQuestionStageView'});

	return MtqSubQuestionStageView;

});
