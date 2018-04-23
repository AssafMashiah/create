define(['jquery', 'BasePropertiesView', 'text!modules/MathfieldEditor/templates/MathfieldProps.html'],
function($,  BasePropertiesView, template) {

	var MathfieldPropsView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);			
		}

	}, {type: 'MathfieldPropsView'});
	return MathfieldPropsView;

});