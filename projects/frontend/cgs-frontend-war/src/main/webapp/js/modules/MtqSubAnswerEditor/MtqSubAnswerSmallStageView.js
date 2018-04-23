define(['jquery', 'BaseStageContentView', 'text!modules/MtqSubAnswerEditor/templates/MtqSubAnswerSmallStage.html'],
function($, BaseStageContentView, template) {

	var MtqSubAnswerSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'MtqSubAnswerSmallStageView'});

	return MtqSubAnswerSmallStageView;

});
