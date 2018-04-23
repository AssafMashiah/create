define(['./config','modules/MathfieldEditor/MathfieldEditor',
	'repo', 'repo_controllers', './AnswerFieldTypeMathfieldStageView', './AnswerFieldTypeMathfieldPropsView' ],
function(config ,MathfieldEditor, repo, repo_controllers, AnswerFieldTypeMathfieldStageView,
	 AnswerFieldTypeMathfieldPropsView) {

	var AnswerFieldTypeMathfieldEditor = MathfieldEditor.extend({

		initialize: function(configOverrides) {
			this.setStageViews({
				small: AnswerFieldTypeMathfieldStageView,
				normal: AnswerFieldTypeMathfieldStageView
			});

			this._super(configOverrides, true);
			this.constants = config.constants;
		},

		startPropsEditing: function(){
			this._super(AnswerFieldTypeMathfieldPropsView);
			
			this.view.create_lists();

			if (this.isCompletionType()) {
				this.view.setAnswerFieldMathfield(this.record.data.answerMarkup || {markup: null, widthEM: null}, null, this.stage_view.mf.mathField.view.getMarkUpValue());
			}
		},

		registerEvents: function(propsContainer) {

			var changes = {
				checkingType	: this.propagateChanges(this.record, 'checkingType', true),
				hint 			: this.propagateChanges(this.record, 'hint', true),
				additionalExactMatch : this.propagateChanges(this.record, 'additionalExactMatch', true),
				conditionsData 	: this.propagateChanges(this.record, 'conditionsData', true),
				completionType 	: this.propagateChanges(this.record, 'completionType',  this.completionChangeAlertDialog.bind(this), true),
				answer_size 	: this.propagateChanges(this.record, 'answer_size', true),
				fieldWidth		: this.propagateChanges(this.record, 'fieldWidth', true)
			};

			this.model = this.screen.components.props.startEditing(this.record, changes, propsContainer ? $(propsContainer) : null);
			this.model.on('change:checkingType', function(event, val){
				//clear previous data 
				repo.startTransaction({ appendToPrevious: true });
				if(this.record.data.additionalExactMatch){
					repo.updateProperty(this.record.id, 'additionalExactMatch', null);
				}
				if(this.record.data.conditionsData){
					repo.updateProperty(this.record.id, 'conditionsData', null);
				}
				repo.endTransaction();
				this.startPropsEditing();
			}, this);
			
			this.model.on('change:answer_size', this.answerSizeChange , this);

			this.model.on('change:fieldWidth', function(event, val) {
				this.stage_view.setFieldWidth(val);
			} , this);

		},
		
		answerSizeChange : function f1(){
			repo.startTransaction({ appendToPrevious: true });
            repo.updateProperty(this.config.id,'MaxChars',config.constants.editor[this.record.data.answer_size].MaxChars);
            repo.endTransaction()

            //render the changed size of the text editor
            
            this.stage_view.endEditing();
            this.stage_view.render();
            this.startPropsEditing();

        },
        reloadMathfield: function () {
        	var parentEditor = repo.getAncestorRecordByType(this.record.id, "tableCell");

        	if (!parentEditor) {
        		parentEditor = repo.getAncestorRecordByType(this.record.id, "ShortAnswerAnswer");

        		if (!parentEditor) {
        			return;
        		} else {
        			var controller = repo_controllers.get(parentEditor.id);
        			var self = this;

        			repo.updateProperty(this.record.id, 'answerMarkup', "");
        			repo.updateProperty(this.record.id, 'markup', "");


        			if (controller.record.data.fieldsNum === 'multiple') {
        				var subQuestionController = repo_controllers.get(this.record.parent);

        				subQuestionController.renderChildren({
                			extraMathfieldProps: {
	                			keyboardPreset: (controller.record.data.checkingEnabled && this.isCompletionType(subQuestionController.record)) ? 'contentEditorMathField_Completion' : 'contentEditorMathField',
	                			onChange: (controller.record.data.checkingEnabled && this.isCompletionType()) ? function () {
	                				var answerFields = repo.getChildrenRecordsByTypeRecursieve(controller.record.id, 'answerFieldTypeMathfield');
	                					answerFields = _.filter(answerFields, function (rec) {
	                						return rec.id === this.record.id;
	                					}, this);
	                					answerFields = answerFields && answerFields.length && answerFields[0];

	                				var answerFieldController = repo_controllers.get(answerFields.id);
	                				var markup = answerFieldController.stage_view && answerFieldController.stage_view.mf && answerFieldController.stage_view.mf.mathField.view.getMarkUpValue();
	                				var widthEM = answerFieldController.stage_view && answerFieldController.stage_view.mf && answerFieldController.stage_view.mf.mathField.view.getWidthEM();
									answerFieldController.view && answerFieldController.view.setAnswerFieldMathfield({
										markup: markup,
										widthEM: widthEM
									}, null, markup);
	                			}.bind(this): $.noop
	                		}
	                	});

        			} else {
        				controller.renderChildren({
                			extraMathfieldProps: {
	                			keyboardPreset: (controller.record.data.checkingEnabled && this.isCompletionType()) ? 'contentEditorMathField_Completion' : 'contentEditorMathField',
	                			onChange: (controller.record.data.checkingEnabled && this.isCompletionType()) ? function () {
	                				var answerFields = repo.getChildrenRecordsByTypeRecursieve(controller.record.id, 'answerFieldTypeMathfield');
	                					answerFields = _.filter(answerFields, function (rec) {
	                						return rec.id === this.record.id;
	                					}, this);
	                					answerFields = answerFields && answerFields.length && answerFields[0];

	                				var answerFieldController = repo_controllers.get(answerFields.id);
	                				var markup = answerFieldController.stage_view && answerFieldController.stage_view.mf && answerFieldController.stage_view.mf.mathField.view.getMarkUpValue();
	                				var widthEM = answerFieldController.stage_view && answerFieldController.stage_view.mf && answerFieldController.stage_view.mf.mathField.view.getWidthEM();
									answerFieldController.view && 
										answerFieldController.view.setAnswerFieldMathfield({
											markup: markup,
											widthEM: widthEM
										}, null, markup);
	                			}.bind(this): $.noop
	                		}
	                	});
        			}
                }
        	} else {
        		var controller = repo_controllers.get(parentEditor.id);

        		controller.setChildType(true);
        		
        		var answerFieldRecord = repo.getChildrenRecordsByType(controller.record.id, 'answerFieldTypeMathfield');
        			answerFieldController = answerFieldRecord && answerFieldRecord.length && repo_controllers.get(answerFieldRecord[0].id);

        		answerFieldController.stage_view.mf.mathField.setEnabled(true)
        		answerFieldController.startPropsEditing();
        	}
        },
        isCompletionType: function (subQuestion) {
        	return require('cgsUtil').isCompletionType(this.record, subQuestion);
        },

        completionChangeAlertDialog: function(val){
			//display the dialog only if were cahnging "from" or "to" completion
			if(val =="C" || this.record.data.completionType == "C"){
				var self = this;
				
				require('cgsUtil').createDialog('dialogs.mathfileEditor.props.change.completionType.title',
					'dialogs.mathfileEditor.props.change.completionType.data','simple',
					{
						'ok': {
							'label': 'Ok'
						},
						'cancel': {
							'label': 'Cancel'
						}
					}, function(response){
						if(response == 'ok'){
							self.changeCompletionType(val,true);
						}if(response == 'cancel'){
							//set the value in drop down to previous value
							var previousVal = self.model._previousAttributes.completionType;
							self.view.$("#completionType").val(previousVal);
							self.model.attributes.completionType = previousVal;

						}
				});
			}else{
				this.changeCompletionType(val);
			}

        },
		
		changeCompletionType : function f2(val,reloadMathfield) {

			repo.startTransaction()			
			repo.updateProperty(this.config.id, 'completionType', val);
			if (reloadMathfield) {
				repo.updateProperty(this.config.id, 'conditionsData', null);
				repo.updateProperty(this.config.id, 'additionalExactMatch', null);
			}
			repo.endTransaction();

			//reload the mathfield if the prev value was a completion or, the current value is completion
			var controller = this;
			var controllerRecordId = controller.record.id;
			if(reloadMathfield){
				this.reloadMathfield();
				
				// Get the new controller because the mathfield has been reloaded
				controller = repo_controllers.get(controllerRecordId);

				controller.startEditing();
				controller.startPropsEditing();
			} else { // !reloadMathfield
				if (controller.isCompletionType()) {
					controller.view.setAnswerFieldMathfield(controller.record.data.answerMarkup || { markup: null, widthEM: null });
				} else {
					controller.view.hideAnswerFieldMathfield();
				}
			}

		}

	}, {
		
			type: 'AnswerFieldTypeMathfieldEditor',

			
			valid : function f3(elem_repo){
				var result = {
						valid : true,
						report : []
					};

				var isNoncheckable = false,
					cloze = repo.getAncestorRecordByType(elem_repo.id, 'cloze');

				if (cloze) {
					var progress = repo.getChildrenRecordsByType(cloze.id, 'advancedProgress')[0];
					isNoncheckable = progress && !progress.data.checking_enabled;
				}
					
				if (!isNoncheckable) {
					if(!elem_repo.data.markup){
						result.valid = false;
						result.report.push(require('validate').setReportRecord(elem_repo,"The Math field must contain content."));
					}
					//check if the mathfield answerfield is of type completion, but the correct answer wasnt set
					var answerMarkup = elem_repo.data.answerMarkup;
					if(answerMarkup){
						var competionTags = $('<div>'+elem_repo.data.answerMarkup.markup+'</div>').find('completion');
						if(competionTags.length){
							var emptyCompletion = _.map(competionTags, function(tag){return $(tag).html()})
							if( emptyCompletion.indexOf('') >-1){
								result.valid = false;
								result.report.push(require('validate').setReportRecord(elem_repo,"validation.answerfield.mathfield.completion.empty"));
							}
						}
					}
					if(elem_repo.data.checkingType == 'condition' ){
						if(elem_repo.data.conditionsData && elem_repo.data.conditionsData.length > 0){
							for (var i = 0; i <elem_repo.data.conditionsData.length ; i++) {
								var condition = elem_repo.data.conditionsData[i];
								if(condition.innerList.length == 0){
									result.valid  = false;
									result.report.push(require('validate').setReportRecord(elem_repo,'validations.mathfield.condition.emptyRule'));
								}
								for (var j = 0; j < condition.innerList.length; j++) {
									var rule = condition.innerList[j];
									if(!rule.markup || !rule.markup.length){
										result.valid = false;
										result.report.push(require('validate').setReportRecord(elem_repo,'validations.mathfield.condition.emptyRule'));
										break;
									}
								}
							}
						}else{
							result.valid  = false;
							result.report.push(require('validate').setReportRecord(elem_repo,'validations.mathfield.condition.emptyRule'));
						}
					}
				}
				return result;	
				
			},

			defaultRepoData : function() {
				return {
				    "title"         : "",
				    "disableDelete" : true,
				    "checkingType"  : "exactMatch",
				    "hideFieldHint" : true,
				    "keyboardPreset":'contentEditorMathField',
					"editMode"		:'on',
					"fontLocale"	: require("localeModel").getConfig("mfConfig").fontLocale,
					"autoComma"		:'true',
					"validate"		:'false',
					"devMode"		:'false',
					"italicVariables": 'true',
					"completionType" : "A",
					"maxHeight"		: 'secondLevel',
					 "displayFieldSize"   : false,
					"disabledMaxChars"    : true,
				    "MaxChars"            : 15,
				    "answer_size"         : "Word",
				    "allowedSizes"        : [  
				                            { "value" : "Letter", "text" : "Single" },
				                            { "value" : "Word", "text" : "Short" },
				                            { "value" : "Line", "text" : "Long" }
				                        ]
				} 
			}
	});

	return AnswerFieldTypeMathfieldEditor;

});
