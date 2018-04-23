define(['jquery', 'BaseStageContentView', 'text!modules/DistructorsEditor/templates/DistructorsSmallStage.html'],
function($, BaseStageContentView, template) {

	var DistructorsSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'DistructorsSmallStageView'});

	return DistructorsSmallStageView;

});
