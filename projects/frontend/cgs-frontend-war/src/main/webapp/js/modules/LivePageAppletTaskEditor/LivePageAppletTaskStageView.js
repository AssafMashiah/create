define(['jquery', 'BaseNormalStageContentView', 'text!modules/LivePageAppletTaskEditor/templates/LivePageAppletTaskStage.html'],
function($, BaseNormalStageContentView, template) {

	var LivePageAppletTaskStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'LivePageAppletTaskStageView'});

	return LivePageAppletTaskStageView;

});
