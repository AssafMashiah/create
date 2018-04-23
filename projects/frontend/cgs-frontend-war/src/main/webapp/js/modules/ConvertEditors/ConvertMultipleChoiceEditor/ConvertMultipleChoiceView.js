define(['BaseStageContentView', 
		'events',
		'text!modules/ConvertEditors/ConvertMultipleChoiceEditor/templates/ConvertMultipleChoice.html'], 
function f462(BaseStageContentView, events, template) {
	var ConvertMultipleChoiceView = BaseStageContentView.extend({
		clearOnRender: true,

		initialize: function f463(options) {
			this.template = template;
			this._super(options);
		},

		registerEvents: function f464() {
			this.$(".create_mc_answer").unbind('click');
			this.$(".create_mc_answer").bind('click', _.bind(function f465() {
				this.controller.createAnswer();
			}, this));
		},

		render: function f466($parent) {
			this._super($parent);

			this.registerEvents();
			this.controller.loadProps.apply(this.controller, []);

			events.fire('setEvents', this.controller.record.id);
			events.fire("setDroppable", this.controller.record.id);

		},
		
		update_draggable_content: function f467(children, type, clean) {
			_.each(children, function f468(item) {
				if (clean) {
					$("div[dropable-event-id='" + item + "']").empty();
				}
				
				$("div[dropable-event-id='" + item + "']").attr('dropable-content', type);

				var dropElement = $("div[dropable-event-id='" + item + "']"),
							contentArea = dropElement.parents(".content-area"),
							contentAreaParent = contentArea.parent().parent();

				//check if the drop area type is image
				if (type === 'image') {
					//get the repo content of the editor
					var elementContent = require("repo").get(item);

					$("div[dropable-event-id='" + item + "']").addClass('no-image-default-size');

					//check if the element content exists in repo
					if (elementContent) {
						//if we dont have answer content so we display the placeholder
						if (!elementContent.data.answer_content) {
							contentArea.addClass('no-image-content-area previewImage noImage');
							contentAreaParent.addClass('no-image-content-area-wrapper');
						} else {
							contentAreaParent.addClass('no-image-content-area-wrapper');
						}
					}
				} else {
					$("div[dropable-event-id='" + item + "']").removeClass('no-image-default-size');
					//if the type is not image we remove the placeholder classes
					contentArea.removeClass('no-image-content-area previewImage noImage');
					contentAreaParent.removeClass('no-image-content-area-wrapper');
				}
			});
		},

        change_mode_content : function f469() {
            $(".ConvertMultipleChoice .instruction span.placeholder").html(this.controller.record.data.question_instruction);

        },

		dispose: function f470() {
			this.$el.unbind();
			this._super();
		}
	}, { type: 'ConvertMultipleChoiceView' });

	return ConvertMultipleChoiceView;
});