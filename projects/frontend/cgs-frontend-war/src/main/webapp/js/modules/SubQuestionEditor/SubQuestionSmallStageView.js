define(['jquery', 'BaseStageContentView', 'text!modules/SubQuestionEditor/templates/SubQuestionSmallStage.html'],
function($, BaseStageContentView, template) {

	var SubQuestionSmallStageView = BaseStageContentView.extend({
		initialize: function(options) {
			this.template = template;
			this._super(options);		
		}

	}, {type: 'SubQuestionSmallStageView'});

	return SubQuestionSmallStageView;

});
