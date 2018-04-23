define([
	'modules/BaseTaskEditor/BaseTaskEditor', 	
	'./config', 
	'./MCStageView', 
	'./MCSmallStageView', 
	'./TaskTemplate', './AssessmentTaskTemplate'],
function(BaseTaskEditor, config, MCStageView, MCSmallStageView ,taskTemplate, assessmentTaskTemplate) {

	var MCEditor = BaseTaskEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: MCSmallStageView,
				normal: MCStageView
			});

			this._super(config, configOverrides);
			
			if (!this.config.previewMode) {
				this.startStageEditing();
				this.startPropsEditing();
			}
		},

		startStageEditing: function(){
			this.showStagePreview($('#stage_base'), {
				bindEvents: true
			});
		}

	},{	type: 'MCEditor',
		templates: {
			lessonModeNormal 	 : taskTemplate.template,
			lessonModeAssessment : assessmentTaskTemplate.template
		},
		showTaskSettingsButton: true,
		displayTaskDropdown: true
	});

	return MCEditor;

});
