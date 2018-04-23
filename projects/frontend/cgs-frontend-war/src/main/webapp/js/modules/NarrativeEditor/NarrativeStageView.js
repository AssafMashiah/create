define(['jquery', 'BaseNormalStageContentView', 'text!modules/NarrativeEditor/templates/NarrativeStage.html'],
function($, BaseNormalStageContentView, template) {

	var NarrativeStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'NarrativeStageView'});

	return NarrativeStageView;

});
