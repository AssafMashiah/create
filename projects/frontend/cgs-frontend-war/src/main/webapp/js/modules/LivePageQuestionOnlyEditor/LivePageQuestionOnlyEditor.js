define(['modules/LivePageBaseTaskEditor/LivePageBaseTaskEditor', './config','./constants' ,'repo', 'types',
	'./LivePageQuestionOnlyStageView', './TaskTemplate'],
function(LivePageBaseTaskEditor, config,constants, repo, types, LivePageQuestionOnlyStageView, taskTemplate) {

	var LivePageQuestionOnlyEditor = LivePageBaseTaskEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				normal: LivePageQuestionOnlyStageView
			});

			this._super(configOverrides);
			//register to menu events 
			this.bindEvents({
				'score_Changed' : {'type':'register', 'func': this.handleScoreChanges , 'ctx': this, 'unbind':'dispose'}
			});
			
			if (!this.config.previewMode) {
				this.startStageEditing();
				this.startPropsEditing();
			}
		},

		startStageEditing: function(){
			this.showStagePreview($('#stage_base'), {bindEvents:true});
		},
		
		handleScoreChanges: function(value){
            repo.updateProperty(this.record.id, 'task_check_type', value ? "manual" : "none");
		}
		

	},{	
		type: 'LivePageQuestionOnlyEditor',
		
		template: taskTemplate.template,
		
		showProperties: true,
		
		displayTaskDropdown: false,
		components: constants.components,

		/*/**
		 * the question only Editor must have at least one component in question area
		 * @param  {[type]} elem_repo [description]
		 * @return {[type]}           [description]
		 */
		
		postValid : function f982(elem_repo) {
			var result = {valid: true,report:[]},
				questionElement = repo.getChildrenRecordsByType(elem_repo.id, 'question')[0];

			if(!questionElement.children.length){
				result.valid = false;
				result.report.push(require('validate').setReportRecord(elem_repo,'Task is invalid. The Question area must contain content.'));
				
			}

			return result;

		}

		 
	});

	return LivePageQuestionOnlyEditor;

});
