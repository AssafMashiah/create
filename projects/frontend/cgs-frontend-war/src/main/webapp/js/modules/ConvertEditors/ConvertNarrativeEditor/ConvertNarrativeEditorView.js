define(['BaseStageContentView', 'events', 'text!modules/ConvertEditors/ConvertNarrativeEditor/templates/ConvertNarrativeEditor.html'], 
function f473(BaseStageContentView, events, template) {
	var ConvertNarrativeEditorView = BaseStageContentView.extend({
		clearOnRender: false,
		initialize: function f474(options) {
			this.template = template;
			this._super(options)
		},
		render: function f475($parent) {
			this._super($parent);

			events.fire('setEvents', this.controller.record.id);
			events.fire("setDroppable", this.controller.record.id);
		}
	}, { type: 'ConvertNarrativeEditorView' });

	return ConvertNarrativeEditorView;
});