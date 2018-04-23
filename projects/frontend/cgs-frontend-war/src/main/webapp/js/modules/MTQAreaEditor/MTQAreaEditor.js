define(['jquery', 'lodash', 'events', 'repo', 'repo_controllers', 'BaseContentEditor', './config', './MTQAreaStageView',
		'./MTQAreaSmallStageView', 'modules/MtqSubQuestionEditor/matchingSubQuestionTemplate',
		'modules/MtqSubQuestionEditor/sortingSubQuestionTemplate'],
function($, _, events, repo, repo_controllers,  BaseContentEditor, config, MTQAreaStageView,
		MTQAreaSmallStageView, matchingSubQuestionTemplate, sortingSubQuestionTemplate) {

	var MTQAreaEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {
			this.doRender = true; // use to know if the new item is added manualy or programmaticlly
			this.setStageViews({
				small: MTQAreaSmallStageView,
				normal: MTQAreaStageView
			});

			this._super(config, configOverrides);

			this.hasMultiSubAnswers = this.record.data.hasMultiSubAnswers;
			this.parentType = this.record.data.mtqAnswerType;

			// template for adding new sub quesion (with multi or without it)
			this.subQuestionTemplate = this.parentType =="matchingAnswer"? matchingSubQuestionTemplate : sortingSubQuestionTemplate;

			repo.startTransaction({ ignore: true });
			this.updateChildrenProps(true);
			repo.endTransaction();

			if(this.config.bindEvents){
				events.register('contentEditorDeleted', this.onEditorDeleted, this);
			}

			//TODO: check why there is a bug with the bind events function. if using this method the context is wrong.
			/*this.bindEvents({
				'contentEditorDeleted'	:	{'type':'register', 'func': this.onEditorDeleted, 'ctx':this, 'unbind':'dispose'}
			});*/

			if (!this.config.previewMode) {
				this.startStageEditing();
			}
		},
        //overriding _super function
		startEditing: function(){},

		allowAddSubAnswer: function(){
			return this.parentType != "sequencingAnswer";
		},

		dispose:function f939() {
			events.unbind('contentEditorDeleted', this.onEditorDeleted);
			this._super();
		},

		onEditorDeleted:function(editorId, deletedIndex) {
			if(this.record.id == editorId){
				console.log('MTQAreaEditor child deleted');
				this.onChildrenUpdated();
				if (deletedIndex > 0) {
					this.scrollToItem(this.record.children[deletedIndex - 1]);
				}
			}
		},

		//update the sub-answers property that allows or prevents delete
		updateChildrenProps: function(disableEvents){
			var canDeleteChildren , minSubQuestions = config[this.parentType].minSubQuestions;
			if(this.record.data.useBank){
				minSubQuestions = config[this.parentType].minSubQuestionsWithBank;
			}

			if(this.record.children.length < minSubQuestions){
				canDeleteChildren = false;
				this.doRender = false;
				// new item will be added programmatically - so rendering it is not necessary
				this.createNewSubQuestion();
			}

			if(this.record.children.length == minSubQuestions){
				canDeleteChildren = false;
			}

			if(this.record.children.length > minSubQuestions){
				canDeleteChildren = true;
			}

			repo.updateProperty(this.record.id,'canDeleteChildren', canDeleteChildren, false, disableEvents);

			// set delete property to each sub quesion
			var subQuestions = repo.getChildrenRecordsByTypeRecursieve(this.record.id, 'mtqSubQuestion');
			_.each(subQuestions, function(subQuestion, index){
				repo.updateProperty(subQuestion.id, 'disableDelete', !canDeleteChildren,false, disableEvents);
			});

		},

		createNewSubQuestion:function f940() {
			//add new sub question according to type.
			//data config adds a data object to an item added in the repo template
			//idx is the index of the repo template object which the data will be added to
			this.createNewItem({template: this.subQuestionTemplate.template,
								parentId: this.elementId,
								definitionType: this.record.data.definitionType,
								subAnswerType : this.record.data.answerType,
								dataConfig:[{	idx: this.subQuestionTemplate.definitionChildIndex,
												data: this.buildChildData(this.record.data.definitionType, {
														'type' : 'textViewer',
														'data' : {"styleOverride": "definition"}
												})
											},
											{	idx: this.subQuestionTemplate.subAnswerChildIndex,
												data: this.buildChildData(this.record.data.answerType)
											}]
								});

		},

		renderNewItem: function(){
			if (this.doRender)
				this.onChildrenUpdated();
			else
				this.doRender = true;
		},

		onChildrenUpdated: function(){
			repo.startTransaction({ appendToPrevious: true });
			this.updateChildrenProps();
			repo.endTransaction();
			this.renderChildren();
		},

		startStageEditing: function(){
			this.showStagePreview($('#stage_base'), {bindEvents:true});
		}

	},
	{
			type: 'MTQAreaEditor'

	});

	return MTQAreaEditor;

});
