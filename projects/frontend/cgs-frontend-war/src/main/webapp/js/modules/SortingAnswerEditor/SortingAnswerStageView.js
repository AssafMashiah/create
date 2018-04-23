define(['jquery', 'BaseAnswerNormalStageContentView', 'text!modules/SortingAnswerEditor/templates/SortingAnswerStage.html'],
function($, BaseAnswerNormalStageContentView, template) {

	var SortingAnswerStageView = BaseAnswerNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'SortingAnswerStageView'});

	return SortingAnswerStageView;

});
