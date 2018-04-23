define(['jquery', 'BaseNormalStageContentView', 'text!modules/ImageViewerEditor/templates/ImageViewerStage.html'],
function($, BaseNormalStageContentView, template) {

	var ImageViewerStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}	

	}, {type: 'ImageViewerStageView'});

	return ImageViewerStageView;

});
