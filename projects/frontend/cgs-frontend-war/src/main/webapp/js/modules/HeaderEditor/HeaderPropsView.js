define(['jquery','BasePropertiesView', 'text!modules/HeaderEditor/templates/HeaderProps.html'],
function($, BasePropertiesView, template) {

	var HeaderPropsView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'HeaderPropsView'});

	return HeaderPropsView;

});
