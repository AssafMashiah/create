define(['jquery', 'modules/BaseTaskEditor/BaseTaskPropsView', 'text!modules/AppletTaskEditor/templates/AppletTaskProps.html'],
function($, BaseTaskPropsView, template) {

	var AppletTaskPropsView = BaseTaskPropsView.extend({
		
		initialize: function(options) {			
			this._super(options);
		},
		initTemplate: function(){
			this.template = template;
		}

	}, {type: 'AppletTaskPropsView'});

	return AppletTaskPropsView;

});
