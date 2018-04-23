define(['jquery','BasePropertiesView', 'text!modules/MatchingAnswerEditor/templates/MatchingAnswerProps.html'/**/],
function($, BasePropertiesView, template) {

	var MatchingAnswerPropsView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},

		isOneToMany: function() {
			return this.controller.record.data.mtqMode == 'one_to_many';
		}

	}, {type: 'MatchingAnswerPropsView'});

	return MatchingAnswerPropsView;

});
