define(['BaseContentEditor', 'repo', 'repo_controllers', 'events', 'validate', 'dialogs', './config', './TableCellPropsView', './TableCellStageView', './TableCellSmallStageView'],
function(BaseContentEditor, repo, repo_controllers, events, validate, dialogs, config, TableCellPropsView, TableCellStageView, TableCellSmallStageView) {

	var TableCellEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: TableCellSmallStageView,
				normal: TableCellStageView
			});

			this._super(config, configOverrides);

			var table = repo.getAncestorRecordByType(this.record.id, 'table');
			this.config.clozeTable = table && table.data && table.data.clozeTable;

			if (!this.config.previewMode) {
				this.startPropsEditing();
				this.startStageEditing();
			}
		},
		getExtraMathfieldConf: function () {
			return {
				extraMathfieldProps: {
					keyboardPreset: this.getKeyboardPreset(),
					onChange: function () {
						var answerField = repo.getChildrenRecordsByType(this.record.id, 'answerFieldTypeMathfield');

						if (answerField && answerField.length) {
							answerField = answerField[0];

							var answerFieldController = repo_controllers.get(answerField.id);

							if (answerFieldController && answerFieldController.stage_view) {
								if (answerFieldController.stage_view.mf) {											
									var markup = answerFieldController.stage_view.mf.mathField.view.getMarkUpValue();
									var widthEM = answerFieldController.stage_view.mf.mathField.view.getWidthEM();
									answerFieldController.view.setAnswerFieldMathfield({
										markup: markup,
										widthEM: widthEM
									});
								}
							}
						}
					}.bind(this)
				}
			}
		},

		// @param - propsContainer - the container of cell model in props element
		registerEvents: function(propsContainer) {
			this.record = repo.get(this.config.id);
			var changes = {
				childType: this.propagateChanges(this.record, 'childType',  true),
				isAnswerField: this.propagateChanges(this.record, 'isAnswerField',  true)
			};

			this.model = this.screen.components.props.startEditing(this.record, changes, propsContainer ? $(propsContainer): null);

			this.model.on('change:childType', this.onChildTypeChange, this);
			this.model.on('change:isAnswerField', function(){
				repo.startTransaction({ appendToPrevious: true });
				//first fire end editind of previous field and than update answer type
				events.fire("setActiveEditorEndEditing");
			 	this.onAnswerFieldChange();
			 	repo.endTransaction();
				
			},this);
		},

		startPropsEditing: function(options){
			this._super();
			// If options is undefined (pure cell props) and it includes elements, start render from child props
			// the cell props will be inserted afterwards
			if (!options) {
				if (this.record.children.length) {
					var childController = repo_controllers.get(this.record.children[0]);
					if (childController) {
						if (!require('editMode').readOnlyMode && !childController.record.data.stageReadOnlyMode && !childController.record.data.isNoncheckable) {
							childController.startEditing();
						}
						childController.startPropsEditing();
						return;
					}
				}
				else if (this.router.activeScreen.editor != this) {
					this.startEditing();
				}
			}

			// Set table cell as active editor after startEditing of child
			events.fire('setActiveEditor', this);

			var config = _.extend({controller: this}, options);
			this.view = new TableCellPropsView(config);
			this.registerEvents(config.appendToSelector);
		},

		disableAnswerField: function() {
			// this - the table cell view
			var self = this.controller;
			if (self && self.config.clozeTable) {
				var cloze_answer = repo.getAncestorRecordByType(self.record.id, 'cloze_answer');

				//in case of no child component, can't mark it as answer field
				if (cloze_answer && cloze_answer.data && cloze_answer.data.fieldsNum == 'single' && !self.record.data.isAnswerField) {
					var cells = repo.getChildrenRecordsByTypeRecursieve(cloze_answer.id, 'tableCell');
					if (_.filter(cells, function(cell) { return cell.data.isAnswerField; }).length > 0) {
						return true;
					}
				}
			}

			return false;
		},

		showAnswerFieldCheckbox: function() {
			// this - the table cell view
			return this.controller.config.clozeTable && (['None', 'Image'].indexOf(this.controller.record.data.childType) == -1);
		},
		
		// Get current child type
		// The record.data.childType property can be overwritten by type selection, 
		// but the operation can be canceled in confirmation dialog
		getRealChildType: function() {
			if(!this.record.children.length)
				return "None";

			switch (repo.get(this.record.children[0]).type) {
				case 'imageViewer':
					return 'Image';
				case 'textViewer':
				case 'AnswerFieldTypeText':
					return 'Text';
				case 'mathfield':
				case 'answerFieldTypeMathfield':
					return 'MathField';
			}
		},

		onAnswerFieldChange: function() {
        	var cloze = repo.getAncestorRecordByType(this.record.id, 'cloze'),
        		checkingEnabled = null;
	        	if(cloze){
	        		var progress = repo.getChildrenByTypeRecursive(cloze.id, 'advancedProgress');
	        		if(progress){
	        			progress = progress[0];
	        			checkingEnabled = progress.data.checking_enabled;
	        		}
	        		
	        	}
            var cloze_answer = repo.getAncestorRecordByType(this.record.id, 'cloze_answer');
			if (this.record.children.length) {
				var childEditor = repo_controllers.get(this.record.children[0]);
				if (childEditor && require('router').activeScreen.editor == childEditor) {
					childEditor.endEditing();
				}

				var child = repo.get(this.record.children[0]);
				if (['textViewer', 'AnswerFieldTypeText'].indexOf(child.type) > -1) {
					repo.updateProperty(child.id, 'type', this.record.data.isAnswerField ? 'AnswerFieldTypeText' : 'textViewer', true);
					if (this.record.data.isAnswerField && !checkingEnabled) {
						var data = _.extend(require('cgsUtil').cloneObject(child.data), this.getExtraProps('text'));
						data.title = '';
						repo.updateProperty(child.id, 'data', data, true);
					}
					else {
						_.each(this.getExtraProps('text'), function(v, k) {
							repo.deleteProperty(child.id, k);
						});
					}
				}
				else if (['mathfield', 'answerFieldTypeMathfield'].indexOf(child.type) > -1) {
					repo.updateProperty(child.id, 'type', this.record.data.isAnswerField ? 'answerFieldTypeMathfield' : 'mathfield', true);
					repo.updateProperty(child.id, 'editMode', this.record.data.isAnswerField ? 'on' : 'off');
					repo.updateProperty(child.id, 'completionType', 'A');
					if (this.record.data.isAnswerField && !child.data.checkingType) {
						repo.updateProperty(child.id, 'checkingType', 'exactMatch');
					}
					if (this.record.data.isAnswerField && !checkingEnabled) {
						var data = _.extend(require('cgsUtil').cloneObject(child.data), this.getExtraProps('mf'));
						data.markup = '';
						repo.updateProperty(child.id, 'data', data, true);
						//dispose the mathfield, so it will save the new (empty) markup
						repo_controllers.get(child.id).stage_view.dispose();
					}
					else {
						_.each(this.getExtraProps('mf'), function(v, k) {
							repo.deleteProperty(child.id, k);
						});
					}
				}

                if (this.record.data.isAnswerField) {
                	var isDD = cloze_answer.data.interaction == 'dd' || checkingEnabled === false;
                	repo.updateProperty(child.id, "noAdditionalCorrectAnswers", isDD);
                	repo.updateProperty(child.id, "noPartiallyCorrectAnswers", isDD);
              		repo.updateProperty(child.id, "noExpectedWrong", isDD);

              		if (isDD) {
	                    repo.updateProperty(child.id, 'AdditionalCorrectAnswers', null);
	                    repo.updateProperty(child.id, 'PartiallyCorrectAnswers', null);
	                    repo.updateProperty(child.id, 'ExpectedWrong', null);
	                }
                }

                validate.isEditorContentValid(this.record.id);

				events.fire('repo_changed');
				this.reloadStage();
				this.startPropsEditing();
			}
		},

		// Show confirmation dialog if the cell contains data you can lose
		onChildTypeChange: function() {
			if (this.record.children.length) {

				if (this.record.data.childType == this.getRealChildType()) return;

				//TODO: Show warning dialog for losing data
				var dialogConfig = {
					title: "Component Deletion",
					content: {
						text: "Are you sure want to remove current cell component?",
						icon: 'warn'
					},
					buttons: {
						yes:		{ label: 'yes' },
						cancel:		{ label: 'cancel' }
					}
				};

				events.once( 'onTableChildTypeChange', function( response ) {
					if(response && response == "yes") {
						this.setChildType() ;
					}
					else {
						repo.revert();
						repo.startTransaction({ ignore: true });
						this.model.set('childType', this.getRealChildType());
						repo.endTransaction();
					}
				}, this);

				dialogs.create('simple', dialogConfig, 'onTableChildTypeChange');
			}
			else {
				this.setChildType();
			}
		},

		// Change cell child type after confirmation
		setChildType: function() {
			var isNoncheckable, completionType = false;

			repo.startTransaction({ appendToPrevious: true });

			if(this.record.data.childType == 'MathField' && this.record.data.isAnswerField){

				var answerTypeMathfield = repo.getChildrenRecordsByType(this.record.id, "answerFieldTypeMathfield");
					answerTypeMathfield = answerTypeMathfield && answerTypeMathfield.length && answerTypeMathfield[0];

				completionType = answerTypeMathfield && answerTypeMathfield.data.completionType;
			}

			// Remove previous children
			_.each(this.record.children, function(child) {
				repo.remove(child, completionType);
			});

			// Check if it's cloze table and in drag & drop mode - disable field props
			var isDD = false;
			if (this.config.clozeTable) {
				var cloze_answer = repo.getAncestorRecordByType(this.record.id, 'cloze_answer');
				if (cloze_answer && cloze_answer.data && cloze_answer.data.interaction == 'dd') {
					isDD = true;
				}

				//in case of none component set isAnswerField = false
				if(this.record.data.childType === 'None') {
					repo.updateProperty(this.record.id, 'isAnswerField', false);
				}

				var cloze = repo.getAncestorRecordByType(this.record.id, 'cloze'),
					progress = repo.getChildrenRecordsByType(cloze.id, 'advancedProgress')[0];

				isNoncheckable = progress && !progress.data.checking_enabled;
			}

			var addItem = null,
			extraCfg = null;

			switch (this.record.data.childType) {
				case 'Text':
					addItem = {
						type: this.record.data.isAnswerField ? 'AnswerFieldTypeText' : 'textViewer',
						parentId: this.record.id,
						data: {
							mode: 'thin',
							minWidth: '50px',
							maxWidth: '218px',
							showNarrationType: true,
							addParentProps: true,
							disableDelete: true,
							availbleNarrationTypes: [
								{"name": "None", "value": ""},
								{"name":"General", "value": "1"}
							]
						}
					};
					if (isDD) {
						addItem.data.noAdditionalCorrectAnswers = true;
						addItem.data.noPartiallyCorrectAnswers = true;
						addItem.data.noExpectedWrong = true;
					}
					if (this.record.data.isAnswerField && isNoncheckable) {
						_.extend(addItem.data, this.getExtraProps('text'));
					}
					break;
				case 'Image':
					addItem = {
						type: 'imageViewer',
						parentId: this.record.id,
						data: {
							mode: 'thin',
							addParentProps: true,
							disableDelete: true
						}
					};
					break;
				case 'MathField':

					addItem = {
							type: this.record.data.isAnswerField ? 'answerFieldTypeMathfield' : 'mathfield',
							parentId: this.record.id,
							data: {
								maxHeight: this.record.data.isAnswerField? 'firstLevel' :'secondLevel',
								editMode: this.record.data.isAnswerField ? 'on' : 'off',
								addParentProps: true,
								disableDelete: true,
								autoComma: true

							}
						};

					if (isDD) {
						addItem.data.noCheckingType = true;
					}
					if (this.record.data.isAnswerField) {

						addItem.data.checkingType = 'exactMatch';
						if (isNoncheckable) {
							_.extend(addItem.data, this.getExtraProps('mf'));
						}


						addItem.data.completionType = completionType || 'A';
						
						if (completionType === 'C') {
							extraCfg = this.getExtraMathfieldConf();
						}
					}
					break;
			}

			if (addItem) {
				this.createItem(addItem);
			}
			
			repo.endTransaction();

			events.fire('repo_changed');

			this.reloadStage(extraCfg);

			if (!completionType) {
				this.startPropsEditing();
			}
		},

		getKeyboardPreset: function () {
			var keyboards = {
                DEFAULT: 'contentEditorMathField',
                COMPLETION_TYPE: 'contentEditorMathField_Completion'
            };

            if (!this.record.data.isAnswerField) {
            	return keyboards.DEFAULT;
            } 


            var keyboardConditions = {
                'cloze': function (record) {

                    var progress = repo.getChildrenByTypeRecursive(record.id, 'advancedProgress');
                        progress = progress && progress.length && progress[0];

                    var cloze_answer = repo.getChildrenByTypeRecursive(record.id, 'cloze_answer');
                        cloze_answer = cloze_answer && cloze_answer.length && cloze_answer[0];

                    var answerType = cloze_answer.data.answerType;
                    
                    var checkingEnabled = progress.data.checking_enabled;
                    var interactionType = cloze_answer.data.interaction;


                    if (checkingEnabled && interactionType === 'write') {
                    	return keyboards.COMPLETION_TYPE;
                    }  
                }
            };

            //get the current editor;
            var editor = repo.getAncestorRecordByType(this.record.id, 'cloze');

            if (!editor) {
               return keyboards.DEFAULT;
            }

            return keyboardConditions[editor.type] && keyboardConditions[editor.type](editor);

		},

		getExtraProps: function(type) {
			if (type == 'text') {
				return {
					'stageReadOnlyMode': true,
					'isNoncheckable': true,
					'displayFieldSize': true,
					'allowedSizes': [
						{ 'value': 'Word', 'text': 'Word' },
						{ 'value': 'Line', 'text': 'Line' },
						{ 'value': 'Paragraph', 'text': 'Paragraph' },
						{ 'value': 'Custom', 'text': 'Custom' }
					],
					'answer_size': 'Word',
					'disabledMaxChars': true,
					'MaxChars': 15
				};
			}

			return {
				'stageReadOnlyMode': true,
				'isNoncheckable': true,
				'fieldWidth': '1',
				'allowedWidths': [
					{ 'value': '1', 'text': '1 Digit or Operator' },
					{ 'value': '4', 'text': '3-4 Digits or Operators' },
					{ 'value': '7', 'text': '6-7 Digits or Operators' },
					{ 'value': '11', 'text': '10-11 Digits or Operators' },
					{ 'value': '16', 'text': '13-16 Digits or Operators' },
					{ 'value': 'halfLine', 'text': 'Half Line' },
					{ 'value': 'line', 'text': 'Full Line' }
				]
			};
		},

		endEditing: function() {
			if (this.record.children.length) {
				var childController = repo_controllers.get(this.record.children[0]);
				if (childController) {
					childController.endEditing();
				}
			}
			this._super();
		},

		// Render the whole table on cell stage reload
		reloadStage: function f1112(extraCfg) {
			this.renderChildren(extraCfg);
		}

	}, {type: 'TableCellEditor',
		valid:function f1113(elem_repo) {
			
			return { valid:true, report:[] };

		}
	});

	return TableCellEditor;

});
