define(['BaseNormalStageContentView', 'text!modules/HeaderEditor/templates/HeaderStage.html'],
function(BaseNormalStageContentView, template) {

	var HeaderStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'HeaderStageView'});

	return HeaderStageView;

});
