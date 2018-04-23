define(['jquery', 'lodash','repo', 'repo_controllers', 'dialogs', 'events', 'MtqAnswerEditor', './config', './SortingAnswerPropsView','./SortingAnswerStageView', './SortingAnswerSmallStageView'],
function($, _, repo, repo_controllers, dialogs, events,  MtqAnswerEditor, config, SortingAnswerPropsView, SortingAnswerStageView, SortingAnswerSmallStageView) {

	var SortingAnswerEditor = MtqAnswerEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: SortingAnswerSmallStageView,
				normal: SortingAnswerStageView
			});

			this._super(config, configOverrides);

			repo.startTransaction({ ignore: true });
			repo.updateProperty(this.record.id, 'mtqMode', this.record.data.mtqMode || 'one_to_one', false, true);
			repo.endTransaction();
		},

		startPropsEditing: function(cfg){
			this._super(cfg);
			var config = _.extend({controller: this}, cfg ? cfg : null);
			this.view = new SortingAnswerPropsView(config);
			this.registerEvents();
		},
		onSortingModeChange : function () {
			repo.startTransaction({ appendToPrevious: true });
			if (this.record.data.mtqMode == 'one_to_many') {
				if (!this.record.data.useBank) {
					repo.updateChildrenProperty(this.record.id, "useBank", true);
					repo.updateProperty(this.record.id, "useBank", true);
					this.createBank();
				}
			}
			repo.endTransaction();

			this.reloadStage();
			var task = repo.getAncestorRecordByType(this.record.id, 'sorting');
            if (task) {
                var task_controller = repo_controllers.get(task.id);
                if (task_controller) {
                    task_controller.startPropsEditing();
                }
            }
		},
		/*change interaction type from drag&drop to linking*/
		onInteractionTypeChange: function (){
			var self = this;
			
			function changeInteraction(){
				repo.startTransaction({ appendToPrevious: true });
				//call function that converts the record to linking type
				require("cgsUtil").convertRepo(self.record.id, "linking");

				//change the instruction text to linking
				var instructionTextViewerId = repo.getChildrenRecordsByType(self.record.parent, 'instruction')[0].children[0],
					instructionNewText = JSON.parse('"'+ require('localeModel').getConfig('stringData').repo['linkingOneToManyInstruction'] +'"');

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
			//in case of defined feedabck, a notification will appear
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

		registerEvents: function() {
			this.record = repo.get(this.config.id);
			var changes = {
				definitionType: this.propagateChanges(this.record, 'definitionType',  this.verifyChange.bind(this), true),
				answerType: this.propagateChanges(this.record, 'answerType',  this.verifyChange.bind(this), true),
				random: this.propagateChanges(this.record, 'random', true),
				placeHolder : this.propagateChanges(this.record, 'placeHolder', true),
				useBank: this.propagateChanges(this.record, 'useBank', true),
				interaction_type: this.propagateChanges(this.record, 'interaction_type', true),
				mtqMode: this.propagateChanges(this.record, 'mtqMode', true)
			};

			this.model = this.screen.components.props.startEditing(this.record, changes, $(".sortingAnswer_editor"));
			
			this.model.on('change:useBank', function(child, val) {
				repo.startTransaction({ appendToPrevious: true });
				this.changeUseBank(val);
				repo.endTransaction();
			}, this);
			this.model.on('change:mtqMode', this.onSortingModeChange, this);
			this.model.on('change:interaction_type', this.onInteractionTypeChange, this);
		}

	},{	type: 'SortingAnswerEditor', stageReadOnlyMode: true});

	return SortingAnswerEditor;

});
