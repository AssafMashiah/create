define(['jquery', 'BaseStageContentView', 'text!modules/AppletAnswerEditor/templates/AppletAnswerSmallStageView.html'],
function($, BaseStageContentView, template) {

	var AppletAnswerSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}
		
		
	}, {type: 'AppletAnswerSmallStageView'});

	return AppletAnswerSmallStageView;

});
