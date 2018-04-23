define(['jquery', 'BasePropertiesView', 'text!modules/HtmlSequenceEditor/templates/HtmlSequencePropsView.html'],
function($, BasePropertiesView, template) {

	var HtmlSequencePropsView = BasePropertiesView.extend({

		el: '#props_base',

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'HtmlSequencePropsView'});

	return HtmlSequencePropsView;

});
