define(['jquery', 'BaseStageContentView', 'text!modules/SortingAnswerEditor/templates/SortingAnswerSmallStage.html'],
function($, BaseStageContentView, template) {

	var SortingAnswerSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'SortingAnswerSmallStageView'});

	return SortingAnswerSmallStageView;

});
