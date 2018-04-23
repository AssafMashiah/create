define(['jquery', 'BaseStageContentView', 'text!modules/MTQAreaEditor/templates/MTQAreaSmallStage.html'],
function($, BaseStageContentView, template) {

	var MTQAreaSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'MTQAreaSmallStageView'});

	return MTQAreaSmallStageView;

});
