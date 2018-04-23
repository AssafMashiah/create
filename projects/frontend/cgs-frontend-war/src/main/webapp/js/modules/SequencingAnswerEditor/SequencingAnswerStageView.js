define(['jquery', 'BaseAnswerNormalStageContentView', 'text!modules/SequencingAnswerEditor/templates/SequencingAnswerStage.html'],
function($, BaseAnswerNormalStageContentView, template) {

	var SequencingAnswerStageView = BaseAnswerNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'SequencingAnswerStageView'});

	return SequencingAnswerStageView;

});
