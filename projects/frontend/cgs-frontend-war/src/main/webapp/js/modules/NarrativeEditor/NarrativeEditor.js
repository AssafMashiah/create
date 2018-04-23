define(['modules/BaseTaskEditor/BaseTaskEditor', './config', './NarrativeStageView',
	'./NarrativeSmallStageView', './TaskTemplate'],
function(BaseTaskEditor, config, NarrativeStageView, NarrativeSmallStageView ,taskTemplate) {

	var NarrativeEditor = BaseTaskEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: NarrativeSmallStageView,
				normal: NarrativeStageView
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

	},{	type: 'NarrativeEditor',
		template: taskTemplate.template,
		showTaskSettingsButton: true,
		displayTaskDropdown: true,

		/*/**
		 * the context Editor must have at least one component in question area
		 * @param  {[type]} elem_repo [description]
		 * @return {[type]}           [description]
		 */
		
		postValid : function f949(elem_repo) {
			var result = {valid: true,report:[]},
				questionElement = require('repo').getChildrenRecordsByType(elem_repo.id, 'question')[0];

			if(questionElement && !questionElement.children.length){
				result.valid = false;
				result.report.push(require('validate').setReportRecord(elem_repo,'Item is invalid. Enter the missing content and property values.'));
			}

			return result;
		}
	});

	return NarrativeEditor;

});
