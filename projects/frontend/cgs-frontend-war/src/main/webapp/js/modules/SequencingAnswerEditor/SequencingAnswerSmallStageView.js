define(['jquery', 'BaseStageContentView', 'text!modules/SequencingAnswerEditor/templates/SequencingAnswerSmallStage.html'],
function($, BaseStageContentView, template) {

	var SequencingAnswerSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'SequencingAnswerSmallStageView'});

	return SequencingAnswerSmallStageView;

});
