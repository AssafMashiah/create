define(['jquery', 'lodash','repo', 'repo_controllers', 'dialogs', 'events', 'MtqAnswerEditor', './config', './MatchingAnswerPropsView','./MatchingAnswerStageView', './MatchingAnswerSmallStageView'],
function($, _, repo, repo_controllers, dialogs, events,  MtqAnswerEditor, config, MatchingAnswerPropsView, MatchingAnswerStageView, MatchingAnswerSmallStageView) {

	var MatchingAnswerEditor = MtqAnswerEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: MatchingAnswerSmallStageView,
				normal: MatchingAnswerStageView
			});

			this._super(config, configOverrides);

			repo.startTransaction({ ignore: true });
			repo.updateProperty(this.record.id, 'mtqMode', this.record.data.mtqMode || 'one_to_one', false, true);
			repo.endTransaction();
		},

		startPropsEditing: function(cfg){
			this._super(cfg);
			var config = _.extend({controller: this}, cfg ? cfg : null);
			this.view = new MatchingAnswerPropsView(config);
			this.registerEvents();
		},

		onInteractionTypeChange: function f893() {
			var self = this;
			function changeInteraction(){
				repo.startTransaction({ appendToPrevious: true });
				require("cgsUtil").convertRepo(self.record.id, "linking");
				var instructionTextViewerId = repo.getChildrenRecordsByType(self.record.parent, 'instruction')[0].children[0],
					instructionNewText = JSON.parse('"'+ require('localeModel').getConfig('stringData').repo['linkingInstruction'] +'"');

				repo.updateProperty(instructionTextViewerId, 'title' , instructionNewText);
				//reset TEV properties
				repo.updateProperty(instructionTextViewerId, 'assetManager', null);
				repo.updateProperty(instructionTextViewerId, 'narration', null);
				repo.updateProperty(instructionTextViewerId, 'generalNarration', null);
				repo.updateProperty(instructionTextViewerId, 'narrationType', "0");
				
				repo._runAlignDataFunction(instructionTextViewerId, 'textViewer', function(){
					repo.endTransaction();
					require("router").load(self.record.parent);
				});
			}

			var feedback = repo.getChildrenByTypeRecursive(this.record.parent, 'feedback');
			if(feedback.length){
				feedback = feedback[0];
				if(!_.isEmpty(feedback.data.feedbacks_map_specific)){
					//show dialog
					require('cgsUtil').createDialog(
						'matchingToLinking.unsavedSpecificFeedbacks.notification.title',
						"matchingToLinking.unsavedSpecificFeedbacks.notification.data",
						'simple',
						{
							'ok': {
								'label': 'Ok'
							},
							'cancel': {
								'label': 'Cancel'
							}
						},function(response){
							if(response == 'ok'){
								changeInteraction();
								
							}else{
								var previousVal = self.model._previousAttributes.interaction_type;
									self.view.$("#field_interaction_type").val(previousVal);
									self.model.attributes.interaction_type = previousVal;
							}

						});
				}else{
					changeInteraction();
				}
			}
		},

		onMatchingModeChange: function() {
            var instructionKey;

            if (this.record.data.mtqMode == 'one_to_many') {
                instructionKey = 'matchingInstructionOneToMany';

				repo.startTransaction({ appendToPrevious: true });
				if (!this.record.data.useBank) {
					repo.updateChildrenProperty(this.record.id, "useBank", true);
					repo.updateProperty(this.record.id, "useBank", true);
					this.createBank();
				}
				repo.updateProperty(this.record.id, "interaction_type", 'drag_and_drop');

				repo.endTransaction();
			} else { // this.record.data.mtqMode == 'one_to_one'
                instructionKey = 'matchingInstruction';
            }

            // change instruction title
            var task = repo.getAncestorRecordByType(this.record.id, 'matching');
            if(task) {
                var taskInstruction = repo.getChildrenRecordsByType(task.id, 'instruction')[0];
                if (taskInstruction && taskInstruction.children && taskInstruction.children[0]) {
                    var taskInstructionTextViewer = repo.get(taskInstruction.children[0]),
	                    instructionText;
                    if (taskInstructionTextViewer) {
                        instructionText = JSON.parse('"{0}"'.format(require('localeModel')
	                        .getConfig('stringData').repo[instructionKey]));

                        repo.startTransaction({ appendToPrevious: true });
                        repo.updateProperty(taskInstructionTextViewer.id, 'title', instructionText);
                        repo.endTransaction();

	                    repo._runAlignDataFunction(taskInstructionTextViewer.id, 'textViewer', function repo_runAlignDataFunction(){
		                    var taskInstructionController = repo_controllers.get(taskInstruction.id);
		                    if (taskInstructionController) {
			                    taskInstructionController.reloadStage();
		                    }
	                    });

                    }
                }
            }

			this.reloadStage();

            if (task) {
                var task_controller = repo_controllers.get(task.id);
                if (task_controller) {
                    task_controller.startPropsEditing();
                }
            }
		},

		registerEvents: function() {
			this.record = repo.get(this.config.id);
			var changes = {
				//currently not supporting answer mode 'one to many' , so dropdown is un neccecary
				answerType: this.propagateChanges(this.record, 'answerType', this.verifyChange.bind(this), true),
				definitionType: this.propagateChanges(this.record, 'definitionType', this.verifyChange.bind(this), true),
				random: this.propagateChanges(this.record, 'random', true),
				useBank: this.propagateChanges(this.record, 'useBank', true),
				interaction_type: this.propagateChanges(this.record, 'interaction_type', true),
				mtqMode: this.propagateChanges(this.record, 'mtqMode', true)
			};

			this.model = this.screen.components.props.startEditing(this.record, changes, $(".matchingAnswer_editor"));

			this.model.on('change:useBank', function(child, val) {
				repo.startTransaction({ appendToPrevious: true });
				this.changeUseBank(val);
				repo.endTransaction();
			}, this);
			this.model.on('change:mtqMode', this.onMatchingModeChange, this);
			this.model.on('change:interaction_type', this.onInteractionTypeChange, this);

		}

	},{	type: 'MatchingAnswerEditor', stageReadOnlyMode: true});

	return MatchingAnswerEditor;

});
