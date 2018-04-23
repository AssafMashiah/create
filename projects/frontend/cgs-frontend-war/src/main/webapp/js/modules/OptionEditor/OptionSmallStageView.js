define(['jquery', 'BaseStageContentView', 'text!modules/OptionEditor/templates/OptionSmallStage.html'],
function($, BaseStageContentView, template) {

	var OptionSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'OptionSmallStageView'});

	return OptionSmallStageView;

});
