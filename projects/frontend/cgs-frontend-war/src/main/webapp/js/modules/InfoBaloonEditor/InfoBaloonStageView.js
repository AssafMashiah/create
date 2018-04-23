define(['jquery', 'BaseNormalStageContentView',  'text!modules/InfoBaloonEditor/templates/InfoBaloonStage.html'],
function($, BaseNormalStageContentView, template) {

	var InfoBaloonStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		},
		dispose: function() {
			this._super();
			this.remove();
		}
		
	}, {type: 'InfoBaloonStageView'});

	return InfoBaloonStageView;

});