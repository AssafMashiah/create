define(['jquery', 'BaseNormalStageContentView', 'mustache',
	'text!modules/CommentsReportEditor/templates/CommentsReportStage.html',
	'text!modules/CommentsReportEditor/templates/CommentsExportTemplate.html'],
function($, BaseNormalStageContentView, Mustache, template, exportTemplate) {

	var CommentsReportStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
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
		},

		buildExportHtml: function(print) {
			return Mustache.render(exportTemplate, { 
				lessonName: this.controller.lessonName,
				content: this.$el.find('#lesson-comments')[0].outerHTML,
				print: print,
				isRtl: require('localeModel').getConfig('direction') == 'rtl'
			});
		}

	}, {type: 'CommentsReportStageView'});

	return CommentsReportStageView;

});