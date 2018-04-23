define([
	'modules/BaseTaskEditor/BaseTaskEditor', 	
	'repo',
	'./config', 
	'./constants',
	'./ShortAnswerStageView',
	'./ShortAnswerSmallStageView',
	'./TaskTemplate', './AssessmentTaskTemplate'],
function(BaseTaskEditor,repo, config, constants, ShortAnswerStageView, ShortAnswerSmallStageView ,taskTemplate, assessmentTaskTemplate) {

	var ShortAnswerEditor = BaseTaskEditor.extend({

		initialize: function(configOverrides) {
			this.setStageViews({
				small: ShortAnswerSmallStageView,
				normal: ShortAnswerStageView
			});

			this._super(config, configOverrides);
			
			if (!this.config.previewMode) {
				this.startStageEditing();
				this.startPropsEditing();
			}
			
			this.bindEvents ({
				'checking_enabled_Changed' : {'type':'register', 'func': this.handleCheckingEnabledChanges , 'ctx': this, 'unbind':'dispose'}
			});
		},

		startStageEditing: function(){
			this.showStagePreview($('#stage_base'), {bindEvents:true});
		},

		handleCheckingEnabledChanges : function f1089() {
			var checkingEnabled = repo.getChildrenRecordsByType(this.record.id,'advancedProgress')[0].data.checking_enabled;
			if(require('lessonModel').getAssessmentType() == 'mixed') {
				if(!checkingEnabled){
					this.showComponent('rubric' , true);
				}
				else{
					this.showComponent('rubric' , false);
				}
			}
            repo.updateProperty(this.record.parent, 'task_task_check_type', checkingEnabled ? "auto" : "manual");

		},
	},
	{
		type: 'ShortAnswerEditor',
		templates:{ lessonModeNormal: taskTemplate.template, lessonModeAssessment: assessmentTaskTemplate.template},
		showProperties: true,
		displayTaskDropdown: true,
		components: constants.components
	});

	return ShortAnswerEditor;

});
