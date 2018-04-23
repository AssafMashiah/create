define(['jquery','BasePropertiesView', 'text!modules/SequencingAnswerEditor/templates/SequencingAnswerProps.html'],
function($, BasePropertiesView, template) {

	var SequencingAnswerPropsView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'SequencingAnswerPropsView'});

	return SequencingAnswerPropsView;

});
