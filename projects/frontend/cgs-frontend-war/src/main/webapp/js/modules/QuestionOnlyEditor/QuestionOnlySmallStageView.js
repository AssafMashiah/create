define(['jquery', 'BaseStageContentView', 'text!modules/QuestionOnlyEditor/templates/QuestionOnlySmallStage.html'],
function($, BaseStageContentView, template) {

	var QuestionOnlySmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'QuestionOnlySmallStageView'});

	return QuestionOnlySmallStageView;

});
