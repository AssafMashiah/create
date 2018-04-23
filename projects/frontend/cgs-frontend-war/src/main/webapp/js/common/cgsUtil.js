define(['lodash', 'recent', 'restDictionary', 'events', 'repo', 'jquery', 'editMode'],
	function (_, recent, restDictionary, events, repo, $, editMode) {

		var CgsUtil = {
			canAddPagesToLesson: function canAddPagesToLesson(lessonId, numberOfPagesToAdd) {
				var numberOfPagesInLesson = require('repo').getChildrenByTypeRecursive(lessonId, 'page').length;
				var maxAllowedPagesInLesson = require("userModel").account.elementsLimit.maxEBookPages;
				return numberOfPagesInLesson + numberOfPagesToAdd <= maxAllowedPagesInLesson;

			},
			getNumberOfPagesToPaste: function getNumberOfPagesToPaste(pasteItem) {
				var isCutMode = require("clipboardManager").clipboardMode == 1;
				var numberOfPagesToPaste = 0;
				if (pasteItem.type == "page") {
					if (repo.get(pasteItem.id) && isCutMode) {
						numberOfPagesToPaste = 0; // in cut mode we reduce the item because it will not increase the total page number
					} else {
						numberOfPagesToPaste = 1;
					}
				} else {
					var pageChildren = repo.getChildrenRecordsByTypeRecursieve(pasteItem.id, "page");
					if (pageChildren && pageChildren.length) {
						if (isCutMode) {
							numberOfPagesToPaste = 0;// in cut mode we reduce the items because they will not increase the total page number
						} else {
							numberOfPagesToPaste = pageChildren.length;
						}
					} else {
						//we take the pages from memory- it means that the items are in a different lesson, so we dont care if it is cut or copy mode
						var cm = require("clipboardManager");
						if (cm.memory) {
							_.each(cm.memory, function (item) {
								if (item.type == "page") {
									numberOfPagesToPaste++;
								}
							});
						}
					}
				}
				return numberOfPagesToPaste;
			},

			////////////////////////////////////////Courses lists//////////////////////////////////////////////////////////
			//returns recent course list from the local file system
			//get all courses from the server and cut this list to recent list only
			getAllRecent: function (callback) {
				this.getAllCourses(function (allList) {
					recent.getRecent(function (recentCoursesIdList) {
						var recentCoursesList = allList.filter(function (elem) {
							return recentCoursesIdList.indexOf(elem.id) > -1;
						});
						callback(recentCoursesList);
					}.bind(this), this);
				}.bind(this));
			},
			//returns all courses list from the server
			getAllCourses: function (callback) {

				var daoConfig = {
					path: restDictionary.paths.GET_PUBLISHER_COURSES_TITLES,
					pathParams: require('courseModel').getBaseConfig()
				};

				require('dao').remote(daoConfig, function (course_list) {
					var mappedCourses = _.map(course_list, function (course) {
						return {
							'id': course.courseId,
							'title': course.title,
							'thumbnail': course.coverRefId,
							'version': course.version
						};
					});
					callback(mappedCourses);
				});
			},

			isCompletionType: function (record, subQuestion) {
				var type = record.type;

				if (type === 'answerFieldTypeMathfield') {
					var cloze_rec = repo.getAncestorRecordByType(record.id, 'cloze');

					if (cloze_rec) {
						var cloze_answer = repo.getChildrenRecordsByType(cloze_rec.id, 'cloze_answer');
						var progress = repo.getChildrenRecordsByType(cloze_rec.id, 'advancedProgress');

						if (progress && progress.length) {
							progress = progress[0];
						} else {
							return false;
						}

						if (cloze_answer && cloze_answer.length) {
							cloze_answer = cloze_answer[0];
						} else {
							return false;
						}

						if (progress.data.checking_enabled && cloze_answer.data.interaction === 'write' && record.data.completionType === 'C') return true;
					} else {
						var shortAnswer = repo.getAncestorRecordByType(record.id, 'ShortAnswerAnswer');

						if (shortAnswer) {
							if (shortAnswer.data.checkingEnabled && (shortAnswer.data.answer_type === 'studentMath' || (subQuestion && subQuestion.data.answer_type === 'studentMath')) && record.data.completionType == 'C') {
								return true;
							}
						}
					}
				}

				return false;
			},
			clearLocaleNarrations: function (locale, callback) {
				var daoConfig = {
						path: restDictionary.paths.CLEAR_NARRATIONS,
						pathParams: {
							courseId: require("courseModel").getCourseId(),
							publisherId: require("userModel").getPublisherId(),
							locale: locale
						}
					},
					failCallback = function (jqXHR) {
						require("busyIndicator").stop();
						var responseJson = JSON.parse(jqXHR.responseText);

						if (responseJson.errorId == '2000') {
							require("lockModel").showLockingDialog("Delete narration language - Lessons being edited", responseJson.data);
						}
						else {
							require('showMessage').serverError.show(jqXHR);
						}
					};

				require("dao").remote(daoConfig, callback, failCallback);
			},
			saveAllLessons: function (onOpenHandler, callback) {
				var repo = require("repo");
				var lessonsId = _.pluck(repo.getChildrenRecordsByTypeRecursieve(repo._courseId, 'lesson'), 'id');
				var lessonModel = require("lessonModel");
				var events = require("events");
				var unmodifiedLessons = [];

				function lockSuccess() {
					events.unbind('lock_ready');

					var lessonId = lessonModel.getLessonId();

					onOpenHandler(lessonId, function () {
						lessonModel.save(lessonId, function () {
							lessonModel.setDirtyFlag(false);
							events.fire('release_lock', lessonModel.getLessonType(lessonId), onLessonSave.bind(this, lessonId));
						}, false);
					});
				}

				function lockFailed(lockFailedData) {
					events.unbind('lock_lesson_success');
					unmodifiedLessons.push({
						lessonId: lockFailedData.entityId,
						username: lockFailedData.lockingUser
					});

					onLessonSave(lockFailedData.entityId);
				}

				function saveActiveLesson(id) {
					if (!id) {
						if (unmodifiedLessons.length) {
							logger.debug(logger.category.GENERAL, {
								message: "-------LOCKED LESSONS-------",
								lessons: unmodifiedLessons
							});
						}
						return callback(unmodifiedLessons);
					}

					lessonModel.open(id, function () {
						events.once("lock_ready", lockFailed, this);
						events.once('lock_lesson_success', lockSuccess, this);

						events.fire("lock", lessonModel.getLessonType(id));
					}, true);
				}

				function onLessonSave(lessonId) {
					repo.removeChildren(lessonId);
					saveActiveLesson(lessonsId.shift());
				}

				saveActiveLesson(lessonsId.shift());
			},
			setTextViewerNarration: function (config) {
				var text_viewer_record = repo.get(config.id);
				var text_viewer_paragraphs = $('<div>').html(text_viewer_record.data.title);
				var result = [];
				var locale = repo.get(repo._courseId).data.contentLocales[0];
				if (!text_viewer_paragraphs.children('div').length) {
					text_viewer_paragraphs.contents().wrapAll('<div>');
				}

				function create_inline_narration() {
					result = [];

					text_viewer_paragraphs.children().each(function () {
						var inlineNarration = _.map(_.filter($(this).find('component'), function (component) {
							var elem = repo.get(component.id);
							return elem && elem.type == 'inlineNarration';
						}), function (component) {
							return repo.get(component.id);
						});

						inlineNarration = _.first(inlineNarration);

						var narrations = inlineNarration && CgsUtil.cloneObject(inlineNarration.data.narrations) || {};


						if (!inlineNarration && $(this).html().trim()) {
							var narration_element = $('<narration contenteditable="false"><component></component><div class="actionsGroup" style="display: none;"><button class="btn remove-narration"><span class="icon-trash base-icon"></span></button><button class="btn edit-narration"><span class="icon-cog base-icon"></span></button></div></narration>');

							inlineNarration = {
								parent: config.id,
								type: 'inlineNarration',
								children: [],
								data: {
									'class': 'component narration_icon',
									'naturalHeight': null,
									'naturalWidth': null
								}
							};

							repo.set(inlineNarration);

							var newChildren = CgsUtil.cloneObject(text_viewer_record.children);
							newChildren.push(inlineNarration.id);
							repo.updateProperty(config.id, 'children', newChildren, true);

							narration_element.find('component').attr('id', inlineNarration.id);

							$(this).append(narration_element);
						}

						if (inlineNarration) {
							if (!narrations[locale]) {
								narrations[locale] = '/media/placeholder.mp3';
							}

							result.push({
								id: inlineNarration.id,
								text: this.outerHTML,
								assetManager: inlineNarration.data.assetManager
							});

							repo.updateProperty(inlineNarration.id, 'narrations', narrations);
						}
					});
					repo.updateProperty(text_viewer_record.id, 'title', text_viewer_paragraphs.html());
				};

				function create_general_narration() {
					repo.updateProperty(text_viewer_record.id, 'generalNarration', true);

					if (!config.disableCreate) {
						var narration = {};

						narration[locale] = text_viewer_record.data.narration && text_viewer_record.data.narration[locale] || '/media/placeholder.mp3';

						repo.updateProperty(text_viewer_record.id, 'narration', narration);
					}
				};

				function clear_narrations() {
					text_viewer_paragraphs.children().each(function () {
						var components = $(this).find('component');

						components.each(function () {
							var component_id = $(this).attr('id');
							var component_record = repo.get(component_id);

							if (component_record.type == 'inlineNarration') {
								repo.remove(component_record.id);
								$(this).remove();
							}
						});
						$(this).find('narration').remove();
					});

					repo.updateProperty(text_viewer_record.id, 'title', text_viewer_paragraphs.html());
				};

				function clear_general_narration() {
					repo.updateProperty(text_viewer_record.id, 'generalNarration', false);
					repo.updateProperty(text_viewer_record.id, 'multiNarrations', null);
					repo.updateProperty(text_viewer_record.id, 'assetManager', null);
					repo.updateProperty(text_viewer_record.id, 'has_multinarration', false);
					repo.deleteProperty(text_viewer_record.id, 'narration');
				};

				switch (config.type) {
					case "":
					case "0":
						clear_narrations();
						clear_general_narration();
						break;
					case "1":
						clear_narrations();
						create_general_narration();

						if (!config.disableCreate) {
							result.push({
								id: config.id,
								text: text_viewer_record.data.title,
								assetManager: text_viewer_record.data.assetManager
							});
						}

						if (config.clearElement && config.clearElement.length) {
							config.clearElement.find(".narration_icon").remove();
						}
						break;
					case "2":
						clear_general_narration();
						if (!config.disableCreate) {
							create_inline_narration();
						}
						break;
				}

				repo.updateProperty(text_viewer_record.id, 'narrationType', config.type);

				return result;
			},
			requestProxy: function (url, onSuccess, onFail) {
				var xhr = new XMLHttpRequest();

				xhr.open('GET', url, true);

				xhr.responseType = 'arraybuffer';

				xhr.onreadystatechange = function () {
					if (this.readyState === 4 && this.status === 200) {
						onSuccess(this);
					} else {
						if (this.status !== 200) {
							onFail && onFail(this);
						}
					}
				};

				xhr.send();
			},
			requestPostProxy: function (url, data, onSuccess, onFail) {
				var xhr = new XMLHttpRequest();

				xhr.open('POST', url, true);

				xhr.responseType = 'arraybuffer';

				xhr.setRequestHeader("Content-Type", "application/json");

				xhr.onreadystatechange = function () {
					if (this.readyState === 4 && this.status === 200) {
						onSuccess(this);
					} else {
						if (this.status !== 200) {
							onFail && onFail(this);
						}
					}
				};

				xhr.send(data);
			},
			validate_content: function (id) {
				var validators = {
					"default": function () {
						var _subtree = repo.getSubtreeRecursive(this.id);
						var checkingTypes = ["textViewer", "imageViewer", "soundButton"];
						var _is_valid = false;

						_.each(_subtree, function (item) {
							if (~checkingTypes.indexOf(item.type)) {
								if (item.data.isValid) {
									_is_valid = true;
								}
							}
						});

						return _is_valid;
					}
				};

				var _templates = {
					linking: validators['default'],
					matchingAnswer: validators['default']
				}

				var _item = repo.get(id);

				if (_item) {
					if (_templates[_item.type]) {
						return _templates[_item.type].call(_item);
					}
				}
			},
			convertRepo: function (from, to) {
				require('busyIndicator').start();

				//function to convert sorting or matching int linking.
				function toLinking(parentType) {
					var _mtq = repo.getAncestorRecordByType(this.id, parentType);
					var _sub_questions = repo.getChildrenByTypeRecursive(this.id, "mtqSubQuestion");
					var _mtq_bank = repo.getChildrenByTypeRecursive(this.id, "mtqBank");
					var _mtq_area = repo.getChildrenRecordsByType(this.id, "mtqArea");

					repo.updateProperty(this.id, 'type', 'linking', true);
					repo.updateProperty(this.id, 'data', {
						stageReadOnlyMode: true,
						useBank: this.data.useBank,
						interaction_type: 'linking',
						width: "100%",
						definitionType: this.data.definitionType,
						answerType: this.data.answerType,
						random: 'only_b'
					}, true);

					//convert bank items to linking distructors
					if (this.data.useBank) {
						if (_mtq_bank.length) {
							_mtq_bank = _mtq_bank[0];

							_templates[_mtq_bank.type]["distructors"].call(_mtq_bank);
						}
					}

					//convert sun questions to linking pairs
					_.each(_sub_questions, function (item) {
						_templates[item.type]["linking_pair"].call(item, parentType == "sorting");
					}, this);

					//convert mtq area to linking area
					if (_mtq_area.length) {
						_mtq_area = _mtq_area[0];
						repo.updateProperty(_mtq_area.id, 'definitionType', this.data.definitionType);
						repo.updateProperty(_mtq_area.id, 'answerType', this.data.answerType);

						_templates[_mtq_area.type]["linking_area"].call(_mtq_area);
					}
				}

				var _templates = {
					mtqBank: {
						distructors: function () {
							repo.updateProperty(this.id, 'type', 'distructors', true);
							repo.updateProperty(this.id, 'stageReadOnlyMode', true);

							var state = this.children.length > 1 ? false : true;

							_.each(this.children, function (item) {
								var bankChildId = repo.get(item).children[0];
								//enable delete of distractor if there is more than one bank child item
								repo.updateProperty(bankChildId, 'disableDelete', state);

								//bank contains "mtqSubAnswer" -> child of type TVE/IMG/SOUND
								//here we remove the mtqSubAnswer wrapping
								repo.moveItem(bankChildId, this.id);
								repo.remove(item);
							}, this);

							//if there are no bank items we will add a default one
							if (!this.children.length) {
								var newId = repo.set({
										parent: this.id,
										children: [],
										type: this.data.answerType,
										data: {
											"title": "",
											"disableDelete": true,
											"width": "100%",
											"isValid": false
										}
									}),
									newChildren = CgsUtil.cloneObject(this.children);
								newChildren.push(newId);
								repo.updateProperty(this.id, 'children', newChildren, true);
							}
							/*remove the image that was generated when the tve was a drag&drop task. to prevent incorrect img size*/
							var textViewerChildren = repo.getChildrenRecordsByTypeRecursieve(this.id, 'textViewer');
							_.each(textViewerChildren, function (tve) {
								repo.deleteProperty(tve.id, "tvPlaceholder");
							});
						}
					},
					mtqSubQuestion: {
						linking_pair: function (oneToManyMode) {
							repo.updateProperty(this.id, 'type', 'linking_pair', true);
							repo.updateProperty(this.id, 'title', 'linkingPair');
							repo.updateProperty(this.id, 'width', '100%');
							repo.updateProperty(this.id, 'disableDelete', this.data.disableDelete);

							var definition = repo.getChildrenRecordsByType(this.id, "definition"),

							//different children types in linking one to many mode or one to one
								answer = repo.getChildrenRecordsByType(this.id, oneToManyMode ? "mtqMultiSubAnswer" : "mtqSubAnswer");

							definition = definition[0];
							answer = answer[0];

							var definitionTypeId = definition.children[0],
							//answer type in one to many mode is the mtq multi sub answer,
							//in one to one is the type of the subanswer child (TVE/IMG/SOUND)
								answerTypeId = oneToManyMode ? answer.id : answer.children[0];

							repo.updateProperty(this.id, 'definitionTypeId', definitionTypeId);
							repo.updateProperty(this.id, 'answerTypeId', answerTypeId);
							repo.updateProperty(this.id, 'oneToManyMode', oneToManyMode);

							definitionChild = repo.getChildrenRecordsByType(definition.id, 'textViewer');

							_.each(definitionChild, function (item) {
								repo.updateProperty(item.id, 'styleOverride', 'normal');
								var newTitle = $('<div/>').html(item.data.title);
								newTitle.children().attr({
									'class': 'cgs ' + 'normal',
									'customstyle': 'normal'
								});
								repo.updateProperty(item.id, 'title', newTitle.html());
							});

							/*remove the image that was generated when the tve was a drag&drop task. to prevent incorrect img size*/
							var textViewerChildren = repo.getChildrenRecordsByTypeRecursieve(this.id, 'textViewer');
							_.each(textViewerChildren, function (tve) {
								repo.deleteProperty(tve.id, "tvPlaceholder");
							});

							repo.moveItem(definitionTypeId, this.id);
							repo.remove(definition.id);

							//in one to many mode we need to convert mtqSubAnswer elements to linkingSubAnswer
							repo.updateProperty(answer.id, "linkingMode", true);
							if (oneToManyMode) {
								_.each(repo.getChildrenByTypeRecursive(this.id, "mtqSubAnswer"), function (subAnswer) {
									_templates[subAnswer.type]["linkingSubAnswer"].call(subAnswer);
								});

							} else {
								//in one to one mode the sub answer child becomes the pair child , the sub answer is deleted
								repo.moveItem(answerTypeId, this.id);
								repo.remove(answer.id);
							}

							repo.deleteProperty(this.data.definitionTypeId, 'data-placeholder');
						}
					},
					mtqSubAnswer: {
						linkingSubAnswer: function () {
							repo.updateProperty(this.id, 'type', 'linkingSubAnswer', true);
						}
					},
					linkingSubAnswer: {
						mtqSubAnswer: function () {
							repo.updateProperty(this.id, 'type', 'mtqSubAnswer', true);
						}
					},
					matchingAnswer: {

						linking: function () {
							toLinking.call(this, "matching");
						}
					},
					sortingAnswer: {
						linking: function () {
							toLinking.call(this, "sorting");
						}
					},
					linking_area: {
						mtqArea: function () {
							repo.updateProperty(this.id, 'type', 'mtqArea', true);
						}
					},
					mtqArea: {
						linking_area: function () {
							repo.updateProperty(this.id, 'type', 'linking_area', true);
							repo.updateProperty(this.id, 'stageReadOnlyMode', true);
						}
					},
					linking: {
						matchingAnswer: function () {
							var _data = {
								answerType: this.data.answerType,
								canDeleteChildren: false,
								definitionType: this.data.definitionType,
								disableDelete: true,
								hasMultiSubAnswers: false,
								useBank: this.data.useBank,
								width: "100%",
								mtqAnswerType: "matchingAnswer"
							};

							repo.updateProperty(this.id, 'type', 'matchingAnswer', true);
							repo.updateProperty(this.id, 'data', _.extend(_data, {
								interaction_type: 'drag_and_drop',
								useBank: this.data.useBank,
								mtqMode: "one_to_one"
							}), true);

							if (this.data.useBank) {
								var _distructors = repo.getChildrenRecordsByType(this.id, "distructors");

								if (_distructors.length) {
									_distructors = _distructors[0];

									_templates[_distructors.type]["mtqBank"].call(_distructors);
								}
							}

							var _linking_area = repo.getChildrenRecordsByType(this.id, "linking_area");

							if (_linking_area.length) {
								_linking_area = _linking_area[0];

								repo.updateProperty(_linking_area.id, 'definitionType', this.data.definitionType);
								repo.updateProperty(_linking_area.id, 'answerType', this.data.answerType);

								_templates[_linking_area.type]["mtqArea"].call(_linking_area);
							}

							var _pairs = repo.getChildrenByTypeRecursive(this.id, "linking_pair");

							_.each(_pairs, function (item) {
								_templates[item.type]["mtqSubQuestion"].call(item);
							}, this);

						},
						sortingAnswer: function () {
							var _data = {
								answerType: this.data.answerType,
								canDeleteChildren: false,
								definitionType: this.data.definitionType,
								disableDelete: true,
								hasMultiSubAnswers: true,
								useBank: this.data.useBank,
								width: "100%",
								mtqAnswerType: "sortingAnswer",
								placeHolder: false
							};

							repo.updateProperty(this.id, 'type', 'sortingAnswer', true);
							repo.updateProperty(this.id, 'data', _.extend(_data, {
								interaction_type: 'drag_and_drop',
								useBank: this.data.useBank,
								mtqMode: "one_to_one"
							}), true);

							if (this.data.useBank) {
								var _distructors = repo.getChildrenRecordsByType(this.id, "distructors");

								if (_distructors.length) {
									_distructors = _distructors[0];

									_templates[_distructors.type]["mtqBank"].call(_distructors);
								}
							}

							var _linking_area = repo.getChildrenRecordsByType(this.id, "linking_area");

							if (_linking_area.length) {
								_linking_area = _linking_area[0];

								repo.updateProperty(_linking_area.id, 'definitionType', this.data.definitionType);
								repo.updateProperty(_linking_area.id, 'answerType', this.data.answerType);

								_templates[_linking_area.type]["mtqArea"].call(_linking_area);
							}

							var _pairs = repo.getChildrenByTypeRecursive(this.id, "linking_pair");

							_.each(_pairs, function (item) {
								_templates[item.type]["mtqSubQuestion"].call(item);
							}, this);

						},
					},
					distructors: {
						mtqBank: function () {
							repo.updateProperty(this.id, 'type', 'mtqBank', true);

							//create a 'mtqSubAnswer' warpper to the bank item
							_.each(this.children, function (item) {
								// make the inner bank item not deletable.
								repo.updateProperty(item, 'disableDelete', true);
								//create a warpper that can be deleted
								var _sub_ans = repo.createItem({
									type: "mtqSubAnswer",
									parentId: this.id,
									data: {
										"title": "",
										"disableDelete": false,
										"width": "100%"
									},
									children: []
								});

								repo.moveItem(item, _sub_ans);
							}, this);

							/*remove the image that was generated when the tve was a drag&drop task. to prevent incorrect img size*/
							var textViewerChildren = repo.getChildrenRecordsByTypeRecursieve(this.id, 'textViewer');
							_.each(textViewerChildren, function (tve) {
								repo.deleteProperty(tve.id, "tvPlaceholder");
							});
						}
					},
					linking_pair: {
						mtqSubQuestion: function () {
							repo.updateProperty(this.id, 'type', 'mtqSubQuestion', true);
							repo.updateProperty(this.id, 'title', 'mtqSubQuestion');
							repo.updateProperty(this.id, 'title', 'mtqSubQuestion');
							repo.updateProperty(this.id, 'width', '100%');

							var definition = repo.get(this.data.definitionTypeId),
								answer = repo.get(this.data.answerTypeId);

							var _definition_a, _answer_b;

							_definition_a = repo.createItem({
								type: "definition",
								parentId: this.id,
								data: {
									"title": "definition",
									"disableDelete": true,
									"width": "100%"
								},
								children: [],
								insertAt: 0
							});
							if (definition.type === 'textViewer') {
								repo.updateProperty(definition.id, 'styleOverride', 'definition');
								var newTitle = $('<div/>').html(definition.data.title);
								newTitle.children().attr({
									'class': 'cgs ' + 'definition',
									'customstyle': 'definition'
								});
								repo.updateProperty(definition.id, 'title', newTitle.html());
							}
							repo.moveItem(this.data.definitionTypeId, _definition_a);

							repo.updateProperty(answer.id, "linkingMode", false);
							if (answer.type == "mtqMultiSubAnswer") {
								//in case of linking in one to many mode we will have the convert the linkingSubAnswer to mtqSubAnswer
								_.each(answer.children, function (linkingSubAnswerId) {
									var linkingSubAnswer = repo.get(linkingSubAnswerId);
									_templates[linkingSubAnswer.type]["mtqSubAnswer"].call(linkingSubAnswer);
								});

							} else {
								//in case of linking one to one we will have to wrap the answers with mtqSubAnswer
								_answer_b = repo.createItem({
									type: "mtqSubAnswer",
									parentId: this.id,
									data: {
										"title": "",
										"disableDelete": true,
										"width": "100%"
									},
									children: [],
									insertAt: 1
								});
								repo.moveItem(this.data.answerTypeId, _answer_b);
							}
							/*remove the image placeholder that was generated when the tve was a drag&drop task. to prevent incorrect img size*/
							var textViewerChildren = repo.getChildrenRecordsByTypeRecursieve(this.id, 'textViewer');
							_.each(textViewerChildren, function (tve) {
								repo.deleteProperty(tve.id, "tvPlaceholder");
							});
						}
					}
				};

				var _from_item = repo.get(from),
					types = require('types');
				task = _from_item;

				while (task && (!types[task.type] || !types[task.type].selectTaskType)) task = repo.get(task.parent);

				if (task) {
					var feedback = repo.getChildrenByTypeRecursive(task.id, 'feedback')[0],
						progress = feedback && repo.get(feedback.parent);

					function deleteFeedbacks(feedbackObject) {
						_.each(feedbackObject, function (item) {
							if (_.isObject(item)) {
								deleteFeedbacks(item);
							}
							else if (_.isString(item) && repo.get(item)) {
								repo.remove(item);
							}
						});
					}

					if (feedback && progress && progress.data.feedback_type == 'advanced') {
						deleteFeedbacks(feedback.data.feedbacks_map_specific);
						repo.deleteProperty(feedback.id, 'feedbacks_map_specific');
						if (_.any(progress.data.availbleProgressTypes, {value: 'generic'})) {
							repo.updateProperty(progress.id, 'feedback_type', 'generic');
						}
						else {
							repo.updateProperty(progress.id, 'feedback_type', progress.data.availbleProgressTypes[0].value);
						}
					}
				}

				var template = _templates[_from_item.type][to];

				var converted = template.call(_from_item);
				require('busyIndicator').stop();
				return converted;

			},


			//general dialog
			createDialog: function (title, data, dialogType, buttons, callback) {

				var dialogConfig = {
					"title": title,
					"content": {
						'icon': 'warn',
						'text': data
					},
					"closeOutside": false,
					"buttons": buttons
				};

				events.once('dialogResponse', callback);
				require('dialogs').create(dialogType, dialogConfig, 'dialogResponse');

			},

			openNewCourseDialog: function (format) {
				var dialogConfig = {
					title: require("translate").tran("Course Setup"),
					closeIcon: true,
					data: format,
					content: {
					},
					closeOutside: false,
					buttons: {
					}

				};

				events.once('newCourseResponse', function (returnValue, response) {
					if (response == null) {
						//open landing page
						var router = require('router');
						//only if no course currently open
						if (router.activeScreen.showFirstScreenDialog && !router._static_data.id) {
							router.activeScreen['showFirstScreenDialog']();
						}
					}
				}, this);

				require('dialogs').create('newCourse', dialogConfig, 'newCourseResponse');
			},


			openImportEpubDialog: function (format) {
				var dialogConfig = {
					title: require("translate").tran("dialog.importepub.title"),
					closeIcon: true,
					content: {
					},
					closeOutside: false,
					buttons: {
					}

				};

// 				events.once('newCourseResponse', function (returnValue, response) {
// 					if (response == null) {
// 						//open landing page
// 						var router = require('router');
// 						//only if no course currently open
// 						if (router.activeScreen.showFirstScreenDialog && !router._static_data.id) {
// 							router.activeScreen['showFirstScreenDialog']();
// 						}
// 					}
// 				}, this);

				require('dialogs').create('importEpub', dialogConfig/*, 'newCourseResponse'*/);
			},

			///////////////////////////////////////Save As Course Dialog//////////////////////////////////////////////////////
			/**
			 * open dialog for "save as" course
			 * if the course is locked then pop up a error dialog
			 */
			openCourseSaveAsDialog: function () {
				var currentCourseTitle = require("repo").get(require('courseModel').getCourseId()).data.title,
					dialogConfig = {

						title: "Save as new course",
						data: currentCourseTitle + "-" + "copy",
						content: {
							icon: 'warn'
						},
						closeOutside: false,
						buttons: {
							save: {
								label: 'Continue'
							},
							cancel: {
								label: 'Cancel'
							}
						}

					};

				events.once('oneSaveAsResponse', function (returnValue, response) {
					if (response == 'save') {
						var courseModel = require('courseModel');
						this.unsavedCourseNotification(courseModel.saveAs.bind(courseModel, returnValue ? returnValue : ''));
					}
				}, this);
				require('dialogs').create('saveAsCourse', dialogConfig, 'oneSaveAsResponse');
			},

			///////////////////////////////////////Save Course Dialog//////////////////////////////////////////////////////
			//decide which unsaved dialog to show in case it's necessary
			unsavedCourseNotification: function (continueCallback) {
				var lessonModel = require('lessonModel');
				var courseModel = require('courseModel');

				if (courseModel.getDirtyFlag() === true) { //courseModel is dirty need to save the course
					this.openCourseSaveDialog(continueCallback);
				} else if (lessonModel.getDirtyFlag() === true) { //lessonModel is dirty need to save the lesson
					this.openSaveLessonDialog(_.bind(continueCallback, this));
				} else {
					continueCallback.call(this);
				}
			},

			//open course save dialog
			openCourseSaveDialog: function (continueCallback) {
				var dialogConfig = {

					title: "Unsaved Changes",

					content: {
						text: "course has been modified. save changes?",
						icon: 'warn'
					},

					closeOutside: false,

					buttons: {
						save: {
							label: 'Save'
						},
						cancel: {
							label: 'Cancel'
						},
						discard: {
							label: 'Dont save'
						}
					}

				};

				events.once('onUnsavedResponse', function (response) {
					this.onUnsavedResponse(response, continueCallback);
				}, this);

				var dialog = require('dialogs').create('simple', dialogConfig, 'onUnsavedResponse');
			},

			//handle response from course save dialog
			onUnsavedResponse: function (response, continueCallback) {
				var courseModel = require('courseModel');
				switch (response) {
					case 'cancel':
					{
						break;
					}
					case 'discard': //don't save
					{
						//courseModel.setDirtyFlag(false);
						continueCallback.call(this);
						break;
					}
					case 'save':
					{
						courseModel.saveCourse(_.bind(function () {
							courseModel.setDirtyFlag(false);
							continueCallback.call(this);
						}, this));
						break;
					}
				}
			},

            //handle open course dialog response
            onOpenCourseChosen: function(response) {
                // responded with course id or 'null'
                if (response) {
                    require('courseModel').openCourse(response, function() {
                    	amplitude.logEvent('Open existing course', {
							"Course ID": response,
							"Type": require("cgsUtil").getAmplitudeValue("format", repo.get(response).data.format)
						});

                        this.bindEvents(); //bind courseModel events
                        require('router').load(response); //load current course
                    });
                }
            },
			///////////////////////////////////////////////New Edition Dialog///////////////////////////////////////////////
			//show course open dialog
			showNewEditionDialog: function () {
				var dialogConfig = {

					title: "Create new edition",

					content: {
						text: "When creating the new edition the course will be detached from the previous edition’s work version. However, when publishing the new edition it will be related to the previous edition."
					},

					buttons: {
						create: {
							label: 'Create',
							value: true,
							canBeDisabled: false
						},
						cancel: {
							label: 'Cancel',
							value: false
						}
					}

				};

				events.once('onNewEdition', this.onNewEdition, this);

				var dialog = require('dialogs').create('simple', dialogConfig, 'onNewEdition', "new_edition_dialog");
			},

			//handle new course edition dialog response
			onNewEdition: function (response) {
				// responded with true/false
				if (response) {
					events.fire('close_course', function () {
						require('courseModel').newEdition();
					});
				}
			},

			//////////////////////////////////OMI I CAN HAve COMMENTS/////////////////////////////////////

			/**
			 * Go from lesson screen to course screen.
			 */
			goFromLessonToCourseScreen: function (response) {
				var repo = require('repo'),
					lessonModel = require('lessonModel'),
					lessonId = lessonModel.getLessonId(),
					parent = repo.getAncestorRecordByType(lessonId, 'toc');

				if (response && response == "discard") {
					//In case the user doesn't save the lesson, the eBook ids will be reverted to the old state
					//Maybe it's a good idea to revert all lesson repo.
					require('courseModel').revertEbooks();
				}
				// We revert the title to last saved lesson title, so courseEditor will have the correct lesson name
				lessonModel.revertTitle();

				function getCourseLastVersion(callback) {
					var courseModel = require('courseModel');

					function showDialog() {
						var dialogConfig = {
							title: "Course is modified",

							content: {
								text: "New version will download",
								icon: "warn"
							},
							closeOutside: false,
							buttons: {
								update: {
									label: "Update"
								}
							},
							modal: true
						};

						// Handle response from the dialog.
						events.register('onUpdateResponse', function (response) {

							if (response) {
								courseModel.openCourse(courseModel.getCourseId(), callback, true);
							}

						}.bind(this));

						require('dialogs').create('simple', dialogConfig, 'onUpdateResponse');
					};

					courseModel.onModified(courseModel.getCourseId(), showDialog, callback);
				}

				// When we're getting back to the course itself and not to a TOC.
				if (typeof parent === 'undefined') {
					parent = repo.getAncestorRecordByType(lessonId, 'course');
				}

				function lockCallback() {
					events.unbind('lock_course_success', this);
					events.unbind('lock_ready', this);
					require('undo').reset();

					require('router').load(parent.id, require('router')._static_data.courseTab);

				}

				// Go to parent.
				getCourseLastVersion(function _getCourseLastVersion() {
					//user can't lock course according to his permissions
					if(require('PermissionsModel').permissions['edit_course'] === false) {
						lockCallback();
					} else {
						events.once('lock_course_success', lockCallback.bind(lockCallback));
						events.once('lock_ready', lockCallback.bind(lockCallback));

						events.fire('lock', 'course');
					}
				})
			},

			lockActiveLesson: function(lessonType) {
				var lessonModel = require('lessonModel');
				var activeLessonId = lessonModel.getLessonId();
				if (activeLessonId) {
					var bindFunc = endOfLockLesson.bind(endOfLockLesson), self = this;

					function endOfLockLesson() {
						events.unbind('lock_lesson_success', bindFunc);
						events.unbind('lock_ready', bindFunc);
						events.removeEventFromContext('lock_ready', self);

						var router = require("router");
						router.load(router.activeRecord.id, router._static_data.tab, router._static_data.page);
					}

					function lockLesson() {
						events.once('lock_lesson_success', bindFunc);
						events.once('lock_ready', bindFunc);
						events.fire('lock', lessonType);
					}

					var onModifiedCallback = function () {
						lessonModel.open(activeLessonId, function () {
							require('busyIndicator').stop();
							lockLesson();
						}.bind(this), true);
					};

					var onNoModifiedChangesCallback = lockLesson;

					lessonModel.onModified(activeLessonId, onModifiedCallback.bind(this), onNoModifiedChangesCallback.bind(this));
				}
			},

			lockActiveCourse: function() {
				if(require('PermissionsModel').permissions['edit_course'] === false) {
					return;
				}
				var courseModel = require('courseModel');
				var activeCourseId = courseModel.getCourseId();
				if (activeCourseId) {
					var bindFunc = endOfLockCourse.bind(endOfLockCourse), self = this;

					function endOfLockCourse() {
						events.unbind('lock_course_success', bindFunc, self);
						events.unbind('lock_ready', bindFunc, self);
						events.removeEventFromContext('lock_ready', self);

						var router = require("router");
						router.load(router.activeEditor.config.id, router._static_data.tab, router._static_data.page);
					}

					function lockCourse() {
						events.once('lock_course_success', bindFunc, this);
						events.once('lock_ready', bindFunc, this);
						events.fire('lock', 'course');
					}

					var onModifiedCallback = function () {
						courseModel.openCourse(activeCourseId, function() {
							require('busyIndicator').stop();
							lockCourse();
						}.bind(this), false);
					};

					var onNoModifiedChangesCallback = lockCourse;

					courseModel.onModified(activeCourseId, onModifiedCallback.bind(this), onNoModifiedChangesCallback.bind(this));
				}
			},

			/**
			 * Open save dialog for a lesson model.
			 */
			openSaveLessonDialog: function (continueCallback, doNotDiscardChanges) {
				var dialogConfig = {
					title: "Unsaved Changes",

					content: {
						text: "Do you want to save changes before leaving?",
						icon: "warn"
					},
					closeOutside: false,
					buttons: {
						save: {
							label: "Save"
						},

						cancel: {
							label: "Cancel"
						},

						discard: {
							label: "Dont save"
						}
					}
				};

				// Handle response from the dialog.
				events.once('onSaveResponse', function (response) {

					var lessonModel = require('lessonModel');

					switch (response) {
						case 'discard':
							if (!doNotDiscardChanges) {
								lessonModel.setDirtyFlag(false);
							}
							if (typeof continueCallback === 'function') continueCallback(response);
							break;

						case 'save':
							logger.debug(logger.category.LESSON, 'Save lesson called from save dialog');
							lessonModel.saveActiveLesson(continueCallback);
							break;
					}

				});

				require('dialogs').create('simple', dialogConfig, 'onSaveResponse');
			},

			/*
			 * Opens dialog to verify the user really wish to delete the item
			 * */
			deleteNotification: function (continueCallback, id, itemName) {

				var dialogConfig = {

					title: (!itemName) ? "Delete Item" : "Delete " + itemName + " Item",

					content: {
						text: (!itemName) ? "Are you sure you want to delete this item?" : "Are you sure you want to delete this " + itemName + " item?",
						icon: 'warn'
					},

					closeOutside: false,

					buttons: {
						yes: {
							label: 'delete'
						},
						cancel: {
							label: 'cancel'
						}
					}

				};

				events.once('onDeleteResponse', function (response) {

					this.onDeleteResponse(response, continueCallback, id);

				}, this);

				var dialog = require('dialogs').create('simple', dialogConfig, 'onDeleteResponse', "delete-notification-dialog");
			},

			/*
			 * Handles the response returned from the "delete notification" dialog
			 * */
			onDeleteResponse: function (response, continueCallback, id) {
				var item = repo.get(id);
				switch (response) {

					case 'cancel':
					{
						break;
					}
					case 'yes':
					{

						logger.audit(logger.category.EDITOR, (item && item.type) + ' (id: ' + id + ') was deleted');
						continueCallback.call(this, id);
						break;
					}
				}

				amplitude.logEvent('Delete Conformation', {
					"User decision": response,
					Object : item && item.type
				});
			},

			/*
			 * Opens assets manager dialog
			 * */
			openAssetsDialog: function (isNarrations) {

				require('router').load(require('lessonModel').lessonId, isNarrations ? 'narrations' : 'assets');

			},

			/*
			 * Opens text to speech dialog
			 * */
			openTTSDialog: function () {

				this.lastURL = {
					id: require('router')._static_data.id,
					tab: require('router')._static_data.tab
				};
				require('router').load(require('lessonModel').lessonId, 'tts');

			},

			/**
			 * Opens share a link dialog
			 */
			openShareALinkDialog: function(data) {
				var dialogConfig = {
					title: require('translate').tran('publish.url.dialog.share.a.link'),
					closeOutside: false,
					isOpenModeOnly: true,
					buttons: {
						cancel: {label: 'Done'}
					}
				};
				var publishModel = require('publishModel');
				switch (data.type) {
					case 'course':
						publishModel.getCoursePublishedUrl(repo._courseId).then(function(publishData) {
							dialogConfig.publishData = publishData;
							require('dialogs').create('PublishLinkDialog', dialogConfig);
						}, function(response) { });
						break;
					case 'lesson':
						publishModel.getLessonPublishedUrl(repo._courseId, require('lessonModel').getLessonId()).then(function(publishData) {
							dialogConfig.publishData = publishData;
							require('dialogs').create('PublishLinkDialog', dialogConfig);
						}, function(response) { });
						break;
					case 'notification':
						dialogConfig.publishData = data;
						require('dialogs').create('PublishLinkDialog', dialogConfig);
						break;
				}
			},

			/*
			 * Opens comments report dialog
			 * */
			openCommentsDialog: function () {

				require('router').load(require('lessonModel').lessonId, 'comments');

			},

			/*
			 * Opens lesson import dialog
			 */
			importLessonDialog: function (courses, callback) {
				var dialogConfig = {
					title: 'Select lesson to import',
					closeIcon: true,
					content: {
						icon: 'warn'
					},
					structure: courses,
					closeOutside: false,
					buttons: {
						yes: {
							label: 'Import'
						},
						cancel: {
							label: 'Cancel'
						}
					}
				};

				events.once('onImportLessonSelected', function (response) {
					if (typeof callback != 'function') return;

					if (!_.isEmpty(response) && response != 'cancel') {
						callback(response);
					}
					else {
						callback(false);
					}
				}, this);


				var dialog = require('dialogs').create('importLesson', dialogConfig, 'onImportLessonSelected');
			},

			/*
			 * Opens lesson import errors dialog
			 */
			importErrorDialog: function (errors /*, callback */) {

				var ind = 1,
					msg = _.map(errors, function (err) {
						return (ind++) + '. ' + err.message;
					}).join('<br>');

				var dialogConfig = {
					title: 'Lesson Import Failed',
					content: {
						text: require('translate').tran('The import action failed due to the following reasons') + ':<br><br>' + msg,
						icon: 'warn'
					},
					closeOutside: false,
					buttons: {
						cancel: {
							label: 'Close'
						}
					}
				};

				var dialog = require('dialogs').create('simple', dialogConfig);
			},

			/*
			 * Opens lesson import alerts dialog
			 */
			importAlertsDialog: function (alerts, continueCallback, cancelCallback) {

				var ind = 1,
					msg = _.map(alerts, function (alert) {
						return (ind++) + '. ' + alert;
					}).join('<br>');

				var dialogConfig = {
					title: 'Lesson import alerts',
					content: {
						text: msg,
						icon: 'warn'
					},
					closeOutside: false,
					buttons: {
						yes: {
							label: 'Continue'
						},
						cancel: {
							label: 'Cancel'
						}
					}
				};

				events.once('onImportAlert', function (response) {
					if (response == 'yes' && typeof continueCallback == 'function') {
						continueCallback();
					} else if (typeof cancelCallback == 'function') {
						cancelCallback();
					}
				}, this);

				var dialog = require('dialogs').create('simple', dialogConfig, 'onImportAlert');
			},

			/*
			 * Opens lesson import differentiated sequences dialog
			 */
			importLevelsDialog: function (localLevels, remoteLevels, callback) {
				var dialogConfig = {
					title: 'import.lesson.differentiated.levels.dialog.title',
					content: {
						icon: 'warn'
					},
					closeOutside: false,
					buttons: {
						yes: {
							label: 'Update',
							canBeDisabled: true
						},
						cancel: {
							label: 'Cancel'
						}
					},
					localLevels: localLevels,
					remoteLevels: remoteLevels
				};

				events.once('onLevelsSelected', function (response) {
					callback(_.isArray(response) ? response : null);
				}, this);


				var dialog = require('dialogs').create('importLessonLevels', dialogConfig, 'onLevelsSelected');
			},

			/*
			 *   return the default repo data to of a type
			 */
			getRepoDefaultData: function (type) {
				var typePath = type.charAt(0).toUpperCase() + type.slice(1).concat('Editor'),
					path = 'modules/'.concat(typePath, '/', typePath);
				return _.extend({}, require(path).defaultRepoData());
			},

			// Create inline components for text viewer templates
			getInlineComponent: function (parentId, fileId, type, callback) {
				require('localeModel').getMediaFileData(fileId, function (file) {
					var FileUpload = require('FileUpload'),
						itemClass,
						narrationType = null,
						componentText = '';

					if (file) {

						switch (type) {
							case 'inlineSound':
								itemClass = 'component sound_icon';
								break;
							case 'inlineNarration':
								itemClass = 'component narration_icon';
								narrationType = '2';
								break;
							case 'textViewerNarration':
								if (typeof callback == 'function') {
									var narration = {};
									narration[repo.get(repo._courseId).data.contentLocales[0]] = file.path;
									callback({
										'componentText': '',
										'narration': narration,
										'generalNarration': true,
										'narrationType': '1',
										'assetManager': [{
											'srcAttr': 'narration',
											'assetId': null,
											'state': true,
											'allowFiles': FileUpload.params.audio.allowFiles,
											'fileMymType': FileUpload.params.audio.fileMymType
										}]

									});
								}
								return;


							default:
								itemClass = 'component';
								break;
						}

						var itemConfig = {
							parentId: parentId,
							type: type,
							data: {
								'component_src': file.path,
								'class': itemClass,
								'naturalWidth': file.width || null,
								'naturalHeight': file.height || null
							}
						};

						// If it's inline asset - add asset manager data to item
						if (['inlineImage', 'inlineSound', 'inlineNarration'].indexOf(type) >= 0) {
							itemConfig.data.assetManager = [{
								'srcAttr': 'component_src',
								'assetId': null,
								'state': true,
								'allowFiles': type == 'inlineImage' ? FileUpload.params.image.allowFiles : FileUpload.params.audio.allowFiles,
								'fileMymType': type == 'inlineImage' ? FileUpload.params.image.fileMymType : FileUpload.params.audio.fileMymType
							}];
						}

						var id = require('repo').createItem(itemConfig);
						componentText = '<component id="' + id + '"/>';

					}

					if (typeof callback == 'function') {
						callback({
							componentText: componentText,
							narrationType: narrationType
						});
					}
				});

			},

			// Get Text Viewer plain text with elements markup
			getTextViewerText: function (tvdata, relativeId) {
				var wrapper = $('<div></div>').html(tvdata),
					counters = {
						mathfield: {
							counter: 1,
							text: 'math'
						},
						inlineImage: {
							counter: 1,
							text: 'image'
						},
						inlineSound: {
							counter: 1,
							text: 'sound'
						},
						latex: {
							counter: 1,
							text: 'latex'
						},
						MathML: {
							counter: 1,
							text: 'math-ml'
						},
						answerfield: {
							counter: 1,
							text: 'answer'
						}
					};

				if (relativeId && wrapper.find('component[id=' + relativeId + ']').length) {
					wrapper = wrapper.find('component[id=' + relativeId + ']').closest('div');
				}

				wrapper.find('mathfield, mathfieldtag').replaceWith(function () {
					return '&lt;' + counters.mathfield.text + (counters.mathfield.counter++) + '&gt;';
				});

				wrapper.find('component, img[type=inlineImage], img[type=inlineSound], img[type=latex], img[type=MathML]').replaceWith(function () {
					var type;
					if ($(this).attr('id') && require('repo').get($(this).attr('id'))) {
						type = require('repo').get($(this).attr('id')).type;
					} else {
						type = $(this).attr('type');
					}

					if (type && counters[type]) {
						return '&lt;' + counters[type].text + (counters[type].counter++) + '&gt;';
					}
					return '';
				});

				wrapper.find('answerfield').replaceWith(function () {
					return '&lt;' + counters.answerfield.text + (counters.answerfield.counter++) + '&gt;';
				});

				wrapper.find('br').replaceWith('\r\n');

				return wrapper.text();
			},

			getRepoItemEditorClass: function (item) {
				// init self validation param
				var typeObj = require('types')[item.type];

				if (!typeObj) {
					throw 'validation error - no TypeObj element on editorId:[' + item.id + '] elementType = ' + item.type;
				}
				if (!typeObj.editor) {
					return {}
				}

				return require('load')(typeObj.editor, typeObj.prefix || null, typeObj.loadOptions);
			},

			getFileMediaType: function (filename) {
				var allowedMedia = ["mp3", "mp4", "avi", "mpa", "wma", "wav",
						"mid", "mpg", "swf", "wmv", "vob", "flv", "asf", "vob", "mpeg"
					].join(),

					allowedImages = ["bmp", "gif", "jpeg", "jpg", "tif", "psd", "png"].join(),
					extension = filename.lastIndexOf('.') > -1 ? filename.substr(filename.lastIndexOf('.') + 1) : filename;

				if (allowedMedia.indexOf(extension) != -1) {
					return "media-file";
				}
				if (allowedImages.indexOf(extension) != -1) {
					return "img-file";
				}
			},

			/*returns the updated data from source, with the saved course data*/
			mergeByKey: function (params) {
				const startTime = performance.now();
				var ans = [];
				_.each(params.source, function (sourceElement) {
					var item = _.clone(sourceElement);
					var targetElement = _.find(params.target, function (targetElement) {
						return targetElement[params.key] == sourceElement[params.key];
					});
					if (targetElement && targetElement[params.propertyToKeep] !== undefined) {
						item[params.propertyToKeep] = targetElement[params.propertyToKeep];
					}
					ans.push(item);
				});
				var duration = performance.now() - startTime;
				console.log("cgsUtil.mergeByKey took " + duration);
				return ans;
			},

			cloneObject: function (source) {
				var clone;
				try {
					clone = JSON.parse(JSON.stringify(source));
				}
				catch (e) {
					clone = _.cloneDeep(source);
				}
				return clone;
			},

			dates: {
				formatServerDate: function (serverDate) {
					var d = new Date(serverDate);
					return d.toLocaleString();
					// return serverDate.replace("T", " ").substring(0, serverDate.indexOf('.'));
				}
			},

			csv: {

				separator: ',',

				/**
				 * convert multi dimension array into blob (prepare for download)
				 * @param  {[type]} data [multi dimension array]
				 * @return {[type]}      [Blob Object]
				 */
				toBlob: function (data) {
					var csvData = [];
					_.each(data, function (item, index) {
						if (item.length > 0) {
							for (var i = item.length - 1; i >= 0; i--) {
								item[i] = item[i].replace(/\"/g, '""');
							}
							var temp = '"' + item.join('"' + CgsUtil.csv.separator + '"') + "\"";
							csvData.push(temp);
						}
					});
					var data = '\uFEFF' + csvData.join('\r\n');

					return new Blob([data], {
						'type': 'text/csv'
					});
				},

				/**
				 * force download as csv file (works only in chrome)
				 * @param  {[type]} name [filename]
				 * @param  {[type]} blob [blob object]
				 */
				send: function (name, blob) {
					var a = document.createElement('a');
					a.href = window.URL.createObjectURL(blob);
					a.download = name;
					a.click();
				},

				/**
				 * combine toBlob and send for external use
				 * @param  {[type]} name [file name]
				 * @param  {[type]} data [multi dimension array(rows and columns)]
				 */
				download: function (name, data) {
					CgsUtil.csv.send(name, CgsUtil.csv.toBlob(data));
				}
			},

			mask: {
				setMask: function (elem) {

					if (!elem) return;

					this.clearMask();


					this.elem = $(elem).eq(0);

					this.leftDiv = $('<div class="mask-overlay">').appendTo($('body'));
					this.topDiv = $('<div class="mask-overlay">').appendTo($('body'));
					this.bottomDiv = $('<div class="mask-overlay">').appendTo($('body'));
					this.rightDiv = $('<div class="mask-overlay">').appendTo($('body'));

					this.updateMask();

					this.elem.parents().bind('scroll', this.updateMask);

					$(window).bind('resize', this.updateMask);
				},

				clearMask: function () {
					$('body .mask-overlay').remove();
					$(window).unbind('resize', this.updateMask);
					if (this.elem) {
						this.elem.parents().unbind('scroll', this.updateMask);
						this.elem = this.leftDiv = this.topDiv = this.bottomDiv = this.rightDiv = null;
					}
				},

				updateMask: function () {
					var self = CgsUtil.mask;

					if (!self.elem || !self.leftDiv) return;

					self.leftDiv.css({
						left: 0,
						top: 0,
						height: '100%',
						width: self.elem.offset().left
					});
					self.topDiv.css({
						left: self.elem.offset().left,
						top: 0,
						height: self.elem.offset().top,
						width: self.elem.outerWidth()
					});
					self.bottomDiv.css({
						left: self.elem.offset().left,
						top: self.elem.offset().top + self.elem.outerHeight(),
						height: $('body').height() - (self.elem.offset().top + self.elem.outerHeight()),
						width: self.elem.outerWidth()
					});
					self.rightDiv.css({
						left: self.elem.offset().left + self.elem.outerWidth(),
						top: 0,
						height: '100%',
						width: $('body').width() - (self.elem.offset().left + self.elem.outerWidth())
					});
				}

			},

			alignmentCalculator: {
				calculate: function (params) {
					return {
						left: this.calculateLeft(params),
						top: this.calculateTop(params)
					}
				},
				calculateTop: function (params) {

					if (!( params && params.elem && params.selector )) return 0;

					params.elem = $(params.elem);

					if (!params.position) params.position = {
						verticalAlign: "top",
						horizontalAlign: "left"
					};

					var selectorPosition = params.selector.offset();

					if (!selectorPosition) return 0;

					var newPosition;
					switch (params.position.verticalAlign) {

						case "top" :

							newPosition = selectorPosition.top - params.elem.outerHeight();

							if (!params.disableReposition) {

								if (newPosition < 0) {

									params.position.verticalAlign = "bottom";

									return this.calculateTop(params);

								}

							}
							return Math.round(newPosition);

						case "middle" :

							newPosition = selectorPosition.top + params.selector.outerHeight() / 2 - params.elem.outerHeight() / 2;

							if (!params.disableReposition) {

								if (newPosition < 0) {

									params.position.verticalAlign = "bottom";

									return this.calculateTop(params);

								}

								if (newPosition + params.elem.outerHeight() > window.innerHeight) {

									params.position.verticalAlign = "top";

									return this.calculateTop(params);

								}

							}

							return Math.round(newPosition);

						case "bottom" :

							newPosition = selectorPosition.top + params.selector.outerHeight();

							if (!params.disableReposition) {

								if (newPosition + params.elem.outerHeight() > window.innerHeight) {

									params.position.verticalAlign = "top";

									return this.calculateTop(params);

								}

							}

							return Math.round(newPosition);

						default :

							return;

					}

				},

				calculateLeft: function (params) {

					if (!( params && params.elem && params.selector )) return 0;

					params.elem = $(params.elem);

					if (!params.position) params.position = {
						verticalAlign: "top",
						horizontalAlign: "left"
					};

					var selectorPosition = params.selector.offset();

					if (!selectorPosition) return;

					var newPosition;

					var isVerticalPositionMiddle = params.position.verticalAlign == "middle";

					switch (params.position.horizontalAlign) {

						case "left" :

							newPosition = selectorPosition.left - ( isVerticalPositionMiddle ? params.elem.outerWidth() : 0 );

							if (!params.disableReposition) {

								if (newPosition + params.elem.outerWidth() > window.innerWidth) {

									params.position.horizontalAlign = "right";

									return this.calculateLeft(params);

								}

								if (isVerticalPositionMiddle && newPosition < 0) {

									params.position.horizontalAlign = "right";

									return this.calculateLeft(params);

								}
							}

							return Math.round(newPosition);

						case "right" :

							newPosition = selectorPosition.left + params.selector.outerWidth() - ( isVerticalPositionMiddle ? 0 : params.elem.outerWidth() );

							if (!params.disableReposition) {

								if (newPosition < 0) {

									params.position.horizontalAlign = "left";

									return this.calculateLeft(params);

								}

								if (isVerticalPositionMiddle && newPosition + params.elem.outerWidth() > window.innerWidth) {

									params.position.horizontalAlign = "left";

									return this.calculateLeft(params);

								}

							}
							return Math.round(newPosition);

						case "middle" :

							newPosition = selectorPosition.left + params.selector.outerWidth() / 2 - params.elem.outerWidth() / 2;

							if (!params.disableReposition) {
								if (newPosition < 0) {

									params.position.horizontalAlign = "left";

									return this.calculateLeft(params);

								}

								if (newPosition + params.elem.outerWidth() / 2 > window.innerWidth) {

									params.position.horizontalAlign = "right";

									return this.calculateLeft(params);

								}

							}
							return Math.round(newPosition);

						case "middle-left" :
						case "middle-right" :

							newPosition = selectorPosition.left + params.selector.outerWidth() / 2 - params.elem.outerWidth();

							if (!params.disableReposition) {

								if (newPosition < 0) {

									params.position.horizontalAlign = "left";

									return this.calculateLeft(params);

								}

								if (newPosition + params.elem.outerWidth() / 2 > window.innerWidth) {

									params.position.horizontalAlign = "right";

									return this.calculateLeft(params);

								}
							}

							return Math.round(newPosition);

						default :

							return;

					}

				}

			},

			isJqueryObjInDom: function (jQueryObj) {
				return jQueryObj.closest('html').length > 0;
			},
			createHelpComponent: function (params) {

				var parentId = params.parentId;
				var helpConfiguration = {
					data: repo.get(parentId).data.help,
					el: params.containerSelector,
					class: "helpComponent",
					title: "Help Menu",
					column_name: "Help Item",
					enable_edit: true,
					showDialogOnDelete: false,
					initialize_item: function f999(event) {
						//create the repo item, automatic attach the item as sequence children
						return repo.createItem({type: 'help', parentId: parentId});

					},
					update_model_callback: function f1000(event, data) {
						var row_id = $(event.target).closest(".js-growing-row").data('item-id');

						repo.startTransaction();

						//event is remove help item
						if (!$(event.target).hasClass('description') && row_id) {
							repo.remove(row_id, true);
						}

						//update the model
						repo.updateProperty(parentId, 'help', data);
						repo.endTransaction();
					}
				};

				var growingList = require("growingListComponentView");
				return new growingList(helpConfiguration);
			},
			isMediaNeedTranscode: function (fileName) {
				var ext = fileName.substr(fileName.lastIndexOf('.') + 1),
					params = require('FileUpload').params;

				if (require('configModel').configuration.isMediaTranscodingAvailable && require('userModel').getAccount().enableMediaEncoding &&
					(_.any(params['video'].extensions, function (videoExtension) {
						return videoExtension.toLowerCase() == ext.toLowerCase();
					}) ||
					_.any(params['audio'].extensions, function (audioExtension) {
						return audioExtension.toLowerCase() == ext.toLowerCase();
					}))) {
					return true;
				}
				return false;
			},

			/**
			 * set input fields mode (readonly/edit) according to the global setting
			 */
			setInputMode:function (domElem) {
				domElem.find('input, select, textarea, button[canBeDisabled!="false"]')
					.each(function (i, input) {
						//if mode is readonly disable all element, if mode not readonly enable only elements that can be enabled
						if (!editMode.readOnlyMode && !!input.getAttribute('cantBeEnabled')) {
							return false;
						}

						input.disabled = editMode.readOnlyMode;
					});
			},
			
			getAmplitudeValue: function(type, value){
				var mapping = {
					format  : {
						"NATIVE" : "Born digital",
						"EBOOK" : "BookAlive"
					},
					publishTarget: {
						"LESSON_TO_CATALOG" : "Catalog",
						"COURSE_TO_CATALOG" : "Catalog",
						"COURSE_TO_FILE":"SCORM",
						"LESSON_TO_FILE":"SCORM",
						"COURSE_TO_URL":"URL",
						"LESSON_TO_URL":"URL",
					},
					publishObject: {
						"LESSON_TO_CATALOG" : "Lesson",
						"COURSE_TO_CATALOG" : "Course",
						"COURSE_TO_FILE":"Course",
						"LESSON_TO_FILE":"Lesson",
						"COURSE_TO_URL":"Course",
						"LESSON_TO_URL":"Lesson",
					},
					interactionType:{
						"cloze" : "Fill in the gaps",
						"appletTask" :"e-Widget",
						"FreeWriting":"Free writing",
						"matching":"Matching",
						"mc":"MC",
						"sequencing":"Sequencing",
						"ShortAnswer":"Short answer",
						"sorting":"Sorting",
						"questionOnly": "Question only",
						"header":"Header",
						"narrative":"Context",
						"pedagogicalStatement" : "Pedagogical statement",
						"selfCheck" : "Self-check"
					},
					overlayType:{
						AUDIO_FILE: "Sound",
						VIDEO_FILE: "Movie",
						VIDEO_YOUTUBE: "Movie",
						IMAGE_FILE: "Image",
						EXTERNAL_URL: "Link"
					}
				}
				return mapping[type][value];
			},
			loadCustomIconsChanges: function () {
				var courseModel = require('courseModel');
				var userModel = require('userModel');
				var repo = require("repo");
				var courseId = courseModel.getCourseId();
				var customizationPackManifest = repo.getRepo()[courseId].data.customizationPackManifest;
				var enrichmentFontPack = null;
				if (customizationPackManifest && customizationPackManifest.customIconsPacks) {
					customizationPackManifest.customIconsPacks.forEach( function(pack) {
						if (pack.type == "ENRICHMENT") {
							enrichmentFontPack = pack;
						}
					});
				}
				if (enrichmentFontPack) {
					repo._old_manifest.resources.forEach( function(resource) {
						if (resource.resId == enrichmentFontPack.resourceId) {
							var fontFaceString = "@font-face { font-family: 'ebook-icons'; src: ";
							var validHrefResources = [];
							resource.hrefs.forEach( function(icon, index, arr) {
								if (hasValidExtension(icon)) {
									validHrefResources.push(icon);
								}
							});
							validHrefResources.forEach( function(icon, index, arr) {
								var urlEndChar = (index == arr.length - 1) ? '; ' : ', ';
								var fontPath = '/cms/publishers/'
									+ userModel.getPublisherId() + '/courses/'
									+ courseId + '/' + resource.baseDir + '/' + icon;
								fontFaceString += "url('" + fontPath + "?ver=" + this.version + "') format('"
									+ getFontFormat(icon) + "')" + urlEndChar;
							}, enrichmentFontPack);
							fontFaceString += '}';
							var oldStyle = document.querySelector('[data-type="customIcon"]');
							if (oldStyle) {
								document.head.removeChild(oldStyle);
							}
							var newStyle = document.createElement('style');
							newStyle.setAttribute('data-type', 'customIcon');
							newStyle.appendChild(document.createTextNode(fontFaceString));
							document.head.appendChild(newStyle);
						}
					});
				}
				function getFontExtension(font) {
					return font.substr(font.lastIndexOf('.') + 1);
				}
				function getFontFormat(font) {
					switch(getFontExtension(font)) {
						case 'woff': return 'woff';
						case 'eot':	return 'embedded-opentype';
						case 'ttf': return 'truetype';
						case 'svg': return 'svg';
					}
				}
				function hasValidExtension(font) {
					switch(getFontExtension(font)) {
						case 'woff': return true;
						case 'eot':	return true;
						case 'ttf': return true;
						case 'svg': return true;
						default: return false;
					}
				}
			}
		};

		return CgsUtil;

	});

/*
 String.prototype.capitalize = function() {
 return this.charAt(0).toUpperCase() + this.slice(1);
 }*/