define(['jquery', 'BaseNormalStageContentView', 'text!modules/DefinitionEditor/templates/DefinitionNormalStage.html'],
function($, BaseNormalStageContentView, template) {

	var DefinitionStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'DefinitionStageView'});

	return DefinitionStageView;

});
