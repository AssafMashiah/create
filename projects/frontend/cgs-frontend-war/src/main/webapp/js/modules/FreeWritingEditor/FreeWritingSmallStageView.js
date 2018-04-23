define(['jquery', 'BaseStageContentView', 'text!modules/FreeWritingEditor/templates/FreeWritingSmallStage.html'],
function($, BaseStageContentView, template) {

	var FreeWritingSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'FreeWritingSmallStageView'});

	return FreeWritingSmallStageView;

});
