define(['jquery','BasePropertiesView', 'text!modules/ConvertEditors/ConvertMultipleChoiceEditor/templates/ConvertMultipleChoiceProps.html'],
function($, BasePropertiesView, template) {

	var ConvertMultipleChoiceEditorPropsView = BasePropertiesView.extend({
		clearOnRender: false,
		initialize: function(options) {
			this.$el = $(".convert_props_" + options.controller.record.id);
			
			this.template = template;
			this._super(options);
		},

		render: function f461($parent) {
			this._super($parent);
		}
 
	}, {type: 'ConvertMultipleChoiceEditorPropsView'});

	return ConvertMultipleChoiceEditorPropsView;

});
