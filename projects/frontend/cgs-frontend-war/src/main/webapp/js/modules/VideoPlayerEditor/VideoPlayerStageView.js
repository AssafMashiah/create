define(['jquery', 'BaseNormalStageContentView', 'text!modules/VideoPlayerEditor/templates/VideoPlayerStage.html'],
function($, BaseNormalStageContentView, template) {

	var VideoPlayerStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'VideoPlayerStageView'});

	return VideoPlayerStageView;

});
