define(['jquery', 'BaseAnswerNormalStageContentView', 'text!modules/ClozeAnswerEditor/templates/ClozeAnswerNormalStageView.html'],
function($, BaseAnswerNormalStageContentView, template) {

	var ClozeAnswerNormalStageView = BaseAnswerNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'ClozeAnswerNormalStageView'});

	return ClozeAnswerNormalStageView;

});
