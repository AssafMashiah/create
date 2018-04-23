define(['jquery', 'events', 'BaseNormalStageContentView','text!modules/SubQuestionEditor/templates/SubQuestionNormalStage.html'],
function($, events, BaseNormalStageContentView, template) {

	var SubQuestionStageView = BaseNormalStageContentView.extend({
		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'SubQuestionStageView'});

	return SubQuestionStageView;

});
