define(['BaseStageContentView', 'events', 'text!modules/ConvertEditors/ConvertPedagogicalStatementEditor/templates/ConvertPedagogicalStatement.html'], 
function f478(BaseStageContentView, events, template) {
	var ConvertPedagogicalStatementView = BaseStageContentView.extend({
		clearOnRender: false,
		initialize: function f479(options) {
			this.template = template;
			this._super(options)
		},

		render: function f480($parent) {
			this._super($parent);

			events.fire('setEvents', this.controller.record.id);
			events.fire("setDroppable", this.controller.record.id);
		}
	}, { type: 'ConvertPedagogicalStatementView' });

	return ConvertPedagogicalStatementView;
});