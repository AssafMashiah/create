define(['jquery', 'BaseStageContentView', 'text!modules/HintEditor/templates/HintSmallStage.html'],
function($, BaseStageContentView, template) {

	var HintSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'HintSmallStageView'});

	return HintSmallStageView;

});