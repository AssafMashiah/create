define(['jquery', 'BaseStageContentView', 'rivets',
		'text!modules/AdvancedProgressEditor/templates/AdvancedProgressSmallStage.html'],
function($, BaseStageContentView, rivets, template) {

	var AdvancedProgressSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
			
	}, {type: 'AdvancedProgressSmallStageView'});

	return AdvancedProgressSmallStageView;

});
