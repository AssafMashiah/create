define(['jquery', 'BaseStageContentView', 'text!modules/NarrationsManagerEditor/templates/NarrationsManagerSmallStage.html'],
function($, BaseStageContentView, template) {

	var NarrationsManagerSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'NarrationsManagerSmallStageView'});

	return NarrationsManagerSmallStageView;

});