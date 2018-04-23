define(['jquery', 'BaseStageContentView', 'text!modules/MatchingAnswerEditor/templates/MatchingAnswerSmallStage.html'],
function($, BaseStageContentView, template) {

	var MatchingAnswerSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'MatchingAnswerSmallStageView'});

	return MatchingAnswerSmallStageView;

});
