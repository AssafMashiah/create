define(['jquery', 'BaseStageContentView', 'text!modules/MTQEditor/templates/MTQSmallStage.html'],
function($, BaseStageContentView, template) {

	var MTQSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'MTQSmallStageView'});

	return MTQSmallStageView;

});
