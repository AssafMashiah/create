define(['jquery', 'BasePropertiesView', 'text!modules/AppletEditor/templates/AppletProps.html'],
function($, BasePropertiesView, template) {

	var AppletPropsView = BasePropertiesView.extend({

		el: '#props_base',

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'AppletPropsView'});

	return AppletPropsView;

});
