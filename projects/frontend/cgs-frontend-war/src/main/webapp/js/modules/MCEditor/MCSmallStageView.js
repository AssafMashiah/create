define(['jquery', 'BaseStageContentView', 'text!modules/MCEditor/templates/MCSmallStage.html'],
function($, BaseStageContentView, template) {

	var MCSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'MCSmallStageView'});

	return MCSmallStageView;

});
