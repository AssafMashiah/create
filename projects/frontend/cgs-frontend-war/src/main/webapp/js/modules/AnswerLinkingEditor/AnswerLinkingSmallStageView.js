define(['jquery', 'BaseStageContentView', 'text!modules/AnswerLinkingEditor/templates/AnswerLinkingSmallStage.html'],
function($, BaseStageContentView, template) {

	var AnswerLinkingSmallStage = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'AnswerLinkingSmallStage'});

	return AnswerLinkingSmallStage;

});
