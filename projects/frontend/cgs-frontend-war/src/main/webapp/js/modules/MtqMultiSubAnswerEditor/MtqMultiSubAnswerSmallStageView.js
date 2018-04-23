define(['jquery', 'BaseStageContentView', 'text!modules/MtqMultiSubAnswerEditor/templates/MtqMultiSubAnswerSmallStage.html'],
function($, BaseStageContentView, template) {

	var MtqMultiSubAnswerSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'MtqMultiSubAnswerSmallStageView'});

	return MtqMultiSubAnswerSmallStageView;

});
