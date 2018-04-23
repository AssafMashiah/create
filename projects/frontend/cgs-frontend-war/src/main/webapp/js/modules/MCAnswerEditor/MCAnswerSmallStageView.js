define(['jquery', 'BaseStageContentView', 'text!modules/MCAnswerEditor/templates/MCAnswerSmallStage.html'],
function($, BaseStageContentView, template) {

	var MCAnswerSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
			// Disable D&D in small stage view
			this.controller.config.sortChildren = false;
		}

		
		
	}, {type: 'MCAnswerSmallStageView'});

	return MCAnswerSmallStageView;

});
