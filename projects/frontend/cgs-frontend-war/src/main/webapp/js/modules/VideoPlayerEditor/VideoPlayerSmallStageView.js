define(['jquery', 'BaseStageContentView', 'text!modules/VideoPlayerEditor/templates/VideoPlayerSmallStage.html'],
function($, BaseStageContentView, template) {

	var VideoPlayerSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}	

	}, {type: 'VideoPlayerSmallStageView'});

	return VideoPlayerSmallStageView;

});
