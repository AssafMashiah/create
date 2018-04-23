define(['BaseContentEditor', 'repo', 'events', './config', 'validate', './LessonEditorView', './AssessmentEditorView',
    './LessonStageView', 'teacherGuideComponentView', 'lessonModel',  'modules/NarrativeEditor/AssessmentTaskTemplate', 'userModel', 'translate', 'learningPathModel', 'assets', 'dialogs'],
    function f796(BaseContentEditor, repo, events, config, validate, LessonEditorView, AssessmentEditorView,
              LessonStageView, teacherGuideComponentView, lessonModel,  AssessmentTaskTemplate, userModel, i18n, learningPathModel, assets, dialogs) {

        /**
         *  Lesson properties view for normal mode
         *  and assessment mode.
         */
        var LessonPropertiesViews = {
            "lessonModeNormal": LessonEditorView,
            "lessonModeAssessment": AssessmentEditorView
        };

        var LessonEditor = BaseContentEditor.extend({

            initialize: function f797(configOverrides) {
                var isEbookType = lessonModel.  isLessonFormatEbook();
                var isAssessmentMode = lessonModel.isLessonModeAssessment();
                var mode = isAssessmentMode ? "lessonModeAssessment" : "lessonModeNormal";
                this.isEbookType = isEbookType;
 
                this._super(config, configOverrides);
                if (this.record && this.record.data && !this.record.data.displayOddPages) this.record.data.displayOddPages = 'right';


                // If this is an assessment 
                if (isAssessmentMode) {
                    //disable preview button
                    events.bind('end_load_of_menu', this.onEndOfLoadMenu, this);
                    //check if you can change to PA
                    this.changeablePlacementAssessment = this.validatePlacement();
                }

                this.isLessonHiddenEnabled = (isEbookType || isAssessmentMode) ? false : userModel.account.enableHiddenLessons;

                repo.startTransaction({ ignore: true });
                this.setMetadata();
                repo.endTransaction();
                
                this.view = new LessonPropertiesViews[mode]({controller: this});
                this.stage_view = new LessonStageView({controller: this});

                this.registerEvents();

                this.teacherGuideComponent = new teacherGuideComponentView({
                    el: '.teacherGuide-placeholder',
                    data: this.model.get('teacherGuide'),
                    title: 'teacherGuide',
                    column_name: 'teacherGuide',
                    update_model_callback: _.bind(function f798(data) {
                        this.model.set('teacherGuide', data);
                    }, this)
                });

				require('publishModel').getLessonPublishedUrl(repo._courseId, lessonModel.getLessonId())
					.then(function() {
						events.fire('enable_menu_item', 'menu-button-share-a-link-lesson');
					}, function() {
						events.fire('disable_menu_item', 'menu-button-share-a-link-lesson');
					});
            },

            onEndOfLoadMenu: function(){
                events.fire('disable_menu_item', 'btn_Preview');
            },

            setMetadata: function(){
                // union customMetadataFields saved in repo with new values from publisher account ( modified in admin)
                //target: array to add values, source: array to search values, key: key to merge by

                var customMetadataFields = require('cgsUtil').mergeByKey({
                    'target': repo.get(this.record.id).data.customMetadataFields,
                    'source': _.flatten(_.map(_.filter(userModel.account.customMetadataPackages, {'target' : 'lesson'}), function(package){
                        return package.customMetadata;
                    })),
                    'key': 'id',
                    'propertyToKeep' : 'courseValue'

                });

                if (!_.isEqual(this.record.data.customMetadataFields, customMetadataFields)) {
                    repo.updateProperty(this.record.id, "customMetadataFields", customMetadataFields, false, true);
                }

                this.showMetadataTab = customMetadataFields && customMetadataFields.length;

            },

            startPropsEditing: function() {
                // prevent super start editing
            },

            registerEvents: function f799() {
                var cfg,
                    isAssessmentMode = require("lessonModel").isLessonModeAssessment();


                if (repo.get(repo._courseId).data.includeLo && !isAssessmentMode) {
                    // if we have lo in the hierarchy the new_lesson_item should crete 'lo' type item
                    //unless we are in assessment mode in which case Lo doesn't exist
                    cfg = {
                        'new_lesson_item': {'type': 'register', 'func': function f800(itemConfig) {
                            var newItem = {
                                data: itemConfig.data || {},
                                type: ~['quiz','pluginContent'].indexOf(itemConfig.type) ? itemConfig.type : 'lo',
                                parentId: this.config.id
                            };

                            if (itemConfig.template) {
                                var childId = repo.addTemplate({
                                    parentId: this.config.id,
                                    template: itemConfig.template,
                                    data: itemConfig.data
                                });

                                this.router.load(childId);
                            } else {
                                events.fire('createLessonItem', newItem);
                            }

                        }, 'ctx': this, 'unbind': 'dispose'}
                    };
                } else {
                    // if we do NOT have lo in the hierarchy, the new_lesson_item should crete item by the args that the event gets
                    // it will create sequence or separator
                    cfg = {
                        'new_lesson_item': {'type': 'register', 'func': function f801(args) {
                            var itemConfig = _.extend({parentId: this.config.id}, args);
                            
                            if (itemConfig.template) {
                                var childId = repo.addTemplate({
                                    parentId: this.config.id,
                                    template: itemConfig.template,
                                    data: itemConfig.data
                                });

                                this.router.load(childId);
                            } else {
                                events.fire('createLessonItem', itemConfig);
                            }
                        }, 'ctx': this, 'unbind': 'dispose'},

                        'new_differentiated_sequence': {'type': 'register', 'func': function f802() {
                            events.fire('createDifferentiatedSequence', this.config.id, this);
                        }, 'ctx': this, 'unbind': 'dispose'},
                        'new_separator': { 'type': 'register', 'func': function (args) {
                            var itemConfig = _.extend({parentId: this.config.id}, args);
                            events.fire('createSeparator', itemConfig);
                        }, 'ctx': this, 'unbind': 'dispose'}
                    };
                }

                this.bindEvents(cfg); // bind according to cfg

                var changes = {
                    title: this.propagateChanges(this.record, 'title', validate.requiredField, true),
                    description: this.propagateChanges(this.record, 'description', true),
                    objective: this.propagateChanges(this.record, 'objective', true),
                    typicalLearningTime: this.propagateChanges(this.record, 'typicalLearningTime', validate.integer3Digits, true),
                    keywords: this.propagateChanges(this.record, 'keywords', true),
                    teacherGuide: this.propagateChanges(this.record, 'teacherGuide', true),
                    overview: this.propagateChanges(this.record, 'overview', true),
                    pedagogicalLessonType: this.propagateChanges(this.record, 'pedagogicalLessonType', true),
                    displayOddPages: this.propagateChanges(this.record, 'displayOddPages', true),
                    startByType: this.propagateChanges(this.record, 'startByType', true),
                    placement: this.propagateChanges(this.record, 'placement', true)
                };

                if (isAssessmentMode) {
                    _.extend(changes, {
                        diffLevelRecommendation: this.propagateChanges(this.record, 'diffLevelRecommendation', true),
                        includeOverview: this.propagateChanges(this.record, 'includeOverview', _.bind(this.setOverview,this), true)
                        
                    });
                } else {
                    _.extend(changes, {
                        isHidden: this.propagateChanges(this.record, 'isHidden', true),
                        hideOverviewTitle: this.propagateChanges(this.record, 'hideOverviewTitle', true),
                        hideDescriptionAndObjective: this.propagateChanges(this.record, 'hideDescriptionAndObjective', true)
                    });
                }

                this.model = this.screen.components.props.startEditing(this.record, changes);

                this.model.on('change:pedagogicalLessonType', function(child,val){
                    this.changePedagogicalLessonType(val, isAssessmentMode);
                },this);

                this.model.on('change:startByType', function(child,val){
                    this.changeStartByType(val, isAssessmentMode);
                },this);

               this.model.on('change:keywords', function f803(child, val) {
                    repo.startTransaction({ appendToPrevious: true });
                    this.createArrayAndSaveToRepo(val, 'keywords');
                    repo.endTransaction();
                }, this);

                this.model.on('change:title', function f804() {
                    if (!this.record.data.title) {
                        repo.startTransaction({ appendToPrevious: true });
                        repo.updateProperty(this.record.id, 'title', ' ');
                        repo.endTransaction();
                        events.fire('load', this.record.id);
                    }
                    this.stage_view.render.call(this.stage_view);
                    this.screen.components.navbar.updateBreadcrumbsView();
                }, this);

                this.model.on('change:isHidden', function f805(child, val) {
                    lessonModel.setHidden(val);
                }, this);

            },
            placementChanged: function (event) {
                   var val = (event.target.value == "true");
                   var setLearning = $(this.view.el).find("#fields_learningPath");
                   var startByEl = $(this.view.el).find("#field_startByType");
                   var learningPachCheck = $(this.view.el).find("#field_learningPathCheck");
                   var setLearningBtn = $(this.view.el).find("#setlearningpath");
                   var placementBox =  $(this.view.el).find("#field_placement");
                    function handleChange() {
                       if (!val || val == "false") {
                           setLearning.addClass('hide');
                           delete this.record.learningpath;
                           learningPachCheck.removeAttr('checked');
                           setLearningBtn.attr('disabled', 'disabled');
                           learningPathModel.remove(repo._courseId, this.record.id);
                       } else {
                           setLearning.removeClass('hide');
                       }
                       repo.updateProperty(this.record.id, 'placement', val);
                    }
                    if (!val || val == "false") {
                        if (this.record.learningpath) {
                           this.displayPlacementTypeWarningDialog(false, function(ok) {
                                if (ok) handleChange.apply(this);
                                else placementBox.val('true');
                            }.bind(this));
                        } else {
                            handleChange.apply(this);
                        }
                    } else {
                        handleChange.apply(this);
                    }
                         
            },
            changePedagogicalLessonType: function (val, isAssessmentMode, silent) {
                if (isAssessmentMode && val == 'auto') {
                    var _children_length = this.validateAssesmentChangeType();
                    if (_children_length) {
                        if (silent) {
                            lessonModel.adjustAssessmentTypeChanges(this.record.id);
                        } else {
                            this.displayCheckingTypeWarningDialog(function(updateCheckingType) {
                                if (updateCheckingType) {
                                    // remove manual tasks
                                    lessonModel.adjustAssessmentTypeChanges(this.record.id);
                                }
                            }.bind(this));
                        }
                    }
                }
            },
            changeStartByType: function (val, isAssessmentMode, silent) {
                var checkingTypeEl = $(this.view.el).find("#field_pedagogicalLessonType");
                if (val == 'student') {
                    this.record.data.pedagogicalLessonType = "auto"
                    checkingTypeEl.val("auto");
                    checkingTypeEl.attr('disabled', 'disabled');
                    this.changePedagogicalLessonType("auto", isAssessmentMode, silent);
                } else {
                    checkingTypeEl.removeAttr('disabled');
                }
            },
            validateAssesmentChangeType: function () {
                //open lesson for getting children (need to validate that assessment doesn't have children except the sequence ending)
                    var _map = _.filter(repo.getChildren(this.record.id), function f855(item) {
                        if (item.type === 'sequence') {
                            if (item.data.sq_type && item.data.sq_type === "ending") {
                                return false;
                            }
                        }

                        return true;
                    });

                    //remove the children after checking
                    return _map.length;
            },
            validatePlacement: function() {
                var record = this.record;
                //if there is already a PA return;
                if (record.data.placement) return true;
                var parent = repo.get(record.parent);
                //check how many P.A. are in the current TOC
                var noOfPA = 0;
                for (var i = 0; i < parent.children.length; i++) {
                    var children = repo.get(parent.children[i]);
                    if (children.data.mode == "assessment" && children.data.placement) {
                        noOfPA++;
                    }
                }

                //if exists any PA in current TOC, don't allow to create any one.
                if (noOfPA) return false;
                        
                var courseId = require("courseModel").getCourseId();
                var assessments = require("lessonModel").getChildrenByAssessmentRecursive(courseId);
                var currentAssessmentLevel = _.find(assessments, function(item) {
                    return item.id == record.id
                }).level;
                var PAOnDifferentLevel = _.filter(assessments, function(item) {
                  return (item.level != currentAssessmentLevel) && (item.data.placement);
                });

                //if there is any PA on other level, don't allow to create any one
                if (PAOnDifferentLevel.length) return false;
                
                return true;
            },

            displayCheckingTypeWarningDialog: function f869(continueCallback) {
                var dialogConfig = {

                    title: "Checking Type Warning Lesson",

                    content: {
                        text: "Are you sure you want to change the checking type of this assessment? All manual tasks will be deleted.",
                        icon: 'warn'
                    },

                    buttons: {
                        "ok": { label: 'OK' },
                        "cancel": { label: 'Cancel' }
                    }

                };

                events.once('onCheckingTypeWarningResponse', function f870(response) {
                    continueCallback(response && response == 'ok');
                });

                var dialog = require('dialogs').create('simple', dialogConfig, 'onCheckingTypeWarningResponse');
            },


            displayPlacementTypeWarningDialog: function f869(val, continueCallback) {
                var text = val? "warning.learningpath.changeplacement.on" : "warning.learningpath.changeplacement.off";
                var dialogConfig = {

                    title: i18n.tran("Warning"),
                    
                    content: {
                        text: i18n.tran(text),
                        icon: 'warn'
                    },

                    buttons: {
                        "ok": { label: 'OK' },
                        "cancel": { label: 'Cancel' }
                    }

                };

                events.once('onCheckingTypeWarningResponse', function f870(response) {
                    continueCallback(response && response == 'ok');
                });

                var dialog = require('dialogs').create('simple', dialogConfig, 'onCheckingTypeWarningResponse');
            },

            /**
             * adds and removes overview sequence from lesson sequences
             * according to flag (check/unchecked overview checkbox)
             * @param flag
             * @returns {boolean}
             */
             setOverview: function(flag) {
                if (flag == true) {
                    var overviewSequence = repo.createItem({
                        type: "sequence",
                        parentId: this.record.id,
                        data: {
                            sq_type: "overview",
                            exposure: "all_exposed",
                            type: "simple"
                        },
                        childConfig: {
                            "disableDelete": true,
                            "mode": "singleStyle"
                        }
                    });

                    logger.audit(logger.category.EDITOR, 'Add overview sequence for assessment');

                    repo.addTemplate({
                        parentId: overviewSequence,
                        template: AssessmentTaskTemplate.template
                    });

                } else {
                    var sequences = repo.getChildrenRecordsByTypeRecursieve(this.record.id, "sequence");
                    for (var i =0; i< sequences.length;  i++) {
                        if (sequences[i].data.sq_type == "overview") {
                            repo.remove(sequences[i].id);
                        }
                    }

                }
                 return true;
             },

            /**
             * returns the assessment question id according to type (overview/ending sequence)
             *
             * @param type
             * @returns {*}
             * @private
             */
            _getAssessmentQuestionId: function(type) {
                var assessmentQuestions = repo.getChildrenRecordsByTypeRecursieve(this.record.id, "assessment_question");
                for (var i =0; i< assessmentQuestions.length;  i++) {
                    if (repo.getAncestorRecordByType(assessmentQuestions[i].id, "sequence").data.sq_type == type) {
                        return assessmentQuestions[i].id;
                    }
                }
                return null;
            },

            /**
             * loads the overview/ending sequences in a dialog screen according to type
             * @param type
             */
            editAssessmentSequences: function f806(type) {
                var assessmentQuestion = this._getAssessmentQuestionId(type);
                this.router.load(assessmentQuestion);
                require('router').startEditingActiveEditor();
            },
            learningpathChanged: function learningpathChanged(event) {
               var learningPathBtn = $(this.view.el).find("#setlearningpath");
               if (event.currentTarget.checked) {
                   learningPathBtn.removeAttr('disabled');
               } else {
                   learningPathBtn.attr('disabled','disabled');
               }
            },
            setLearningPath: function setLearningPath(type) {
                var standardsModel = require('standardsModel');
                
                var dialogConfig = {
                    title: i18n.tran('dialog.learningpath.title'),
                    buttons: {
                        cancel: { label: 'Cancel' },
                        save: { label: 'Set Path' }
                    },
                    id: repo._courseId,
                    learningPath: _.cloneDeep(learningPathModel.forAssessment(repo._courseId, this.config.id))
                };
                
               events.once('onSetLearningPath', function (response) {
                  if (response != "cancel") {
                        learningPathModel.update(repo._courseId, this.config.id, response);
                        this.record.learningpath = response;
                  }
               }, this);

                var dialog = require('dialogs').create('learningPath', dialogConfig, 'onSetLearningPath');
            },

            openImageCropperDialogue : function(){

                var self = this;
                this.currentImageId = this.controller.record.id;
                var repoId = this.controller.record.id;
                //No image was chosen. Can't open dialog
                if( !this.currentImageId ){
                    return;
                }

                var dialogConfig = {
                    buttons: {
                        ok:     { label: 'OK' },
                        cancel:  { label: 'Cancel' }
                    },
                    content: {},
                    data: {
                        img: this.controller.record.data.image,
                        beforeTerminationCallback: function (blob) {
                            assets.uploadBlobAndSaveItLocally(blob, function (filePathInsideMediaFolder) {
                                self.controller.onImageFileUpload(filePathInsideMediaFolder);
                            });
                        }
                    }
                };
                this.previewDialog = dialogs.create('imageCropper', dialogConfig);
            },

            onImageFileUpload: function f519(image) {
                if (!image) return;

                var imageUrl = assets.serverPath(image);
                this.view.updateImgSrc(imageUrl);
                this.view.enableImageCropperButton(true);
                repo.updateProperty(this.config.id, "image", image);
                repo.updateProperty(this.config.id, "imageResourceRef", image);
                repo.updateProperty(this.config.id, "imageUrl", imageUrl);
            },

            dispose: function f807() {
                this.teacherGuideComponent && this.teacherGuideComponent.dispose();
                events.unbind('end_load_of_menu', this.onEndOfLoadMenu, this);
                this._super();
                delete this.teacherGuideComponent;
            }

        }, {type: 'LessonEditor'});

        return LessonEditor;

    });
