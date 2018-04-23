define(['jquery','BasePropertiesView', 'text!modules/MtqMultiSubAnswerEditor/templates/MtqMultiSubAnswerEditorPropsView.html'/**/],
function($, BasePropertiesView, template) {

	var MtqMultiSubAnswerEditorView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'MtqMultiSubAnswerEditorView'});

	return MtqMultiSubAnswerEditorView;

});
