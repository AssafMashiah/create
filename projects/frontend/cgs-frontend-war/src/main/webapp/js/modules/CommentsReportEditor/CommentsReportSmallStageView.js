define(['jquery', 'BaseStageContentView', 'text!modules/CommentsReportEditor/templates/CommentsReportSmallStage.html'],
function($, BaseStageContentView, template) {

	var CommentsReportSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'CommentsReportSmallStageView'});

	return CommentsReportSmallStageView;

});