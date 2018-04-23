define(['jquery', 'BaseStageContentView', 'events',
	'text!modules/ShortAnswerAnswerEditor/templates/ShortAnswerAnswerSmallStage.html'],
function($, BaseStageContentView, events, template) {

	var ShortAnswerAnswerSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}

	}, {type: 'ShortAnswerAnswerSmallStageView'});

	return ShortAnswerAnswerSmallStageView;

});
