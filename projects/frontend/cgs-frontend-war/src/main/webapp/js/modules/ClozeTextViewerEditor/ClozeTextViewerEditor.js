define(['modules/TextViewerEditor/TextViewerEditor',
	'repo',
	'events',
	'repo_controllers',
	'IconAndFileUpload',
	'events',
	'./config',
	'./ClozeTextViewerPropsView',
	'./ClozeTextViewerStageView',
	'./ClozeTextViewerSmallStageView',
	'modules/AnswerFieldTypeMathfieldEditor/AnswerFieldTypeMathfieldPropsView',
	'modules/AnswerFieldTypeTextEditor/AnswerFieldTypeTextPropsView',
	'modules/AnswerFieldTypeMathfieldEditor/config'],
function(TextViewerEditor,
		repo,
		events,
		repo_controllers,
		IconAndFileUpload,
		events,
		config,
		ClozeTextViewerPropsView,
		ClozeTextViewerStageView,
		ClozeTextViewerSmallStageView,
		AnswerFieldTypeMathfieldPropsView,
		AnswerFieldTypeTextPropsView,
		AnswerFieldTypeMathfieldConfig) {

	var ClozeTextViewerEditor = TextViewerEditor.extend({

		changes: {
			mathfield: [
				'checkingType',
				'conditionsData',
				'hint',
				'type',
				'maxHeight',
				'additionalExactMatch',
				'completionType',
				'isNoncheckable',
				'fieldWidth',
				'allowedWidths'
			],
			text: [
				'showAdditionalCorrectAnswers',
				'showPartiallyCorrectAnswers',
				'showExpectedWrong',
				'AdditionalCorrectAnswers',
				'PartiallyCorrectAnswers',
				'ExpectedWrong',
				'hint',
				'type',
				'isNoncheckable',
				'displayFieldSize',
				'allowedSizes',
				'answer_size',
				'disabledMaxChars',
				'MaxChars'
			]
		},
		_clear_exclude:[],
		defaultValues: {
			mathfield: ["maxHeight:parent","checkingType:exactMatch",'completionType:A']
		},

		initialize: function(configOverrides) {
			this.setStageViews({
				small: ClozeTextViewerSmallStageView,
				normal: ClozeTextViewerStageView
			});

			this.propsView = ClozeTextViewerPropsView;

			this._super(configOverrides, config());

			if (!this.record.data.answerFields) {
				repo.startTransaction({ ignore: true });
				repo.updateProperty(this.record.id, 'answerFields', {}, false, true);
				repo.endTransaction();
			}

		},

		create_properties_text: function f117(selectedElement) {
			this.view && this.view.dispose();


			this.selectedElement = selectedElement;
			this.selectedElementType = "text";

			this.generateJSON();

			//found AF number inside of cloze task
			var arr_keys = Object.keys(this.record.data.answerFields);
			var af_num = arr_keys.indexOf(this.selectedElement.attr('id')) + 1;

			this.view = new AnswerFieldTypeTextPropsView({ controller: this, af_num : af_num,
				 model: this.record.data.answerFields[this.selectedElement.attr('id')] });
			this.propsSelectedElement = $(".editor-wrapper.AnswerFieldTypeText_editor.props_editor");

			this.view.init();
			this.view.onChangeEvents();
		},

		removeElement: function f118(id) {
			if (this.record.data.answerFields[id]) {
				var _answer = this.record.data.answerFields[id];

				if (_answer.conditionsData) {
					repo.deleteProperty(this.record.id, 'conditionsData', false, true);
					delete this.model.attributes.conditionsData;
				}

				if (_answer.additionalExactMatch) {
					repo.deleteProperty(this.record.id, 'additionalExactMatch', false, true);
					delete this.model.attributes.additionalExactMatch;
				}

				var newAF = _.omit(_.clone(this.record.data.answerFields), id);
				repo.updateProperty(this.record.id, 'answerFields', newAF, false, true);
				delete this.model.attributes.answerFields[id];
			}

			if (this.record.data.answerMarkup && this.record.data.answerMarkup[id]) {
				delete this.record.data.answerMarkup[id];
			}

			this.startPropsEditing();
		},

		create_properties_mathfield: function f119(selectedElement) {
			this.view && this.view.dispose();

			this.selectedElement = selectedElement;
			this.selectedElementType = "mathfield";

			this.generateJSON();

			if (AnswerFieldTypeMathfieldConfig.constants) {
				this.constants = AnswerFieldTypeMathfieldConfig.constants;
			}
			//found AF number inside of cloze task
			var arr_keys = Object.keys(this.record.data.answerFields);
			var af_num = arr_keys.indexOf(this.selectedElement.attr('id')) + 1;

			this.view = new AnswerFieldTypeMathfieldPropsView({ controller: this, af_num : af_num,
				model: this.record.data.answerFields[this.selectedElement.attr('id')] });
			this.propsSelectedElement = $(".editor-wrapper.answerFieldTypeMathfield_editor.props_editor");

			this.view.init();
			this.view.onChangeEvents();

			if (this.isCompletionTypeMode()) {
				var mf = this.selectedElement.find("mathfieldtag");
				if (!this.record.data.answerMarkup) {
					repo.updateProperty(this.record.id, 'answerMarkup', {});
				}

				if (!this.record.data.answerMarkup[this.selectedElement.attr('id')]) {
					this.record.data.answerMarkup[this.selectedElement.attr('id')] = {
						markup: this.record.data.mathfieldArray[mf.attr('id')].markup,
						widthEM: 0
					};
				}
				//this.setAnswerCompletionType(this.record.data.mathfieldArray[mf.attr('id')].markup);
				this.view.setAnswerFieldMathfield(this.record.data.answerMarkup[this.selectedElement.attr('id')], function (correctAnswerMarkup, correctAnswerWidthEm) {
            		this.record.data.answerMarkup[this.selectedElement.attr('id')].markup = correctAnswerMarkup;
            		this.record.data.answerMarkup[this.selectedElement.attr('id')].widthEM = correctAnswerWidthEm;
            	}.bind(this), this.record.data.mathfieldArray[mf.attr('id')].markup);
			}
		},
		isCompletionTypeMode: function () {
			var cloze = repo.getAncestorRecordByType(this.record.id, 'cloze');
			var progress = repo.getChildrenRecordsByType(cloze.id, 'advancedProgress')[0];
			var cloze_answer = repo.getChildrenRecordsByType(cloze.id, 'cloze_answer')[0];

			return progress.data.checking_enabled && cloze_answer.data.interaction === 'write' && this.record.data.completionType === 'C';
		},
		refresh: function f120() {
			this['create_properties_' + this.selectedElementType].call(this, this.selectedElement);
		},

		setMaxChars: function() {
			if (this.selectedElement) {
				var newMaxChars;
				switch (this.model.get('answer_size')) {
					case 'Letter':
						newMaxChars = 1;
						break;
					case 'Line':
						newMaxChars = 45;
						break;
					case 'Custom':
						newMaxChars = 80;
						break;
					case 'Word':
					default:
						newMaxChars = 15;
				}
				this.selectedElement.attr('disabledMaxChars', newMaxChars == 1);
				this.selectedElement.attr('MaxChars', newMaxChars);
				this.OnMaxCharsChange();
			}
		},

		OnMaxCharsChange: function() {
			if (this.selectedElement) {
				var chars = parseInt(this.selectedElement.attr('MaxChars')) || 150;
				this.selectedElement.parent('answerfield').width(chars * 10);
				this.stage_view.setIframeHeight();
			}
		},

		setMFWidth: function(val) {
			if (this.selectedElement) {
				this.selectedElement.parent('answerfield').attr({ fieldWidth: val });
				this.stage_view.setIframeHeight();
			}
		},

		update_field: function f121(id) {
			var el = this.stage_view.getElement(id);
			var el_parent = $(el).parent().get(0);

			// #CREATE-4624 - fix for old courses where FITG Answer Scenarios
			// would delete saved answers when checkind other answers groups;
			var _ref_json = {};
			// poor man's property missing handling
			try {
				_ref_json = this.record.data.answerFields[id];
			} catch (e) {
			}

			var _json_data = this.getElementAsJSON(el.get(0), _ref_json);

			repo.updatePropertyObject(this.record.id, 'answerFields', id, require('cgsUtil').cloneObject(_json_data));

			this.initDefaultValues(el.attr('type'), el);
		},

		initDefaultValues: function f122(type, element) {
			var defaultValues = this.defaultValues[type];

			_.each(defaultValues, _.bind(function f123(item) {
				if (item.indexOf(":") === -1) return;

				var _split = item.split(":"),
					k = _split[0],
					v = _split[1];

				if (v === "parent") {
					v = this.getParentProperty(k);

					this.setDefaultValue(element.attr('id'), element, k, v);
				} else {
					this.setDefaultValue(element.attr('id'), element, k, v);
				}
			}, this));
		},

		setDefaultValue: function f124(id, element, propName, value) {
			if (this.record.data.answerFields[id]) {
				if (!this.record.data.answerFields[id][propName]) {
					var af = require('cgsUtil').cloneObject(this.record.data.answerFields[id]);
					af[propName] = value;
					repo.updatePropertyObject(this.record.id, 'answerFields', id, af, true);
					element.attr(propName, value);
				}
			}
		},

		getParentProperty: function f125(prop) {
			var _record = repo.get(this.record.parent);

			if (_record.data[prop]) {
				return _record.data[prop];
			} else {
				return false;
			}
		},

		onChangeBankAnswers: function () {
			var cloze_answer = repo.getAncestorRecordByType(this.record.id, 'cloze_answer');

			if (cloze_answer && cloze_answer.data.useBank) {
				var cloze_bank = repo.getChildrenRecordsByType(cloze_answer.id, 'clozeBank');
					cloze_bank = cloze_bank && cloze_bank[0];

				var cloze_bank_controller = require("repo_controllers").get(cloze_bank.id);

				if (cloze_bank_controller) {
					cloze_bank_controller.setDefaultList(true);
				}
			}
		},

		attachAttribute: function f126(target) {
			if (target.changed) {
				var key = _.keys(target.changed)[0],
					value = _.values(target.changed)[0];

				if (typeof value === 'object') value = JSON.stringify(value);

				var changeAttribute = function(){

					this.selectedElement.attr(key, value);
					this.update_field(this.selectedElement.attr('id'));

					this.stage_view.isStartEditing = true;
					this.stage_view.saveData();

					if (target.changed.ExpectedWrong) {
						this.onChangeBankAnswers();
					}
				}.bind(this);
							//display the dialog only if were cahnging "from" or "to" completion
				if (key === "completionType" && (value == "C" || this.record.data.completionType == 'C')) {
					this.completionChangeAlertDialog(function () {
						changeAttribute();

						if (this.record.data.answerFields[this.selectedElement.attr('id')].additionalExactMatch) {
							delete this.record.data.answerFields[this.selectedElement.attr('id')].additionalExactMatch;

							repo.deleteProperty(this.record.id, 'additionalExactMatch', false, true);

							delete this.model.attributes.additionalExactMatch;

							this.selectedElement.removeAttr('additionalExactMatch');
						}

						this.setAnswerCompletionType();


						this.create_properties_mathfield(this.selectedElement);
					}.bind(this));
				}else{
					changeAttribute();
				}


                //this.propagateChanges(this.record, key, true);
				//this.refresh();
			}
		},

		completionChangeAlertDialog: function(callback){
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
						callback();
					}
					if(response== 'cancel'){
						//set the value in drop down to previous value
						var previousVal = self.model._previousAttributes.completionType;
						self.view.$("#completionType").val(previousVal);
						self.model.attributes.completionType = previousVal;
					}
				});

		},

		clearCompletionMathfields: function () {

            _.each(this.stage_view.body.find('mathfieldtag, mathfield'), function (mathfield) {
                var mfId = $(mathfield).attr('id');
                var mf_data = this.record.data.mathfieldArray[mfId];

                if ($(mathfield).parent().is('ANSWERFIELD')) {
                    var af_el = $(mathfield).parent();

                    if (af_el.attr('completiontype') === 'C') {
                    	mf_data.markup = "";

	                    if (this.record.data.answerFields[af_el.attr('id')]) {
	                    	this.record.data.answerFields[af_el.attr('id')].completionType = 'A';

	                    	delete this.record.data.answerFields[af_el.attr('id')].additionalExactMatch;
	                    }

	                    if (this.record.data.answerMarkup && this.record.data.answerMarkup[af_el.attr('id')]) {
	                    	delete this.record.data.answerMarkup[af_el.attr('id')];
	                    }

						af_el.attr('completiontype', 'A');
	                    af_el.removeAttr('additionalExactMatch');
                    }

                }

            }, this);
        },

		setAnswerCompletionType: function (markup) {
			var mfId = this.selectedElement.find('mathfieldtag').attr('id');

			this.stage_view.removeMathfield(this.selectedElement.find('mathfieldtag'));

			var mfElement = this.stage_view.insertMathfieldTag(this.selectedElement);

			mfElement.attr('id', mfId);

			var keyboardPreset = this.getKeyboardPreset(mfElement);
			var mathfield_config = this.stage_view.getMathfieldConfiguration({
	            keyboardPreset: keyboardPreset,
	            parentContainer: this.stage_view.isTableChild() ? $('body') : mfElement.parents('div'),
	            fontLocale: require("localeModel").getConfig("mfConfig").fontLocale
	        });

	        if (keyboardPreset === 'contentEditorMathField_Completion') {
	        	mathfield_config.onChange = function () {
	            	var markup = this.stage_view.getMathfieldMarkup(mfElement);
	            	var widthEm = this.stage_view.getMathfieldWidthEM(mfElement);
	            	var answerMarkup = this.record.data.answerMarkup || {};
	            	var defaultMarkup;

	            	if (answerMarkup[this.selectedElement.attr('id')] && answerMarkup[this.selectedElement.attr('id')].markup === markup) {
						return;
	            	}

	            	answerMarkup[this.selectedElement.attr('id')] = {
	            		markup: markup
	            	};

	            	repo.updateProperty(this.record.id, 'answerMarkup', answerMarkup);

	            	if (this.view && this.view.growingMathfieldListComponent) {
                        this.view.growingMathfieldListComponent.setMathfieldState($("<state></state>").append($("<markup></markup>").append(markup)));
                    }
                    if (this.record.data.mathfieldArray[this.selectedElement.find('mathfieldtag').attr('id')]) {
                    	var mfArrayMathfield = this.record.data.mathfieldArray[this.selectedElement.find('mathfieldtag').attr('id')];

	                    mfArrayMathfield.markup = markup;
	                  	mfArrayMathfield.widthEM = widthEm;

	                  	defaultMarkup = markup;
                    } else {
                    	defaultMarkup = mf && mf.view && mf.view.getMarkUpValue();
                    }


	            	this.view.setAnswerFieldMathfield(answerMarkup[this.selectedElement.attr('id')], function (correctAnswerMarkup, correctAnswerWidthEm) {
	            		answerMarkup[this.selectedElement.attr('id')] = {
	            			markup: correctAnswerMarkup,
	            			widthEM: correctAnswerWidthEm
	            		};

	            		repo.updateProperty(this.record.id, 'answerMarkup', answerMarkup);
	            	}.bind(this), defaultMarkup);
	            }.bind(this);
	        }

			var mf = this.stage_view.initMathField(mfElement.attr('id'), mathfield_config, markup);

	        if (mf) {
	            mf.view.setEnabled(true);

	            this.stage_view.mathfieldArr[mfElement.attr('id')] = mf;

	            this.record.data.mathfieldArray[mfElement.attr('id')] = {
	            	markup: mf.view.getMarkUpValue(),
	            	widthEM: mf.view.getWidthEM()
	            }
	        }

	        if (keyboardPreset === "contentEditorMathField") {
	        	this.view && this.view.hideAnswerFieldMathfield();

	        	if (this.record.data.answerMarkup && this.record.data.answerMarkup[this.selectedElement.attr('id')]) {
	        		delete this.record.data.answerMarkup[this.selectedElement.attr('id')];
	        	}
	        }
		},

		generateJSON: function f127() {
			if (this.selectedElement.length) {
				var _ref_json;

				if (this.record.data.answerFields[this.selectedElement.attr('id')]) {
					_ref_json = this.record.data.answerFields[this.selectedElement.attr('id')];
				}

				var _updated_json = this.getElementAsJSON(this.selectedElement.get(0), _ref_json, this.selectedElementType);

				_.each(this.changes[_updated_json.type], _.bind(function f128(item) {
					if (this.record.data[item]) {
						delete this.record.data[item];
					}
				}, this));

				return $.extend(true, this.record.data, _updated_json);
			}
		},

		getElementAsJSON: function f129(element, ref_json, type) {
			if (!element || !element.attributes || !element.attributes.length) return false;

			var _json = ref_json || {};
			var _elementType = type || $(element).attr("type");

			if (!_.isObject(_json)) return false;

			_.each(element.attributes, _.bind(function f130(item) {
				_.each(this.changes[_elementType], _.bind(function f131(key) {
					if (key.toLowerCase() === item.name) {
						try {
							_json[key] = JSON.parse(item.nodeValue);
						} catch (e) {
							_json[key] = item.nodeValue;
						}
					}
				}, this));
			}, this));

			return _json;
		},

		getMode: function f132() {
			var _cloze_answer_field_record = repo.get(this.record.parent);
			var _fields_num = _cloze_answer_field_record.data.fieldsNum;

			return _fields_num;
		},

		viewRegisterEvents: function f133() {
			if (this.selectedElement && this.selectedElementType) {
				var changes = this.changes[this.selectedElementType];
				var _changesHandlers = {};

				_.each(changes, _.bind(function f134(item) {
					_changesHandlers[item] = _.bind(this.attachAttribute, this);
				}, this));

				this.model = this.screen.components.props.startEditing(this.record, _changesHandlers, this.propsSelectedElement);
			}

		},

		startEditing: function(e) {
			// Check if it's checkable task
			var cloze = repo.getAncestorRecordByType(this.record.id, 'cloze'),
				progress = repo.getChildrenRecordsByType(cloze.id, 'advancedProgress')[0];

			var textMenu = _.find(this.config.menuItems, { id: 'menu-button-text-editor' }),
				insertMenu = _.find(textMenu && textMenu.subMenuItems, { id: 'menu-button-insert' });

			if (insertMenu) {
				if (progress && !progress.data.checking_enabled) {
					insertMenu.subMenuItems = _.reject(insertMenu.subMenuItems, { id: 'menu-button-insert-af' });
					if (!_.find(insertMenu.subMenuItems, { id: 'menu-button-insert-af-uncheckable' })) {
						insertMenu.subMenuItems.push({
                            'id': 'menu-button-insert-af-uncheckable',
                            'icon': 'af',
                            'label' : '((AF))',
                            'canBeDisabled' : true,
                            'dontStealFocus' : true,
                            'event': 'executeCommand',
                            'args': ['insertAnswerField', 'text'],
                            'dropDownItems': [
                                {
                                    'id':'menu-button-insert-af-text',
                                    'label' : '((Text))',
                                    'event':'executeCommand',
                                    'args' :['insertAnswerField', 'text'],
                                    'dontStealFocus' : true
                                },
                                {
                                    'id':'menu-button-insert-af-mf',
                                    'label' : '((Math))',
                                    'event':'executeCommand',
                                    'args' :['insertAnswerField', 'mathfield'],
                                    'dontStealFocus' : true
                                }
                            ]
                        });
					}
				}
				else {
					insertMenu.subMenuItems = _.reject(insertMenu.subMenuItems, { id: 'menu-button-insert-af-uncheckable' });
					if (!_.find(insertMenu.subMenuItems, { id: 'menu-button-insert-af' })) {
						insertMenu.subMenuItems.push({
                            'id': 'menu-button-insert-af',
                            'icon': 'af',
                            'label' : '((AF))',
                            'event': 'executeCommand',
                            'args': ['insertAnswerField', null],
                            'canBeDisabled': true,
                            'dontStealFocus': true
					});
					}
				}
			}


			this._super(e);
		},

		endEditing: function(){

			this._super();
			//fire event only if there is a bank
			if (repo.get(this.record.parent) && repo.get(this.record.parent).data.fieldsNum === 'single' && repo.get(this.record.parent).data.useBank && this.stage_view.$('iframe.textViewerEditor').find('document').length &&  events.exists("setDefaultBankValues")) {
				events.fire("setDefaultBankValues");
			}

		}

	},{
		valid : function f135(elem_repo) {

			var validationResult = {valid : true,report : []};
			//check answers field avilable
			if(!_.keys(elem_repo.data.answerFields).length) {
				validationResult.valid = false;
				validationResult.report.push(require('validate').setReportRecord(elem_repo,"Please Insert at least one answer in the answer area"));
				validationResult.bubbleUp = true;
			}

			//get advenced progress
			var cloze = repo.getAncestorRecordByType(elem_repo.id,'cloze');
			var advancedProgress = _.first(repo.getChildrenRecordsByType(cloze.id,'advancedProgress'));
			//check if checking enabled
			if(advancedProgress.data.checking_enabled) {
				//check if at least one  answer fields  empty (type text)
				var result = $("<div>" + elem_repo.data.title + "</div>").find('answerfield').map(function f136() {
					//check if the answer field is math field
					if($(this).find('mathfield').length){
						var mathfieldid  = $(this).find('mathfield').attr('id');
						var mfData = elem_repo.data.mathfieldArray[mathfieldid];

						//check if the mathfield answerfield is of type completion, but the correct answer wasnt set
						if(elem_repo.data.answerMarkup){
							var answerMarkup = elem_repo.data.answerMarkup[$(this).attr('id')];
							if(answerMarkup){
								var competionTags = $('<div>'+elem_repo.data.answerMarkup[$(this).attr('id')].markup+'</div>').find('completion');
								if(competionTags.length){
									var emptyCompletion = _.map(competionTags, function(tag){return $(tag).html()})
									if( emptyCompletion.indexOf('') >-1){
										return 'emptyCompletion';
									}
								}
							}
						}
						return !!(mfData && mfData.markup);
					}
					if($(this).find('mathfieldtag').length) {
						return false
					}
					//check if the answer field is mathfieldtag
					else{
						return $.trim($(this).find('span').text());
					}
				});

        // We allow empty gaps so there is no need for the next check
				/*if(result.toArray().indexOf("") > -1 || result.toArray().indexOf(false) > -1){
					validationResult.valid = false;
					validationResult.report.push(require('validate').setReportRecord(elem_repo,"There is an empty answer. Insert at least one answer in the Answer area."));
					validationResult.bubbleUp = true;
				}*/
				if(result.toArray().indexOf("emptyCompletion") > -1){
					validationResult.valid = false;
					validationResult.report.push(require('validate').setReportRecord(elem_repo,"validation.answerfield.mathfield.completion.empty"));
					validationResult.bubbleUp = true;
				}
				//if the answerfield (mathfield) checking type is condition- we need to check that the condition was entered.
				_.each(elem_repo.data.answerFields, function(answerField){
					if(answerField.checkingType == "condition"){
						var validCondition = true;
						if(answerField.conditionsData){
							for (var i = 0; i <answerField.conditionsData.length ; i++) {
								var condition = answerField.conditionsData[i];
								for (var j = 0; j < condition.innerList.length; j++) {
									var rule = condition.innerList[j];
									if(!rule.markup || !rule.markup.length){
										validCondition = false;
										break;
									}
								}
								if(!validCondition){
									break;
								}
							}

						}else{
							validCondition = false;
						}
						if(!validCondition){
							validationResult.valid = false;
							validationResult.report.push(require('validate').setReportRecord(elem_repo,"validations.mathfield.condition.emptyRule"));
							validationResult.bubbleUp = true;
						}
					}

				})

			}
			return  validationResult;
		}
	});

	return ClozeTextViewerEditor;

});
