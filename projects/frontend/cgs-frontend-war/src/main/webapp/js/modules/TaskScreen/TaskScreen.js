define(['BaseScreen', 'events', './TaskScreenView','./OverlayTaskScreenView', './config',
	'./overlayTaskConfig',  'repo', 'repo_controllers','lessonModel'],
function(BaseScreen, events, TaskScreenView, OverlayTaskScreenView, taskScreenConfig,
	overlayTaskConfig, repo, repo_controllers, LessonModel) {

	var TaskScreen = BaseScreen.extend({

		initialize: function(configOverrides) {
			var config = this.getConfiguration(configOverrides.id);
			this.showTaskBar = (config.components.navbar && config.components.navbar.config.showTaskBar) ? !!config.components.navbar.config.showTaskBar : false;
           	this._super(config, configOverrides);
           	
           	if(this.isOverlayMode){
				this.view = new OverlayTaskScreenView({controller: this});
           	}else{
           		this.view = new TaskScreenView({controller: this});
           	}

			this.registerEvents();
			this.counter = 1;
		},
		getConfiguration: function(editorId){
			var config;
			var task = repo.get(editorId);
			if(task.data.displayInOverlayScreen){
				this.isOverlayMode = true;
				config = overlayTaskConfig;
			}else{
				config = taskScreenConfig;
				config.components.menu.config.menuItems[1].label = require('translate').tran(  LessonModel.isLessonModeAssessment(LessonModel.getLessonId())? "Assessment Screen": "Lesson Screen");
				config.components.menu.config.menuItems[0].label = require('translate').tran(  LessonModel.isLessonModeAssessment(LessonModel.getLessonId())? "menuButton.back.assessment": "menuButton.back.lesson");

			}
			return config;
		},

		registerEvents:function f1118() {
			this.bindEvents({
				'load':{'type':'bind', 'func':this.load, 'ctx':this, 'unbind':'dispose'},
				'task_showSettings':{'type':'register', 'func':this.showTaskSettings, 'ctx':this, 'unbind':'dispose'},
				'backToPreviousScreen': {'type':'register', 'func':this.backToSequence, 'ctx':this, 'unbind':'dispose'}
			});

			this.view.$(".done-button").on('click',this.backToSequence.bind(this));
			this.view.$(".cancel-button").on("click",this.backToPageAndCancel.bind(this));
		},

		backToSequence: function() {
			var editor = repo_controllers.get(this.config.id);

			if (editor) {
				events.fire('setActiveEditor', editor); // for endEditing of content editors.

				// scroll back to item in within the sequence
				if (editor.elementId){
					events.once('scrollToItem', editor.scrollToItem.bind(editor, editor.elementId));
				}

	            var parent = repo.getAncestorRecordByType(editor.record.parent, 'pluginTask') ||
	            			repo.getAncestorRecordByType(editor.config.id, "page") ||
	            			repo.getAncestorRecordByType(editor.config.id, "sequence") ||
	            			repo.getAncestorRecordByType(editor.config.id, "pluginContent") ||
	            			repo.getAncestorRecordByType(editor.config.id, "html_sequence");

				var validationResults = require('validate').isEditorContentValid(editor.config.id);

				//log amplitude event when the user clicked "done"- when the task was created
				var lessonModel = require("lessonModel");
				if(lessonModel.isLessonFormatEbook()){
					var overlaySequence = repo.getAncestorRecordByType(this.config.id, "OVERLAY_DL_SEQUENCE");
					var currentRepoState = lessonModel.overlatInteractionState;
					if(!currentRepoState || !currentRepoState[overlaySequence.id]){
						amplitude.logEvent('Add '+ require("cgsUtil").getAmplitudeValue("interactionType", repo.get(editor.config.id).type), {
		                    "Course ID" : repo._courseId,
							"Lesson ID" :require("lessonModel").getLessonId(),
		                    "Type" : require("cgsUtil").getAmplitudeValue("format", "EBOOK")
						});
					}
				}
				editor.loadElement(parent.id);

				//start editing plugin task, to load its menu
				if(parent.type == "pluginTask"){
					var parentController = repo_controllers.get(parent.id);
					if(parentController && parentController.startEditing){
						parentController.startEditing();
					}
				}
			}
		},
		//revert chages made to the overlay task
		backToPageAndCancel: function(){
			//update repo with the saved "currentRepoState"
			var overlaySequence = repo.getAncestorRecordByType(this.config.id, "OVERLAY_DL_SEQUENCE");
			if(overlaySequence){
				var page = repo.get(overlaySequence.parent);
				//remove all current changes from repo
				repo.remove(overlaySequence.id);
				//re-set the previous state of the repo

				var lessonModel = require("lessonModel");
				var currentRepoState = lessonModel.overlatInteractionState;
				if(currentRepoState && currentRepoState[overlaySequence.id]){

					repo.set(currentRepoState[overlaySequence.id]);
					if(currentRepoState[overlaySequence.id].length){
						//add the previous state of overlay to the page children
						page.children.push(overlaySequence.id);
					}
				}
				//load the page
				require('router').load(page.id);
			}
		},

		showTaskSettings: function() {
			//set active task editor
			events.fire('clickOnStage');
		}

	}, {type: 'TaskScreen'});

	return TaskScreen;

});