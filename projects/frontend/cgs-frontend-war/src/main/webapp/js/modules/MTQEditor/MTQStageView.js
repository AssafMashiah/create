define(['jquery', 'BaseNormalStageContentView', 'text!modules/MTQEditor/templates/MTQNormalStage.html'],
function($, BaseNormalStageContentView, template) {

	var MTQStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'MTQStageView'});

	return MTQStageView;

});
