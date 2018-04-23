define(['BaseScreen', 'repo', 'events', 'courseModel', 'cgsUtil', 'lessonModel',
    './LessonScreenView', './config', 'dialogs', './AssessmentConfig', './ebookConfig', 'mustache', 'VirtualPageManager'],
    function f810(BaseScreen, repo, events, courseModel, cgsUtil, lessonModel, LessonScreenView,
    	configFunc, dialogs, AssessmentConfig, ebookLessonConfig, mustache, VirtualPageManager) {

    	function getLessonMenuConfig(lessonRecord) {
    		var isAssesment = lessonModel.isLessonModeAssessment(lessonRecord && lessonRecord.type == 'lesson' && lessonRecord.id);
    		if(isAssesment){
    			return "lessonModeAssessment";
    		}
    		switch(lessonRecord.data.format){
    			case "EBOOK":
    				return "ebookLesson";
    			default:
    				return "lessonModeNormal";
    		}
    	}
	var LessonScreen = BaseScreen.extend({

		initialize: function(configOverrides) {
			var record = repo.get(configOverrides.id);
			if(record.type !== "lesson"){
				var lesson  = repo.getAncestorRecordByType(configOverrides.id, "lesson");
				if(lesson){
					record= lesson;
					configOverrides.id = record.id;
				}
			}
	        /**
	         * menu configuration for lesson screen,
	         * normal mode and assessment mode.
	         */

	        this.LessonMenuConfig = {
	            "lessonModeNormal": configFunc.get(),
	            "lessonModeAssessment": AssessmentConfig,
	            "ebookLesson" : ebookLessonConfig.get()
	        };
            var menuConfigMode = getLessonMenuConfig(record);
	        if(menuConfigMode == "lessonModeNormal"){
	        	this.setLessonsActivitiesGroupMenu(this.LessonMenuConfig[menuConfigMode].components.menu.config.menuItems);
	        }
	        
            this._super(this.LessonMenuConfig[menuConfigMode], configOverrides);

			this.view = new LessonScreenView({controller: this});
			this.registerEvents();

			if (!!record && record.type === "lesson") {
				lessonModel.setLessonId(configOverrides.id);
			}

			this.counter = 1;
		},
		setLessonsActivitiesGroupMenu: function (config) {
			if (!config || !config.length) return false;

			_.each(config, function (item) {
				 if (item.id && item.id === 'menu-lesson-activities-group') {
				 	item.subMenuItems = this.getLessonActivities();
				 } else {
				 	this.setLessonsActivitiesGroupMenu(item.subMenuItems);
				 }
			}, this);
		},
		getLessonActivities: function () {
			var lo = {
				'id':'menu-button-new-lo', // id in DOM
				'icon':'ok-sign2',
				'label' : '((menu.button.add.lo))',
				'event':'new_lesson_item',
				'args':{"type":"lo"},
				'canBeDisabled' : true
			},
			quiz = {
				'id':'menu-button-new-quiz', // id in DOM
				'icon':'quiz',
				'label' : '((Quiz))',
				'event':'new_lesson_item',
				'args':{"type":"quiz", "data": {"taskWeight": "equal", "scoreType": "NONE", "maxScore": 1, "pedagogicalLoType": "quiz"} },
				'canBeDisabled' : true
			},
			subMenuItems = [];

			var userModel = require('userModel');
				
			if (repo.get(repo._courseId).data.includeLo) {
				subMenuItems.push(lo);
			}

			if(userModel.account.enableQuiz){
				subMenuItems.push(quiz);
			}

			return subMenuItems;
		},

		registerEvents: function() {
			this.bindEvents(
				{
					'load'	: {
						'type'	:'bind',
						'func'	: this.load ,
						'ctx'	:this,
						'unbind':'dispose'
					},
					'createLessonItem':{
						'type':'register', 
						'func': this.createItem , 
						'ctx':this, 
						'unbind':'dispose'
					},
					'createSeparator' : {
						'type':'register', 
						'func': this.createSeparator , 
						'ctx':this, 
						'unbind':'dispose'
					},
					'createDifferentiatedSequence': {
						'type':'register', 
						'func': this.createDifferentiatedSequence , 
						'ctx':this, 
						'unbind':'dispose'
					},
					'delete_lesson_item':{
						'type':'register', 
						'func': function _delete_lesson_item(id){
                            	this.deleteItem(id);
                        	},
                    	'ctx': this, 
                    	'unbind': 'dispose'
                    },
                    'pdf_new':{
                    	'type':'register', 
                    	'func': function _createPdfNew() {
							_.bind(this.createPdfNew, this)();
						},
						'ctx':this, 
						'unbind':'dispose'
					},
					'import-sequence' : {
						'type' 	: 'register',
						'func'	: this.importSequence,
						'ctx'	: this,
						'unbind':'dispose'
					},
					'reference-sequence' : {
						'type' 	: 'register',
						'func'	: this.referenceToSequence,
						'ctx'	: this,
						'unbind':'dispose'
					},
					'backToPreviousScreen': {
						'type'	: 'register',
						'func'	: lessonModel.unsavedNotification.bind(lessonModel, cgsUtil.goFromLessonToCourseScreen),
						'ctx'	: lessonModel,
						'unbind':'dispose'
					},
					'upload_ebook' :{
						'type'	: 'register',
						'func'	: this.openUploadEbookFileDialog,
						'ctx'	: this,
						'unbind':'dispose'
					},
					'create_blank_page' : {
						'type'	: 'register',
						'func'	: this.createBlankPage,
						'ctx'	: this,
						'unbind':'dispose'
					}

				});
		},

		importSequence : function f811(){
			var dialogConfig = {
				title : "Import Sequence From File",
				closeOutside : false,
				buttons: {
                        cancel: { label: 'cancel' }
                }
			};

			dialogs.create('importSequence',dialogConfig);

		},

		referenceToSequence: function(callback){
			var dialogConfig = {
				title : "Reference Sequence",
				closeOutside : false,
				buttons: {
					yes: { label: 'Select' },
					cancel: { label: 'Cancel' }
				}
			};
			events.once('onReferenceSequenceSelected', function f812(response) {
                if (!_.isEmpty(response) && response != 'cancel' ) {
					if(callback && _.isFunction(callback)){

						callback(response);

					}else{

						var parentId = (['lo', 'lesson'].indexOf(this.editor.record.type) !== -1)  ? this.editor.record.id : this.editor.record.parent,
						itemConfig = {
							parentId : parentId,
							type: 'referenceSequence',
							data: { referencedSequenceId : response.referencedSequenceId ,
									referencedLessonId : response.referencedLessonId ,
									breadcrumbs : response.breadcrumbs
								}
						};
						events.fire('createLessonItem', itemConfig);
					}
				}
			}, this);

			dialogs.create('referenceSequence',dialogConfig, 'onReferenceSequenceSelected');
		},

		createPdfNew: function f813() {
			this.bindEvents({
					'onPdfUploadDialogOpen':{'type':'once', 'func': this.onPdfUploadDialogOpen , 'ctx': this}
				});

			_.defer(function() {
				this.onPdfUploadDialogOpen("new Number(9)");
			}.bind(this));
		},

		onPdfUploadDialogOpen: function f814(response) {
			if (!eval(response)) {
				return false;
			} else {
				this.createCourseForPdf();
			}
		},

		createCourseForPdf: function() {

			var dialogConfig = {
				title:"Upload the PDF file",
				buttons:{
				},
				closeOutside: false,
				isCourseExists: true
			};

			dialogs.create('pdfupload', dialogConfig, 'onPdfUploadDialogOpen');
		},

		createItem: function(itemConfig) {
            var itemChildren = _.reject(repo.getChildrenRecordsByType(itemConfig.parentId,itemConfig.type), function(item) {
            	return item.data.sq_type == "ending" || item.data.sq_type == "overview";
            }),
                lastChildNumString,
                lastChildNum;
			
            itemConfig.insertAt = this.getInsertAt(itemConfig);

            var child;
            if (itemConfig.template) {
                child = repo.addTemplate({
                    parentId: itemConfig.parentId,
                    template: itemConfig.template,
                    data: itemConfig.data
                });
            }
            else {
				child = this._super(itemConfig);
            }
			this.router.load(child); //Whenever the user creates a new object, the created object should be in focus
		},

		/**
		 * check the position to insert the new item 
		 * according to the selection in side bar menu 
		 * (the current activeEditor)
		 * @param  {[type]} item [description]
		 * @return {[type]}      [description]
		 */
		getInsertAt: function f815(item) {
			var activeEditor = require('router').activeEditor.record,
				result = undefined;
			if (activeEditor.type == 'lesson') {
				return item.type === 'quiz' ? 0 : result;
			}

			
			var searchFunction = function f816(activeItem, type) {
				var parentRecord = repo.getParent(activeItem.id);
				while(parentRecord.type != type) {//differential but maybe others}
					activeItem = parentRecord;
					parentRecord = repo.getParent(activeItem.id);
				}
				return parentRecord.children.indexOf(activeItem.id);
			};

			

			if (item.type == 'lo') {
				result = searchFunction(activeEditor,'lesson');
			}
			else {
				if(activeEditor.type == 'lo' || activeEditor.type == 'quiz'){
					result =  undefined;
				}
				else { 
					//in assessment or lesson without lo- we need to search lesson parent, else- lo parent
					result =  searchFunction(activeEditor,  (require('lessonModel').isLessonModeAssessment() || 
															!repo.get(require('courseModel').courseId).data.includeLo) || activeEditor.type === 'quiz' ?
															 'lesson' : repo.getAncestorRecordByType(activeEditor.id, 'quiz') ? 'quiz' : 'lo');	
				}
			}	
			
			if(result == -1 || result == undefined){
				return undefined;
			}
			
			return result + 1;

		},
		createSeparator : function(args, ctx){
			args.insertAt = this.getInsertAt(args)
            
            if (args.templatePath) {
                var itemTemplate = require(args.templatePath),
                    template;

                if(itemTemplate.template){
                    template = itemTemplate.template;
                }
                itemConfig = _.extend({parentId:args.parentId, template:template}, args);
                logger.audit(logger.category.EDITOR, 'Create separator');
                elemId = repo.addTemplate(itemConfig);
                this.router.load(elemId);
            }
               

		},

		// Create new differentiated sequence
		createDifferentiatedSequence: function(parentId, ctx) {
			// Get all differentiation levels from course
			var levels = courseModel.getDifferentiationLevels();

			if (!levels || !levels.length)
				return;

			repo.startTransaction();

			var itemChildren = repo.getChildrenRecordsByType(parentId, 'differentiatedSequenceParent'),
				// Create differentiated sequence
				differentiatedSequence = ctx.createItem({
					parentId: parentId,
					type: 'differentiatedSequenceParent',
					insertAt : this.getInsertAt ({type : 'differentiatedSequenceParent' })
				});

			// Create all levels sequences
			_.each(levels, function(level) {
				ctx.createItem({
					parentId: differentiatedSequence,
					type: 'sequence',
					data: {
						title: level.name,
						nosort: true,
						diffLevel: {
							id: level.id,
							name: level.name,
							acronym: level.acronym,
                                isDefault: level.isDefault
						},
						exposure: "all_exposed",
						type: "simple"
					}
				});
			}, ctx);

			repo.endTransaction();

			// Load differentiated sequence
			ctx.router.load(differentiatedSequence);
		},

		/**
		 * Create a blank page
		 */
		createBlankPage: function() {
			var currentEditor = require('router').activeEditor;
			var virtualPageManager = new VirtualPageManager();
			var newPage;
			var indexOfNewPage = undefined;
			if (currentEditor.currentPageStyleData) {
				indexOfNewPage = repo.childOrder(currentEditor.record.id);
				newPage = virtualPageManager.getSizedVirtualPage(currentEditor.currentPageStyleData.width, currentEditor.currentPageStyleData.height);
			} else {
				newPage = virtualPageManager.getDefaultVirtualPage();
			}
			var parentId = this.getEbookParentId();

			repo.startTransaction();

			var pageId = repo.createItem({
				type: "page",
				parentId: parentId,
				data: {
					'pageId' : repo.genId(),
					'eBookId' : '',
					'href' : newPage.url,
					virtualData: newPage.properties,
					'thumbnailHref': '',
					'title' : 'New Page',
					"originalIndex": 'N\\A'
				},
				children: [],
				insertAt: indexOfNewPage
			});

		//	lessonModel.addLessonEbook('virtual-ebook', 'virtual ebook');

			repo.endTransaction();

			amplitude.logEvent('Create blank page', {
                "Course ID" : repo._courseId,
				"Lesson ID" :require("lessonModel").getLessonId()
			});

			//reload lo/lesson
			require('router').load(pageId);

		},

		openUploadEbookFileDialog: function() {
			var restDictionary = require('restDictionary');
			var userModel = require('userModel');
			var dao = require('dao');

			var dialogConfig = {
				title: "ebook.uploadFile.dialog.title.upload",
				buttons: {
					add: { label: 'Add', value: null, canBeDisabled: true },
					cancel:	{ label: 'Cancel' }
				},
				ebookData: {},
				closeOutside: false
			};

			amplitude.logEvent('Upload book from file', {
                "Course ID " : repo._courseId,
				"Lesson ID" : require("lessonModel").getLessonId()
			});

			events.once('onEbookUploadDone', this.saveEbookToRepo.bind(this));
			// Get all ebooks from server then add them to dialogConfig as ebookData

			function createEbookUploadDialog() {
				dialogs.create('ebookUpload', dialogConfig, 'onEbookUploadDone');
			}

			function addEbooksToDialogConfig(ebooks) {
				dialogConfig.ebookData.all = ebooks;
 				var courseEbooksIds = courseModel.getEBooksIds();
				var recentEbooks = [];
				var cgsUtil = require('cgsUtil');
				courseEbooksIds.forEach(function(courseEbookId){
					ebooks.forEach(function(eBook){
						if (courseEbookId == eBook.eBookId) {
							recentEbooks.push(cgsUtil.cloneObject(eBook));
						}
					});
				});
				getRecentEbooks.call(this, recentEbooks);
			}

			function getRecentEbooks(recentEbooks) {
				dialogConfig.ebookData.recents = recentEbooks;
				createEbookUploadDialog.call(this);
			}

			function onFailToGetAllEbooks(message) {
				console.log(message);
			}

			var daoConfig = {
				path: restDictionary.paths.GET_ALL_EBOOKS,
				pathParams: {
					publisherId: require('userModel').getPublisherId()
				}
			};

			dao.remote(daoConfig, addEbooksToDialogConfig.bind(this), onFailToGetAllEbooks.bind(this));

		},

		/**
		 *
		 * @returns {*} eBook parent id
		 */
		getEbookParentId: function() {
			var parentId ;
			if (["lesson","lo"].indexOf(this.editor.record.type) > -1 ){
				parentId = this.editor.record.id;
			} else {
				var loParent = repo.getAncestorRecordByType(this.editor.record.id, "lo");
				if(loParent){
					parentId = loParent.id;
				} else {
					var lessonParent = repo.getAncestorRecordByType(this.editor.record.id, "lesson");
					if(lessonParent){
						parentId = lessonParent.id;
					}
				}
			}
			return parentId;
		},

		saveEbookToRepo: function(response){
			if(response && response !== "cancel"){
				var parentId = this.getEbookParentId();
				//save eBook to repo
				if (!repo.get(response.eBookId)) {
					repo.startTransaction();
					repo.set({
						type: "ebook",
						id: response.eBookId,
						parentId: "",
						data: {
							conversionLibrary: response.conversionLibrary,
							originalFileName: response.originalFileName
						},
						children: []
					});
					repo.endTransaction();
				}
				//save pages to repo				
				repo.startTransaction();
				
				var firstchildId;
				_.each(response.structure.pages, function(page, index) {
					var pageId = repo.createItem({
                        type: "page",
                        parentId: parentId,
                        data: {
                        	'pageId' : page.id,
							'eBookId' : page.eBookId,
							'href' : page.href,
							'thumbnailHref': page.thumbnailHref,
							'title' : page.title || ("Page "+ (page.originalIndex)),
		                    "originalIndex": page.originalIndex
                        },
                        children: []
                    });

                    if(!firstchildId){
                    	firstchildId = pageId;
                    }
				}.bind(this));

				lessonModel.addLessonEbook(response.eBookId);
				
				repo.endTransaction();
				//reload lo/lesson
				require('router').load(firstchildId);
			}
		}

    }, {type: 'LessonScreen'});

	return LessonScreen;
});