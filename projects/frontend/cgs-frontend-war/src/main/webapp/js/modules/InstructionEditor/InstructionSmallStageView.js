define(['jquery', 'BaseStageContentView', 
	'text!modules/InstructionEditor/templates/InstructionSmallStage.html'],
function($, BaseStageContentView, template) {

	var InstructionSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
			

	}, {type: 'InstructionSmallStageView'});

	return InstructionSmallStageView;

});
