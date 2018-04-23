define(['jquery', 'mustache', 'BasePropertiesView', 'text!modules/ClozeEditor/ClozeProperties/templates/MathfieldPropertiesView.html'],
function($, Mustache, BasePropertiesView, template) {


	var ClozeMathfieldPropertiesView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}		
	}, {type: 'ClozeMathfieldPropertiesView'});

	return ClozeMathfieldPropertiesView;

});
