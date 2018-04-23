define(['BaseContentEditor', 'repo', 'repo_controllers', 'events', './config', 'validate', 'dialogs', 'types',
	    './MCAnswerEditorView', './MCAnswerStageView', './MCAnswerSmallStageView'],
function(BaseContentEditor, repo, repo_controllers, events, config, validate, dialogs, types,
         MCAnswerEditorView, MCAnswerStageView, MCAnswerSmallStageView ) {

	var MCAnswerEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: MCAnswerSmallStageView,
				normal: MCAnswerStageView
			});
			
			this._super(config, configOverrides);

			if(this.record.data.answerMode == 'mmc')
				config.minimumAnswers = 3;

			this.correct_options_arr = [];

			repo.startTransaction({ ignore: true });
			this.updateChildrenProps();
			repo.endTransaction();

			_.each(this.record.children,function(child) {
				var option = repo.get(child);
				if (option && option.data && option.data.correct)
					this.correct_options_arr.push(child);
			}, this);

			if(this.config.bindEvents){
				this.bindEvents({
					'contentEditorDeleted':{'type':'register', 'func': this.onEditorDeleted,
							'ctx':this, 'unbind':'dispose'}
				});
			}
		},
        //overriding _super function
		startEditing: function(){},

		startPropsEditing: function(cfg){
			this._super(cfg);
			var config = _.extend({controller: this}, cfg ? cfg : null);
			this.view = new MCAnswerEditorView(config);
			this.registerEvents();
		},

		registerEvents: function() {
			this.record = repo.get(this.config.id);
			var changes = {
				answerMode: this.propagateChanges(this.record, 'answerMode', validate.requiredField, true),
				optionsType: this.propagateChanges(this.record, 'optionsType',  true),
				random: this.propagateChanges(this.record, 'random', true)
			};

			this.model = this.screen.components.props.startEditing(this.record, changes, $(".mcAnswer_editor"));

			this.model.on('change:answerMode', function(child, val) { this.changeAnswerMode(val) }, this);
			this.model.on('change:optionsType', function() {
				this.changeTypeNotification(this.changeOptionChildrenAccordingToType);
			}, this);
		},
		
		onEditorDeleted:function(editorId) {
				
			if(this.config.id == editorId){
				console.log('MCeditor child deleted');
				this.onChildrenUpdated();
				// events.fire('clickOnStage')
			}
		},

		uncheckOtherOptions: function(optionIdToExclude) {
			//update in repo all children expect 'optionIdToExclude' - set correct = false
			repo.updateChildrenProperty(this.config.id, "correct", false);
			repo.updateProperty(optionIdToExclude, "correct", true);
		},

		updateCorrectOptionsArray: function(optionId, correct) {
			repo.startTransaction();
			//end editing of the active editor
			this.router.activeScreen.editor.endEditing &&
				this.router.activeScreen.editor.endEditing();

			if(this.record.data.answerMode === "mc") {
				this.correct_options_arr = [optionId];
				this.uncheckOtherOptions(optionId);
			} else {
				if(!correct) {
					this.correct_options_arr = _.union(this.correct_options_arr, [optionId]);
				} else {
					this.correct_options_arr = _.without(this.correct_options_arr, optionId);
				}
				repo.updateProperty(optionId, "correct", !correct);
				this.uncheckAll();
			}
			repo.endTransaction();
			this.reloadStage();
		},

		buildChildData: function(optionsType) {
			var childData, disableDelete = (this.record.children.length <= config.minimumAnswers);

			if(optionsType === "textViewer") {
				childData = {	"disableDelete":true, 
								"mode" : "singleStyle",
								"availbleNarrationTypes" :[ {"name": "None", "value": ""},
															{"name":"General", "value": "1"}]
							};
			} else if(optionsType === "imageViewer") {
				childData = {"disableDelete":true, "dontInputCaption" : true, "dontInputCopyrights" : true};
			} else {
				childData = {"disableDelete":true};
			}

			return childData;
		},

		changeOptionChildrenAccordingToType:function f898() {
			//iterate all options and remove it's child and add new one according to the new type
			var options_arr = this.record.children, itemConfig,
				optionsType = this.record.data.optionsType, childData, optionController;

			childData = this.buildChildData(optionsType);

			_.each(options_arr, function(optionId, key){
				repo.removeChildren(optionId);

				optionController = repo_controllers.get(optionId);

				itemConfig = {
					"type": optionsType,
					"parentId": optionId,
					"data": childData
				};
				optionController.createNewItem(itemConfig, false);
			});

			this.reloadStage();
			require('validate').isEditorContentValid(this.record.id);
		},

		changeTypeNotification : function(continueCallback) {
			if (!this.dontShowDialog) {
				var dialogConfig = {
					title: "Type of Options change",
					content: {
						text: "You have asked to change the type of options. Changing the type will lose all fed content. Are you sure you want to change the type of Options?",
						icon: 'warn'
					},
					buttons: {
						yes:		{ label: 'yes' },
						cancel:		{ label: 'cancel' }
					}
				};

				events.once('onOptionsTypeChange', function(response) {
					this.onOptionsTypeChange(response, continueCallback) ;
				}, this ) ;

				dialogs.create( 'simple', dialogConfig, 'onOptionsTypeChange' ) ;
			}
		},

		onOptionsTypeChange:function f899(response, continueCallback) {
			if (response == 'yes') {
				repo.startTransaction({ appendToPrevious: true });
				continueCallback.call(this);
				repo.endTransaction();
			}
			else {
				repo.revert();
				repo.startTransaction({ ignore: true });
				this.dontShowDialog = true;
				this.model.set('optionsType', this.model.previous('optionsType'));
				this.dontShowDialog = false;
				repo.endTransaction();
			}
		},

		changeAnswerMode: function(mode) {

			repo.startTransaction({ appendToPrevious: true });

			var repo_controllers = require('repo_controllers'), mc_progress_controller;
			var mc_task = repo_controllers.get(this.record.parent);

			var mc_progress = repo.getChildrenRecordsByType(mc_task.record.id, 'progress'), arr_feedbacks = [];
			if(mc_progress.length) {
				mc_progress = mc_progress[0];

				mc_progress_controller = repo_controllers.get(mc_progress.id);
				arr_feedbacks = repo.getChildrenRecordsByType(mc_progress.id, 'feedback');
			}

			// Update task feedbacks
			if (mc_progress && arr_feedbacks.length) {
				var mc_feedback = arr_feedbacks[0], displayfeedbacks;

				repo.updateProperty(mc_feedback.id, 'taskType', mode);
				displayfeedbacks = mc_progress.data.feedbacksToDisplay[mode];

				//on answer type change, need to reset feedbacks to it's default
				repo.updateProperty(mc_feedback.id, 'feedbacksToDisplay' , [] );
				repo.updateProperty(mc_feedback.id, 'feedbacks_map' , {} );
				repo.updateProperty(mc_feedback.id, 'feedbacks_map_specific' , {} );
				repo.removeChildren(mc_feedback.id);
				repo.updateProperty(mc_progress.id, 'feedback_type' , "local");


                if (mode === "mmc") {
					repo.updateProperty(mc_progress.id, 'availbleProgressTypes',[	{"name": "Local", "value": "local"},
																	{"name":"Basic", "value": "generic"},
																	{"name": "Advanced", "value" : "advanced"}]);
				} else {
                    repo.updateProperty(mc_progress.id, 'availbleProgressTypes',[	{"name": "Local", "value": "local"},
																	{"name":"Generic", "value": "generic"},
																	{"name": "Generic and Specific", "value" : "advanced"}]);
				}

				repo.updateProperty(mc_feedback.id, 'predefined_list', null, true);
			}

            mc_task_instruction_id = repo.getChildrenRecordsByType(mc_task.record.id, 'instruction')[0].children[0];
            
			if (mode === "mmc") {
				//minimum options number in multiple answers is -3
				config.minimumAnswers = 3;
				if(this.record.children.length < config.minimumAnswers) {
					this.createNewOption(true);
				}

                // change instruction title to multi select
                repo.updateProperty(mc_task_instruction_id, 'title' , JSON.parse('"'+ require('localeModel').getConfig('stringData').repo['mcMultiInstruction'] +'"'));
			}
			else {
				//update single choice feedbacks
				config.minimumAnswers = 2;

                // change instruction title to single selection
				repo.updateProperty(mc_task_instruction_id, 'title' , JSON.parse('"'+ require('localeModel').getConfig('stringData').repo['mcInstruction'] +'"'));
			}
			//reset TEV properties
			repo.updateProperty(mc_task_instruction_id, 'assetManager', null);
			repo.updateProperty(mc_task_instruction_id, 'narration', null);
			repo.updateProperty(mc_task_instruction_id, 'generalNarration', null);
			repo.updateProperty(mc_task_instruction_id, 'narrationType', "0");

			repo._runAlignDataFunction(mc_task_instruction_id, 'textViewer', _.bind(function(){

				repo.updateChildrenProperty(this.config.id, "correct", false);
				this.correct_options_arr = [];
				this.updateChildrenProps();

				repo.endTransaction();
	            // render instruction stage view
	            repo_controllers.get(repo.get(mc_task_instruction_id).parent).renderChildren();

	            this.reloadStage();  //answer stage
				mc_progress_controller.reload(); //progress stage + props
			},this));

		},

		reloadStage: function f900() {
			this._super(function() {
				this.stage_view.render();
				this.renderChildren();
				require('router').startEditingActiveEditor();
			}.bind(this));
		},

		createNewOption:function f901(dontRenderTheOption) {
			var childData, optionCfg, disableDelete = (this.record.children.length <= config.minimumAnswers), option, child, childCfg;
			childData = this.buildChildData(this.record.data.optionsType);
			optionCfg = {
				"type":'option',
				"parentId":this.config.id,
				"data":{"disableDelete":disableDelete},
				"childConfig":childData
			};
			option = this.createNewItem(optionCfg, true);

			childCfg = {
				"type":this.record.data.optionsType,
				"parentId":option,
				"data":childData
			}

			child = this.createNewItem(childCfg, dontRenderTheOption);
			require('validate').isEditorContentValid(child);

		},

		renderNewItem: function(){
			this.onChildrenUpdated();
		},

		onChildrenUpdated: function(){
			this.updateChildrenProps();
			this.uncheckAll();
			this.renderChildren();

		},

		uncheckAll: function() {
			this.correct_options_arr = _.filter(this.correct_options_arr, function(opt) {
				return this.record.children.indexOf(opt) >= 0;
			}, this);
			if (this.correct_options_arr.length >= this.record.children.length) {
				this.correct_options_arr = [];
				repo.updateChildrenProperty(this.config.id, "correct", false);
			}
		},

		updateChildrenProps: function(){
			//props in MCAnswer record which his childrens (options) are using.
			if(this.record.children.length <= config.minimumAnswers){
				repo.updateProperty(this.config.id,'canDeleteChildren', false, false, true);
			}else{
				repo.updateProperty(this.config.id,'canDeleteChildren', true, false, true);
			}
		}

	}, {
			type:'MCAnswerEditor',
			disableSortableCss : true,
			stageReadOnlyMode: true,
			
			/**
			 * valid = (num_of_correct_options > (elem_repo.data.answerMode == "mmc" ? 1 : 0));
			 * @param  {[type]} elem_repo [description]
			 * @return {[type]}           [description]
			 */
			postValid:function f902(elem_repo) {

				var num_of_correct_options = 0,
					result = {valid : true,report:[]};
				
				_.each(elem_repo.children, function f903(child) {
					var option = repo.get(child);
					if (option && option.data && option.data.correct) {
						num_of_correct_options += 1;
					}
				});

				if ( !num_of_correct_options ) {
					result.valid = false;
					result.report.push(require('validate').setReportRecord(elem_repo,'Task is invalid. At least one option must be defined as the correct answer.'));
					result.bubbleUp = true;
				}
				
				return result;
			}
	});

	return MCAnswerEditor;

});