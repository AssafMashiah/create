define(['jquery', 'BaseStageContentView', 'text!modules/ShortAnswerEditor/templates/ShortAnswerSmallStage.html'],
function($, BaseStageContentView, template) {

	var ShortAnswerSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'ShortAnswerSmallStageView'});

	return ShortAnswerSmallStageView;

});
