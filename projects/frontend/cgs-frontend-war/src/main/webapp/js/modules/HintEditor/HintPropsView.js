define(['jquery', 'BasePropertiesView', 'text!modules/HintEditor/templates/HintProps.html'],
function($, BasePropertiesView, template) {

	var HintEditorView = BasePropertiesView.extend({

		el: '#props_base',

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'HintEditorView'});

	return HintEditorView;

});
