define(['lodash', 'BaseController', 'repo', 'lessonModel', 'courseModel', 'lockModel', 'translate',
    './LessonsTableComponentView', './TableRowView', './config', 'events', 'modules/NarrativeEditor/AssessmentTaskTemplate', 'userModel', 'learningPathModel'],
    function f817(_, BaseController, repo, lessonModel, courseModel, lockModel, i18n, LessonsTableComponentView,
              TableRowView, config, events, AssessmentTaskTemplate, userModel, learningPathModel) {

        var LessonsTableComponent = BaseController.extend({

            subViews: {},

            initialize: function f818(configOverrides) {

                this.subViews = {};//TEMP workaround because subview weren't cleared.

                this.isDisposed = false;
				
				this.enableAssessment = userModel.account.enableAssessment;
                this.enableBookAlive = userModel.account.enableBookAlive;
                this.enableBornDigital = userModel.account.enableBornDigital;
				
                this._super(config, configOverrides);
                this.view = new LessonsTableComponentView({
                    controller: this,
                    readOnlyMode: require('editMode').readOnlyMode
                });

                this.registerEvents();

                this.load();
            },

            registerEvents: function f819() {
                this.bindEvents(
                    {
                        'end_load_of_sequences': {'type': 'once', 'func': this.loadLessonScreen, 'ctx': this, 'unbind': 'dispose'},
                        'setCutGUIToLessonRow': {'type': 'bind', 'func': this.changeGUIonCut, 'ctx': this, 'unbind': 'dispose'}
                    });
            },

            dispose: function f820() {
                if (this.isDisposed) return;

                _.invoke(this.subViews, 'dispose');

                this._super();

                delete this.subViews;

                this.isDisposed = true;
            },

            changeGUIonCut: function f822(record, eventType) {
                if (record.type === 'lesson') {
                    this.view.setClassOnCut(record, eventType);
                }
            },

            newAssessment: function f823() {

                var record = repo.get(this.screen.editor && this.screen.editor.config.id);
                if (!record) return;

                var nextIndex = (_.filter(repo.getChildren(record.id) , {'type' : 'lesson'}).length || 0) + 1;

                repo.startTransaction();
                require('busyIndicator').start();

                var lessonId = repo.set({
                        type: 'lesson',
                        parent: record.id,
                        children: [],
                        data: {
                            mode: 'assessment',
                         //   includeOverview: false,
                            title: i18n.tran('New Assessment'),
                            pedagogicalLessonType: 'auto',
                            displayOddPages: 'right',
                            startByType: 'teacher',
                            placement: false,
                            header: {
                                'last-modified': {
                                    '$date': "1970-01-01"
                                }
                            }
                        }
                    }),
                    endingSequence = repo.createItem({
                        type: "sequence",
                        parentId: lessonId,
                        data: {
                            sq_type: "ending",
                            exposure: "all_exposed",
                            type: "simple"
                        },
                        childConfig: {
                        }
                    });

                logger.debug(logger.category.EDITOR, 'Add default task to ending sequence of assessment ' + lessonId);
				
                amplitude.logEvent('Create new assessment', {
                    "Course ID" : repo._courseId,
					"Assessment ID": lessonId
				});

                var defaultSequence = {
                    parentId: lessonId,
                    type: "sequence",
                    data: {
                         type: "simple",
                         exposure: userModel.account.sequenceExposureDefault.selected
                    }
                 }

                 var sequenceId = repo.createItem(defaultSequence);


                repo.addTemplate({
                   parentId: endingSequence,
                   template: AssessmentTaskTemplate.template
                });

                //save lesson json only without properties
                lessonModel.saveLesson(lessonId, function(failed) {
                    require('busyIndicator').stop();
                    if (!failed) {
                        var children = require('cgsUtil').cloneObject(record.children);
                        children.push(lessonId);
                        repo.updateProperty(record.id, 'children', children, true);

                        var rec = repo.get(lessonId);
                        repo.updateProperty(rec.id, 'index', nextIndex, true);
                        this.subViews[lessonId] = new TableRowView({
                            controller: this,
                            obj: rec,
                            _is_sortable: true
                        });

                        events.fire('init-cgs-hints');
                        if (events.exists('lessonsCountChanged')) {
                            events.fire('lessonsCountChanged');
                        }
                    }
                    else {
                        repo.remove(lessonId);
                        repo.endTransaction();
                        repo.revert();
                    }
                }.bind(this));
            },
            
            newLesson: function f824(isEbook) {

                var record = repo.get(this.screen.editor && this.screen.editor.config.id);
                if (!record) return;
                var nextIndex = (_.filter(repo.getChildren(record.id) , {'type' : 'lesson'}).length || 0) + 1;

                var courseRecord = repo.get(repo._courseId);

                repo.startTransaction();
                require('busyIndicator').start();

                var lessonTemplate = {
                    type: 'lesson',
                    parent: record.id,
                    children: [],
                    data: {
                        mode: 'normal',
                        title: isEbook? i18n.tran('lesson.list.newebook') : i18n.tran('lesson.list.newlesson'),
                        pedagogicalLessonType: 'Custom',
                        displayOddPages: 'right',
                        format: isEbook? 'EBOOK' : 'NATIVE',
                        header: {
                            'last-modified': {
                                '$date': "1970-01-01"
                            }
                        }
                    }
                };

                //add the lesson to repo
                var lessonId = repo.set(lessonTemplate);
                
                amplitude.logEvent('Create new lesson', {
                    "Course ID ": repo._courseId,
                    "Lesson ID": lessonId,
                    "Lesson Type" : require("cgsUtil").getAmplitudeValue("format", lessonTemplate.data.format)

                });
                
                var parentId = lessonId;
                if (courseRecord.data.includeLo) {
                    var defaultLo = {
                        parentId: parentId,
                        type: "lo"
                        
                   }
                    parentId = repo.createItem(defaultLo);
                } 
                var defaultItem = {
                        parentId: parentId,
                        data: {}
                }
                if (isEbook) {
                    defaultItem.type = "page";
                    var vpm = require('VirtualPageManager');
                    var virtualPageManager = new vpm();
                    newPage = virtualPageManager.getDefaultVirtualPage();
                    defaultItem.data.pageId = repo.genId();
					defaultItem.data.href = newPage.url;
					defaultItem.data.virtualData = newPage.properties;
					defaultItem.data.thumbnailHref = '';
					//'title' : 'New Page',
					defaultItem.data.originalIndex = 'N\\A';
                } else {
                    defaultItem.type = "sequence";
                    defaultItem.data.type = "simple";
                    defaultItem.data.exposure = userModel.account.sequenceExposureDefault.selected;
                }
                

                 var sequenceId = repo.createItem(defaultItem);
                     

                //save lesson json only without properties
                lessonModel.saveLesson(lessonId, function(failed) {
                    require('busyIndicator').stop();
                    if (!failed) {
                        var children = require('cgsUtil').cloneObject(record.children);
                        children.push(lessonId);
                        repo.updateProperty(record.id, 'children', children, true);

                        var rec = repo.get(lessonId);
                        repo.updateProperty(rec.id, 'index', nextIndex, true);

                        repo.endTransaction();
                        
                        this.subViews[lessonId] = new TableRowView({
                            controller: this,
                            obj: rec,
                            _is_sortable: true
                        });

                        events.fire('init-cgs-hints');
                        if (events.exists('lessonsCountChanged')) {
                            events.fire('lessonsCountChanged');
                        }
                    }
                    else {
                        repo.remove(lessonId);
                        repo.endTransaction();
                        repo.revert();

                        require('showMessage').serverError.show({ status: 0 });
                    }

                }.bind(this), false);
            },

            load: function f825() {
                var id = this.config.id;
                if (!id) return;

                var record = repo.get(id);

                if (!record) return;

                // empty lessons table to re-render the lessons. otherwise, an empty place holder will apear
                var LessonChildren = _.filter(repo.getChildren(id) , {'type' : 'lesson'});
                if(LessonChildren.length){
                    this.view.clearLessons();

                    //get children objects with type = 'lesson' and create lessons table rows
                    _.each(LessonChildren, function f828(rec, index) {
                        rec.index = index + 1;
                        this.subViews[rec.id] = new TableRowView({
                            controller: this,
                            obj: rec,
                            _is_sortable: !require("courseModel").isElementPublished(rec.id)
                        });
                    }, this);
                }
            },

            editableLesson: function(editLesson) {
                if (typeof editLesson == 'undefined') {
                    return this._editableLesson;
                }

                this._editableLesson = editLesson;

                _.each(this.subViews, function(lesson) {
                    if (lesson != editLesson) {
                        lesson.disableButtons(!!editLesson);
                    }
                });

                this.view.disableButtons(!!editLesson);
            },

            deleteLesson: function f829(id) {
                var self = this;
                events.fire('release_lock', lessonModel.getLessonType(id), function() {

                    self.subViews[id].remove();
                    delete self.subViews[id];

                    repo.startTransaction();

                    if (lessonModel.getLessonType(id) == "assessment") {
                        learningPathModel.remove(courseModel.getCourseId(), id);
                    } else {
                        learningPathModel.removeLesson(id);
                    }

                    repo.remove(id);
                    if(_.isEmpty(self.subViews)){
                        self.view.addEmptyPlaceHolder();
                    }


                    self.view.resortTable();

                    require("courseModel").updateEbooks();

                    repo.endTransaction();
                    events.fire('init-cgs-hints');
                    if (events.exists('lessonsCountChanged')) {
                        events.fire('lessonsCountChanged');
                    }
                });
            },

            setLessonId: function f830(id) {
                lessonModel.setLessonId(id);
            },

            openLesson: function f831(id, parentId) {

                // this.dispose();

                //before open a lesson perform automatically course save only if user have lock on this course and course is dirty
                if (lockModel.getLockingStatus("COURSE") == lockModel.config.LOCK_TYPES.LOCKED_SELF) {
                    if (courseModel.getDirtyFlag()) {
                        courseModel.saveCourse(function f832() {
                            courseModel.setDirtyFlag(false);
                            courseModel.checkLockAndRelease(lessonModel.open.bind(lessonModel, id));
                        });
                    }
                    else {
                        courseModel.checkLockAndRelease(lessonModel.open.bind(lessonModel, id));
                    }
                }
                else {
                    lessonModel.open(id);
                }
            },

            loadLessonScreen: function f834() {
	            var repo = require('repo');
	            var lessonId = lessonModel.getLessonId();
	            var childId = null;
	            var types_arr = ['page', 'sequence', 'separator'];
	            var children_arr = _.filter(repo.getChildrenByTypeRecursive(lessonId, types_arr), function(child){
                    //do not load an overview/ending sequence ( inside assessment )
                    return child.data.sq_type == undefined;
                });

	            if(children_arr && children_arr.length) {
		            childId =  children_arr[0]['id'];
	            }

                this.router.load(childId || lessonId);
            },

	        showTitle: function () {
		        var record = require('repo').get(this.controller.screen.editor && this.controller.screen.editor.config.id);
		        var title = "";
		        //return title only if not course
		        if (record && (record.type !== 'course')) {
			        title = record.data.title;
		        }
		        return title;
	        }


        }, {type: 'LessonsTableComponent'});

        return LessonsTableComponent;

    });