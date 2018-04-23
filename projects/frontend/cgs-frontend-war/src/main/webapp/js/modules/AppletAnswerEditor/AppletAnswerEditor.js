define(['BaseContentEditor', 'repo', 'events', 'repo_controllers', 'appletModel',  './config', 'lockModel', './AppletAnswerStageView', './AppletAnswerSmallStageView'],
function(BaseContentEditor, repo, events, repo_controllers, appletModel, config, lockModel,  AppletAnswerStageView, AppletAnswerSmallStageView) {

	var AppletAnswerEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {
			this.setStageViews({
				small: AppletAnswerSmallStageView,
				normal: AppletAnswerStageView
			});

			this._super(config, configOverrides);
			if(this.config.bindEvents){

			this.bindEvents({
				'contentEditorDeleted':
					{'type':'register', 'func': this.onEditorDeleted, 'ctx':this, 'unbind':'dispose'}
				});
			}
			
			if( this.config.stagePreviewMode !== "small" ) {
				repo.startTransaction({ ignore: true });
				this.updateCheckableValue();
				repo.endTransaction();
			}
		},
					
		updateCheckableValue: function() {
			
			var appWrappers = repo.getChildrenRecordsByType( this.record.id, "appletWrapper" ) ;
			
			if( appWrappers.length > 0 ) {
				
				var wrapperRecord = appWrappers[0] ;
				var applets = repo.getChildrenRecordsByType( wrapperRecord.id, "applet" ) ;
				
				if( applets.length > 0 ) {
					
					var appletRecord = applets[0] ;
					var updatedValue = appletRecord.data.isCheckable ;
					var currentValue = this.record.data.isCheckable ;
					
					this.setCheckbleApplet( updatedValue );
				}
			}
			
		},

		setCheckbleApplet: function(value){
			repo.updateProperty(this.elementId, 'isCheckable', value, false, true);
			var progress= repo.getChildrenRecordsByType(this.record.parent, 'progress');
			if(progress.length == 1){
				progress = progress[0];

				if(value){
					if (!repo.getChildrenRecordsByType(progress.id, 'feedback').length) {
						this.createItem({parentId: progress.id,
										type: "feedback",
										data: {title: "Feedback",
												show_partly_correct : false,
												feedbacksToDisplay : ["all_correct", "partly_correct", "all_incorrect"]
											}
										});
					}
					//update progress properties only if they are set to the default of "none" feedback
					if(['none', ''].indexOf(progress.data.feedback_type) > -1){
						repo.updateProperty(progress.id, 'feedback_type', 'local', false, true);
					}
					if(progress.data.num_of_attempts == 0){
						repo.updateProperty(progress.id, 'num_of_attempts', 2, false, true);
					}
			
				}else{
					var feedback= repo.getChildrenRecordsByType(progress.id, 'feedback');
					if(feedback.length > 0){
						feedback = feedback[0];
						repo.remove(feedback.id);
					}
					repo.updateProperty(progress.id, 'feedback_type', 'none', false, true);
					repo.updateProperty(progress.id, 'num_of_attempts', 0, false, true);
				}
			}
			
		},
		
		createNewApplet: function(args){

			args.parentId = this.config.id;

            // if lesson is locked by someone else, do not allow to add a new applet
            var lockModel = require ("lockModel"),
            	lessonModel = require ("lessonModel");
            if(lockModel.getLockingStatus(lessonModel.getLessonType()) == lockModel.config.LOCK_TYPES.LOCKED_SELF) {
                appletModel.showAppDialog(args);
            } else {
                return false;
            }

		},
		
		onEditorDeleted: function(editorId){
			if(this.config.id == editorId){
				this.renderChildren();
			}
		},

		startEditing: function(){
			//check if click wasnt fron the delete button of the applet (if so, we dont want to trigger the start editing)
			if(!$(event.currentTarget).hasClass('deleteBtn')){
				this._super();
			
				if(this.dontHaveChildren()){
					this.bindEvents({
						'createNewApplet':{'type':'register', 'unbind':'endEditing', 'func': this.createNewApplet, 'ctx':this},
						'createNewItem':{'type':'bind', 'func': this.createNewItem , 'ctx':this, 'unbind':'endEditing'}
					});
					events.fire('createNewApplet', {"templatePath":"modules/AppletWrapperEditor/AppletWrapperEditor"});
				}
			}
		},

		renderNewItem: function(){
			this.renderChildren();
		}
		

	}, {
		
		type: 'AppletAnswerEditor', 
		
		postValid : function f33(elem_repo){
			if(elem_repo.children.length){
				return {valid : true, report: []}
			}
			else{
				return { 
					valid : false,
					report : [require('validate').setReportRecord(elem_repo,"Task is invalid. No applet was defined in the Answer area.")]};
			}
		}
	});

	return AppletAnswerEditor;

});