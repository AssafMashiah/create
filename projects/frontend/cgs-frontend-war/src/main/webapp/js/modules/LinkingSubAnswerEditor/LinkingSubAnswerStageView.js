define(['BaseNormalStageContentView', 'text!modules/LinkingSubAnswerEditor/templates/LinkingSubAnswerNormalStage.html'],
function(BaseNormalStageContentView, template) {

	var LinkingSubAnswerStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'LinkingSubAnswerStageView'});

	return LinkingSubAnswerStageView;

});
