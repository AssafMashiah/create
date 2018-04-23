define(['BaseContentEditor', 'events', 'dialogs', './config', 'repo', 'repo_controllers', 'types', './ClozeAnswerPropertiesView', './ClozeAnswerNormalStageView',
    './ClozeAnswerSmallStageView'],
    function f82(BaseContentEditor, events, dialogs, config, repo, repo_controllers, types, ClozeAnswerPropertiesView, ClozeAnswerNormalStageView, ClozeAnswerSmallStageView) {

        var ClozeAnswerEditor = BaseContentEditor.extend({

            initialize: function f83(configOverrides) {

                this.setStageViews({
                    small: ClozeAnswerSmallStageView,
                    normal: ClozeAnswerNormalStageView
                });

                repo.startTransaction({ ignore: true });
                this.setDefaultMaxHeight(configOverrides.id);
                repo.endTransaction();

                this._super(config, configOverrides);

                this.isDDMode = this.record.data.interaction == 'dd';

                //register to menu events 
                this.bindEvents({
                    'checking_enabled_Changed' : {'type':'register', 'func': function(val){
						//when not checkbale need to not show properties n answer fields
                        if(this.record.data.answerType == "cloze_text_viewer"){
                            this.updateRecordProps(this.record.id, val);
                        }else{
                            _.each(repo.getChildrenRecordsByTypeRecursieve(this.record.id, 'AnswerFieldTypeText'), function(af) {
                                this.updateRecordProps(af.id, val);
                            }, this);
                            _.each(repo.getChildrenRecordsByTypeRecursieve(this.record.id, 'answerFieldTypeMathfield'), function(af) {
                                repo.updateProperty(af.id, 'noCheckingType', false);
                            });
                        }

                        if (!val && !this.record.data.useBank) {
                            this.model.set('fieldsWidth', 'each');
                        }
                        this.refresh();

                        this.onAnswerTypeChange('ok');

                    } , 'ctx': this, 'unbind':'dispose'}
                });

                if (!this.config.previewMode) {
                    this.startStageEditing();
                    this.startPropsEditing();
                }

            },
            setDefaultMaxHeight: function f84(id) {
                var rec = repo.get(id);

                if (rec && !rec.data.maxHeight) {
                    repo.updateProperty(id, 'maxHeight', 'firstLevel', false, true);
                }
            },

            startPropsEditing: function f85(cfg) {
                this._super(cfg);
                var config = _.extend({controller: this}, cfg ? cfg : null);
                this.view = new ClozeAnswerPropertiesView(config);
                this.registerEvents();
            },

            startStageEditing: function f86() {
                this.showStagePreview($('#stage_base'), {bindEvents: true});
            },

            registerEvents: function f87() {
                this.record = repo.get(this.config.id);
                var changes = {
                    answerType: this.propagateChanges(this.record, 'answerType', true),
                    interaction: this.propagateChanges(this.record, 'interaction', true),
                    fieldsNum: this.propagateChanges(this.record, 'fieldsNum', true),
                    fieldsWidth: this.propagateChanges(this.record, 'fieldsWidth', true),
                    useBank: this.propagateChanges(this.record, 'useBank', true),
                    reuseItems: this.propagateChanges(this.record, 'reuseItems', true),
                    bankItemsType: this.propagateChanges(this.record, 'bankItemsType', true)
                };

                this.model = this.screen.components.props.startEditing(this.record, changes, $(".cloze_answer_editor"));
                this.model.on('change:useBank', function f88(child, val) {
                    this.changeUseBank(val);
                }, this);
                this.model.on('change:answerType', this.showAnswerTypeDialog, this);
                this.model.on('change:interaction', this.showInteractionChangeDialog, this);
                this.model.on('change:fieldsNum', this.onFieldsNumChange, this);
                this.model.on('change:bankItemsType', function (child, val) {
                   console.log("Bank items type changed to", val);
                }, this);
                this.model.on('change:reuseItems', function (child, val) {
                    if (!val) {
                        this.model.set('bankItemsType', 'disabled');
                    } else {
                        repo.deleteProperty(this.record.id, 'bankItemsType', false, true);
                    }
                    this.view.checkBankItemsType();
                }, this);
            },

            onFieldsNumChange: function f89() {
                /**
                 * if answer number of fields change from multiple to
                 * single , check that there's currently 0-1 number of
                 * answers and if not present a dialog explaining
                 * and cancel the change.
                 */
                var progress_rec = repo.getChildrenRecordsByType(this.record.parent, 'advancedProgress')[0],
                    progress_controller = repo_controllers.get(progress_rec.id),
                    canChangeFieldNum = true;

                repo.startTransaction({ appendToPrevious: true });

                if (this.record.data.fieldsNum === "single") {
                    switch (this.record.data.answerType) {
                        case "table":
                            canChangeFieldNum= this.checkTableSingleAnswer();
                            if(canChangeFieldNum){
                                this.setExpectedWrongNoShow(false);
                            }
                            break;
                        case "cloze_text_viewer" :
                            canChangeFieldNum = this.checkClozeTextViewerSingleAnswer();
                            if(canChangeFieldNum){
                                this.setExpectedWrongNoShow(false);
                            }

                    }
                    if(canChangeFieldNum){
                        //update progress feedbacks types
                        repo.updateProperty(progress_rec.id, 'availbleProgressTypes',[
                            {"name": "Local", "value": "local"},
                            {"name":"Generic", "value": "generic"},
                            {"name":"Generic and Specific", "value" : "advanced"}
                        ]);
                    }
                } else {
                    // Don't show expected wrong answers
                    this.setExpectedWrongNoShow(false);

	                //update progress feedbacks types
	                repo.updateProperty(progress_rec.id, 'availbleProgressTypes',[
                        {"name": "Local", "value": "local"},
		                {"name":"Basic", "value": "generic"},
                        {"name": "Advanced", "value" : "advanced"}
                    ]);  //advanced feedbacks of cloze task currently doesn't supported by DL player
                }
                if(canChangeFieldNum){
                    // Change feedback type acc to task settings
                    this.setFeedbackType();
                }

                repo.endTransaction();
            },

            setExpectedWrongNoShow: function(val) {
                // Set noExpectedWrong value to cloze text viewer
                var ctv = repo.getChildrenRecordsByTypeRecursieve(this.record.id, 'cloze_text_viewer');
                if (ctv.length) {
                    _.each(ctv, function(rec) {
                        repo.updateProperty(rec.id, 'noExpectedWrong', val);
                    });
                }

                // Set noExpectedWrong value to answer fields into cloze table
                var aft = repo.getChildrenRecordsByTypeRecursieve(this.record.id, 'AnswerFieldTypeText');
                if (aft.length) {
                    _.each(aft, function(rec) {
                        repo.updateProperty(rec.id, 'noExpectedWrong', val);
                    });
                }
            },

            checkTableSingleAnswer: function f90() {
                var answerTable = repo.getChildrenRecordsByType(this.config.id, "table")[0],
                    tableAnswers;
                tableAnswers = repo.getChildrenRecordsByTypeRecursieve(answerTable.id, "AnswerFieldTypeText")
                    .concat(repo.getChildrenRecordsByTypeRecursieve(answerTable.id, "answerFieldTypeMathfield"));

                if (tableAnswers && tableAnswers.length > 1) {
                    this.preventSingleAnswerMode();
                    return false;
                }
               return true;
            },

            checkClozeTextViewerSingleAnswer: function f91() {
                var answerTextViewer = repo.getChildrenRecordsByType(this.config.id, "cloze_text_viewer")[0];

                if (answerTextViewer.data.answerFields &&
                    _.size(answerTextViewer.data.answerFields) > 1) {
                    this.preventSingleAnswerMode();
                    return false;
                }
                return true;
            },

            preventSingleAnswerMode: function f92() {
                dialogs.create('simple', {
                    title: "Cannot change to single answer mode",
                    content: {
                        text: "Remove all answers except one (or none) in order change to single answer mode", //Text
                        icon: 'warn'
                    },
                    buttons: {
                        ok: { label: 'OK' }
                    }
                }).show();
                repo.updateProperty(this.config.id, 'fieldsNum', 'multiple');
                events.fire('setActiveEditor', this);

                this.refresh();
            },

            onMathfieldMaxHeightChange: function f93(e) {
                /**
                 * check if field height is decreased,
                 * if it is decreased
                 */
                var previousMaxHeight = this.record.data.maxHeight;
                repo.updateProperty(this.record.id, 'maxHeight',e.target.checked ? 'secondLevel' : 'firstLevel');

                switch (this.record.data.maxHeight) {

                    case "secondLevel":
                      this.changeMathmaxHeight("secondLevel");
                    break;

                    case "firstLevel":
                        if (previousMaxHeight === "secondLevel") {
                            this.showMathfieldNarrowWarning("firstLevel", previousMaxHeight);
                        } else {
                            this.changeMathmaxHeight("firstLevel");
                        }
                       break;
                }

            },

            showMathfieldNarrowWarning: function f94(maxHeight, prevHeight) {
                var dialogConfig = {
                    title: "Are You Sure?",
                    content: {
                        text: "Changing math answer field height may cause loss of data", //Text
                        icon: 'warn'
                    },
                    buttons: {
                        ok: { label: 'OK' },
                        cancel: { label: 'Cancel' }
                    }
                };


                events.register('openDialogNarrowMathfield');

                events.once('openDialogNarrowMathfield', _.bind(function f95(response) {
                    if (response === "ok") {
                        this.changeMathmaxHeight(maxHeight);
                    } else {
                        repo.revert();
                        repo.startTransaction({ ignore: true });
                        repo.updateProperty(this.config.id, "maxHeight", prevHeight);
                        repo.endTransaction();
                        events.fire('setActiveEditor', this);
                        this.refresh();
                    }

                }, this));

                dialogs.create('simple', dialogConfig, 'openDialogNarrowMathfield', this).show();
            },

            changeMathmaxHeight: function f96(maxHeight) {
                repo.startTransaction({ appendToPrevious: true });
                var mathfieldAnswers,
                    answerRecord = repo.get(repo.get(this.config.id).children[0]);
                switch (this.record.data.answerType) {
                    case "cloze_text_viewer":
                        var answers = require('cgsUtil').cloneObject(answerRecord.data.answerFields);
                        _.each(answers, function f97(item) {
                            item.type == "mathfield" && (item.maxHeight = maxHeight);
                        });
                        repo.updateProperty(answerRecord.id, 'answerFields', answers);

                        var answerDom = $('<div/>').html(answerRecord.data.title);
                        answerDom.find('answerfield[type="mathfield"]').attr('maxheight', maxHeight);
                        repo.updateProperty(answerRecord.id, 'title', answerDom.html());

                        answerRecord.data.maxHeight && repo.updateProperty(answerRecord.id, 'maxHeight', maxHeight);
                        break;

                    case "table" :
                        mathfieldAnswers =  _.union(repo.getChildrenRecordsByTypeRecursieve(answerRecord.id, "answerFieldTypeMathfield"), repo.getChildrenRecordsByTypeRecursieve(answerRecord.id, "mathfield"));
                        _.each(mathfieldAnswers, function f98(item) {
                            repo.updateProperty(item.id, 'maxHeight', maxHeight);
                        });
                        break;
                }

                repo.endTransaction();
                
                this.reRender();
            },

            showAnswerTypeDialog: function f99() {
                var dialogConfig = {
                    title: "Are You Sure?",
                    content: {
                        text: "Changing answer type will erase all your current data.", //Text
                        icon: 'warn'
                    },
                    buttons: {
                        ok: { label: 'OK' },
                        cancel: { label: 'Cancel' }
                    }
                };
                events.once('openDialogChangeAnswerType', function f100(response) {
                    this.onAnswerTypeChange(response);
                }, this);
                dialogs.create('simple', dialogConfig, 'openDialogChangeAnswerType', this).show();
            },

            onAnswerTypeChange: function f101(responseFromDialog) {
                //if user confirms changing answer type create new answer editor view and
                // and new bank editor
                if (responseFromDialog === "ok") {
                    repo.startTransaction({ appendToPrevious: true });
                    repo.removeChildren(this.config.id);
                    var answerTypeCfg = {
                        "type": this.record.data.answerType,
                        "parentId": this.config.id,
                        "children": [],
                        "data": {
                            "title": "",
                            "disableDelete": true,
                            "width": "100%",
                            "clozeTable": true,
                            "noExpectedWrong": this.record.data.interaction == 'dd',
                            'noAdditionalCorrectAnswers': this.record.data.interaction == 'dd',
                            'noPartiallyCorrectAnswers': this.record.data.interaction == 'dd'
                        }
                    };

                    this.createNewItem(answerTypeCfg, false);
                    if (this.record.data.useBank == true) {
                        this.createBank();
                    }
                    repo.endTransaction();
                    this.reRender();
                    this.startParentPropsEditing();
                } else {
                    var mode = (this.record.data.answerType === "cloze_text_viewer") ? "table" : "cloze_text_viewer";
                    repo.revert();
                    repo.startTransaction({ ignore: true });
                    repo.updateProperty(this.config.id, 'answerType', mode);
                    repo.endTransaction();
                }
                events.fire('setActiveEditor', this);
                this.refresh();
            },

            showInteractionChangeDialog: function() {
                var dialogConfig = {
                    title: "Are You Sure?",
                    content: {
                        text: "Changing intraction type will erase all your current data", //Text
                        icon: 'warn'
                    },
                    buttons: {
                        ok: { label: 'OK' },
                        cancel: { label: 'Cancel' }
                    }
                };

                events.once('openDialogChangeInteractionType', _.bind(function f102(response) {
                    this.onInteractionTypeChange(response);
                }, this));

                dialogs.create('simple', dialogConfig, 'openDialogChangeInteractionType', this);
            },

            onInteractionTypeChange: function(responseFromDialog) {
                var self = this;
                if (responseFromDialog === "ok") {
                    repo.startTransaction({ appendToPrevious: true });
                    if (this.record.data.interaction === "write") {
                        repo.updateProperty(this.record.id, 'className', '');

                        var multi = this.record.data.fieldsNum == 'multiple';

                        var ctv = repo.getChildrenRecordsByTypeRecursieve(this.record.id, 'cloze_text_viewer');
                        if (ctv.length) {
                            self.updateRecordProps(ctv[0].id, false);
                        }

                        // Clear answer fields data for table
                        var table = repo.getChildrenRecordsByTypeRecursieve(this.record.id, 'table');
                        if (table.length) {
                            table = table[0];

                            _.each(repo.getChildrenRecordsByTypeRecursieve(table.id, 'AnswerFieldTypeText'), function(af) {
                                self.updateRecordProps(af.id, false);
                            });

                            _.each(repo.getChildrenRecordsByTypeRecursieve(table.id, 'answerFieldTypeMathfield'), function(af) {
                                repo.updateProperty(af.id, 'noCheckingType', false);
                            });
                            
                        }

                        //Remove bank if empty
                        var clozeBankObject = repo.getChildrenRecordsByType(this.record.id, 'clozeBank');
                        if (clozeBankObject.length) {

                            clozeBankController = repo_controllers.get(clozeBankObject[0].id);
                            if(clozeBankController){
                                clozeBankController.setDefaultList();
                            }
                            if (!clozeBankObject[0].children.length) {
                                this.model.set('reuseItems', false);
                                this.model.set('useBank', false);
                            }
                            else {
                                _.each(clozeBankObject[0].children, function(bankChild) {
                                    repo.updateProperty(bankChild, 'styleOverride', 'bankReadOnly', false, true);
                                })
                            }
                        }
                        repo.deleteProperty(this.record.id, 'bankItemsType', false, true);
                    }
                    else if (this.record.data.interaction === "dd") {
                        // Update repo properties
                        repo.updateProperty(this.record.id, 'className', 'drag-drop-cloze');
                        repo.updateProperty(this.record.id, 'fieldsNum', 'multiple');
                        repo.updateProperty(this.record.id, 'useBank', true);
                        repo.updateProperty(this.record.id, 'fieldsWidth','longest');
                        repo.updateProperty(this.record.id, 'bankItemsType', 'disabled');
                        // repo.updateProperty(this.record.id, 'reuseItems', true);

                        // Create bank if still doesn't exist
                        var clozeBank = repo.getChildrenRecordsByType(this.record.id, 'clozeBank');
                        if (!clozeBank.length) {
                            this.createBank();
                        }
                        else {
                            //clear the default lists (expected wrong values) inside the bank
                            clozeBankController = repo_controllers.get(clozeBank[0].id);
                            if(clozeBankController){
                                clozeBankController.clearDefaultList();
                            }
                            _.each(clozeBank[0].children, function(bankChild) {
                                repo.updateProperty(bankChild, 'styleOverride', 'normal', false, true);
                            })
                        }

                        // Clear answer fields data for text viewer
                        var ctv = repo.getChildrenRecordsByTypeRecursieve(this.record.id, 'cloze_text_viewer');
                        if (ctv.length) {
                            ctv = ctv[0];

                            // Run on all answer fields
                            _.each(ctv.data.answerFields, function(af) {
                                if (af.type == 'mathfield') {
                                    af.checkingType = 'exactMatch';
                                }
                            });
                            self.updateRecordProps(ctv.id, true);
                        }

                        // Clear answer fields data for table
                        var table = repo.getChildrenRecordsByTypeRecursieve(this.record.id, 'table');
                        if (table.length) {
                            table = table[0];

                            _.each(repo.getChildrenRecordsByTypeRecursieve(table.id, 'AnswerFieldTypeText'), function(af) {
                                self.updateRecordProps(af.id, true);
                            });
                            
                            _.each(repo.getChildrenRecordsByTypeRecursieve(table.id, 'answerFieldTypeMathfield'), function(af) {
                                repo.updateProperty(af.id, 'checkingType', 'exactMatch');
                                repo.updateProperty(af.id, 'noCheckingType');
                            });
                            
                        }
                    }
                    //this.checkBankItemsType();
                    repo.endTransaction();
                } else {
                    var mode = (this.record.data.interaction === 'write') ? 'dd' : 'write';
                    repo.revert();
                    repo.startTransaction({ ignore: true });
                    repo.updateProperty(this.record.id, 'interaction', mode);
                    repo.endTransaction();
                }


                // Refresh cloze stage and props
                var router = require('router');
                router.load(router._static_data.id, router._static_data.tab);
                var newCAEditor = repo_controllers.get(this.record.id);
                if (newCAEditor) {
                    events.fire('setActiveEditor', newCAEditor);
                }

                if (this.record.data.interaction === 'dd') {
                    this.setMathfieldDefaultKeyboard();   
                }
            },

            setMathfieldDefaultKeyboard: function () {
                var ctv = repo.getChildrenRecordsByTypeRecursieve(this.record.id, 'cloze_text_viewer');
                    ctv = ctv && ctv.length && ctv[0];

                if (!ctv) {
                    var tableCellCtr = repo.getChildrenRecordsByTypeRecursieve(this.record.id, 'tableCell');
                    var answerFieldRec =  repo.getChildrenRecordsByTypeRecursieve(this.record.id, 'answerFieldTypeMathfield');

                    _.each(answerFieldRec, function (item) {
                        repo.updateProperty(item.id, 'markup', "");
                        repo.updateProperty(item.id, 'answerMarkup', "");
                        repo.deleteProperty(item.id, 'additionalExactMatch', false, true);

                        repo_controllers.get(item.id).stage_view.mf.mathField.view.dispose();
                    });

                    _.each(tableCellCtr, function (item) {
                        repo_controllers.get(item.id).reloadStage();
                    });
                } else {
                    repo_controllers.get(ctv.id).clearCompletionMathfields();
                }
            },

            updateRecordProps: function(id, isDD) {

                // Don't show mathfield checking type
                repo.updateProperty(id, 'noCheckingType', isDD);

                // Don't show lists for the text answer field
                repo.updateProperty(id, 'noAdditionalCorrectAnswers', isDD);
                repo.updateProperty(id, 'noPartiallyCorrectAnswers', isDD);
                repo.updateProperty(id, 'noExpectedWrong', isDD);

                /*// Remove current lists for the text answer field
                if (isDD) {
                    repo.updateProperty(id, 'AdditionalCorrectAnswers', null);
                    repo.updateProperty(id, 'PartiallyCorrectAnswers', null);
                    repo.updateProperty(id, 'ExpectedWrong', null);
                }*/
            },

            reRender: function f103() {
                this.renderChildren();
                require('router').startEditingActiveEditor();
            },

            startParentPropsEditing: function() {
                var parent = repo_controllers.get(this.record.parent);
                if (parent && parent.startPropsEditing) {
                    parent.startPropsEditing();
                }
            },

            changeUseBank: function f104(flag) {
                repo.startTransaction({ appendToPrevious: true });
                if (flag) {
                    this.createBank();
                    if(this.record.data.fieldsWidth != 'longest')
                        repo.updateProperty(this.record.id, 'fieldsWidth','longest');
                        this.startParentPropsEditing();
                } else {
                    var progress_rec = repo.getChildrenRecordsByType(this.record.parent, 'advancedProgress')[0];
                    if(progress_rec && !progress_rec.data.checking_enabled){
                        repo.updateProperty(this.record.id, 'fieldsWidth','each');
                    }
                    this.model.set('reuseItems', flag);
                    this.removeBank();
                    this.startParentPropsEditing();
                }

                // this.model.set('reuseItems', flag);

                this.setFeedbackType();
                this.reRender();

                require('router').startEditingActiveEditor();

                var clozeBankObject = repo.getChildrenRecordsByType(this.record.id,'clozeBank');
                if(clozeBankObject.length){
                    clozeBankController = repo_controllers.get(clozeBankObject[0].id);
                    if(clozeBankController){
                        clozeBankController.setDefaultList(true);
                    }
                }

                repo.endTransaction();
            },

            createBank: function f105() {
                // create bank
                var bankCfg = {
                    "type": "clozeBank",
                    "parentId": this.record.id,
                    "children": [],
                    "data": {"title": "clozeBank", "disableDelete": true, "width": "100%"}
                };
                this.createNewItem(bankCfg, false);
                this.view.checkReuseState();
            },

            removeBank: function f106() {
                var bank = repo.getChildrenRecordsByType(this.record.id, 'clozeBank');
                if (bank.length > 0) {
                    bank = bank[0];
                    //remove from repo, will call dispose and remove from repo controller
                    repo.remove(bank.id);
                }
                this.view.checkReuseState();
            },

            setFeedbackType: function() {
                var progress_rec = repo.getChildrenRecordsByType(this.record.parent, 'advancedProgress')[0],
                    progress_controller = repo_controllers.get(progress_rec.id),
                    feedback_rec = repo.getChildrenRecordsByType(progress_rec.id, 'feedback')[0];

                if (repo.getChildrenRecordsByType(this.record.id, 'clozeBank').length) {
                    repo.updateProperty(feedback_rec.id, 'taskType', 'with_bank');
                }
                else {
                    repo.updateProperty(feedback_rec.id, 'taskType', 'no_bank');
                }

                progress_controller.changeType(progress_rec.data.feedback_type, true);
            },

            disableFieldWidth: function() {
               
                var progress_rec = repo.getChildrenRecordsByType(this.record.parent, 'advancedProgress')[0];
                return !(progress_rec && progress_rec.data.checking_enabled) || this.record.data.useBank;
            }

        }, {
            type: 'ClozeAnswerEditor',
            valid: function(elem_repo) {
                var bank = repo.get(_.find(elem_repo.children, function(child) { return repo.get(child).type == 'clozeBank' })),
                    progress_rec = repo.getChildrenRecordsByType(elem_repo.parent, 'advancedProgress')[0],
                    isNoncheckable = progress_rec && !progress_rec.data.checking_enabled,
                    reports = [],
                    isValid = true;

                if (!elem_repo.data.reuseItems && elem_repo.data.useBank && elem_repo.data.interaction == 'dd') {

                    var answers = [];

                    function checkAnswer(answer, answers) {
                        return !answer || answers.indexOf(answer) == -1 && !!answers.push(answer);
                    }

                    if (!isNoncheckable) {
                        if (elem_repo.data.answerType == 'cloze_text_viewer') {
                            var ctv = repo.get(_.find(elem_repo.children, function(child) { return repo.get(child).type == 'cloze_text_viewer' }));
                            if (ctv) {
                                _.each(ctv.data.answerFields, function(ans, key) {
                                    var answerText;
                                    if (ans.type == 'mathfield' && ctv.data.mathfieldArray[key.replace('answerfield_', '')]) {
                                        answerText = ctv.data.mathfieldArray[key.replace('answerfield_', '')].markup.trim();
                                    }
                                    else if (ans.type == 'text') {
                                        answerText = $(ctv.data.title).find('answerfield [id="' + key + '"]').text().trim();
                                    }

                                    isValid = isValid && checkAnswer(answerText, answers);
                                });
                            }
                        }
                        else {
                            _.each(repo.getChildrenRecordsByTypeRecursieve(elem_repo.id, 'AnswerFieldTypeText'), function(af) {
                                isValid = isValid && checkAnswer($(af.data.title).text().trim(), answers);
                            }, this);
                            _.each(repo.getChildrenRecordsByTypeRecursieve(elem_repo.id, 'answerFieldTypeMathfield'), function(af) {
                                isValid = isValid && af.data.markup && checkAnswer(af.data.markup.trim(), answers);
                            });
                        }
                    }

                    _.each(bank && bank.children, function(childId) {
                        var item = repo.get(childId),
                            answer = $(item.data.title);
                        if (answer.find('mathfield').length) {
                            isValid = isValid && checkAnswer(item.data.mathfieldArray[answer.find('mathfield').attr('id')].markup.trim(), answers);
                        }
                        else {
                            isValid = isValid && checkAnswer(answer.text().trim(), answers);
                        }
                    });

                    if (!isValid) {
                        reports.push(require('validate').setReportRecord(elem_repo, 'task.fill.in.gaps.props.duplicated_items_in_bank.msg_text'));
                        
                    }

                    if (isNoncheckable) {
                        var afCount;
                        if (elem_repo.data.answerType == 'cloze_text_viewer') {
                            var ctv = repo.get(_.find(elem_repo.children, function(child) { return repo.get(child).type == 'cloze_text_viewer' }));
                            if (ctv) {
                                afCount = _.size(ctv.data.answerFields);
                            }
                        }
                        else {
                            afCount = repo.getChildrenRecordsByTypeRecursieve(elem_repo.id, 'AnswerFieldTypeText').length + 
                                        repo.getChildrenRecordsByTypeRecursieve(elem_repo.id, 'answerFieldTypeMathfield').length;
                        }
                        if (bank && afCount > bank.children.length) {
                            isValid = false;
                            reports.push(require('validate').setReportRecord(elem_repo, 'task.fill_in_gaps.not_enough_items_validation_error.msg_text'));
                        }
                    }
                }

                if (isNoncheckable && elem_repo.data.useBank && bank && !bank.children.length) {
                    isValid = false;
                    reports.push(require('validate').setReportRecord(elem_repo, 'task.fill_in_gaps.empty_bank_validation_error.msg_text'));
                }

                if (!isValid) {
                    return {
                        valid : false,
                        report : reports,
                        bubbleUp : true
                    }
                }

                return {
                    valid : true,
                    report : []
                }
            }
        });

        return ClozeAnswerEditor;

    });
