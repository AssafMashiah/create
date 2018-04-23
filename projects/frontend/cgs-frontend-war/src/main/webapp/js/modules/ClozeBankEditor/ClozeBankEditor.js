define(['jquery', 'lodash', 'repo', 'repo_controllers', 'BaseContentEditor', './config', 'events',
	'./ClozeBankStageView','./ClozeBankSmallStageView', './ClozeBankPropertiesView'],
function($, _, repo, repo_controllers, BaseContentEditor, config, events,
		ClozeBankStageView, ClozeBankSmallStageView, ClozeBankPropertiesView) {

	var ClozeBankEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: ClozeBankSmallStageView,
				normal: ClozeBankStageView
			});

			this._super(config, configOverrides);

			if (events.exists('setDefaultBankValues')) {
				events.unbind('setDefaultBankValues');
			}
			if (events.exists('contentEditorDeleted')) {
				events.unbind('contentEditorDeleted', this.onEditorDeleted);
			}
			if(this.config.bindEvents){

			//register to menu events
			this.bindEvents({
				'setDefaultBankValues': {'type':'bind', 'ctx':this, 'func': function(){
					//need to re-render stage view
					this.setDefaultList(true);
				}, 'unbind':'dispose'},
				'contentEditorDeleted':{'type':'register', 'func': this.onEditorDeleted,
							'ctx':this, 'unbind':'dispose'}
			});
			}

			if (this.isSingleMode() || this.isNonCheckable()) {
				repo.startTransaction({ ignore: true });
				this.setDefaultList(false);
				repo.endTransaction();
			}

			//this.config.defaultList = ['option 1', 'option 2', 'option 3', 'option 4'];


			if (!this.config.previewMode) {
				this.startStageEditing();
			}
		},
		isSingleMode: function f107() {
			var cloze_answer_record = repo.get(this.record.parent);

			return cloze_answer_record.data.fieldsNum === "single" ? true : false;
		},

		isNonCheckable: function() {
			var cloze = repo.getAncestorRecordByType(this.record.id, 'cloze');
			if (cloze) {
				var progress = repo.getChildrenRecordsByType(cloze.id, 'advancedProgress')[0];
				return !!progress && !progress.data.checking_enabled;
			}
			return false;
		},

		// Create new answer text viewer
		createNewSubAnswer:function f108(text, disableDelete, stageReadOnlyMode, dontRender) {
			var cloze_answer_record = repo.get(this.record.parent);
				style = cloze_answer_record.data.interaction == 'write' ? 'bankReadOnly' : '';
			this.createNewItem({
				parentId: this.elementId,
				title: text,
				type : 'textViewer',
				data: {
					disableDelete: disableDelete,
					showNarrationType: true,
					stageReadOnlyMode: stageReadOnlyMode,
					styleOverride: style,
					textEditorStyle: "texteditor",
					mode: 'bankStyle',
					width: "50%"
				}
			}, dontRender);
		},

		//create default bank values from additional correct, partially correct & expected wrong
		setDefaultList: function(render){
			this.getDefaultBankValues();
			this.clearDefaultList();
			this.addDefaultList();

			// Reorder - default list should be first
			repo.updateProperty(this.record.id, 'children', _.sortBy(this.record.children, function(childId) {
				var child = repo.get(childId);
				return child.data.stageReadOnlyMode ? 0 : 1;
			}), true, true);

			if (render) {
				this.stage_view.render();
				this.renderChildren();
			}
		},
		// clear default bank items (from additional correct, partially correct & expected wrong)
		clearDefaultList: function(){
			_.each(this.record.children, _.bind(function(childId){
				child = repo.get(childId);
				if(child.data.stageReadOnlyMode == true){
					repo.remove(childId);
				}

			},this))
		},

		// Add list of permanent values (can't be deleted or edited)
		addDefaultList: function() {
			_.each(this.defaultList, _.bind(function(text) {
				this.createNewSubAnswer(text, true, true, true);
			}, this));

			var cloze = repo.getAncestorRecordByType(this.record.id, 'cloze');
			if (cloze) {
				var progress = repo.getChildrenRecordsByType(cloze.id, 'advancedProgress')[0];
				if (progress && !progress.data.checking_enabled && !this.record.children.length) {
					this.createNewSubAnswer('', true, false, true);
				}
			}
		},
		//get default bank values from additional correct, partially correct & expected wrong
		getDefaultBankValues: function(){

			this.defaultList = [];
			var clozeAnswer = repo.get(this.record.parent);
			if (clozeAnswer && !this.isNonCheckable()) {
				var clozeTextViewer = repo.getChildrenRecordsByTypeRecursieve(clozeAnswer.id, "cloze_text_viewer");
				if(clozeTextViewer.length){
					clozeTextViewer = clozeTextViewer[0];
					_.each(clozeTextViewer.data.answerFields, _.bind(function(answer){
						this.saveDefaultBankValues(answer, clozeAnswer.data.interaction =="dd");
					},this));
				}
				var clozeTable = repo.getChildrenRecordsByTypeRecursieve(clozeAnswer.id, "table");
				if(clozeTable.length){
					clozeTable = clozeTable[0];
					if(clozeTable.data.clozeTable === true){
						answerFields = repo.getChildrenRecordsByTypeRecursieve(clozeTable.id,"AnswerFieldTypeText");
						_.each(answerFields, _.bind(function(answer){
							this.saveDefaultBankValues(answer.data, clozeAnswer.data.interaction =="dd");
						},this));
					}
				}
			}
			this.defaultList = _.uniq(this.defaultList);
		},

		saveDefaultBankValues: function(repoData, isDD){
			if (!isDD) {

				if(repoData.showExpectedWrong){
					_.each(repoData.ExpectedWrong, _.bind(function(wrongAnswer){
						this.defaultList.push(wrongAnswer.item);
					},this));
				}
			}
		},

		// Update disableDelete value of text fields
		updateChildrenProps: function(){
			var subAnswers = repo.getChildrenRecordsByType(this.record.id, 'textViewer'),
				disable = subAnswers.length == this.config.minimumAnswers;

			_.each(subAnswers, function(subAnswer, index){
				repo.updateProperty(subAnswer.id, 'disableDelete', disable || subAnswer.data.stageReadOnlyMode ||
					(this.isNonCheckable() && subAnswers.length == 1));
			}, this);
		},

		startEditing: function(event){
			this._super();
			this.onChildrenUpdated();
            this.view = new ClozeBankPropertiesView({controller: this});
		},

		renderNewItem: function(){
			this.onChildrenUpdated();
		},
		onEditorDeleted:function(editorId) {

			if(this.config.id == editorId){
				console.log('cloze answer child deleted');
				this.onChildrenUpdated();
			}
		},

		onChildrenUpdated: function(){
			this.updateChildrenProps();
			this.renderChildren();
		},

		startStageEditing: function(){
			this.showStagePreview($('#stage_base'), {bindEvents:true});
		}

	},
	{ type: 'ClozeBankEditor' });

	return ClozeBankEditor;

});
