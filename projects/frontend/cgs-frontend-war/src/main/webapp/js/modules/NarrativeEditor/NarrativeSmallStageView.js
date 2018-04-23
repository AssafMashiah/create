define(['jquery', 'BaseStageContentView', 'text!modules/NarrativeEditor/templates/NarrativeSmallStage.html'],
function($, BaseStageContentView, template) {

	var NarrativeSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'NarrativeSmallStageView'});

	return NarrativeSmallStageView;

});
