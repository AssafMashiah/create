define(['jquery', 'BasePropertiesView', 'text!modules/FeedbackEditor/templates/FeedbackProps.html'],
function($, BasePropertiesView, template) {

	var FeedbackEditorView = BasePropertiesView.extend({

		el: '#props_base',

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'FeedbackEditorView'});

	return FeedbackEditorView;

});
