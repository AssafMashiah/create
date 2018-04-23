define(['jquery', 'BaseStageView', 'text!modules/HtmlSequenceEditor/templates/HtmlSequenceSmallStageView.html'],
function f778($, BaseStageView, template) {

	var HtmlSequenceSmallStageView = BaseStageView.extend({
		initialize: function(options) {
			this.template = template;
			this._super(options);
		},

		render: function() {
			this._super();
		}
	}, {type: 'HtmlSequenceSmallStageView'});

	return HtmlSequenceSmallStageView;

});
