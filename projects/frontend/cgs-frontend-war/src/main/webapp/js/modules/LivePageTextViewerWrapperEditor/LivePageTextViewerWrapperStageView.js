define(['jquery', 'BaseNormalStageContentView', 'text!modules/LivePageTextViewerWrapperEditor/templates/LivePageTextViewerWrapperStage.html'],
function($, BaseNormalStageContentView, template) {

	var LivePageTextViewerWrapperStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},
		dispose: function() {
			this._super();
			this.remove();
		}

	}, {type: 'LivePageTextViewerWrapperStageView'});

	return LivePageTextViewerWrapperStageView;

});
