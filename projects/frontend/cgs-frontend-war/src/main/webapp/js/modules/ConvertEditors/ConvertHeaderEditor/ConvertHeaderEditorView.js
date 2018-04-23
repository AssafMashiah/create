define(['BaseStageContentView', 'events', 'text!modules/ConvertEditors/ConvertHeaderEditor/templates/ConvertHeaderEditor.html'], 
function f426(BaseStageContentView, events, template) {
	var ConvertHeaderEditorView = BaseStageContentView.extend({
		clearOnRender: false,
		initialize: function f427(options) {
			this.template = template;
			this._super(options)
		},
		render: function f428($parent) {
			this._super($parent);

			events.fire('setEvents', this.controller.record.id);
			events.fire("setDroppable", this.controller.record.id);
		}
	}, { type: 'ConvertHeaderEditorView' });

	return ConvertHeaderEditorView;
});