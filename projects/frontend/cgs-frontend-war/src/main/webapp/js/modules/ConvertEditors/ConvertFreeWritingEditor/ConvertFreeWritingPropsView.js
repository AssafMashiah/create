define(['jquery','BasePropertiesView', 'text!modules/ConvertEditors/ConvertFreeWritingEditor/templates/ConvertFreeWritingEditorProps.html'],
function($, BasePropertiesView, template) {

	var ConvertFreeWritingEditorPropsView = BasePropertiesView.extend({
		clearOnRender: true,
		initialize: function(options) {
			this.$el = $(".convert_props_" + options.controller.record.id);
			
			this.template = template;
			this._super(options);
		},

		render: function f417($parent) {
			this._super($parent);
		}
 
	}, {type: 'ConvertFreeWritingEditorPropsView'});

	return ConvertFreeWritingEditorPropsView;

});
