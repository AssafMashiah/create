define(['jquery', 'BaseStageContentView', 'text!modules/ClozeAnswerEditor/templates/ClozeAnswerSmallStageView.html'],
function($, BaseStageContentView, template) {

	var ClozeAnswerSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'ClozeAnswerSmallStageView'});

	return ClozeAnswerSmallStageView;

});
