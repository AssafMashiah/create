define(['jquery', 'BasePropertiesView', 'text!modules/InfoBaloonEditor/templates/InfoBaloonProps.html'],
function($, BasePropertiesView, template) {

	var InfoBaloonEditorView = BasePropertiesView.extend({

		el: '#props_base',

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'InfoBaloonEditorView'});

	return InfoBaloonEditorView;

});
