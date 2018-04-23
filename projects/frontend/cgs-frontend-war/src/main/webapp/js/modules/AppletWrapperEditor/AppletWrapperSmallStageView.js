define(['jquery', 'BaseStageContentView', 'text!modules/AppletWrapperEditor/templates/AppletWrapperSmallStage.html'],
function($, BaseStageContentView, template) {

	var AppletWrapperSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},
		
		showStagePreview: function($parent, previewConfig) {
			this.render($parent);
			if (!!this.controller.isTask) {
				if (!!previewConfig.bindTaskEvents) {
					this.bindStageEvents();
				}
			} else {
				if (!!previewConfig.bindEvents)
					this.bindStageEvents();
			}
		}

	}, {type: 'AppletWrapperSmallStageView'});

	return AppletWrapperSmallStageView;

});
