define(['jquery', 'BaseNormalStageContentView', 'text!modules/MtqSubAnswerEditor/templates/MtqSubAnswerNormalStage.html'],
function($, BaseNormalStageContentView, template) {

	var MtqSubAnswerStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'MtqSubAnswerStageView'});

	return MtqSubAnswerStageView;

});
