define(['jquery', 'BaseNormalStageContentView', 'text!modules/AudioPlayerEditor/templates/AudioPlayerStage.html'],
function($, BaseNormalStageContentView, template) {

	var AudioPlayerStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'AudioPlayerStageView'});

	return AudioPlayerStageView;

});
