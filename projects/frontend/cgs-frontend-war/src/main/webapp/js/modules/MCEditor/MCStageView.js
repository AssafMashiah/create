define(['jquery', 'BaseNormalStageContentView', 'text!modules/MCEditor/templates/MCNormalStage.html'],
function($, BaseNormalStageContentView, template) {

	var MCStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'MCStageView'});

	return MCStageView;

});
