define(['jquery', 'BaseStageContentView', 'text!modules/ImageViewerEditor/templates/ImageViewerSmallStage.html'],
function($, BaseStageContentView, template) {

	var ImageViewerSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'ImageViewerSmallStageView'});

	return ImageViewerSmallStageView;

});
