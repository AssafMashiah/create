define(['jquery', 'BaseStageContentView','text!modules/SharedContentEditor/templates/SharedContentSmallStage.html'],
function($, BaseStageContentView, template) {

	var SharedSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'SharedSmallStageView'});

	return SharedSmallStageView;

});