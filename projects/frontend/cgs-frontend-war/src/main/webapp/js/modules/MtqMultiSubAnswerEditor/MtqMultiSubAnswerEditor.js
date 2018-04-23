define(['jquery', 'lodash','repo', 'BaseContentEditor', './config', './MtqMultiSubAnswerStageView',
    './MtqMultiSubAnswerSmallStageView', 'modules/LinkingSubAnswerEditor/LinkingSubAnswerTemplate', 'modules/MtqSubAnswerEditor/MtqSubAnswerTemplate', './MtqMultiSubAnswerEditorView'],
function($, _, repo,  BaseContentEditor, config, MtqMultiSubAnswerStageView,
        MtqMultiSubAnswerSmallStageView, LinkingSubAnswerTemplate, MtqSubAnswerTemplate, MtqMultiSubAnswerEditorView) {

	var MtqMultiSubAnswerEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: MtqMultiSubAnswerSmallStageView,
				normal: MtqMultiSubAnswerStageView
			});

			this._super(config, configOverrides);

            this.parentType = this.record.data.mtqAnswerType;

            repo.startTransaction({ ignore: true });
            this.updateChildrenProps(true);
            repo.endTransaction();

            if(this.config.bindEvents){
                this.bindEvents({
                    'contentEditorDeleted'	:	{'type':'register', 'func': this.onEditorDeleted, 'ctx':this, 'unbind':'dispose'}
                });
            }
		},

		startStageEditing: function(){
			this.showStagePreview($('#stage_base'), {bindEvents:true});
		},
        startPropsEditing: function(cfg){
            this._super(cfg);
            var config = _.extend({controller: this}, cfg ? cfg : null);
            this.view = new MtqMultiSubAnswerEditorView(config);
        },

        onEditorDeleted:function(editorId) {
            if(this.record.id == editorId){
                console.log('MtqMultiSubAnswer child deleted');
                this.onChildrenUpdated();
            }
        },

        //update the sub-answers property that allows or prevents delete
        updateChildrenProps: function(disableEvents){

            var canDeleteChildren, minAnswers = config.minimumAnswers[this.parentType];

            if(this.record.children.length <= minAnswers){
                canDeleteChildren = false;
            }else{
                canDeleteChildren = true;
            }
            repo.updateProperty(this.record.id,'canDeleteChildren', canDeleteChildren, false, disableEvents);

            var subAnswers = repo.getChildrenRecordsByTypeRecursieve(this.record.id, this.record.data.linkingMode ? 'linkingSubAnswer' : 'mtqSubAnswer');
            _.each(subAnswers, function(subAnswer, index){
                repo.updateProperty(subAnswer.id, 'disableDelete', !canDeleteChildren, false, disableEvents);
            });

        },

        renderNewItem: function(){
            this.onChildrenUpdated();
        },

        onChildrenUpdated: function(){
            repo.startTransaction({ appendToPrevious: true });
            this.updateChildrenProps();
            repo.endTransaction();
            this.renderChildren();
        },

        createNewSubAnswer: function f944() {
            //add a new sub answer . different template for linking mode/ drag&drop mode
            var template = this.record.data.linkingMode ? LinkingSubAnswerTemplate : MtqSubAnswerTemplate;
            this.createNewItem({template: template.template,
                                parentId: this.elementId,
                                subAnswerType : this.record.data.answerType,
                                dataConfig:[{   idx: template.subAnswerChildIndex,
                                                data: this.buildChildData(this.record.data.answerType)
                                            }]
                                });
             require('router').startEditingActiveEditor();
		}

	},{	type: 'MtqMultiSubAnswerEditor' , stageReadOnlyMode: true});
	return MtqMultiSubAnswerEditor;

});
