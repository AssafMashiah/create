define(['jquery', 'BaseStageContentView', 'text!modules/DefinitionEditor/templates/DefinitionSmallStage.html'],
function($, BaseStageContentView, template) {

	var DefinitionSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'DefinitionSmallStageView'});

	return DefinitionSmallStageView;

});
