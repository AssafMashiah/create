define([
	'modules/BaseTaskEditor/BaseTaskEditor', 
	'./constants',
	'./config', 
	'./FreeWritingStageView',
	'./FreeWritingSmallStageView',
	'./TaskTemplate','./AssessmentTaskTemplate'],
function(BaseTaskEditor, constants, config, FreeWritingStageView, FreeWritingSmallStageView ,taskTemplate,assessmentTaskTemplate) {

	var FreeWritingEditor = BaseTaskEditor.extend({

		initialize: function(configOverrides) {
			this.setStageViews({
				small: FreeWritingSmallStageView,
				normal: FreeWritingStageView
			});

			this._super(config, configOverrides);
			
			if (!this.config.previewMode) {
				this.startStageEditing();
				this.startPropsEditing();
			}
		},

		startStageEditing: function(){
			this.showStagePreview($('#stage_base'), {bindEvents:true});
		}

	},{	type: 'FreeWritingEditor',
		//template: taskTemplate.template,
		templates : {
			lessonModeNormal : taskTemplate.template,
			lessonModeAssessment : assessmentTaskTemplate.template
		},
		showProperties: true,
		displayTaskDropdown: true,
		components: constants.components
	});

	return FreeWritingEditor;

});
