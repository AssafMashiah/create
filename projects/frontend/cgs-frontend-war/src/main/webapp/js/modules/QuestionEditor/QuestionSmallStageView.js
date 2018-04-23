define(['jquery', 'BaseStageContentView', 'text!modules/QuestionEditor/templates/QuestionSmallStage.html'],
function($, BaseStageContentView, template) {

	var QuestionSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			//this.options.controller.config.sortChildren = false;
			this.template = template;
			this._super(options);
		}
		
		
	}, {type: 'QuestionSmallStageView'});

	return QuestionSmallStageView;

});
