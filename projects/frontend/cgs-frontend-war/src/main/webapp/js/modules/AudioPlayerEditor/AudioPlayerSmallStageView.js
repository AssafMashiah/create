define(['jquery', 'BaseStageContentView', 'text!modules/AudioPlayerEditor/templates/AudioPlayerSmallStage.html'],
function($, BaseStageContentView, template) {

	var AudioPlayerSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}	

	}, {type: 'AudioPlayerSmallStageView'});

	return AudioPlayerSmallStageView;

});
