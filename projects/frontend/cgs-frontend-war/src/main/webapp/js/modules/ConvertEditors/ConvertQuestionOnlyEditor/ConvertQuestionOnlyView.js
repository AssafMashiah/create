define(['BaseStageContentView', 'events', 'text!modules/ConvertEditors/ConvertQuestionOnlyEditor/templates/ConvertQuestionOnly.html'], 
function f483(BaseStageContentView, events, template) {
	var ConvertQuestionOnlyView = BaseStageContentView.extend({
		clearOnRender: false,
		initialize: function f484(options) {
			this.template = template;
			this._super(options)
		},

		render: function f485($parent) {
			this._super($parent);

			events.fire('setEvents', this.controller.record.id);
			events.fire("setDroppable", this.controller.record.id);
		}
	}, { type: 'ConvertQuestionOnlyView' });

	return ConvertQuestionOnlyView;
});