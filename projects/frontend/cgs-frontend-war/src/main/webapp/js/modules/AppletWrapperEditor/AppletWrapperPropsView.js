define(['jquery', 'BasePropertiesView', 'text!modules/AppletWrapperEditor/templates/AppletWrapperProps.html'],
function($,  BasePropertiesView, template) {

	var AppletWrapperPropsView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}
		
	}, {type: 'AppletWrapperPropsView'});
	return AppletWrapperPropsView;

});