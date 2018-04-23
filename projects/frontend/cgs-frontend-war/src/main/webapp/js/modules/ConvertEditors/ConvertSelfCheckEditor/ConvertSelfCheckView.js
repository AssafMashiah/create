define(['BaseStageContentView', 'events', 'text!modules/ConvertEditors/ConvertSelfCheckEditor/templates/ConvertSelfCheck.html'], 
function f488(BaseStageContentView, events, template) {
	var ConvertSelfCheckView = BaseStageContentView.extend({
		clearOnRender: false,
		initialize: function f489(options) {
			this.template = template;
			this._super(options)
		},

		render: function f490($parent) {
			this._super($parent);

			events.fire('setEvents', this.controller.record.id);
			events.fire("setDroppable", this.controller.record.id);
		}
	}, { type: 'ConvertSelfCheckView' });

	return ConvertSelfCheckView;
});