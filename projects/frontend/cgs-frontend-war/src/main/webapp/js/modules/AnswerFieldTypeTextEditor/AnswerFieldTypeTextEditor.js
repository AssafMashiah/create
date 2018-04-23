define(['modules/TextViewerEditor/TextViewerEditor', 'repo', 'repo_controllers',
	'events','modules/TextEditorEditor/constants', 'growingListComponentView', './AnswerFieldTypeTextPropsView',
	'./AnswerFieldTypeTextSmallStageView', './AnswerFieldTypeTextStageView'],
	function(TextViewerEditor, repo, repo_controllers, events, Constants,
		growingListComponentView, AnswerFieldTypeTextPropsView, StageView, SmallStageView) {

		var AnswerFieldTypeTextEditor = TextViewerEditor.extend({

			initialize:function f8(configOverrides) {

				this.setStageViews({
					small:StageView,
					normal:SmallStageView
				});

				this.propsView = AnswerFieldTypeTextPropsView;

				this._super(configOverrides, {});
			},

			// @param propsContainer - context for model binding
			registerEvents:function f9(propsContainer) {
				if (propsContainer)
					this.propsContainer = propsContainer;

				var changes = {
					showAdditionalCorrectAnswers:this.propagateChanges(this.record, 'showAdditionalCorrectAnswers', true),
					showPartiallyCorrectAnswers:this.propagateChanges(this.record, 'showPartiallyCorrectAnswers', true),
					showExpectedWrong:this.propagateChanges(this.record, 'showExpectedWrong', true),
					AdditionalCorrectAnswers:this.propagateChanges(this.record, 'AdditionalCorrectAnswers', true),
					PartiallyCorrectAnswers:this.propagateChanges(this.record, 'PartiallyCorrectAnswers', true),
					ExpectedWrong:this.propagateChanges(this.record, 'ExpectedWrong', true),
					hint:this.propagateChanges(this.record, 'hint', true),
					answer_size: this.propagateChanges(this.record, 'answer_size', true),
					MaxChars :this.propagateChanges(this.record, 'MaxChars', true),
					ShowToolbar :this.propagateChanges(this.record, 'ShowToolbar', true)
				};

				this.model = this.screen.components.props.startEditing(this.record, changes, this.propsContainer ? $(this.propsContainer) : null);
				this.view.create_lists();
				this.onChangeEvents();
			},

			onChangeEvents:function f10() {
				this.model.on('change:showAdditionalCorrectAnswers', this.startPropsEditing, this);

				this.model.on('change:showPartiallyCorrectAnswers', this.startPropsEditing, this);

				this.model.on('change:showExpectedWrong', this.startPropsEditing, this);

				this.model.on('change:answer_size', this.onAnswerSizeChange, this);

				this.model.on('change:MaxChars', function() {
					repo.startTransaction({ appendToPrevious: true });
					if (this.record.data.answer_size == 'Custom') {
						if (this.record.data.MaxChars < 46) {
							this.model.set('ShowToolbar', false);
						}
						this.view.hideShowToolbar(this.record.data.MaxChars < 46);
					}
					repo.endTransaction();
					this.stage_view.checkTextSize.call(this.stage_view);
				} , this);

			},

			onAnswerSizeChange: function f14() {
				repo.startTransaction({ appendToPrevious: true });
				if (this.record.data.isNoncheckable) {
					var maxChars;
					switch (this.record.data.answer_size) {
						case 'Word':
							maxChars = 15;
							break;
						case 'Line':
							maxChars = 45;
							break;
						case 'Paragraph':
							maxChars = 150;
							break;
						case 'Custom':
							maxChars = 250;
							break;
					}
					repo.updateProperty(this.config.id, 'MaxChars', maxChars);
					repo.updateProperty(this.config.id, 'ShowToolbar', ['Paragraph', 'Custom'].indexOf(this.record.data.answer_size) > -1);
					repo.updateProperty(this.config.id, 'disabledMaxChars', this.record.data.answer_size != 'Custom');
					this.stage_view.checkTextSize();
				}
				else {
					repo.updateProperty(this.config.id, 'MaxChars', Constants.editor[this.record.data.answer_size].MaxChars);
					repo.updateProperty(this.config.id, 'ShowToolbar', Constants.editor[this.record.data.answer_size].ShowToolbar);
					repo.updateProperty(this.config.id, 'disabledMaxChars', Constants.editor[this.record.data.answer_size].disabledMaxChars);
					repo.updateProperty(this.config.id, 'disabledShowToolbar', Constants.editor[this.record.data.answer_size].disabledShowToolbar);
					repo.deleteProperty(this.config.id, 'tvPlaceholder');
				}

				//render the changed size of the text editor
				this.stage_view.isStartEditing = true;
				this.stage_view.checkTextSize();

				repo.endTransaction();
				
				this.stage_view.endEditing(true);
				this.stage_view.render();
				this.stage_view.startEditing();
				this.startPropsEditing();
			},

			showToolbarCheckbox: function() {
				return	this.controller.record.data.isNoncheckable &&
						this.controller.record.data.MaxChars > 45 &&
						['Paragraph', 'Custom'].indexOf(this.controller.record.data.answer_size) > -1;
			},

			startEditing: function f15(e) {
	        	if (this.record.data.mode === 'plain') {
	        		this.config.menuInitFocusId = 'menu-button-task';
	        	}
	        	this._super(e);
	        },
			
			endEditing: function(){
				this._super();
				//fire event only if there is a bank
				var parent = repo.get(this.record.parent);
				if (parent && parent.data.useBank && events.exists("setDefaultBankValues"))
					events.fire("setDefaultBankValues");
			}


	}, 
	{
		type:'AnswerFieldTypeTextEditor',
		defaultRepoData : function() {
			return {
	            "title": "",
	            "hideFieldHint" : true,
	            "MaxChars": 15,
	            "ShowToolbar": false,
	            "disabledMaxChars": true,
	            "disabledShowToolbar": true,
	            "MathFieldKeyboard": false,
	            "disableDelete":true,
	            "answer_size": "Word",
	            "displayFieldSize":true,
	            "allowedSizes":[{ "value": "Letter", "text": "Letter" },
	                { "value": "Word", "text": "Word" },
	                { "value": "Line", "text": "Line" }
	            ]
		    }
		},
		/**
		 * text
		 * @param  {[type]} elem_repo [description]
		 * @return {[type]}           [description]
		 */
		valid:function f16(elem_repo) {

			var isNoncheckable = false,
				cloze = repo.getAncestorRecordByType(elem_repo.id, 'cloze');

			if (cloze) {
				var progress = repo.getChildrenRecordsByType(cloze.id, 'advancedProgress')[0];
				isNoncheckable = progress && !progress.data.checking_enabled;
			}

			
			//check if the answer_field_type_text  is empty
			if(!isNoncheckable && !$.trim($('<div>' + elem_repo.data.title + '</div>').text()).length){
					
				return  { 
					valid : false, 
					report : [require('validate').setReportRecord(elem_repo,'The Answer field is empty. At least one answer must be entered.')],
				};
			}

				return  { valid:true, report:[] };
		},
	});

	return AnswerFieldTypeTextEditor;

});
