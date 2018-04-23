define(['modules/BaseTaskEditor/BaseTaskEditor', './config','./constants' ,'repo', 'types', './QuestionOnlyStageView', './QuestionOnlySmallStageView',
	    './TaskTemplate'],
function(BaseTaskEditor, config,constants, repo, types, QuestionOnlyStageView, QuestionOnlySmallStageView ,taskTemplate) {

	var QuestionOnlyEditor = BaseTaskEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: QuestionOnlySmallStageView,
				normal: QuestionOnlyStageView
			});

			this._super(config, configOverrides);
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
		type: 'QuestionOnlyEditor',
		
		template: taskTemplate.template,
		
		showProperties: true,
		
		displayTaskDropdown: true,
		components: constants.components,

		/*/**
		 * the question only Editor must have at least one component in question area
		 * @param  {[type]} elem_repo [description]
		 * @return {[type]}           [description]
		 */
		
		postValid : function f982(elem_repo) {
			var result = {valid: true,report:[]},
				questionElement = repo.getChildrenRecordsByType(elem_repo.id, 'question')[0];

			if(questionElement && questionElement.children &&  !questionElement.children.length){
				result.valid = false;
				result.report.push(require('validate').setReportRecord(elem_repo,'Task is invalid. The Question area must contain content.'));
				
			}

			return result;

		}

		 
	});

	return QuestionOnlyEditor;

});
