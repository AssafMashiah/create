define(['jquery', 'IconAndFileUpload', '../LivePageElementEditor/LivePageElementPropsView',
 'text!modules/LivePageMultimediaEditor/templates/LivePageMultimediaProps.html'],
function($,  IconAndFileUpload, LivePageElementPropsView, template) {

	var LivePageMultimediaPropsView = LivePageElementPropsView.extend({

		initialize: function(options) {
			this._super(options);
		},

		render: function() {
			this.template = template;
			this._super();
		}

	}, {type: 'LivePageMultimediaPropsView'});
	return LivePageMultimediaPropsView;

});