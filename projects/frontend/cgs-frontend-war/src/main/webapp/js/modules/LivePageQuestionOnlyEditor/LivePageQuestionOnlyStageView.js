define(['jquery', 'BaseNormalStageContentView', 'text!modules/LivePageQuestionOnlyEditor/templates/LivePageQuestionOnlyNormalStage.html'],
function($, BaseNormalStageContentView, template) {

	var LivePageQuestionOnlyStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'LivePageQuestionOnlyStageView'});

	return LivePageQuestionOnlyStageView;

});
