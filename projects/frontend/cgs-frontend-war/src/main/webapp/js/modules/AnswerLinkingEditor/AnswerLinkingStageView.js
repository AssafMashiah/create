define(['jquery', 'BaseAnswerNormalStageContentView', 'text!modules/AnswerLinkingEditor/templates/AnswerLinkingStage.html'],
function($, BaseAnswerNormalStageContentView, template) {

	var AnswerLinkingStageView = BaseAnswerNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		},
		render: function f32($parent, previewConfig) {
			this._super($parent, previewConfig);
		}
		
	}, {type: 'AnswerLinkingStageView'});

	return AnswerLinkingStageView;

});
