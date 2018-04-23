define(['jquery', 'BaseStageContentView', 'text!modules/MTQBankEditor/templates/MTQBankSmallStage.html'],
function($, BaseStageContentView, template) {

	var MTQBankSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'MTQBankSmallStageView'});

	return MTQBankSmallStageView;

});
