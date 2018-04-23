define(['lodash', 'events', 'BaseStageContentView',
	'text!modules/ConvertEditors/ConvertMCAnswerEditor/templates/ConvertMCAnswerEditor.html',
	'repo_controllers'],
function f433(_, events, BaseStageContentView, template, repo_controllers) {
	var ConvertMCAnswerEditorView = BaseStageContentView.extend({
		clearOnRender: true,
		events: {},
		initialize: function f434(options) {
			this.template = template;
			this._super(options);
		},
		registerEvents: function f435() {
			var self = this;
			$("#correct_answer_" + this.controller.record.id).click(function(event) {
				self.update.call(this, event, self);
			});

			// this.delegateEvents();
		},
		render: function f436() {
			//Undelegate the UI event to avoid double answers creation
			this.undelegateEvents();
			//call the constructor with the specific parent container
			this._super($(".answers_container_" + this.controller.record.parent));
			//Set this answer as selected according to the parent controller data
			this.setChecked();
			//register the UI Events again
			this.registerEvents();

			//Fire the base events for droppable area
			events.fire('setEvents', this.controller.record.id);
			events.fire("setDroppable", this.controller.record.id);

			var pController = repo_controllers.get(this.controller.record.parent);

			pController.stage_view.update_draggable_content(pController.record.children, pController.record.data['type_' + pController.record.id]);
		},

		setChecked: function f437() {
			var checked = this.controller.getChecked();

			if (!checked) {
				return false;
			}

			//Check if we on multi answers mode and the data is array
			if (_.isArray(checked.selected)) {
				//for each selected item compare it to the current controller id
				_.each(checked.selected, _.bind(function f438(item) {
					//if it's equal set it to checked
					if (item === this.controller.record.id) {
						$("#correct_answer_" + item).attr('checked', true);
					}
				}, this));
			} else {
				//if we on single answer mode just check if we are the correct answer
				if (checked.selected === this.controller.record.id) {
					$("#correct_answer_" + checked.selected).attr('checked', true);
				}
			}
		},

		update: function(e, self) {
			//the selected answer target
			var item = $(e.target);
			//get the mc-editor id from DOM
			var parentId = $(e.target).attr('parent-id');
			var data;

			//check if we are checkboxes (Multi-Choice)
			if (item.attr('type') === 'checkbox') {
				//build the selector for all the correct answers
				var selectors = ".mc_answer_check[parent-id='" + parentId + "']";
				
				//don't allow all checkboxes to be checked 
				if($(selectors).length == $(selectors + ":checked").length){
					$(item).prop('checked',false);
					return false;
				}
				
				//prepare the data for the controller
				data = {
					parent: parentId,
					selected: []
				};
				
				//itreate through the answers and check which of them is checked
				$(selectors).each(function f439() {
					if ($(this).is(":checked")) {
						//push the id of the answer to the data object
						data.selected.push($(this).attr('value'));
					}
				});
			} else {
				//for single answer mode
				data = {
					parent: parentId,
					selected: item.attr('value')
				}
			}

			//update the controller
			self.controller.update(data);
		}

	}, { type: 'ConvertMCAnswerEditorView' });

	return ConvertMCAnswerEditorView;
});