define(['BaseStageContentView', 'text!modules/LinkingSubAnswerEditor/templates/LinkingSubAnswerSmallStage.html'],
function(BaseStageContentView, template) {

	var LinkingSubAnswerSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'LinkingSubAnswerSmallStageView'});

	return LinkingSubAnswerSmallStageView;

});
