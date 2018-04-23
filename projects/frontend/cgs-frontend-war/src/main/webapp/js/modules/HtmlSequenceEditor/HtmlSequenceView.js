define(['jquery', 'BasePropertiesView', 'text!modules/HtmlSequenceEditor/templates/HtmlSequenceView.html'],
function f781($, BasePropertiesView, template) {

	var HtmlSequenceView = BasePropertiesView.extend({
		initialize: function(options) {
			this.template = template;
			this._super(options);
		},

		render: function() {
			this._super();
		}
	}, {type: 'HtmlSequenceView'});

	return HtmlSequenceView;

});
