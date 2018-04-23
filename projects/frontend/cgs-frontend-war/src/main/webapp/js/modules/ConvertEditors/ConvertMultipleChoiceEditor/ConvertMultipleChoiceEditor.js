define(['lodash', 'BaseContentEditor', 'repo', 'repo_controllers', 'events',
    './constants', './config', './ConvertMultipleChoiceView', './ConvertMultipleChoiceEditorPropsView',
    'localeModel'],
	function f440(_, BaseContentEditor, repo, repo_controllers, events, constants, config,
              ConvertMultipleChoiceView, ConvertMultipleChoiceEditorPropsView, localeModel) {
	var ConvertMultipleChoiceEditor = BaseContentEditor.extend({
		initialize: function f441(options) {
			this._super(config, options);
			this.config.previewMode = false;

			repo.startTransaction({ ignore: true });

			//set props default values (because we have a multiple props views for any mc, so we can't do the set through the task template)
			_.each(constants.fields, function f442(item) {
				if (!this.record.data[item.name + '_' + this.record.id]) {
					repo.updateProperty(this.record.id, item.name + '_' + this.record.id, item.value, false, true);
					repo.updateProperty(this.record.id, item.name, item.value, false, true);
				}
			}, this);

			this.single_question_instruction  = localeModel.getConfig('stringData').repo['mcInstruction'];
            this.multiple_question_instruction = localeModel.getConfig('stringData').repo['mcMultiInstruction'];

            repo.updateProperty(this.record.id, 'question_instruction', this.single_question_instruction, false, true);


			//initialize the stage view
			this.stage_view = new ConvertMultipleChoiceView({ controller: this });	

			this.createDefaultAnswers(constants.single_answers_size);
			
			repo.endTransaction();

			events.fire('setActiveEditor', this);

			this.bindEvents({
				'contentEditorDeleted':{'type':'register', 'func': this.onAnswerDeleted,
						'ctx':this, 'unbind':'dispose'}
			});
		},

		onAnswerDeleted: function f443(id) {
			if (this.record.data.type === 'multiple_answers') {
				if (this.record.children.length === constants.multiple_answers_size) {
					_.each(this.record.children, function f444(item) {
						repo.updateProperty(item, 'disableDelete', true);
						repo_controllers.get(item).stage_view.render();
					});
				}
			} else {
				if (this.record.children.length === constants.single_answers_size) {
					_.each(this.record.children, function f445(item) {
						repo.updateProperty(item, 'disableDelete', true);
						repo_controllers.get(item).stage_view.render();
					});
				}
			}
		},

        loadProps: function f446() {
			events.fire('setActiveEditor', this);
			//initialize the props view
			this.view = new ConvertMultipleChoiceEditorPropsView({ controller: this });
			//set the props events
			this.registerEvents();
		},

        createAnswer: function f447(data) {
			//build the mc answer data
			var editorData = {
				'type': 'convert_mc_answer',
				'data': {
					'disableDelete': false,
					'input_type': this.record.data.input_type
				},
				'parent': this.config.id,
				'children': []
			};


			$.extend(editorData.data, data || {});
			//set it to repo
			var child = repo.set(editorData);

			//push it to the children
			var newChildren = require('cgsUtil').cloneObject(this.record.children);
			newChildren.push(child);
			repo.updateProperty(this.record.id, 'children', newChildren, true);
			this.renderChildren();
			
			this.disableAnswers(this.getTotal(this.record.data.mode));
		},

		registerEvents: function f448() {
			var changes = {},
				model = null;

			//itreate through the constant field (props fields)
			_.each(constants.fields, function f449(item) {
				//propagete change by the structure of the field and this record id
				changes[item.name + '_' + this.record.id] = this.propagateChanges(this.record, item.name + '_' + this.record.id, true);
			}, this);
			
			//start editing the props
			model = this.screen.components.props.startEditing(this.record, changes);

			//generic creation of model change event for the props
			_.each(constants.fields, function f450(item) {
				model.on('change:' + item.name + '_' + this.record.id, 
						this['on' + (item.name.charAt(0).toUpperCase() + item.name.slice(1)) + "Change"], this);
			}, this);
		},

		onRandomizeChange: function f451() {
			//this field exists 2 times because we can't concat variable name in mustache
			repo.updateProperty(this.record.id, 'randomize', this.record.data['randomize_' + this.record.id]);
		},

		onTypeChange: function f452() {
			repo.startTransaction({ appendToPrevious: true });
			_.each(this.record.children, function f453(item) {
				var rec = repo.get(item);

				repo.updateProperty(item, 'data', {
					disableDelete: rec.data.disableDelete,
					input_type: this.record.data.input_type
				}, true, true);
			}, this);

			//this field exists 2 times because we can't concat variable name in mustache
			repo.updateProperty(this.record.id, 'type', this.record.data['type_' + this.record.id]);

			//do we need it? change the type of the drop zone from image to text
			this.stage_view.update_draggable_content(this.record.children, this.record.data['type_' + this.record.id], true);
			repo.endTransaction();
		},

        getTotal: function f454(mode) {
			return {
				'multiple_answers': constants.multiple_answers_size,
				'single_answer': constants.single_answers_size
			}[mode] || false;
		},

        disableAnswers: function f455(n) {
			if (this.record.children.length > n) {
				_.each(this.record.children, function f456(item) {
					repo.updateProperty(item, 'disableDelete', false);
					repo_controllers.get(item).stage_view.render();
				});
			}
		},

        onModeChange: function f457() {
        	repo.startTransaction({ appendToPrevious: true });
			//on mode change we just change the template of the answers from 0 to 2 (multiple answers)
			var mode = this.record.data['mode_' + this.record.id];
            if (mode == "multiple_answers") {
            	repo.updateProperty(this.record.id, 'question_instruction', this.multiple_question_instruction, false, true);
            	repo.updateProperty(this.record.id, 'mode', 'multiple_answers', false, true);
            }
            else {
            	repo.updateProperty(this.record.id, 'question_instruction', this.single_question_instruction, false, true);
            	repo.updateProperty(this.record.id, 'mode', 'single_answer', false, true);
            }
            if(this.record.data.checked){
            	delete this.record.data.checked.selected;
        	}
			this.stage_view.change_mode_content();
            repo.updateProperty(this.record.id, 'input_type', constants.modes[mode]);
			
			this.createDefaultAnswers(this.getTotal(mode));
			this.removeDefaultAnswers(this.getTotal(mode));

			_.each(this.record.children, function f458(item) {
				repo.updateProperty(item, 'input_type', constants.modes[this.record.data['mode_' + this.config.id]]);
				repo_controllers.get(item).stage_view.render();
			}, this);

			this.onAnswerDeleted();
			repo.endTransaction();
		},

		createDefaultAnswers: function f459(n) {
			if (this.record.children.length < n) {
				var answersCount = n - this.record.children.length;

				for (var i = 0; i < answersCount; ++i) {
					this.createAnswer({ disableDelete: true });
				}
			}
		},

		removeDefaultAnswers: function f460(n) {
			if (this.record.children.length > n) {
				var removeCount = this.record.children.length - n;
				var count = 0;
				var cController;

				for (var i = 0; i < this.record.children.length; ++i) {
					cController = repo_controllers.get(this.record.children[i]);

					if (count < removeCount && cController && !cController.record.data.answer_content) {
						cController.stage_view.remove();
						delete cController;

						var newChildren = require('cgsUtil').cloneObject(this.record.children);
						newChildren.splice(i, 1);
						repo.updateProperty(this.record.id, 'children', newChildren, true);

						++count;
					}
				} 
			}
		}

    }, { type: 'ConvertMultipleChoiceEditor' });

	return ConvertMultipleChoiceEditor;
});