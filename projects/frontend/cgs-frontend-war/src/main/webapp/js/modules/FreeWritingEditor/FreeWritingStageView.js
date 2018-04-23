define(['jquery', 'BaseNormalStageContentView', 'text!modules/FreeWritingEditor/templates/FreeWritingNormalStage.html'],
function($, BaseNormalStageContentView, template) {

	var FreeWritingStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'FreeWritingStageView'});

	return FreeWritingStageView;

});
