define(['jquery','BasePropertiesView', 'text!modules/ClozeBankEditor/templates/ClozeBankPropertiesView.html'],
function($, BasePropertiesView, template) {

	var ClozeBankPropertiesView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'ClozeBankPropertiesView'});

	return ClozeBankPropertiesView;

});
