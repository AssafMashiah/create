define({
	course: {
		screen: 'CourseScreen',
		editor: 'CourseEditor',
		group: 'course',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: ["toc", "lesson"]
		}
	},

	toc: {
		screen: 'TocScreen',
		editor: 'TocEditor',
		group: 'toc',
		showpreview: false,
		clipboard: {
			canCopy: true,
			canBePasted: function(copyItem, parentItem) {
				var repo = require('repo'),
					focusLevel = repo.getAncestors(parentItem.id).length,
					cbLevel = repo.getAncestors(copyItem.id).length,
					copyLevels = _(repo.getSubtreeRecursive(copyItem.id))
									.filter(function(item) {
										return item.type == 'toc' && item.id != copyItem.id;
									})
									.map(function(item) {
										return repo.getAncestors(item.id).length;
									}),
					addLevel = copyLevels.length > 0 ? (_.max(copyLevels) - cbLevel + 1) : 1,
					maxLevel = repo.get(require('courseModel').courseId).data.maxDepth;

				// Summary level is less or equal than max course leves - can paste
				return addLevel + focusLevel <= maxLevel;
			},
			insert: 'last',
			renameItem: true,
			focusOn: true,
			childrenTypes: ["toc", "lesson"]
		}
	},

	lesson: {
		screen: 'LessonScreen',
		editor: 'LessonEditor',
		group: 'lesson',
		showpreview: true,
		clipboard: {
			canCopy: true,
			canPasteInto: function(copyItem, parentItem) {
				var repo = require('repo');
				if (parentItem.type == 'lesson' && require('lessonModel').isLessonModeAssessment(parentItem.id)) {
					var canPaste = true,
						subTree = repo.get(copyItem.id) ? repo.getSubtreeRecursive(copyItem.id) : require('clipboardManager').memory,
						restrictedTypes = [
											'lo',
											'differentiatedSequenceParent',
											'separator',
											'url_sequence',
											'html_sequence',
											'referenceSequence'
										],
						mixedOnlyTypes = [
											'questionOnly',
											'FreeWriting',
											'appletTask'
										];

					_.each(subTree, function(item) {
						if (restrictedTypes.indexOf(item.type) > -1) {
							canPaste = false;
						}
						else if (mixedOnlyTypes.indexOf(item.type) > -1 && parentItem.data.pedagogicalLessonType == 'auto') {
							canPaste = false;
						}
					});

					return canPaste;
				}
				var cgsUtil = require("cgsUtil");
				var numberOfPagesToPaste = cgsUtil.getNumberOfPagesToPaste(copyItem);
				if(numberOfPagesToPaste > 0){
					return cgsUtil.canAddPagesToLesson(require("lessonModel").lessonId, numberOfPagesToPaste);
				}else{
					return true;
				}
			},
			canPasteNextToSibling: true,
			insert: 'next',
			renameItem: true,
			childrenTypes: ["lo", "separator", "sequence", "url_sequence", "html_sequence", "differentiatedSequenceParent", 'page']
		}
	},

	lo: {
		screen: 'LessonScreen',
		editor: 'LoEditor',
		group: 'lo',
		validationBubbleUp: false,
		showpreview: true,
		clipboard: {
			canPasteInto: function canPasteInto(copyItem, parentItem){
				var repo = require("repo");
				var cgsUtil = require("cgsUtil");
				var canPaste = true;
				var numberOfPagesToPaste = cgsUtil.getNumberOfPagesToPaste(copyItem);
				if(numberOfPagesToPaste > 0){
					canPaste = cgsUtil.canAddPagesToLesson(require("lessonModel").lessonId, numberOfPagesToPaste);
				}
				return canPaste;
			},
			canCopy: true,
			canPasteNextToSibling: true,
			insert: 'next',
			renameItem: true,
			focusOn: true,
			childrenTypes: ["separator", "sequence", "url_sequence", "html_sequence", "differentiatedSequenceParent", 'page']
		}
	},

	page: {
	   screen: 'LessonScreen',
	   editor: 'PageEditor',
	   group: 'Pages',
	   showpreview: true,
	   clipboard: {
		   canCopy: true,
		   canBePasted: function(item, parent) {
				return (parent.type != 'lesson') || !require('repo').get(require('courseModel').courseId).data.includeLo;
			},
		   canPasteInto: function (item, parentItem) {
				var canPaste = false;
				var r = require("repo");
				if (r.get(require('courseModel').courseId).data.includeLo) {
				  	if (parentItem.type == 'lesson') { 
				  		canPaste = true;
					}
				} else {
					if (parentItem.type != 'lo'){
				  		canPaste = false;
				  	}
				}
				var cgsUtil = require("cgsUtil");
				var numberOfPagesToPaste = cgsUtil.getNumberOfPagesToPaste(copyItem);
				if(numberOfPagesToPaste > 0){
					canPaste = cgsUtil.canAddPagesToLesson(require("lessonModel").lessonId, numberOfPagesToPaste);
				}
				return canPaste;
		  },
		  canPasteNextToSibling: true,
		  insert: 'next',
		  renameItem: true,
		  focusOn: true,
		  childrenTypes: ["sequence", 'OVERLAY_EXTERNAL_URL', 'OVERLAY_IMAGE', 'OVERLAY_AUDIO', 'OVERLAY_VIDEO']
	   }
	},

	OVERLAY_EXTERNAL_URL: {
		screen: 'LessonScreen',
		editor: 'OverlayLinkEditor',
		group: 'overlay',
		showpreview: false,
		clipboard: {
			canCopy: false,
			strictParent: true,
			insert: 'next',
			childrenTypes: []
		}
	},

	OVERLAY_IMAGE: {
		screen: 'LessonScreen',
		editor: 'OverlayImageEditor',
		group: 'overlay',
		showpreview: false,
		clipboard: {
			canCopy: false,
			strictParent: true,
			insert: 'next',
			childrenTypes: []
		}
	},

	OVERLAY_AUDIO: {
		screen: 'LessonScreen',
		editor: 'OverlayAudioEditor',
		group: 'overlay',
		showpreview: false,
		clipboard: {
			canCopy: false,
			strictParent: true,
			insert: 'next',
			childrenTypes: []
		}
	},

	OVERLAY_VIDEO: {
		screen: 'LessonScreen',
		editor: 'OverlayVideoEditor',
		group: 'overlay',
		showpreview: false,
		clipboard: {
			canCopy: false,
			strictParent: true,
			insert: 'next',
			childrenTypes: []
		}
	},
	OVERLAY_DL_SEQUENCE: {
		screen: 'LessonScreen',
		editor: 'OverlaySequenceEditor',
		group: 'overlay',
		showpreview: false,
		clipboard: {
			canCopy: false,
			strictParent: true,
			insert: 'next',
			childrenTypes: []
		}
	},

	quiz: {
		screen: 'LessonScreen',
		editor: 'QuizEditor',
		group: 'quiz',
		validationBubbleUp: false,
		showpreview: true,
		clipboard: {
			canCopy: true,
			canPasteNextToSibling: true,
			insert: 'next',
			renameItem: true,
			focusOn: true,
			childrenTypes: ["sequence"]
		}
	},
	pdf: {
		screen: 'PdfScreen',
		editor: 'PdfEditor',
		group: 'pdf',
		showpreview: true,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	separator: {
		screen: 'LessonScreen',
		editor: 'SeparatorEditor',
		group: 'separator',
		fullName: "Separator",
		showpreview: true,
		clipboard: {
			canCopy: true,
			canBePasted: function(item, parent) {
				return (parent.type != 'lesson') || (!require('repo').get(require('courseModel').courseId).data.includeLo);
			},
			canPasteNextToSibling: true,
			insert: 'next',
			renameItem: true,
			focusOn: true,
			childrenTypes: []
		}
	},

	sequence: {
		screen: 'LessonScreen',
		editor: 'SequenceEditor',
		group: 'sequence',
		fullName: "Sequence",
		validationBubbleUp: false,
		showpreview: true,
		clipboard: {
			canCopy: true,
			canBePasted: function(item, parent) {
				// If the copied sequence is differentiation level, it should include children and the target should be sequence
				if (item.data.diffLevel || parent.data.diffLevel) {
					return parent.type == 'sequence' && parent.id != item.id && item.children.length;
				}

				return (parent.type != 'lesson') || require('lessonModel').isLessonModeAssessment(parent.id) || !require('repo').get(require('courseModel').courseId).data.includeLo;
			},
			canPasteInto: function (item, parentItem) {
				var r = require("repo");
				var isQuiz = r.getAncestorRecordByType(parentItem.id, 'quiz');

				if (isQuiz) {
					if (['FreeWriting', 'questionOnly', 'selfCheck', 'narrative', 'pedagogicalStatement'].indexOf(item.type) > -1) {
						return false;
					}
				}

				return true;
			},
            canPasteNextToSibling: true,
			insert: 'next',
			renameItem: true,
			focusOn: true,
			childrenTypes: [
				"questionOnly",
				"openQuestion",
				"FreeWriting",
				"ShortAnswer",
				"mc",
				"matching",
				"sorting",
				"sequencing",
				"narrative",
				"pedagogicalStatement",
				"selfCheck",
				"header",
				"appletTask",
				"cloze"
			]
		}
	},
	url_sequence: {
		screen: 'LessonScreen',
		editor: 'URLSequenceEditor',
		group: 'sequence',
		fullName: "URL Sequence",
		showpreview: true,
		clipboard: {
			canCopy: true,
			canBePasted: function(item, parent) {
				return (parent.type != 'lesson') || (!require('repo').get(require('courseModel').courseId).data.includeLo);
			},
			canPasteNextToSibling: true,
			insert: 'next',
			renameItem: true,
			focusOn: true,
			childrenTypes: []
		}
	},
	html_sequence: {
		screen: 'LessonScreen',
		editor: 'HtmlSequenceEditor',
		group: 'sequence',
		fullName: "HTML Sequence",
		showpreview: true,
		clipboard: {
			canCopy: true,
			canBePasted: function(item, parent) {
				return (parent.type != 'lesson') || !require('repo').get(require('courseModel').courseId).data.includeLo;
			},
			insert: 'last',
			renameItem: true,
			focusOn: true,
			childrenTypes: []
		}
	},
	differentiatedSequenceParent: {
		screen: 'LessonScreen',
		editor: 'DifferentiatedSequenceEditor',
		group: 'sequence',
		fullName: "Differentiated Sequence",
		showpreview: true,
		clipboard: {
			canCopy: true,
			canBePasted: function(item, parent) {
				return (parent.type != 'lesson') || (!require('repo').get(require('courseModel').courseId).data.includeLo);
			},
            canPasteNextToSibling: true,
			insert: 'next',
			renameItem: true,
			focusOn: true,
			childrenTypes: []
		}
	},
	referenceSequence:{
		screen: 'LessonScreen',
		editor: 'ReferenceSequenceEditor',
		group: 'sequence',
		fullName: "Reference Sequence",
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},

	questionOnly: {
		name:"questionOnly",
		fullName: "Question Only",
		screen: 'TaskScreen',
		editor: 'QuestionOnlyEditor',
		group: 'task',
		selectTaskType:true,
		showpreview: true,
		validationBubbleUp : true,
		validationAncestor: true,
		clipboard: {
			canCopy: function(item) {
				if (_.any(require('repo').getAncestors(item.id), { type: 'pluginExternal' })) {
					return false;
				}

				return true;
			},
			insert: 'next',
			childrenTypes: []
		},
		assessmentEnable: {
        	auto: false,
        	mixed: true
        },
		order: 1
    },    
	
	cloze: {
		name:"cloze",
		fullName: "Fill in the Gaps",
		screen: 'TaskScreen',
		editor: 'ClozeEditor',
		group: 'task',
		isOverlayEnabled: true,
		selectTaskType:true,
        showpreview: true,
        validationBubbleUp : true,
		clipboard: {
			canCopy: function(item) {
				if (_.any(require('repo').getAncestors(item.id), { type: 'pluginExternal' })) {
					return false;
				}
				
				return true;
			},
			insert: 'next',
			childrenTypes: []
		},
		assessmentEnable: {
        	auto: true,
        	mixed: true
        },
        quizEnabled: true,
		order: 6
	},
    cloze_answer: {
        name:"ClozeAnswerEditor",
        fullName: "Fill in the Gaps Answer",
        screen: 'TaskScreen',
        editor: 'ClozeAnswerEditor',
        group: 'task',
        selectTaskType:false,
        showpreview: false,
        validationAncestor: true,
        clipboard: {
            canCopy: false,
            insert: 'next',
            childrenTypes: []
        }
    },
	cloze_text_viewer: {
		name:"cloze_text_viewer",
		fullName: "Fill in the Gaps TextViewer",
		screen: 'TaskScreen',
		editor: 'ClozeTextViewerEditor',
		group: 'task',
		selectTaskType:false,
		showpreview: false,
		clipboard: {
			canCopy: true,
			insert: 'next',
			childrenTypes: []
		}
	},
	clozeBank: {
		screen: 'TaskScreen',
		editor: 'ClozeBankEditor',
		group: 'task',
		fullName: "Fill in the Gaps Bank",
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: ["textViewer"]
		}
	},
	AnswerFieldTypeText: {
		name:"AnswerFieldTypeText",
		screen: 'TaskScreen',
		editor: 'AnswerFieldTypeTextEditor',
		group: 'task',
		selectTaskType:false,
		validationBubbleUp : true,
		showpreview: false,
		clipboard: {
			canCopy: true,
			insert: 'next',
			childrenTypes: []
		}
	},
	FreeWriting: {
		name: "FreeWriting",
		fullName: "Free Writing",
		screen: 'TaskScreen',
		editor: 'FreeWritingEditor',		
		hasAssessmentTemplate : true,
		group: 'task',
		selectTaskType:true,
		validationBubbleUp : true,
		assessmentEnable: {
        	auto: false,
        	mixed: true
        },
        isOverlayEnabled: true,
		showpreview: true,
		clipboard: {
			canCopy: function(item) {
				if (_.any(require('repo').getAncestors(item.id), { type: 'pluginExternal' })) {
					return false;
				}
				
				return true;
			},
			insert: 'next',
			childrenTypes: []
		},
		order: 3
	},
	FreeWritingAnswer: {
		screen: 'TaskScreen',
		editor: 'FreeWritingAnswerEditor',
		group: 'task',
		fullName: "Free Writing Answer",
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	ShortAnswer: {
		name: "ShortAnswer",
		fullName: "Short Answer",
		screen: 'TaskScreen',
		hasAssessmentTemplate : true,
		editor: 'ShortAnswerEditor',
		validationBubbleUp : true,
		isOverlayEnabled: true,
		group: 'task',
		selectTaskType:true,
        assessmentEnable: {
        	auto: true,
        	mixed: true
        },
		showpreview: true,
		clipboard: {
			canCopy: function(item) {
				if (_.any(require('repo').getAncestors(item.id), { type: 'pluginExternal' })) {
					return false;
				}
				
				return true;
			},
			insert: 'next',
			childrenTypes: []
		},
        quizEnabled: true,
		order: 4
	},
	ShortAnswerAnswer: {
		screen: 'TaskScreen',
		editor: 'ShortAnswerAnswerEditor',
		group: 'task',
		fullName: "Short Answer Answer",
		showpreview: false,
		validationAncestor: true,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	subQuestion: {
		screen: 'TaskScreen',
		editor: 'SubQuestionEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	textEditor: {
		screen: 'TaskScreen',
		editor: 'TextEditorEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	mc: {
		name: "mc",
		fullName: "Multiple Choice",
		screen: 'TaskScreen',
		editor: 'MCEditor',
		hasAssessmentTemplate : true,
		group: 'task',
		isOverlayEnabled: true,
		selectTaskType:true,
		validationBubbleUp : true,
        assessmentEnable: {
        	auto: true,
        	mixed: true
        },
		showpreview: true,
		clipboard: {
			canCopy: function(item) {
				if (_.any(require('repo').getAncestors(item.id), { type: 'pluginExternal' })) {
					return false;
				}
				
				return true;
			},
			insert: 'next',
			childrenTypes: []
		},
        quizEnabled: true,
		order: 2
	},

	mcAnswer: {
		screen: 'TaskScreen',
		editor: 'MCAnswerEditor',
		group: 'task',
		validationBubbleUp: true,
		validationAncestor : true,
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: ["option"]
		}
	},

	option: {
		screen: 'TaskScreen',
		editor: 'OptionEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: true,
			strictParent: true,
			insert: 'next',
			resetData: function(item) {
				require('repo').updateProperty(item.id, 'correct', false, false, true);
			},
			childrenTypes: []
		}
	},

	matching: {
		name: "matching",
		fullName: "Matching",
		screen: 'TaskScreen',
		editor: 'MTQEditor',
		group: 'task',
		isOverlayEnabled: true,
		useSpecificTemplate:true,
		templateName: 'MatchingTemplate',
		selectTaskType:true,
		showpreview: true,
		validationBubbleUp : true,
		clipboard: {
			canCopy: function(item) {
				if (_.any(require('repo').getAncestors(item.id), { type: 'pluginExternal' })) {
					return false;
				}
				
				return true;
			},
			insert: 'next',
			childrenTypes: []
		},
		assessmentEnable: {
        	auto: true,
        	mixed: true
        },
        quizEnabled: true,
		order: 7
	},
	linking: {
		name: "linking",
		screen: 'TaskScreen',
		editor: 'AnswerLinkingEditor',
		group: 'task',
	},
	linking_area: {
		name: "linking_area",
		screen: 'TaskScreen',
		editor: 'LinkingAreaEditor',
		group: 'task',
	},
	distructors: {
		name: "distractors",
		screen: 'TaskScreen',
		editor: 'DistructorsEditor',
		group: 'task',
	},
	linking_pair: {
		name: "linking_pair",
		screen: 'TaskScreen',
		editor: 'LinkingPairEditor',
		group: 'task'
	},
	linkingSubAnswer: {
		screen: 'TaskScreen',
		editor: 'LinkingSubAnswerEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: true,
			strictParent: true,
			insert: 'next',
			childrenTypes: []
		}
	},

	sorting: {
		name: "sorting",
		fullName: "Sorting",
		screen: 'TaskScreen',
		editor: 'MTQEditor',
		group: 'task',
		useSpecificTemplate:true,
		templateName: 'SortingTemplate',
		selectTaskType:true,
		isOverlayEnabled: true,
		showpreview: true,
		validationBubbleUp : true,
		clipboard: {
			canCopy: function(item) {
				if (_.any(require('repo').getAncestors(item.id), { type: 'pluginExternal' })) {
					return false;
				}
				
				return true;
			},
			insert: 'next',
			childrenTypes: []
		},
		assessmentEnable: {
        	auto: true,
        	mixed: true
        },
        quizEnabled: true,
		order: 8
	},

	sequencing: {
		name: "sequencing",
		fullName: "Sequencing",
		screen: 'TaskScreen',
		editor: 'MTQEditor',
		group: 'task',
		useSpecificTemplate:true,
		isOverlayEnabled: true,
		templateName: 'SequencingTemplate',
		selectTaskType:true,
		showpreview: true,
		validationBubbleUp : true,
		clipboard: {
			canCopy: function(item) {
				if (_.any(require('repo').getAncestors(item.id), { type: 'pluginExternal' })) {
					return false;
				}
				
				return true;
			},
			insert: 'next',
			childrenTypes: []
		},
		assessmentEnable: {
        	auto: true,
        	mixed: true
        },
        quizEnabled: true,
		order: 9
	},

	matchingAnswer: {
		screen: 'TaskScreen',
		editor: 'MatchingAnswerEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	sortingAnswer:{
		screen: 'TaskScreen',
		editor: 'SortingAnswerEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	sequencingAnswer:{
		screen: 'TaskScreen',
		editor: 'SequencingAnswerEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},

	mtqArea: {
		screen: 'TaskScreen',
		editor: 'MTQAreaEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: ["mtqSubQuestion"]
		}
	},

	mtqBank: {
		screen: 'TaskScreen',
		editor: 'MTQBankEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: ["mtqSubAnswer"]
		}
	},

	mtqSubQuestion: {
		screen: 'TaskScreen',
		editor: 'MtqSubQuestionEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: true,
			strictParent: true,
			insert: 'next',
			childrenTypes: []
		}
	},

	mtqSubAnswer: {
		screen: 'TaskScreen',
		editor: 'MtqSubAnswerEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: true,
			strictParent: true,
			insert: 'next',
			childrenTypes: []
		}
	},
	mtqMultiSubAnswer :{
		screen: 'TaskScreen',
		editor: 'MtqMultiSubAnswerEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: ["mtqSubAnswer"]
		}
	},

	definition: {
		screen: 'TaskScreen',
		editor: 'DefinitionEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	narrative: {
		name:"narrative",
		fullName: "Context",
		screen: 'TaskScreen',
		hasAssessmentTemplate : true,
		editor: 'NarrativeEditor',
		group: 'task',
		selectTaskType:true,
		showpreview: true,
		validationBubbleUp : true,
		validationAncestor: true,
		clipboard: {
			canCopy: function(item) {
				if (_.any(require('repo').getAncestors(item.id), { type: 'pluginExternal' })) {
					return false;
				}
				
				return true;
			},
			insert: 'next',
			childrenTypes: []
		},
		order: 10
	},

	pedagogicalStatement: {
		name: "pedagogicalStatement",
		fullName: "Pedagogical",
		screen: 'TaskScreen',
		editor: 'PedagogicalStatementEditor',
		group: 'task',
		selectTaskType:true,
		showpreview: true,
		validationBubbleUp : true,
		validationAncestor: true,
		clipboard: {
			canCopy: function(item) {
				if (_.any(require('repo').getAncestors(item.id), { type: 'pluginExternal' })) {
					return false;
				}
				
				return true;
			},
			insert: 'next',
			childrenTypes: []
		},
		order: 11
	},
	selfCheck: {
		name:"selfCheck",
		fullName: "Self-Check",
		screen: 'TaskScreen',
		editor: 'SelfCheckEditor',
		group: 'task',
		selectTaskType:true,
		showpreview: true,
		validationBubbleUp : true,
		validationAncestor: true,
		clipboard: {
			canCopy: function(item) {
				if (_.any(require('repo').getAncestors(item.id), { type: 'pluginExternal' })) {
					return false;
				}
				
				return true;
			},
			insert: 'next',
			childrenTypes: []
		},
		order: 12
	},

	instruction:{
		screen:'TaskScreen',
		editor:'InstructionEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},

	question:{
		screen:'TaskScreen',
		editor:'QuestionEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: [
				'textViewer',
				'imageViewer',
				'soundButton',
				'audioPlayer',
				'videoPlayer',
				'appletWrapper',
				'table'
			]
		}
	},
    assessment_question:{
        screen: 'DialogScreen',
        editor: 'AssessmentQuestionEditor',
        group: 'task',
        fullName: "Assessment Question",
        showpreview: false,
        clipboard: {
            canCopy: false,
            insert: 'last',
            childrenTypes: []
        }
    },

	textViewer: {
		screen: 'TaskScreen',
		editor: 'TextViewerEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: true,
			strictParent: true,
			insert: 'next',
			childrenTypes: []
		}
	},
	TableEditor: {
		screen: 'TaskScreen',
		editor: 'TableEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: true,
			strictParent: true,
			insert: 'next',
			childrenTypes: []
		}
	},

	imageViewer: {
		screen: 'TaskScreen',
		editor: 'ImageViewerEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: true,
			strictParent: true,
			insert: 'next',
			childrenTypes: []
		}
	},

	header: {
		screen: 'TaskScreen',
		editor: 'HeaderEditor',
		group: 'task',
		fullName: "Header",
		showpreview: false,
		clipboard: {
			canCopy: function(item) {
				if (_.any(require('repo').getAncestors(item.id), { type: 'pluginExternal' })) {
					return false;
				}
				
				return true;
			},
			canBePasted: function(item, parent) {
				return (require('repo').getChildrenRecordsByType(parent.id, 'header').length == 0);
			},
			insert: 'first',
			childrenTypes: []
		},
		order: 0
	},

	sharedContent: {
		screen: 'TaskScreen',
		editor: 'SharedContentEditor',
		group: 'task',
		fullName: "Shared Content",
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: [
				'textViewer',
				'imageViewer',
				'soundButton',
				'audioPlayer',
				'videoPlayer',
				'appletWrapper',
				'table'
			]
		}
	},
	soundButton: {
		screen: 'TaskScreen',
		editor: 'SoundButtonEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: true,
			strictParent: true,
			insert: 'next',
			childrenTypes: []
		}
	},
	audioPlayer: {
		screen: 'TaskScreen',
		editor: 'AudioPlayerEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: true,
			strictParent: true,
			insert: 'next',
			childrenTypes: []
		}
	},
	videoPlayer: {
		screen: 'TaskScreen',
		editor: 'VideoPlayerEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: true,
			strictParent: true,
			insert: 'next',
			childrenTypes: []
		}
	},
	progress: {
		screen: 'TaskScreen',
		editor: 'ProgressEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	advancedProgress: {
		screen: 'TaskScreen',
		editor: 'AdvancedProgressEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	hint: {
		screen: 'DialogScreen',
		editor: 'HintEditor',
		group: 'hint',
		fullName: "Hint",
		validationBubbleUp:false,
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	feedback : {
		screen: 'DialogScreen',
		editor: 'FeedbackEditor',
		group: 'feedback',
		fullName: "Feedback",
		showpreview: false,
		validationBubbleUp: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	infoBaloon : {
		screen: 'DialogScreen',
		editor: 'InfoBaloonEditor',
		group: 'infoBaloon',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	help: {
		screen: 'DialogScreen',
		editor: 'HelpEditor',
		group: 'help',
		fullName: "Help",
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	assetsManager: {
		screen: 'DialogNoPropsScreen',
		editor: 'AssetsManagerEditor',
		group: 'assetsManager',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	narrationsManager: {
		screen: 'DialogNoPropsScreen',
		editor: 'NarrationsManagerEditor',
		group: 'assetsManager',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	ttsManager: {
		screen: 'DialogNoPropsScreen',
		editor: 'TtsManagerEditor',
		group: 'assetsManager',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	commentsReport: {
		screen: 'DialogNoPropsScreen',
		editor: 'CommentsReportEditor',
		group: 'commentsReport',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},

	title:{
		screen:'TaskScreen',
		editor:'TitleEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	genericTitle:{
		screen:'TaskScreen',
		editor:'GenericTitleEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	genericSubTitle:{
		screen:'TaskScreen',
		editor:'GenericSubTitleEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	compare:{
		screen: 'TaskScreen',
		editor: 'CompareEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	//start convert editors
	convert_editors: {
		screen: 'PdfScreen',
		editor: 'ConvertEditors',
		group: 'pdf'
	},
	convert_header_editor: {
		screen: 'PdfScreen',
		editor: 'ConvertHeaderEditor',
		prefix: 'ConvertEditors',
		group: 'pdf',
		showpreview: false
	},
	convert_narrative_editor: {
		screen: 'PdfScreen',
		editor: 'ConvertNarrativeEditor',
		prefix: 'ConvertEditors',
		group: 'pdf',
		showpreview: false
	},

	convert_question_only_editor: {
		screen: 'PdfScreen',
		editor: 'ConvertQuestionOnlyEditor',
		prefix: 'ConvertEditors',
		group: 'pdf',
		showpreview: false
	},
	convert_pedagogical_statement: {
		screen: 'PdfScreen',
		editor: 'ConvertPedagogicalStatementEditor',
		prefix: 'ConvertEditors',
		group: 'pdf',
		showpreview: false
	},
	convert_multiple_choice: {
		screen: 'PdfScreen',
		editor: 'ConvertMultipleChoiceEditor',
		prefix: 'ConvertEditors',
		group: 'pdf',
		showpreview: false
	},
	convert_mc_answer: {
		screen: 'PdfScreen',
		editor: 'ConvertMCAnswerEditor',
		prefix: 'ConvertEditors',
		group: 'pdf',
		showpreview: false
	},
	convert_freewriting_editor: {
		screen: 'PdfScreen',
		editor: 'ConvertFreeWritingEditor',
		prefix: 'ConvertEditors',
		group: 'pdf',
		showpreview: false
	},
	convert_self_check_editor: {
		screen: 'PdfScreen',
		editor: 'ConvertSelfCheckEditor',
		prefix: 'ConvertEditors',
		group: 'pdf',
		showpreview: false
	},
	//end convert editors
	appletWrapper: {
		screen: 'TaskScreen',
		editor: 'AppletWrapperEditor',
		group: 'task',
		showpreview: false,
		validationBubbleUp:false,
		clipboard: {
			canCopy: true,
			strictParent: true,
			insert: 'next',
			childrenTypes: []
		}
	},
	applet:{
		screen: 'AppletDialogScreen',
		editor: 'AppletEditor',
		group: 'applet',
		showpreview: false,
		validationBubbleUp: true,
		validationAncestor : 'special',
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	appletTask:{
		screen: 'TaskScreen',
		editor: 'AppletTaskEditor',
		group: 'task',
        selectTaskType: true,
		fullName: "Applet Task",
        name:"appletTask",
		showpreview: true,
		isOverlayEnabled: true,
		clipboard: {
			canCopy: function(item) {
				if (_.any(require('repo').getAncestors(item.id), { type: 'pluginExternal' })) {
					return false;
				}
				
				return true;
			},
			insert: 'next',
			childrenTypes: []
		},
		assessmentEnable: {
        	auto: false,
        	mixed: true
        },
        quizEnabled: true,
		order: 5
	},
	appletAnswer:{
		screen: 'TaskScreen',
		editor: 'AppletAnswerEditor',
		group: 'task',
		showpreview: true,
		validationBubbleUp: true,
		validationAncestor: true,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: ["appletWrapper"]
		}
	},
	pluginExternal: {
		screen:'TaskScreen',
		editor:'PluginExternalEditor',
		loadOptions: {
			folderName: "PluginEditor"
		},
		group: 'task',
		showpreview: false
	},
	//start plugin
	pluginContent:{
		screen:'LessonScreen',
		editor:'PluginContentEditor',
		group: 'pluginContent',
		showpreview: true,
		loadOptions: {
			folderName: "PluginEditor"
		},
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	pluginTask:{
		screen:'TaskScreen',
		editor:'PluginTaskEditor',
		group: 'task',
		showpreview: true,
		loadOptions: {
			folderName: "PluginEditor"
		},
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	pluginHidden: {
		screen:'DialogScreen',
		editor:'PluginHiddenEditor',
		loadOptions: {
			folderName: "PluginEditor"
		},
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	mathfield: {
		screen: 'TaskScreen',
		editor: 'MathfieldEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			strictParent: true,
			insert: 'next',
			childrenTypes: []
		}

	},
	answerFieldTypeMathfield: {
		screen: 'TaskScreen',
		editor: 'AnswerFieldTypeMathfieldEditor',
		group: 'task',
		showpreview: false,
		validationBubbleUp : true,
		clipboard: {
			canCopy: false,
			strictParent: true,
			insert: 'next',
			childrenTypes: []
		}
	},
	table: {
		screen: 'TaskScreen',
		editor: 'TableEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: function(item) {
				return item && item.data && !item.data.clozeTable;
			},
			insert: 'last',
			childrenTypes: []
		}
	},
	tableRow: {
		screen: 'TaskScreen',
		editor: 'TableRowEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
	tableCell: {
		screen: 'TaskScreen',
		editor: 'TableCellEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}
	},
    mathfieldEditor :{
        screen : 'TaskScreen',
        editor : 'MathfieldEditorEditor',
        group : 'task',
        showpreview: false,
        clipboard: {
            canCopy: false,
            insert: 'last',
            childrenTypes: []
        }
    },
    "inlineImage" : {
    	validationBubbleUp: false
    },
    "latex" : {
    	validationBubbleUp: false
    },
    "MathML" : {
    	validationBubbleUp: false
    },
    "inlineSound": {
    	validationBubbleUp: false
    },
    "inlineNarration": {
    	validationBubbleUp: false
    },
    "hyperlink": {
    	validationBubbleUp: false
    },

    // PDF layout elements

	livePageTextViewerWrapper: {
		screen: 'DialogScreen',
		editor: 'LivePageTextViewerWrapperEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			strictParent: true,
			insert: 'next',
			childrenTypes: []
		}
	},
    livePageImageViewer: {
		screen: 'TaskScreen',
		editor: 'LivePageImageViewerEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			strictParent: true,
			insert: 'next',
			childrenTypes: []
		}
	},
	livePageSoundButton: {
		screen: 'TaskScreen',
		editor: 'LivePageSoundButtonEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			strictParent: true,
			insert: 'next',
			childrenTypes: []
		}
	},
	livePageAudioPlayer: {
		screen: 'TaskScreen',
		editor: 'LivePageAudioPlayerEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			strictParent: true,
			insert: 'next',
			childrenTypes: []
		}
	},
	livePageVideoPlayer: {
		screen: 'TaskScreen',
		editor: 'LivePageVideoPlayerEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			strictParent: true,
			insert: 'next',
			childrenTypes: []
		}
	},
	livePageAppletWrapper: {
		screen: 'TaskScreen',
		editor: 'LivePageAppletWrapperEditor',
		group: 'task',
		showpreview: false,
		validationBubbleUp: false,
		clipboard: {
			canCopy: false,
			strictParent: true,
			insert: 'next',
			childrenTypes: []
		}
	},
	livePageMultimedia: {
		screen: 'DialogScreen',
		editor: 'LivePageMultimediaEditor',
		group: 'task',
		showpreview: false,
		clipboard: {
			canCopy: false,
			strictParent: true,
			insert: 'next',
			childrenTypes: []
		}
	},
	livePageQuestionOnly: {
		name:"questionOnly",
		fullName: "Question Only",
		screen: 'TaskScreen',
		editor: 'LivePageQuestionOnlyEditor',
		group: 'task',
		selectTaskType:false,
		showpreview: true,
		validationBubbleUp : true,
		validationAncestor: true,
		clipboard: {
			canCopy: false,
			insert: 'next',
			childrenTypes: []
		},
		assessmentEnable: {
        	auto: false,
        	mixed: true
        }
    },
    livePageAppletTask:{
		screen: 'TaskScreen',
		editor: 'LivePageAppletTaskEditor',
		group: 'task',
        selectTaskType: false,
		fullName: "Applet Task",
        name:"appletTask",
		showpreview: true,
		clipboard: {
			canCopy: false,
			insert: 'next',
			childrenTypes: []
		},
		assessmentEnable: {
        	auto: false,
        	mixed: true
        },
        quizEnabled: true
	},
	'styleEditor' : {
		screen: 'DialogScreen',
		editor: 'styleAndEffectEditor',
		group: 'styleAndEffectEditor',
		showpreview: false,
		clipboard: {
			canCopy: false,
			insert: 'last',
			childrenTypes: []
		}

	}

});