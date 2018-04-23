define(['jquery', 'BasePropertiesView', 'text!modules/AppletAnswerEditor/templates/AppletAnswerPropsView.html'],
function($, BasePropertiesView, template) {

	var AppletAnswerEditorView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'AppletAnswerEditorView'});

	return AppletAnswerEditorView;

});
