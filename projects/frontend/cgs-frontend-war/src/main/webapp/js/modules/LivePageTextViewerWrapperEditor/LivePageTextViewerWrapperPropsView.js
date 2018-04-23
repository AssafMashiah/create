define(['jquery', 'IconAndFileUpload', '../LivePageElementEditor/LivePageElementPropsView',
 'text!modules/LivePageTextViewerWrapperEditor/templates/LivePageTextViewerWrapperProps.html'],
function($,  IconAndFileUpload, LivePageElementPropsView, template) {

	var LivePageTextViewerWrapperPropsView = LivePageElementPropsView.extend({

		initialize: function(options) {
			this._super(options);
		},

		render: function() {
			this.template = template;
			this._super();
		}

	}, {type: 'LivePageTextViewerWrapperPropsView'});
	return LivePageTextViewerWrapperPropsView;

});