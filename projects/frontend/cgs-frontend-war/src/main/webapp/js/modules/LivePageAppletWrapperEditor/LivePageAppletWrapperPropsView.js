define(['jquery', '../LivePageElementEditor/LivePageElementPropsView', 'text!modules/AppletWrapperEditor/templates/AppletWrapperProps.html'],
function($,  LivePageElementPropsView, template) {

	var LivePageAppletWrapperPropsView = LivePageElementPropsView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},

		render: function() {
			this.template = template;
			this._super();		
		}
		
	}, {type: 'LivePageAppletWrapperPropsView'});
	return LivePageAppletWrapperPropsView;

});