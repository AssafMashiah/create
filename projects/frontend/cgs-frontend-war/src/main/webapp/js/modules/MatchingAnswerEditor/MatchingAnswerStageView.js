define(['jquery', 'BaseAnswerNormalStageContentView', 'text!modules/MatchingAnswerEditor/templates/MatchingAnswerNormalStage.html'],
function($, BaseAnswerNormalStageContentView, template) {

	var MatchingAnswerStageView = BaseAnswerNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'MatchingAnswerStageView'});

	return MatchingAnswerStageView;

});
