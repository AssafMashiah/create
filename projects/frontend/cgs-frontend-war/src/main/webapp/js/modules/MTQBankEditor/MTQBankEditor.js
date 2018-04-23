define(['jquery', 'lodash', 'repo', 'repo_controllers', 'BaseContentEditor',
		'./config', './MTQBankStageView','./MTQBankSmallStageView',
		'modules/MtqSubAnswerEditor/MtqSubAnswerTemplate'],
function($, _, repo, repo_controllers,  BaseContentEditor, config,
		MTQBankStageView, MTQBankSmallStageView, MtqSubAnswerTemplate) {

	var MTQBankEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: MTQBankSmallStageView,
				normal: MTQBankStageView
			});

			this._super(config, configOverrides);

			if (!this.config.previewMode) {
				this.startStageEditing();
			}
		},

		createNewSubAnswer:function f942() {
            this.createNewItem({template: MtqSubAnswerTemplate.template,
                            parentId: this.elementId,
                            subAnswerType : this.record.data.answerType,
                            dataConfig:[{
                                            idx: 0,
                                            data: {  }
                                        },
                            			{   idx: MtqSubAnswerTemplate.subAnswerChildIndex,
                                            data: this.buildChildData(this.record.data.answerType)
                                        }]
                        });
		},

		updateChildrenProps: function(){
			//update the sub-answers property to always allow delete
			var subAnswers = repo.getChildrenRecordsByTypeRecursieve(this.record.id, 'mtqSubAnswer');
			_.each(subAnswers, function(subAnswer, index){
				repo.updateProperty(subAnswer.id, 'disableDelete', false);
			});

		},

		renderNewItem: function(){
			this.onChildrenUpdated();
		},

		onChildrenUpdated: function(){
			this.updateChildrenProps();
			this.renderChildren();
		},

		startStageEditing: function(){
			this.showStagePreview($('#stage_base'), {bindEvents:true});
		}

	},
	{
			type: 'MTQBankEditor'

	});
	return MTQBankEditor;

});
