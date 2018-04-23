define(['jquery', 'BaseStageContentView', 'events',
	'text!modules/FreeWritingAnswerEditor/templates/FreeWritingAnswerSmallStage.html'],
function($, BaseStageContentView, events, template) {

	var FreeWritingAnswerSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
			

	}, {type: 'FreeWritingAnswerSmallStageView'});

	return FreeWritingAnswerSmallStageView;

});
