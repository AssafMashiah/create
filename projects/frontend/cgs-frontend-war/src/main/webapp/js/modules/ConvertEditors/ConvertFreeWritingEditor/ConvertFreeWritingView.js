define(['BaseStageContentView', 
		'events',
		'text!modules/ConvertEditors/ConvertFreeWritingEditor/templates/ConvertFreeWritingEditor.html'], 
function f418(BaseStageContentView, events, template) {
	var ConvertFreeWritingView = BaseStageContentView.extend({
		clearOnRender: true,

		initialize: function f419(options) {
			this.template = template;
			this._super(options);
		},

		registerEvents: function f420() {

		},

		render: function f421($parent) {
			this._super($parent);
			this.controller.loadProps.apply(this.controller, []);

			events.fire('setEvents', this.controller.record.id);
			events.fire("setDroppable", this.controller.record.id);
		},
		
		update_textarea_size: function f422(size) {
			this.$el.find(".answer_area").attr('class', 'answer_area ' + size);
		},

		dispose: function f423() {
			this.$el.unbind();
			this._super();
		}
	}, { type: 'ConvertFreeWritingView' });

	return ConvertFreeWritingView;
});