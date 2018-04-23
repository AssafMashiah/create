define(['modules/BaseTaskEditor/BaseTaskEditor', './config', './SelfCheckStageView', 
	'./SelfCheckSmallStageView', './TaskTemplate'],
function(BaseTaskEditor, config, SelfCheckStageView, SelfCheckSmallStageView ,SelfCheckTemplate) {

	var SelfCheckEditor = BaseTaskEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: SelfCheckSmallStageView,
				normal: SelfCheckStageView
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

	},{	type: 'SelfCheckEditor',
		template: SelfCheckTemplate.template,
		showProperties: true,
		displayTaskDropdown: true,
			/*/**
		 * the self check Editor must have at least one component in question area
		 * @param  {[type]} elem_repo [description]
		 * @return {[type]}           [description]
		 */
		
		postValid : function f986(elem_repo) {
			var result = {valid: true,report:[]},
				repo = require('repo'),
				questionElement = repo.getChildrenRecordsByType(elem_repo.id, 'question')[0];
				titleElement = repo.getChildrenRecordsByType(elem_repo.id, 'title')[0];

			//if no title, a least on item in the question area is needed
			if( titleElement && !titleElement.data.show && questionElement && !questionElement.children.length){
				result.valid = false;
				result.report.push(require('validate').setReportRecord(elem_repo,'Item is invalid. Enter the missing content and property values.'));
			}

			return result;
		}
	});

	return SelfCheckEditor;

});

