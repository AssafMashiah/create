define(['jquery', 'BaseStageContentView', 'text!modules/ClozeBankEditor/templates/ClozeBankSmallStage.html'],
function($, BaseStageContentView, template) {

	var ClozeBankSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'ClozeBankSmallStageView'});

	return ClozeBankSmallStageView;

});
