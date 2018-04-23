define(['jquery', 'BaseNormalStageContentView', 'text!modules/AppletTaskEditor/templates/AppletTaskStage.html'],
function($, BaseNormalStageContentView, template) {

	var AppletTaskStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'AppletTaskStageView'});

	return AppletTaskStageView;

});
