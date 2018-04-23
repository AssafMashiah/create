define(['jquery', 'BaseStageContentView', 'text!modules/PedagogicalStatementEditor/templates/PedagogicalStatementSmallStage.html'],
function($, BaseStageContentView, template) {

	var PedagogicalStatementSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'PedagogicalStatementSmallStageView'});

	return PedagogicalStatementSmallStageView;

});
