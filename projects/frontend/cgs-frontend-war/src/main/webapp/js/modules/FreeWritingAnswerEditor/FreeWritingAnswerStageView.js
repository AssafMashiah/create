define(['jquery',  'translate', 'mustache', 'BaseAnswerNormalStageContentView', 'text!modules/FreeWritingAnswerEditor/templates/FreeWritingAnswerStage.html'],
function($, i18n,  Mustache, BaseAnswerNormalStageContentView, template) {

	var FreeWritingAnswerStageView = BaseAnswerNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}		

	}, {type: 'FreeWritingAnswerStageView'});

	return FreeWritingAnswerStageView;

});
