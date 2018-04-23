define(['jquery', 'BaseStageContentView', 'text!modules/SelfCheckEditor/templates/SelfCheckSmallStage.html'],
function($, BaseStageContentView, template) {

	var SelfCheckSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'SelfCheckSmallStageView'});

	return SelfCheckSmallStageView;

});
