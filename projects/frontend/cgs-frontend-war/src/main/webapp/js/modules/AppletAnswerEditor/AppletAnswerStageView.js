define(['jquery', 'events', 'BaseAnswerNormalStageContentView', 'text!modules/AppletAnswerEditor/templates/AppletAnswerStageView.html'],
function($, events, BaseAnswerNormalStageContentView, template) {

	var AppletAnswerStageView = BaseAnswerNormalStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}
		
	}, {type: 'AppletAnswerStageView'});

	return AppletAnswerStageView;

});
