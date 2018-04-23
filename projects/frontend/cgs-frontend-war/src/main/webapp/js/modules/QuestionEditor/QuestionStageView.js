define(['jquery','repo', 'BaseNormalStageContentView', 'text!modules/QuestionEditor/templates/QuestionStage.html'],
function($, repo, BaseNormalStageContentView, template) {

	var QuestionStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}
		
	}, {type: 'QuestionStageView'});

	return QuestionStageView;

});
