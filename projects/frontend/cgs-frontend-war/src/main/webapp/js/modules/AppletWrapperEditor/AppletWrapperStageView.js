define(['jquery', 'BaseNormalStageContentView', 'text!modules/AppletWrapperEditor/templates/AppletWrapperStage.html'],
function($, BaseNormalStageContentView, template) {

	var AppletWrapperStageView = BaseNormalStageContentView.extend({

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

	}, {type: 'AppletWrapperStageView'});

	return AppletWrapperStageView;

});
