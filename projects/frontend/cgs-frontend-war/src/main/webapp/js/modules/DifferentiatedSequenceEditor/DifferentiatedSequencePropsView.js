define(['jquery', 'BasePropertiesView', 'text!modules/DifferentiatedSequenceEditor/templates/DifferentiatedSequenceEditor.html'],
function($, BasePropertiesView, template) {

	var DifferentiatedSequencePropsView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},

	}, {type: 'DifferentiatedSequencePropsView'});

	return DifferentiatedSequencePropsView;

});
