define(['jquery', 'BaseStageContentView', 'text!modules/AssetsManagerEditor/templates/TtsManagerSmallStage.html'],
function($, BaseStageContentView, template) {

	var TtsManagerSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'TtsManagerSmallStageView'});

	return TtsManagerSmallStageView;

});