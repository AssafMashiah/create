define(['modules/BaseTaskEditor/BaseTaskEditor', 'repo', 'events', 'localeModel', './config', './constants',
	    './FeedbackPropsView', './FeedbackStageView'],
	function(BaseTaskEditor, repo, events, localeModel, config, constants,
	         FeedbackPropsView, FeedbackStageView) {

		var FeedbackEditor = BaseTaskEditor.extend({

			initialize: function(configOverrides) {
                this._super(/*config*/{
                    menuInitFocusId: config.menuInitFocusId,
                    menuItems: []
                }, configOverrides);
				this.constants = require('cgsUtil').cloneObject(constants);

				$.extend(true, this.constants.feedbacks, localeModel.getConfig('stringData').feedbacks);

				this.feedbacks_map = require('cgsUtil').cloneObject(this.record.data.feedbacks_map) || {};
				this.feedbacks_map_specific = require('cgsUtil').cloneObject(this.record.data.feedbacks_map_specific) || {};
				this.feedbacks_predefined_list = [];
				this.arr_options = [];

				repo.startTransaction({ ignore: true });

				this.createPredefinedFeedBacksList();
				this.deleteGenericFeedbacksNotInUse();

				this.feedback_type = repo.get(this.record.parent).data.feedback_type;

				//create generic feedbacks (Generic or Specific types)
				if(!!this.record.data.feedbacksToDisplay.length) {
					this.createGenericFeedbacks(this.record.data.feedbacksToDisplay, {});
				}

				if(this.feedback_type == 'advanced') { //Generic + Specific
					this.loadOptionsArray();
					this.deleteSpecificFeedbacksNotInUse();
					this.createSpecificFeedbacks();
				} else {
					this.deleteAllSpecificFeedbacks();
				}

				repo.updateProperty(this.record.id, 'feedbacks_map', this.feedbacks_map);
				repo.updateProperty(this.record.id, 'feedbacks_map_specific', this.feedbacks_map_specific);

				this.stage_view = new FeedbackStageView({controller:this});

				var needToReloadPredifinedList = true;

				if (!this.record.predefined_list) {
					var types = require('types'),
						task = _.find(repo.getAncestors(this.record.id), function(item) { return types[item.type] && types[item.type].selectTaskType }),
						children = repo.getSubtreeRecursive(task && task.id),
						prefix = '', mode = '', ftype = '';

					// Set predefined list by task type and settings
					switch (task && task.type) {
						case 'mc':
							prefix = 'mc';
							mode = _.find(children, function(item) { return item.type == 'mcAnswer' }).data.answerMode == 'mc' ? 'single_answer' : 'multiple_answer';
							ftype = _.find(children, function(item) { return item.type == 'progress' }).data.feedback_type;
							if (mode == 'single_answer') {
								ftype = (ftype == 'advanced') ? 'generic_specific' : ((ftype == 'basic') ? 'generic' : ftype);
							}
							else {
								ftype = (ftype == 'generic') ? 'basic' : ftype;
							}
							break;
						case 'cloze':
							prefix = 'fill_the_gaps';
							mode = _.find(children, function(item) { return item.type == 'cloze_answer' }).data.fieldsNum == 'single' ? 'single' : 'multiple';
							ftype = '';
							break;
						case 'ShortAnswer':
							prefix = 'short_answer';
							mode = _.find(children, function(item) { return item.type == 'ShortAnswerAnswer' }).data.fieldsNum == 'SingleAnswerMode' ? 'single' : 'multiple';
							ftype = '';
							break;
						case 'matching':
						case 'sorting':
						case 'sequencing':
							prefix = task.type;
							mode = ftype = '';
							break;
						case 'appletTask':
						case 'livePageAppletTask':
							prefix = 'Applet_Task';
							mode = ftype = '';
							break;
					}
					this.record.predefined_list = _.compact([prefix, mode, ftype]).join('_');
				}

				if (!this.config.previewMode) {
					this.startPropsEditing();
					this.startStageEditing();

					// Don't load predefined list on custom list
					if (this.record.predefined_list != $('#predefined_feedbacks').val()) {
						if (!this.record.predefined_list) {
							// Set default to the first list
							this.record.predefined_list = $('#predefined_feedbacks').val();
						}
						this.loadPredefinedList(this.record.predefined_list);
						needToReloadPredifinedList = false;
					}
				}
				//reload the predifined list if not happend yet, 
				//to get the data when user changes the feedback type from the progress editor drop down
				if(needToReloadPredifinedList && this.record.predefined_list!= this.constants.custom_list_label){
					this.loadPredefinedList(this.record.predefined_list);
				}

				repo.endTransaction();
			},

			startPropsEditing: function(){
				this.view = new FeedbackPropsView({controller:this});
			},

			startStageEditing: function(){
				this.showStagePreview($('#stage_base'), {bindEvents: true});
				this.stage_view.updatePredefinedList(this.record.predefined_list);
			},

			/*
			Mapping of all options for each task with specific feedback
			Structures:
			------------------------------------------------------------
			(mc)
			[
				{
					id: ..., // id of mc option
					dataType: 'repoChild',
					data: {
						child: ..., // id of option child
					},
					isCorrect: ... // is the option is correct answer
				}
			]
			------------------------------------------------------------
			(cloze - write)
			[
				{
					id: ..., // id of answer field
					dataType: 'textViewerPart' or 'mathfield',
					data: {
						previewText: ..., // text for answer preview render (if it's part of textviewer)
						mathfieldArray: ..., // mathfields array of the textviewer (if it's part of textviewer)
						markup: ... // mathfield markup (if it's mathfield answer field in table)
					},
					children: [
						{
							id: ..., // id of additional answer
							dataType: 'textViewerPart' or 'mathfield',
							data: {
								previewText: ..., // text for answer preview render (if it's part of textviewer)
								mathfieldArray: ..., // mathfields array of the textviewer (if it's part of textviewer)
								markup: ... // mathfield markup (if it's exact match mathfield)
							},
							feedbackType: ... // Type of feedback ('correct', 'partially', 'wrong')
						}
					]
				}
			]
			------------------------------------------------------------
			(cloze - drag&drop)
			like cloze - write with additional option
			[
				{
					'default': true // For adding default correct and incorrect feedbacks
				}
			]
			*/
			loadOptionsArray: function() {
				this.arr_options = [];
				// Get task record
				var task = _.find(repo.getAncestors(this.record.id), function(rec) {
					return require('types')[rec.type] && require('types')[rec.type].selectTaskType;
				})

				if (!task) return;

				// Get full answer field data
				function getAnswerData(id, data, isMathfield) {
					var children_data = [];

					// If it's text answer field - get additional correct, partially correct and expected wrong lists entries
					if (!isMathfield) {
						if (data.showAdditionalCorrectAnswers) {
							children_data = _.union(children_data, _.map(data.AdditionalCorrectAnswers, function(answer) {
								return {
									id: answer.id || (answer.id = repo.genId()),
									parentId: id,
									dataType: 'textViewerPart',
									data: {
										previewText: answer.item
									},
									feedbackType: 'correct',
									isCorrect: true
								}
							}));
						}

						if (data.showPartiallyCorrectAnswers) {
							children_data = _.union(children_data, _.map(data.PartiallyCorrectAnswers, function(answer) {
								return {
									id: answer.id || (answer.id = repo.genId()),
									parentId: id,
									dataType: 'textViewerPart',
									data: {
										previewText: answer.item
									},
									feedbackType: 'partially',
									isPartial: true
								}
							}));
						}

						if (data.showExpectedWrong) {
							children_data = _.union(children_data, _.map(data.ExpectedWrong, function(answer) {
								return {
									id: answer.id || (answer.id = repo.genId()),
									parentId: id,
									dataType: 'textViewerPart',
									data: {
										previewText: answer.item
									},
									feedbackType: 'wrong',
									isCorrect: false
								}
							}));
						}
					}
					// If it's mathfield answer field - get exact match mathfields
					else {
						children_data = _.union(children_data, _.map( data.checkingType =="exactMatch" ? data.additionalExactMatch : null, function(answer) {
							return {
								id: answer.id || (answer.id = repo.genId()),
								parentId: id,
								dataType: 'mathfield',
								data: {
									markup: answer.markup,
									editMode: data.completionType === 'C' ? 'completion' : 'off'
								},
								feedbackType: 'correct',
								isCorrect: true
							};
						}));
					}

					return {
						id: id,
						children: children_data
					}
				}

				if (task.type == 'mc') { // The task is mc - get all mc options
					this.taskType = 'mc';
					var mcAnswer = repo.getChildrenRecordsByType(task.id, 'mcAnswer');
					if(mcAnswer.length) {
						this.arr_options = _.chain(repo.getChildrenRecordsByType(mcAnswer[0].id, 'option'))
											.map(function(option) {
												return {
													id: option.id,
													dataType: 'repoChild',
													data: {
														child: option.children[0]
													},
													isCorrect: !!option.data.correct
												}
											})
											.sortBy(function(option) { // Order by correct -> incorrect
												return option.isCorrect ? 0 : 1;
											})
											.value();
					}
				}
				else if (task.type == 'cloze') { // The task is cloze - get all answer fields
					var cloze_answer = repo.getChildrenRecordsByType(task.id, 'cloze_answer');
					cloze_answer = cloze_answer.length && cloze_answer[0];
					if(cloze_answer) {
						// The cloze task is in write mode
						if (cloze_answer.data.interaction == 'write') {
							this.taskType = 'cloze_write';
							// Get data for each answer field in task (text mode)
							_.each(repo.getChildrenRecordsByType(cloze_answer.id, 'cloze_text_viewer'), function(ctv) {
								this.arr_options = _.map(ctv.data.answerFields, function(af, key) {
									var isMathfield = af.type == 'mathfield';

									var answer = getAnswerData(key, af, isMathfield);
									var dataType = isMathfield ? 'mathfield' : 'textViewerPart';
									var dataStructure = {
										dataType: dataType,
										data: {}
									};

									//check if we are not mathfield, use the normal getHtmlFormatter to compile the title
									if (!isMathfield) {
										//pass the text viewer text and the mathfieldArray
										dataStructure.data = _.extend(dataStructure.data, {
											previewText: $('<div />').html(ctv.data.title).find('[id=' + key + ']').html(),
											mathfieldArray: ctv.data.mathfieldArray
										});
									} else {
										var markup = null;
										var editMode = 'off';
										//if we in mathfield completion type mode, we take the  markup from answerMarkup object
										if (ctv.data.answerMarkup && ctv.data.answerMarkup[answer.id]) {
											markup = ctv.data.answerMarkup[answer.id].markup;
											editMode = 'completion';
										} else {
											//else we are find the id of mathfield and get the markup from the mathfield array;
											var mfId = $('<div />').html(ctv.data.title).find('[id=' + key + ']').find('mathfield').attr('id');

											markup = ctv.data.mathfieldArray[mfId] && ctv.data.mathfieldArray[mfId].markup
										}

										dataStructure.data = _.extend(dataStructure.data, {
											markup:markup,
											editMode: editMode
										})
									}


									return _.extend(answer, dataStructure);
								});
							}, this);

							// Get data for each text answer field in task (table mode)
							this.arr_options = _.union(this.arr_options, _.map(repo.getChildrenByTypeRecursive(cloze_answer.id, 'AnswerFieldTypeText'), function(af) {
								return _.extend(getAnswerData(af.id, af.data, false), {
									dataType: 'textViewerPart',
									data: {
										previewText: af.data.title,
										mathfieldArray: af.data.mathfieldArray
									}
								});
							}));

							// Get data for each mathfield answer field in task (table mode)
							this.arr_options = _.union(this.arr_options, _.map(repo.getChildrenByTypeRecursive(cloze_answer.id, 'answerFieldTypeMathfield'), function(af) {
								var answer = getAnswerData(af.id, af.data, true);
								var dataStructure = {
										dataType: 'mathfield',
										data: {}
									};
								var markup;
								var editMode = 'off';

								if (af.data.answerMarkup) {
									markup = af.data.answerMarkup.markup;
									editMode = 'completion';
								} else {
									markup = af.data.markup;
								}

								return _.extend(answer, {
									dataType: 'mathfield',
									data: {
										markup: markup,
										editMode: editMode
									}
								});
							}));
						}
						// The cloze task is in drag & drop mode
						else {
							this.taskType = 'cloze_drag';
							var bank = repo.getChildrenRecordsByType(cloze_answer.id, 'clozeBank'),
								bankRecords = bank.length && repo.getChildren(bank[0]) || [],
								answerFields = _.union(
									// Get data for each answer field in task (text mode)
									_.flatten(_.map(repo.getChildrenRecordsByType(cloze_answer.id, 'cloze_text_viewer'), function(ctv) {
                                        return $.makeArray($('<div />').html(ctv.data.title).find('answerfield').map(function(i, answerfield) {
                                            var $answerfield = $(answerfield);
                                            var answerfieldType = $answerfield.attr('type');

                                            if (answerfieldType == 'mathfield') {
                                                return {
                                                    id: $answerfield.attr('id'),
                                                    dataType: 'textViewerPart',
                                                    data: {
                                                        previewText: $answerfield.html(),
                                                        mathfieldArray: ctv.data.mathfieldArray
                                                    }
                                                };
                                            } else { // (answerfieldType == 'text')
                                                var $span = $answerfield.children('span');
                                                return {
                                                    id: $span.attr('id'),
                                                    dataType: 'textViewerPart',
                                                    data: {
                                                        previewText: $span.html(),
                                                        mathfieldArray: ctv.data.mathfieldArray
                                                    }
                                                };
                                            }
                                        }));
									})),
									// Get data for each text answer field in task (table mode)
									_.map(repo.getChildrenByTypeRecursive(cloze_answer.id, 'AnswerFieldTypeText'), function(af) {
										return {
											id: af.id,
											dataType: 'textViewerPart',
											data: {
												previewText: af.data.title,
												mathfieldArray: af.data.mathfieldArray
											}
										}
									}),
									// Get data for each mathfield answer field in task (table mode)
									_.map(repo.getChildrenByTypeRecursive(cloze_answer.id, 'answerFieldTypeMathfield'), function(af) {
										return {
											id: af.id,
											dataType: 'mathfield',
											data: {
												markup: af.data.markup
											}
										}
									})
								);

							// Wrong options for each answer field are:
							//				1. All other answer fields
							//				2. All bank options
							this.arr_options = _.map(answerFields, function(answerField) {
								return {
									id: answerField.id,
									dataType: answerField.dataType,
									data: answerField.data,
									children: _.union(
													_.chain(answerFields)
														.filter(function(af) { return af.id != answerField.id; })
														.map(function(af) { 
															return {
																id: af.id,
																parentId: answerField.id,
																dataType: af.dataType,
																data: af.data,
																feedbackType: 'wrong',
																isCorrect: false
															} 
														})
														.value(),
													_.map(bankRecords, function(bankRec) {
														return {
															id: bankRec.id,
															parentId: answerField.id,
															dataType: 'textViewerPart',
															data: {
																previewText: bankRec.data.title,
																mathfieldArray: bankRec.data.mathfieldArray
															},
															feedbackType: 'wrong',
															isCorrect: false
														};
													})
												)

								}
							});

                            var clozeData = repo.getAncestorRecordByType(this.record.id, 'cloze');
                            if (clozeData) {
                                var clozeAnswerData = repo.getChildrenRecordsByType(clozeData.id, 'cloze_answer')
                                if(clozeAnswerData.length && clozeAnswerData[0].data.reuseItems) {
                                    this.filterDuplicatesArrOptions();
                                }
                            }

							this.arr_options.push({'default': true});
						}
					}
				}
				// task is matching or sorting
				else if( ['matching', 'sorting'].indexOf(task.type) > -1){

					var mtqAnswer = repo.getChildrenRecordsByType(task.id, task.type=='matching'? 'matchingAnswer' : "sortingAnswer");
					mtqAnswer = mtqAnswer.length && mtqAnswer[0];

					if(mtqAnswer) {
						//define the task tipe here , to make sure we are not in linking task
						this.taskType = 'mtq';

						var mtqBank = repo.getChildrenRecordsByType(mtqAnswer.id, 'mtqBank'),
						mtqBankRecords = mtqBank.length && repo.getChildren(mtqBank[0]) || [],
						arr_options = [],
						subQuestions = repo.getChildrenByTypeRecursive(mtqAnswer.id, 'mtqSubQuestion');

						// loop over sub answer to get the definition and the sub answers 
						for(var subQuestionIndex in subQuestions){
							var subQuestion = subQuestions[subQuestionIndex],
							option = {},
							definition = repo.getChildrenByTypeRecursive(subQuestion.id, 'definition');

							definition = definition && definition.length && definition[0];
							if(definition){
								option = {
									definition: true,
									id: definition.id,
									dataType: 'repoChild',
									data: {
										child: definition.children[0]
									}
								};
							}
							var subAnswers = repo.getChildrenByTypeRecursive(subQuestion.id, 'mtqSubAnswer');
							option.children = [];

							for (var subAnswerIndex in subAnswers) {
								var subAnswer = subAnswers[subAnswerIndex];
								// add children to data model- these are the correct answers
								option.children.push({
									id: subAnswer.id,
									additionalId : option.id,
									dataType: 'repoChild',
									data: {
										child: subAnswer.children[0]
									},
									isCorrect: true,
									feedbackType: 'correct',
								});
							}
							arr_options.push(option);
						}
						// map the data model to get all incorrect options - get combinations of other sub answers and bank items
						this.arr_options = _.map(arr_options, function(subQuestion) {

							subQuestion.children = _.union(
									// correct option/s
									subQuestion.children,
									// incorrect - from other sub answers
									_.flatten(_.chain(arr_options)
										.filter(function(otherSubQuestion) { return otherSubQuestion.id != subQuestion.id; })
										.map(function(otherSubQuestion) {
											return _.compact(_.map(otherSubQuestion.children, function(child){
												//get only the correct answers from other sub questions
												if(child.isCorrect){
													return {
														id: child.id,
														dataType: 'repoChild',
														additionalId : subQuestion.id,
														data: child.data,
														feedbackType: 'wrong',
														isCorrect: false,
													};
												}
												return null;
											}));
										})
										.value()),
										// incorrect- form bank
										_.map(mtqBankRecords, function(bankRec) {
											return {
												id: bankRec.id,
												dataType: 'repoChild',
												data: {
													child: bankRec.children[0]
												},
												feedbackType: 'wrong',
												isCorrect: false,
												additionalId : subQuestion.id
											};
										})
									);
							return subQuestion;
						});
						if(mtqAnswer.data.mtqMode == "one_to_many"){
							this.filterDuplicatesArrOptions();
						}
						// add default option
						this.arr_options.push({'default': true});
					}
				}
			},

            filterDuplicatesArrOptions: function() {
                var regexFindMathfieldId = /.*?id="(.+?)"/;
                var uniqueAnswers;
                var key;

                var fillUniqueAnswer = function(answer, uniqueAnswers) {

                    // Set key according to answer type
					switch(answer.dataType){

						// This means it's mathfield+table mode
						case 'mathfield':
							key = answer.data.markup;
						break;

						case 'textViewerPart':
							if (answer.data.previewText.search('<mathfield') == 0) { // cloze_text_viewer mode + answer type is mathfield
								var mathfieldId = answer.data.previewText.match(regexFindMathfieldId)[1];
								key = answer.data.mathfieldArray[mathfieldId].markup;
							} else { // // cloze_text_viewer mode + answer type is text
									key = answer.data.previewText.trim();
							}
						break;
						case 'repoChild':
						//special case in mtq, we dont need to compare the definition
							if(answer.definition){
								key = null;
							}else{

								var child = repo.getChildren(answer.id)[0];
								var convertedChild = require('json2xml').convert(repo._data ,child.id); // convert the element to an xml format
								key = require('conversion/custom/utils').getAnswerCompareKey($(convertedChild)); // get key to compare the element
							}
						break;
					}
                   

                    // Insert the key to the map only if it's unique
                    if (key && !(key in uniqueAnswers)) {
                        uniqueAnswers[key] = answer.id;
                    }
                };

                // Each option in arr_options should have unique map of a single gap options
                var option;
                for (var i in this.arr_options) {
                    option = this.arr_options[i];
                    uniqueAnswers = {};

                    // Build unique answers map
                    // Handle the correct answer
                    fillUniqueAnswer(option, uniqueAnswers);

                    // Handle the children (wrong answers)
                    _.each(option.children, function(child) {
                        fillUniqueAnswer(child, uniqueAnswers);
                    });

                    // Create unique id map out of the unique markup map
                    uniqueAnswers = _.invert(uniqueAnswers);

                    // Leave only children that exist in the uniqueAnswers map
                    option.children = _.filter(option.children, function (child) {
                        return (child.id in uniqueAnswers);
                    });
                }
            },

			createPredefinedFeedBacksList:function f753() {
				var list = "";
				for (list in this.constants.feedbacks) {
					this.feedbacks_predefined_list.push(list);
				}

				if(this.record.predefined_list == this.constants.custom_list_label) {
					this.feedbacks_predefined_list = _.union(this.feedbacks_predefined_list, this.record.predefined_list);
				}
			},

			updateCustomPredefinedList: function() {
				this.record.predefined_list = this.constants.custom_list_label;
				this.feedbacks_predefined_list = _.union(this.feedbacks_predefined_list, this.record.predefined_list);
				this.stage_view && this.stage_view.updatePredefinedList(this.record.predefined_list);
			},

			removeChild: function(child_obj) {
				child_obj.stage_view.remove();
				child_obj.stage_view.dispose();
				child_obj.dispose();
			},

			loadPredefinedList: function(list_name) {
				var predefined_list = this.constants.feedbacks[list_name], child, child_obj, self = this;

				repo.updateProperty(this.record.id, 'predefined_list', list_name, true);
				this.feedbacks_predefined_list = _.without(this.feedbacks_predefined_list, this.constants.custom_list_label);

				//remove only generic feedbacks
				_.each(this.record.data.feedbacksToDisplay, function(feedback, i){
					if(!!self.record.data.feedbacks_map[feedback]) {
						child_obj = _.where(self.stage_view.children_obj, {'elementId' : self.record.data.feedbacks_map[feedback].preliminary});

						if(!!child_obj.length) {
							self.removeChild(child_obj[0]);
							repo.remove(self.record.data.feedbacks_map[feedback].preliminary);
						}

						child_obj = _.where(self.stage_view.children_obj, {'elementId' : self.record.data.feedbacks_map[feedback].final});

						if(!!child_obj.length) {
							self.removeChild(child_obj[0]);
							repo.remove(self.record.data.feedbacks_map[feedback].final);
						}

						//remove from feedbacks_map array
						delete self.feedbacks_map[feedback];

						delete child_obj;
					}
				});

				this.feedbacks_map = require('cgsUtil').cloneObject(this.feedbacks_map);
				this.createGenericFeedbacks(this.record.data.feedbacksToDisplay, predefined_list);
				repo.updateProperty(this.record.id, 'feedbacks_map', this.feedbacks_map);

				this.startStageEditing();

				this.stage_view.updatePredefinedList(this.record.predefined_list);

			},

			deleteAllSpecificFeedbacks : function() {
				var feedbacks_map_specific = require('cgsUtil').cloneObject(this.feedbacks_map_specific);

				// Delete all feedbacks ids (remove from repo)
				_.each(feedbacks_map_specific, function f754(feedback, key) {
						if(repo.get(feedback.correct_feedback_id)) {
							repo.remove(feedback.correct_feedback_id);
						}

						if(repo.get(feedback.incorrect_feedback_id)) {
							repo.remove(feedback.incorrect_feedback_id);
						}

						_.each(feedback.related_feedbacks, function(related) {
							if (repo.get(related.feedback_id))
								repo.remove(related.feedback_id);
						});

						if (key == 'default_feedbacks') {
							if (feedback.correct && feedback.correct.feedback_id) {
								repo.remove(feedback.correct.feedback_id);
							}
							if (feedback.incorrect && feedback.incorrect.feedback_id) {
								repo.remove(feedback.incorrect.feedback_id);
							}
						}

						delete this.feedbacks_map_specific[key];
				}, this);
			},

			deleteSpecificFeedbacksNotInUse: function() {
				var feedbacks_map_specific = require('cgsUtil').cloneObject(this.feedbacks_map_specific);

				_.each(feedbacks_map_specific, function(feedback, key){
					if (key == 'default_feedbacks') return;

					var option = _.find(this.arr_options, function(opt) { return opt.id == key; });
					if (!option) { //remove this feedback
						//remove from feedbacks_map_specific array

						if (repo.get(feedback.correct_feedback_id)) {
							repo.remove(feedback.correct_feedback_id);
						}

						if (repo.get(feedback.incorrect_feedback_id)) {
							repo.remove(feedback.incorrect_feedback_id);
						}

						_.each(feedback.related_feedbacks, function(related) {
							if (repo.get(related.feedback_id))
								repo.remove(related.feedback_id);
						});

						delete this.feedbacks_map_specific[key];
					}
					else { 
						if (this.taskType == 'cloze_drag' && repo.get(feedback.incorrect_feedback_id)) {
							repo.remove(feedback.incorrect_feedback_id);
							delete this.feedbacks_map_specific[key].incorrect_feedback_id;
						}

						if (_.isBoolean(option.isCorrect)) {
							if (option.isCorrect && repo.get(feedback.incorrect_feedback_id)) {
								repo.remove(feedback.incorrect_feedback_id);
								delete this.feedbacks_map_specific[key].incorrect_feedback_id;
							}
							if (!option.isCorrect && repo.get(feedback.correct_feedback_id)) {
								repo.remove(feedback.correct_feedback_id);
								delete this.feedbacks_map_specific[key].correct_feedback_id;
							}
						}

						_.each(feedback.related_feedbacks, function(related, relatedKey) {
							if (!_.where(option.children, { id: relatedKey }).length && repo.get(related.feedback_id)) {
								repo.remove(related.feedback_id);
								delete this.feedbacks_map_specific[key].related_feedbacks[relatedKey]
							}
						}, this);
					}
				}, this);

				if (!_.where(this.arr_options, {'default': true}).length && feedbacks_map_specific['default_feedbacks']) {
					if (feedbacks_map_specific['default_feedbacks'].correct && repo.get(feedbacks_map_specific['default_feedbacks'].correct.feedback_id)) {
						repo.remove(feedbacks_map_specific['default_feedbacks'].correct.feedback_id)
					}
					if (feedbacks_map_specific['default_feedbacks'].incorrect && repo.get(feedbacks_map_specific['default_feedbacks'].incorrect.feedback_id)) {
						repo.remove(feedbacks_map_specific['default_feedbacks'].incorrect.feedback_id)
					}

					delete this.feedbacks_map_specific['default_feedbacks'];
				}
			},

			deleteGenericFeedbacksNotInUse: function() {

				if(!this.feedbacks_map) {
					return;
				}

				var feedbacks_map = _.clone(this.feedbacks_map);
				$.each(feedbacks_map, function f755(k, v) {
					if (v.type !== 'generic')
						delete feedbacks_map[k];
				});

				var feedbacksToDisplay = this.record.data.feedbacksToDisplay, self = this;

				_.each(feedbacks_map, function(feedback, key){
					if(_.indexOf(feedbacksToDisplay, key) < 0) { //remove this feedback
						//remove from feedbacks_map array
						delete self.feedbacks_map[key];

						if(!!repo.get(feedback.preliminary)) {
							repo.remove(feedback.preliminary);
						}

						if(!!repo.get(feedback.final)) {
							repo.remove(feedback.final);
						}

					}
				});

			},

			createSpecificFeedbacks: function() {

				function createFeedback(optionId) {
					var itemConfig = {
							"type": "textViewer",
							"parentId": this.config.id,
							"childConfig": {
								"tvEndEditingCallback": this.updateCustomPredefinedList.bind(this)
							},
							"data": { "disableDelete": true, "mode": "singleStyleNoInfoBaloon", "styleOverride": "feedback", "allowEmptyText" :true }
						},
						child = this.createItem(itemConfig),
						child_obj = repo.get(child);

					child_obj.stage_preview_container = '#td_' + optionId;

					return child;
				}

				// Create feedbacks text viewers for all options

				_.chain(this.arr_options)
					.where({'default': undefined })
					.each(function(option) {

						this.feedbacks_map_specific[option.id] = this.feedbacks_map_specific[option.id] || {};

						if (!option.definition) {
						// Create option's correct feedback
						if (option.isCorrect !== false) {
							if (!this.feedbacks_map_specific[option.id].correct_feedback_id) {
								this.feedbacks_map_specific[option.id].correct_feedback_id = createFeedback.call(this, 'c_' + option.id);
							}
						}

						// Create option's incorrect feedback
						if (option.isCorrect !== true && this.taskType != 'cloze_drag') {
							if (!this.feedbacks_map_specific[option.id].incorrect_feedback_id) {
								this.feedbacks_map_specific[option.id].incorrect_feedback_id = createFeedback.call(this, 'w_' + option.id);
							}
						}
						}

						if (option.children && option.children.length)
						{
							this.feedbacks_map_specific[option.id].related_feedbacks = this.feedbacks_map_specific[option.id].related_feedbacks || {};
						}

						_.each(option.children, function(optionChild) {
							// Create option's related feedbacks
							if (!this.feedbacks_map_specific[option.id].related_feedbacks[optionChild.id]) {
								this.feedbacks_map_specific[option.id].related_feedbacks[optionChild.id] = {
									feedback_id: createFeedback.call(this, option.id + '_' + optionChild.id),
									type: optionChild.feedbackType
								};
							}
						}, this);

				}, this);

				if (_.where(this.arr_options, {'default': true}).length) {
					var defaults = this.feedbacks_map_specific['default_feedbacks'] = this.feedbacks_map_specific['default_feedbacks'] || {}

					// Create default correct feedback
					if (!defaults.correct || !defaults.correct.feedback_id) {
						defaults.correct = { 'feedback_id': createFeedback.call(this, 'default_correct') };
					}

					// Create default incorrect feedback
					if (!defaults.incorrect || !defaults.incorrect.feedback_id) {
						defaults.incorrect = { 'feedback_id': createFeedback.call(this, 'default_incorrect') };
					}
				}

			},

			createGenericFeedbacks:function f756(array_of_feedbacks, predefined_list) {
				var children_count = array_of_feedbacks.length, feedback, child, child_obj, itemConfig, preliminaryExists, finalExists, feedbackId;

				if (children_count) {
					for (feedback in array_of_feedbacks) {

						feedbackId = array_of_feedbacks[feedback];

						preliminaryExists = false; finalExists = false;

						if(!!this.feedbacks_map[feedbackId]) {
							if(!!this.feedbacks_map[feedbackId].preliminary) {
								preliminaryExists = true;
							}

							if(!!this.feedbacks_map[feedbackId].final) {
								finalExists = true;
							}
						}


						if(!preliminaryExists) {
							this.feedbacks_map[feedbackId] = {};
							this.feedbacks_map[feedbackId].type = 'generic';

							itemConfig = {
								"type":"textViewer",
								"parentId":this.config.id,
								"childConfig" : {
									"tvEndEditingCallback": this.updateCustomPredefinedList.bind(this)
								},
								"data":{ "disableDelete" : true , "mode":"singleStyleNoInfoBaloon", "styleOverride": "feedback"}
							};

							if(!!predefined_list && predefined_list[feedbackId]) {

								itemConfig.title = this.getStringifyedData(predefined_list[feedbackId].preliminary );
							}

							child = this.createItem(itemConfig);
								child_obj = repo.get(child);
								child_obj.stage_preview_container = '#td_p_' + feedbackId;

								this.feedbacks_map[feedbackId].preliminary = child;
						}

						////////////////////////////////////////////////////////////////////////////////////////

						if(!finalExists) {
							if(!!predefined_list && predefined_list[array_of_feedbacks[feedback]]) {
								itemConfig.title = this.getStringifyedData(predefined_list[array_of_feedbacks[feedback]].final);
							}

							child = this.createItem(itemConfig);
							child_obj = repo.get(child);
							child_obj.stage_preview_container = '#td_f_' + array_of_feedbacks[feedback];

							this.feedbacks_map[array_of_feedbacks[feedback]].final = child;
						}

						//////////////////////////////////////////////////////////////////////////////////////////

					}
				}

			},
			getStringifyedData: function(data) {
				// special format saved because of the customization pack PropsTVE text format
				var ans = data;
                try {
                    ans = JSON.parse('"' + data + '"');
                    return ans;
                } catch (err) {
                	return data;
                }
            }

		}, {type: 'FeedbackEditor',
			setScreenLabel: 'Feedback Content',
			showTaskSettingsButton: false,
			displayTaskDropdown: false,
			mapChildrenForValidation : function(repo_elem){
				children = repo.getChildren(repo_elem.id);
				var newChildren = _.map(children , function(child){
					if(child.data.allowEmptyText !== true ){
						var isSpecificFeedback = _.find(repo_elem.data.feedbacks_map_specific, function(item){
							return	item['correct_feedback_id'] === child.id ||
									item['incorrect_feedback_id'] === child.id ||
									_.filter(item.related_feedbacks,
										function(relatedItem){
											return relatedItem.feedback_id == child.id;
										}).length;

							});
						if(isSpecificFeedback){
							repo.updateProperty(child.id, 'allowEmptyText', true, false, true);
						}
					}
					return child;
				});

				return newChildren;
			},
			postValid : function f757(elem_repo){
				
				if(_.filter(elem_repo.children, function(child){
					return !repo.get(child).data.isValid ;
				}).length){
					return {
						valid: false, report: []
					}
				}
				return {valid : true , report :[]};
			}
		});

		return FeedbackEditor;

	});