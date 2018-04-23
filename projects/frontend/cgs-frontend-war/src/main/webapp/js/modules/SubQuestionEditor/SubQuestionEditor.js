define(['BaseContentEditor', './config', 'repo', 'events', './SubQuestionPropsView',
    './SubQuestionStageView', './SubQuestionSmallStageView', 'dialogs'],
    function f1096(BaseContentEditor, config, repo, events, SubQuestionPropsView, SubQuestionStageView, SubQuestionSmallStageView, dialogs) {

        var SubQuestionEditor = BaseContentEditor.extend({

            initialize: function f1097(configOverrides) {
                this.setStageViews({
                    small: SubQuestionSmallStageView,
                    normal: SubQuestionStageView
                });

                this._super(config, configOverrides);
            },

            changeEditorByIndex: function f1098(index, type) {
                //override the subquestion question editor
                repo.startTransaction({ appendToPrevious: true });
                repo.updateProperty(this.record.children[0], 'type', type, true);
                repo.endTransaction();

                //render the subquestion children
                this.renderChildren();
            },

            registerEvents: function f1099() {
                var changes = {
                    question_type: this.propagateChanges(this.record, 'question_type', true),
                    answer_type: this.propagateChanges(this.record, 'answer_type', true)
                };

                this.model = this.screen.components.props.startEditing(this.record, changes);

                this.model.on('change:question_type', this.showDialog, this);
                this.model.on('change:answer_type', this.changeAnswerType, this);

            },
            _changeMathfieldHeight: function f1100(type) {
                var mfEditor = repo.getChildrenRecordsByType(this.record.id, "mathfieldEditor").concat(
                    repo.getChildrenRecordsByType(this.record.id, "answerFieldTypeMathfield"))[0];

                repo.startTransaction({ appendToPrevious: true });
                repo.updateProperty(mfEditor.id, "maxHeight", type);
                repo.endTransaction();
            },
            onMathfieldHeightChange: function f1101(e) {

                var prevHeight = this.record.data.mathfield_height;
                var height = e.target.checked? 'secondLevel':'firstLevel';
                repo.updateProperty(this.record.id,'mathfield_height',height);

                if (repo.get(this.record.parent).data.checkingEnabled == true) {
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
                        events.once('openDialogChangeMfHeight',function f1102(response) {
                            if (response == "ok") {
                                this._changeMathfieldHeight(height);
                                events.fire("checking_enabled_Changed", repo.get(this.record.parent).data.checkingEnabled);
                            } else {
                                repo.revert();
                                repo.startTransaction({ ignore: true });
                                repo.updateProperty(this.record.id, "mathfield_height", prevHeight);
                                repo.endTransaction();
                                this.refresh();
                            }

                        }.bind(this));
                        //create & show the dialog on the screen
                        dialogs.create('simple', dialogConfig, 'openDialogChangeMfHeight', this).show();

                } else {
                    this._changeMathfieldHeight(height);
                }

            },

            //on change answer type event
            changeAnswerType: function f1103(item, type) {
                repo.startTransaction({ appendToPrevious: true });
                var shortAnswerAnswer = repo.get(this.record.parent),
                    answerIndex = 0;
                if (shortAnswerAnswer.data.has_questions) {
                    //if we have sub question than the answer is the second chile otherwise its the only child.
                    answerIndex = 1;
                }
                repo.updateProperty(this.record.id, 'answer_type', type);
                repo.updateProperty(this.record.id, 'mathfield_height', "secondLevel");
                repo.updateProperty(this.record.children[answerIndex], 'answer_type', type, true);
                repo.remove(this.record.children[answerIndex]); // remove current answer
                this.createAnswerFieldByType(type, shortAnswerAnswer.data.checkingEnabled);
                repo.endTransaction();

                this.refresh();
                this.renderChildren();
            },
            //create a new answer field by type and checking enabled param
            createAnswerFieldByType: function f1104(type, checking_enabled) {
                var repoType = this.getAnswerType(type, checking_enabled),
                    data = require('cgsUtil').getRepoDefaultData(repoType);

                //override default property
                if (repoType == "AnswerFieldTypeText") {
                    data.noExpectedWrong = true;
                }
                this.createItem({
                    'type': repoType,
                    'parentId': this.config.id,
                    'data': data
                });
            },

            //check for changes in question
            checkQuestionDataWasChanged: function f1105() {
                var checker = false,
                    p,
                    param;

                _.each(this.record.children, function f1106(childId) {
                    p = repo.get(childId);

                    switch (p.type) {
                        case "textViewer":
                            if (p.data["title"] && p.data["title"].length > 0) {
                                checker = true;
                                return;
                            }
                            break;
                        case "imageViewer":
                            param = ["caption", "captionNarration", "copyrights", "image", "sound"]
                            for (var i = 0; i < param.length; i++) {
                                if (p.data[param[i]] && p.data[param[i]].length > 0) {
                                    checker = true;
                                    return;
                                }
                            }
                            break;
                        case "soundButton":
                            if (p.data["sound"] && p.data["sound"].length > 0) {
                                checker = true;
                                return;
                            }
                            break;
                        default:
                            break;
                    }
                });
                return checker;
            },

            //Show dialog on question type change
            showDialog: function f1107() {

                if (this.checkQuestionDataWasChanged()) {

                    //Dialog box properties
                    var dialogConfig = {
                        title: "Are you sure you want to change the type?", //Title of the dialog box
                        content: {
                            text: "Changing the type will lose all fed content!", //Text
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
                    //creating event once on dialog open
                    events.once('openDialogChangeMode', _.bind(function f1108(response) {
                        this.onEditorTypeChange(response);
                    }, this));

                    //create & show the dialog on the screen
                    dialogs.create('simple', dialogConfig, 'openDialogChangeMode', this).show();

                } else {
                    this.onEditorTypeChange();
                }
            },

            //response from change editor type dialog
            onEditorTypeChange: function f1109(response) {
                //on changing the type of the question call to override editor
                if (response == 'cancel') {
                    repo.revert();
                    repo.startTransaction({ ignore: true });
                    repo.updateProperty(this.config.id, 'question_type', this.sType);
                    repo.endTransaction();

                    this.view.render();
                    this.registerEvents();
                    return;
                }

                this.sType = this.record.data['question_type'];

                this.changeEditorByIndex(0, this.sType);
            },

            startPropsEditing: function f1110() {
                this._super();
                this.view = new SubQuestionPropsView({ controller: this });
                this.registerEvents();
                this.sType = this.record.data['question_type'];
            },

            /**
             * return the type of the answer field
             * @param type
             * @param checking_enabled
             * @returns {string}
             */
            getAnswerType: function f1111(type, checking_enabled) {
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

            }

        }, {    type: 'SubQuestionEditor' });

        return SubQuestionEditor;

    });
