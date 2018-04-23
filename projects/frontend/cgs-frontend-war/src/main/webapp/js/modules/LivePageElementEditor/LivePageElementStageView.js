define(['jquery','repo', 'BaseNormalStageContentView', 'text!modules/LivePageElementEditor/templates/LivePageElementStage.html'],
function($, repo, BaseNormalStageContentView, template) {

	var LivePageElementStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}
		
	}, {type: 'LivePageElementStageView'});

	return LivePageElementStageView;

});