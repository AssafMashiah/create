define(['jquery', 'BasePropertiesView','text!modules/AnswerLinkingEditor/templates/AnswerLinkingPropsView.html'],
function($, BasePropertiesView, template) {

	var AnswerLinkingPropsView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'AnswerLinkingPropsView'});

	return AnswerLinkingPropsView;

});
