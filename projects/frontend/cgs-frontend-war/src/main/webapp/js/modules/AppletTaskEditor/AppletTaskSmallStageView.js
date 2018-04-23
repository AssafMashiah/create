define(['jquery', 'BaseStageContentView', 'text!modules/AppletTaskEditor/templates/AppletTaskSmallStage.html'],
function($, BaseStageContentView, template) {

	var AppletTaskSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'AppletTaskSmallStageView'});

	return AppletTaskSmallStageView;

});
