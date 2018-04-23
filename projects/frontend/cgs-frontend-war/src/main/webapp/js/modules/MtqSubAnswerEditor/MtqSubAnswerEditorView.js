define(['jquery','BasePropertiesView', 'text!modules/MtqSubAnswerEditor/templates/MtqSubAnswerEditorPropsView.html'/**/],
function($, BasePropertiesView, template) {

	var MtqSubAnswerEditorView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'MtqSubAnswerEditorView'});

	return MtqSubAnswerEditorView;

});
