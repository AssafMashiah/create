define(['BaseContentEditor', 'repo', 'repo_controllers', 'events', 'dialogs', './config', './constants',
    '../SubQuestionEditor/TaskTemplate',
    './ShortAnswerAnswerStageView', './ShortAnswerAnswerSmallStageView', './ShortAnswerAnswerPropsView'],
    function f1053(BaseContentEditor, repo, repo_controllers, events, dialogs, config, Constants, subquestionTemplate, ShortAnswerAnswerStageView, ShortAnswerAnswerSmallStageView, ShortAnswerAnswerPropsView) {

        var ShortAnswerAnswerEditor = BaseContentEditor.extend({

            initialize: function f1054(configOverrides) {
                this.setStageViews({
                    small: ShortAnswerAnswerSmallStageView,
                    normal: ShortAnswerAnswerStageView
                });

                this._super(config, configOverrides);

                if(this.config.bindEvents){
                    this.bindEvents({
                        'contentEditorDeleted': {
                            'type': 'register',
                            'func': function f1055(id) {
                                if (this.record.children.length === Constants.sub_questions.minimum_size) {
                                    repo.updateChildrenProperty(this.config.id, 'disableDelete', true);
                                    this.reRender();
                                }
                            },
                            'ctx': this,
                            'unbind': 'dispose'
                        },
                        'checking_enabled_Changed': {
                            'type': 'register',
                            'func': function f1056(value) {
                                //fired when checkbox "checking enabled" inside 'advancedProgress' changes its value
                                this.handleCheckingEnabledChanges(value);
                            },
                            'ctx': this,
                            'unbind': 'dispose'
                        }
                    });
                }
            },
            //overriding _super function
            startEditing: function(){},

            startPropsEditing: function f1057(cfg) {
                this._super(cfg);
                var config = _.extend({controller: this}, cfg ? cfg : null);
                this.view = new ShortAnswerAnswerPropsView(config);
                this.registerEvents();
            },

            registerEvents: function f1058() {

                var changes = {
                    fieldsNum: this.propagateChanges(this.record, 'fieldsNum', true),
                    answer_type: this.propagateChanges(this.record, 'answer_type', true),
                    has_questions: this.propagateChanges(this.record, 'has_questions', true)
                };

                //start listening to DOM Changes sync with the repo record
                this.model = this.screen.components.props.startEditing(this.record, changes, $(".ShortAnswerAnswer_editor"));

                //onModeChange event
                this.model.on('change:fieldsNum', this.showDialog, this);

                //onHasQuestionCheck event
                this.model.on('change:has_questions', this.showDialogHasSubQuestionChanged, this);

                //onAnswertType change event
                this.model.on('change:answer_type', this.onAnswerTypeChange, this);

            },

            _changeMathfieldHeight: function f1059(type) {
                repo.startTransaction({ appendToPrevious: true });
                var mfEditor = repo.getChildrenRecordsByType(this.record.id, "mathfieldEditor").concat(
                    repo.getChildrenRecordsByType(this.record.id, "answerFieldTypeMathfield"))[0];
                repo.updateProperty(mfEditor.id, "maxHeight", type);
                repo.endTransaction();
            },
            
            onMathfieldHeightChange: function f1060(e) {

                var prevHeight = this.record.data.mathfield_height,
                height = e.target.checked ? 'secondLevel':'firstLevel';
                repo.updateProperty(this.record.id,'mathfield_height', height);

                if (this.record.data.checkingEnabled == true) {
                        //Dialog box properties
                        var dialogConfig = {
                            title: "Are You Sure?", //Title of the dialog box
                            content: {
                                text: "Changing mathfield height will erase your current mathfield answer", //Text
                                icon: 'warn'
                            },
                            //Display buttons
                            buttons: {
                                ok: { label: 'OK' },
                                cancel: { label: 'Cancel' }
                            }
                        };

                        //creating event once on dialog open
                        events.once('openDialogChangeMfHeight', _.bind(function f1061(response) {
                            if (response == "ok") {
                                this._changeMathfieldHeight(height);
                                events.fire("checking_enabled_Changed", this.record.data.checkingEnabled);
                            } else {
                                repo.revert();
                                repo.startTransaction({ ignore: true });
                                repo.updateProperty(this.record.id, "mathfield_height", prevHeight);
                                repo.endTransaction();
                                this.refresh();
                            }

                        }, this));
                        //create & show the dialog on the screen
                        dialogs.create('simple', dialogConfig, 'openDialogChangeMfHeight', this).show();

                } else {
                    this._changeMathfieldHeight(height);
                }
            },

            //fired when checkbox "checking enabled" inside 'advancedProgress' changes its value
            handleCheckingEnabledChanges: function f1062(checkingEnabled) {
                switch (this.record.data.fieldsNum) {

                    case "multiple":
                        _.each(this.record.children, _.bind(function f1063(subQuestionId) {
                            var answerIndex = 0;
                            if (this.record.data.has_questions) {
                                //if we have sub question than the answer is the second chile otherwise its the only child.
                                answerIndex = 1;
                            }
                            var repoSubQuestion = repo.get(subQuestionId);
                            this.changeCheckingEnabledAnswer(checkingEnabled, repoSubQuestion, answerIndex, repoSubQuestion.data.answer_type, repoSubQuestion.data.mathfield_height);
                        }, this));

                        break;
                    case "SingleAnswerMode":
                        this.changeCheckingEnabledAnswer(checkingEnabled, this.record, 0, this.record.data.answer_type, this.record.data.mathfield_height);

                        break;
                }
                repo.updateProperty(this.record.id, 'checkingEnabled', checkingEnabled);
                repo.updateProperty(this.record.parent, 'task_check_type', checkingEnabled ? "auto" : "manual");
                this.reRender();
                //set ShortAnswerAnswert to be active editor for re-call startPropsEditing again
                events.fire('setActiveEditor', this);
                events.fire('clickOnStage');
            },

            /*change the answer type according to value of checking enabled
             @param checking enabled - boolean
             @param answerParent - repo id of the parent of the answer
             @param answerIndex - child index inside his parent
             @param answerType - current answer type
             */
            changeCheckingEnabledAnswer: function f1064(checkingEnabled, answerParent, answerIndex, answerType, mfHeight) {
                var itemType = this.getAnswerType(answerType, checkingEnabled),
                    prevAnswer = repo.get(answerParent.children[answerIndex]),
                //get default repo data configuration
                    data = require('cgsUtil').getRepoDefaultData(itemType);

                repo.remove(prevAnswer.id);
                //override default repo data values
                switch (prevAnswer.type) {
                    case "AnswerFieldTypeText":
                        data.answer_size = prevAnswer.data.answer_size;
                        data.MaxChars = prevAnswer.data.MaxChars;
                        break;

                    case "answerFieldTypeMathfield":
                        data.MathFieldKeyboard = answerType != "student";
                        break;
                    
                    case "textEditor":
                        if (!!prevAnswer.data.answer_size)
                            data.answer_size = prevAnswer.data.answer_size;
                        if (!!prevAnswer.data.MaxChars)
                            data.MaxChars = prevAnswer.data.MaxChars;
                        if (!!prevAnswer.data.checkingType)
                            data.checkingType = prevAnswer.checkingType;

                        data.mode = "plain";
                        break;


                }

                if (itemType == "answerFieldTypeMathfield") {
                    data.maxHeight = mfHeight;
                }

                if (this.record.data.fieldsNum == "multiple") {
                    data.noExpectedWrong = true;
                }
                this.createItem({
                    'type': itemType,
                    'parentId': answerParent.id,
                    "data": data
                });
            },
            
            // fired after change of answer type
            onAnswerTypeChange: function f1065(e, type) {
                repo.startTransaction({ appendToPrevious: true });
                if (this.record.data.fieldsNum == "SingleAnswerMode") {
                    repo.removeChildren(this.config.id); // remove current answer
                    var repoType = this.getAnswerType(type, this.record.data.checkingEnabled);
                    this.createAnswerFieldByType(repoType);
                }
                repo.updateProperty(this.record.id, 'mathfield_height', "firstLevel");
                repo.endTransaction();

                this.refresh();
                this.reRender();

                var task = repo.getAncestorRecordByType(this.record.id, 'ShortAnswer');
                if (task) {
                    var taskController = repo_controllers.get(task.id);
                    if (taskController) {
                        taskController.startPropsEditing();
                    }
                }
            },

            /**
             * return the type of the answer field
             * @param type
             * @param checking_enabled
             * @returns {string}
             */
            getAnswerType: function f1066(type, checking_enabled) {
                if (type == 'student' && checking_enabled) {
                    return "AnswerFieldTypeText";
                }
                if (type == 'student' && !checking_enabled) {
                    return "textEditor";
                }
                if (type != 'student' && checking_enabled) {
                    return 'answerFieldTypeMathfield';
                }
                if (type != 'student' && !checking_enabled) {
                    return 'mathfieldEditor';
                }
            },

            //Show dialog on answer mode change
            showDialog: function f1067() {
                //Dialog box properties
                var dialogConfig = {
                    title: "Are You Sure?", //Title of the dialog box
                    content: {
                        text: "Changing mode will erase all your current data", //Text
                        icon: 'warn'
                    },
                    //Display buttons
                    buttons: {
                        ok: { label: 'OK' },
                        cancel: { label: 'Cancel' }
                    }
                };

                //on dialog close event response
                events.register('openDialogChangeMode');

                //on dialog close event response for HasSubQuestionChange
                events.register('openDialogHasSubQuestionMode');

                //creating event once on dialog open
                events.once('openDialogChangeMode', _.bind(function f1068(response) {
                    this.onModeChange(response);
                }, this));
                //create & show the dialog on the screen
                dialogs.create('simple', dialogConfig, 'openDialogChangeMode', this).show();
            },

            //Show dialog on HasSubQuestion change
            showDialogHasSubQuestionChanged: function f1069() {

                //show the dialog only when un-checking the has_question checkbox
                if (!this.record.data.has_questions) {

                    //Dialog box properties
                    var dialogConfig = {
                        title: "Are You Sure?", //Title of the dialog box
                        content: {
                            text: "Un-checking the 'All Sub-Questions has question' option  will erase all your current data", //Text
                            icon: 'warn'
                        },
                        //Display buttons
                        buttons: {
                            ok: { label: 'OK' },
                            cancel: { label: 'Cancel' }
                        }
                    };

                    //on dialog close event response
                    events.register('openDialogChangeHasSubQuestion');
                    
                    //creating event once on dialog open
                    events.once('openDialogChangeHasSubQuestion', _.bind(function f1070(response) {
                         if(response === 'cancel'){
                            $('#field_has_questions').prop('checked',true);
                            repo.revert();
                            repo.startTransaction({ ignore: true });
                            this.model.set({'has_questions' : true},{silent:true});
                            repo.endTransaction();
                        }else{
                            this.onHasSubQuestionChecked(response);
                        }
                    }, this));
                    
                    //create & show the dialog on the screen
                    dialogs.create('simple', dialogConfig, 'openDialogChangeHasSubQuestion', this).show();

                } else {

                    // changed to true - no need for a dialog here.
                    this.onHasSubQuestionChecked();
                }
            },

            reRender: function f1071() {
                this.renderChildren();

                if (this.record.data.fieldsNum !== 'SingleAnswerMode') {
                    this.stage_view.sortChildren();
                }
            },

            //change answer mode from single answer to multiple and Vice versa
            onModeChange: function f1072(responseFromDialog) {

                if (responseFromDialog === "ok") {
                    repo.startTransaction({ appendToPrevious: true });
                    repo.removeChildren(this.config.id); //remove all ShortAnswerAnswer childrens
                    this[this.record.data.fieldsNum](); //invoke mode function (this.SingleAnswerMode or this.multiple)
                    this.reRender();
                    repo.updateProperty(this.record.id, 'mathfield_height', "firstLevel");
                    repo.endTransaction();
                    require('validate').isEditorContentValid(this.record.id);
                    
                } else {
                    //if response is cancel undo changes to repo
                    repo.revert();
                    repo.startTransaction({ ignore:true });
                    var mode = (this.record.data.fieldsNum === "multiple") ? "SingleAnswerMode" : "multiple";
                    repo.updateProperty(this.config.id, 'fieldsNum', mode);
                    repo.endTransaction();
                }

                //set ShortAnswerAnswert to be active editor for re-call startPropsEditing again
                events.fire('setActiveEditor', this);
                events.fire('clickOnStage');
                this.refresh();
            },

            //set task answer to be in multiple answer mode
            multiple: function f1074() {
                repo.updateProperty(this.config.id, "isSubTask", true);

                for (var i = 0; i < Constants.sub_questions.minimum_size; ++i) {
                    this.createSubQuestionEditor();
                }
                //update progress feedbacks types
                var progressEditor = repo.getChildrenRecordsByType(this.record.parent, "advancedProgress");
                if (progressEditor) {
                    progressEditor = progressEditor[0];
                    var progressController = repo_controllers.get(progressEditor.id);
                    repo.updateProperty(progressEditor.id, 'availbleProgressTypes',
                        [
                            {"name": "Local", "value": "local"},
                            {"name": "Basic", "value": "generic"}
                            //{"name": "Advanced", "value": "advanced"}
                        ]);
                    var feedbackEditor = repo.getChildrenRecordsByType(progressEditor.id, "feedback");
                    if (feedbackEditor.length) {
                        feedbackEditor = feedbackEditor[0];
                        repo.updateProperty(feedbackEditor.id, 'taskType', 'multiple');
                        repo.updateProperty(feedbackEditor.id, 'predefined_list', null, true);
                        progressController.reload(); //progress stage + props
                    }
                }
            },

            //set task answer to be single answer
            SingleAnswerMode: function f1075() {
                repo.updateProperty(this.config.id, "isSubTask", false);

                var singleAnswerType = "textEditor";
                if (this.record.data.checkingEnabled) {
                    singleAnswerType = "AnswerFieldTypeText";
                }

                this.createAnswerFieldByType(singleAnswerType);
                //set answer type to defalut
                repo.updateProperty(this.record.id, "answer_type", "student");

                var progressEditor = repo.getChildrenRecordsByType(this.record.parent, "advancedProgress");

                if (progressEditor) {
                    progressEditor = progressEditor[0];
                    var progressController = repo_controllers.get(progressEditor.id);

                    // Reset feedback type if it's advanced - there is no advanced type in single mode
                    if (progressEditor.data.feedback_type == 'advanced') {
                        repo.updateProperty(progressEditor.id, 'feedback_type', 'local');
                    }
                    //update progress feedbacks types
                    repo.updateProperty(progressEditor.id, 'availbleProgressTypes',
                        [
                            {"name": "Local", "value": "local"},
                            {"name": "Generic", "value": "generic"}
                        ]);
                    var feedbackEditor = repo.getChildrenRecordsByType(progressEditor.id, "feedback");
                    if (feedbackEditor.length) {
                        feedbackEditor = feedbackEditor[0];
                        repo.updateProperty(feedbackEditor.id, 'taskType', 'single');
                        repo.updateProperty(feedbackEditor.id, 'predefined_list', null, true);
                        progressController.reload(); //progress stage + props
                    }
                }
            },

            //create sub question editor
            createSubQuestionEditor: function f1076() {
                var subQuestion = {
                    'type': 'subQuestion',
                    'parentId': this.config.id,
                    'data': {
                        'title': "",
                        'disableDelete': true,
                        'fieldsNum': "multiple"
                    }
                }, subQuestionId = null;

                //check if we already have the required miniume for enable deleting
                if (this.record.children.length >= Constants.sub_questions.minimum_size) {
                    subQuestion.data.disableDelete = false;
                    repo.updateChildrenProperty(this.config.id, 'disableDelete', false);
                }

                //create the record at repo
                subQuestionId = this.createItem(subQuestion);
                this.addedChild = subQuestionId;

                /*
                 using repo add template only if we don't have children yet
                 to add the textViewer and textEditorEditor/answerfield from the taskTemplate
                 */
                var childTypeToAdd = this.getAnswerType(this.record.data.answer_type, this.record.data.checkingEnabled);

                logger.audit(logger.category.EDITOR, 'Add subquestion to short answer');

                repo.addTemplate({
                    template: subquestionTemplate.template,
                    parentId: subQuestionId,
                    subAnswerType: childTypeToAdd
                });
                //set data to item created
                _.each(repo.getChildrenRecordsByTypeRecursieve(subQuestionId, childTypeToAdd), function f1077(answerField) {
                    var data = require('cgsUtil').getRepoDefaultData(childTypeToAdd);
                    if (childTypeToAdd == "AnswerFieldTypeText") {
                        data.noExpectedWrong = true;
                    }
                    repo.updateProperty(answerField.id, 'data', data, true);
                }, this);

                if (!this.record.data.has_questions) {
                    this.removeSubQuestionQuestion();
                }

                repo.updateProperty(subQuestionId, 'question_type', 'textViewer');
                repo.updateProperty(subQuestionId, 'answer_type', this.record.data.answer_type);
                repo.updateProperty(subQuestionId, 'mathfield_height', "firstLevel");
            },

            //remove the question editor from the sub question - leave only the answer
            removeSubQuestionQuestion: function f1078(id) {
                var remove = function f1079(child) {
                    return repo.remove(child);
                };

                if (id) {
                    var p = repo.get(id);

                    if (p.children.length === 2) {
                        remove(p.children[0]);
                    }
                } else {
                    _.each(this.record.children, function f1080(childId) {
                        var p = repo.get(childId);

                        if (p.children.length === 2) {
                            remove(p.children[0]);
                        }
                    });
                }
            },
            
            //onCheckboxChecked event (remove questions || show questions)
            onHasSubQuestionChecked: function f1081(result) {
               
                repo.startTransaction({ appendToPrevious: true });
                if (!this.record.data.has_questions) {
                    this.removeSubQuestionQuestion();
                } else {
                    _.each(this.record.children, function f1082(childId) {
                        this.createItem({
                            'type': 'textViewer',
                            'parentId': childId,
                            'data': {
                                'title': "",
                                'disableDelete': true
                            }
                        });
                        //TODO: Fix insertAt Property (now is replacing the element)
                        var r = repo.get(childId);
                        repo.updateProperty(childId, 'children', require('cgsUtil').cloneObject(r.children).reverse(), true);
                        repo.updateProperty(childId, 'question_type', 'textViewer');
                    }, this);
                }
                repo.endTransaction();

                events.fire('setActiveEditor', this);
                events.fire('clickOnStage');
                this.renderChildren();
                require('router').startEditingActiveEditor();
            },
            //create new answer field type text or math
            createAnswerFieldByType: function f1083(repoType, extendData) {

                var data = require("cgsUtil").getRepoDefaultData(repoType)

                if (extendData) {
                    data = _.extend(data, extendData);
                }

                this.createItem({
                    'type': repoType,
                    'parentId': this.config.id,
                    'data':data
                });
            }

        }, {type: 'ShortAnswerAnswerEditor', stageReadOnlyMode: true});

        return ShortAnswerAnswerEditor;

    });