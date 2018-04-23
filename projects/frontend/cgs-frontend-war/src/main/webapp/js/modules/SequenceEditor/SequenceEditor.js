define(['jquery', 'BaseContentEditor', 'repo', 'events', 'cgsUtil', './config', './AssessmentConfig', 'dialogs', './SequencePropsView', './SequenceStageView',
    'validate', 'keyboardManager', 'lessonModel', 'editMode', 'FileUpload',  'StandardsList',
    'standardsModel', 'growingListComponentView', 'commentsComponent' , 'teacherGuideComponentView', './reconvertValidation'],
    function f992($, BaseContentEditor, repo, events, cgsUtil, config, AssessmentConfig, dialogs, SequencePropsView, SequenceStageView,
        validate, keyboardManager, lessonModel, editMode, FileUpload,  StandardsList,
        standardsModel, growingListComponentView, commentsComponent, teacherGuideComponentView, reconvertValidation) {

        /**
         * menu configuration for sequence,
         * normal mode and assessment mode.
         */
        var SequenceMenuConfig = {
            "lessonModeNormal": config,
            "lessonModeAssessment": AssessmentConfig
        };

        var SequenceEditor = BaseContentEditor.extend({

            initialize: function f993(configOverrides) {

                var mode = (lessonModel.isLessonModeAssessment() || repo.get(repo.get(require("router")._static_data.id).parent).type === 'quiz') ? "lessonModeAssessment" : "lessonModeNormal";

	            this.setInsertTaskGroupMenu(SequenceMenuConfig[mode], require('router').activeScreen['LessonMenuConfig'][mode]);

                this._super(SequenceMenuConfig[mode], configOverrides);

                repo.startTransaction({ ignore: true });
                if (lessonModel.isLessonModeAssessment()) {
                    repo.updateProperty(this.record.id, 'exposure', 'all_exposed', false, true);
                }
                repo.endTransaction();

                this.view = new SequencePropsView({controller: this});
                this.stage_view = new SequenceStageView({controller: this});

                this.registerEvents();

                this.growingListComponent = new growingListComponentView({
                    el: '.objective-placeholder',
                    data: this.model.get('objective'),
                    title: 'Objective',
                    column_name: 'Enter text',
                    update_model_callback: _.bind(function f994(event, data) {
                        this.model.set('objective', data);
                    }, this)
                });

                this.sequenceHelp = cgsUtil.createHelpComponent({
                    "parentId": this.record.id,
                    "containerSelector" : $(".help_placeholder")
                });

	            if (this.enableStandards) {
		            this.standardsList = new StandardsList(
			            {
				            itemId: '#standards_list',
				            repoId: this.record.id,
				            getStandardsFunc: _.bind(function f1002() {
					            return standardsModel.getStandards(this.record.id);
				            }, this)
			            });
	            }

                this.teacherGuideComponent = new teacherGuideComponentView({
                    el: '.teacherGuide-placeholder',
                    data: this.model.get('teacherGuide'),
                    title: 'teacherGuide',
                    column_name: 'teacherGuide',
                    update_model_callback: _.bind(function f995(data) {
                        this.model.set('teacherGuide', data);
                    }, this)
                });

                events.bind('end_load_of_menu', this.onEndOfLoadMenu, this);

                this.compareDisabled = true;

                this.showStagePreview($('#stage_base'), {bindTaskEvents: true, bindEvents: false, stagePreviewMode: 'small'});

                // fire an event after sequence was rendered - used for scrolling to the new created item
                if (events.exists('scrollToItem')) {
                    events.fire('scrollToItem');
                }

                this.initializeCreativeWrapper();

                this.view.setInputMode();

                //initialize comments component that allows the user the add comments in the sequence editor
                this.commentsComponent = new commentsComponent({
                    data: this.record.data.comments,
                    parentRecordId: this.record.id,
                    $parent: $(".commentsArea")
                });

                require('publishModel').getLessonPublishedUrl(repo._courseId, lessonModel.getLessonId())
                    .then(function() {
                        events.fire('enable_menu_item', 'menu-button-share-a-link-lesson');
                    }, function() {
                        events.fire('disable_menu_item', 'menu-button-share-a-link-lesson');
                    });
            },

	        setInsertTaskGroupMenu: function (config, screenConfig) {
		        var screenConfigMenuItems = screenConfig.components.menu.config.menuItems;

		        var menuItem = _.find(screenConfigMenuItems, {'id': "menu-button-course"});
		        var sequenceMenuItems = _.find(menuItem.subMenuItems, {'id': "sequence-insert-menu"});

		        var defaultMenuItems = require('router').activeScreen.components.menu.defaultMenuItems;
		        var defaultMenuItem = _.find(defaultMenuItems, {'id': "menu-button-course"});
		        var defaultSequenceMenuItems = _.find(defaultMenuItem.subMenuItems, {'id': "sequence-insert-menu"});

		        //replace default task list with list according to sequence mode (normal or quiz)
		        if(sequenceMenuItems) {
		            _.extend(defaultSequenceMenuItems, sequenceMenuItems);
		        }
	        },

            onEndOfLoadMenu: function() {
                this.setMenuButtonsState();
                this.disableCompareMenuButton();
            },

            startPropsEditing: function () {
                // prevent super start editing
            },

            initializeCreativeWrapper: function f1005() {
                new FileUpload({
                    activator: "#upload-creative-wrapper",
                    options: _.extend(FileUpload.params.cws, {

                        //new feature to rename file from cws to zip (itreate through the files and execute the callback)
                        rename: function f1006(name) {
                            //get the file extension
                            var ext = name.substring(name.lastIndexOf(".") + 1, name.length);

                            if (ext === 'zip') return name; //if we already upload zip so no need to change it
                            else {
                                return name.replace(name.substring(name.lastIndexOf(".") + 1, name.length), 'zip');
                            }
                        },
                        uploadFileLocalyOnly : true
                    }),
                    callback: function f1007(path) {
                        var cgsModel = require('cgsModel');
                        if (path) {
                            cgsModel.setCreativeWrapper(this.record.id, path);
                        } else { //!path - delete creative wrapper
                            cgsModel.deleteCreativeWrapper(this.record.id);
                            this.view.removeCreativeWrapperThumbnail();
                        }
                    },
                    context: this,
                    recordId: this.record.id,
                    srcAttr: 'cwsSrc',
                    enableAssetManager: this.enableAssetOrdering,
                    enableDelete: true
                });
            },

            registerEvents: function f1008() {

                var changes = {
                        title: this.propagateChanges(this.record, 'title', validate.requiredField, true),
                        type: this.propagateChanges(this.record, 'type', this.afterDialogResponse.bind(this), true),
                        exposure: this.propagateChanges(this.record, 'exposure', true),
                        instructions: this.propagateChanges(this.record, 'instructions', true),
                        teacherGuide: this.propagateChanges(this.record, 'teacherGuide', true),
                        keywords: this.propagateChanges(this.record, 'keywords', true),
                        objective: this.propagateChanges(this.record, 'objective', true),
                        difficulty: this.propagateChanges(this.record, 'difficulty', true),
                        help: this.propagateChanges(this.record, 'help', true),
                        sharedBefore: this.propagateChanges(this.record, 'sharedBefore', true)
                    },
                    newItemHandler = {'type': 'register', 'func': function f1009(args) {

                        //set parent of new created item to be the parent of current element 
                        var parentId = this.record.parent;

                        //in case we want to create a "Lo" item , his parent needs to bee the lesson element
                        if (args.type == "lo") {
                            var lessonParentRecord = repo.getAncestorRecordByType(this.record.id, "lesson");
                            parentId = lessonParentRecord.id;
                        }
                        var itemConfig = _.extend({parentId: parentId}, args);

                        events.fire('createLessonItem', itemConfig);
                    }, 'ctx': this, 'unbind': 'dispose'};

                this.model = this.screen.components.props.startEditing(this.record, changes);

                this.bindEvents(
                    {
                        'setSelectedEditor': {'type': 'bind', 'func': this.setCompareButtonState, 'ctx': this, 'unbind': 'dispose'},
                        'clickOnStage': {'type': 'bind', 'func': this.removeSelectedEditor, 'ctx': this, 'unbind': 'dispose'},
                        'compare_items': {'type': 'register'},
                        'menu_lesson_item_delete': {'type': 'register', 'func': function f1010() {
                            events.fire('delete_lesson_item', this.config.id);
                        }, 'ctx': this, 'unbind': 'dispose'},
                        'revert_sequence': {'type': 'register', 'func': function f1011() {
                            this.revert_sequence();
                        }, 'ctx': this, 'unbind': 'dispose'},
                        'handle_reconvert_event': {'type': 'register', 'func': this.handle_reconvert_event, 'ctx': this, 'unbind': 'dispose'},
                        'new_lesson_item': newItemHandler,
                        'new_differentiated_sequence': { 'type': 'register', 'func': function f1012() {
                            events.fire('createDifferentiatedSequence', this.record.parent, this);
                        }, 'ctx': this, 'unbind': 'dispose'},
                        'new_separator': { 'type': 'register', 'func': function (args) {
                            var itemConfig = _.extend({parentId: this.record.parent}, args);
                            events.fire('createSeparator', itemConfig);
                        }, 'ctx': this, 'unbind': 'dispose'}
                    });

                this.model.on("change:type", this.typeChangeHandler, this);
                this.model.on("change:sharedBefore", this.sharedBeforeChangeHandler, this);
            },

            handle_reconvert_event: function f1013() {
                events.once('reconvert_html_sequence', this.reconvert_html_sequence.bind(this));

                var dialog = dialogs.create('simple', {
                    title: "Edit Conversion",

                    content: {
                        text: "The sequence will return to the converted content",
                        icon: 'warn'
                    },
                    buttons: {
                        confirm: { label: 'OK' },
                        cancel: { label: 'Cancel' }
                    }
                }, 'reconvert_html_sequence');
            },

            /**
             * Recursive function that iterates through the record tree and check if reconvert to pdf is valid
             * @param id
             * @returns {*}
             */
            approve_reconverting: function f1014(id) {
                if (!id) {
                    return true;
                }
                var _repo_record = repo.get(id),
                    handler = reconvertValidation[_repo_record.type];
                if (!handler) {
                    return true;
                }

                //checks on the validation object handler that there is no children exists
                if (handler.children && _repo_record.children.length) {
                    var a = _.values(repo.getDirectChildrenTypes(_repo_record)),
                        b = reconvertValidation[_repo_record.type].children;
                    if (!_.difference(a, b)) {
                        return false;
                    }
                }

                //checks if all the values in validation.data are equel to the one in _repo.record
                if (handler.data) {
                    if (_.map(handler.data,function f1015(value, key) {
                        if (_.isArray(handler.data[key])) {
                            return handler.data[key].indexOf(_repo_record.data[key]) !== -1;
                        }
                        else if (_repo_record.data[key] != handler.data[key]) {
                            return false;
                        }
                        return true;
                    }, this).indexOf(false) !== -1) {
                        return false;
                    }
                }

                //if the validation object handler has function runs the function
                if (_.isFunction(handler.is_valid)) {
                    return   reconvertValidation[_repo_record.type].is_valid(_repo_record);
                }

                if (_repo_record.children.length) {
                    var result = _repo_record.children.every(_.bind(this.approve_reconverting, this));
                    return result;
                }
                return true;
            },

            reconvert_html_sequence: function f1016(response) {
                if (response === "cancel") return;
                //on success
                repo.startTransaction();
                repo.updateProperty(this.record.id, 'type', 'html_sequence', true);
                repo.updateProperty(this.record.id, 'exposure', 'all_exposed');

                repo.updateProperty(this.record.id, 'type', 'simple');
                repo.updateProperty(this.record.id, 'isPdfConverted', false);

                _.each(this.record.children, function f1017(v) {
                    repo.remove(v);
                });
                repo.setRecursiveCloneToRepo(this.record.data.editModeData);
                repo.endTransaction();
                this.router.load(this.record.data.editModeData.id);
            },

            //after chaning the squence from shared to simple all the child should be init the sharedIntegration prop
            typeChangeHandler: function f1018(event, val) {

            },

            sharedBeforeChangeHandler: function f1020(event, val) {

                this.stage_view.placeSharedArea();
            },

            setMenuButtonsState: function f1021() {
                var isAssessmentMode = require("lessonModel").isLessonModeAssessment() || repo.getParent(this.record).data.pedagogicalLoType == "quiz",
                    disableItems = [],
                    enableItems = [];
                this.registerMenuEvents();

                // If header is already exists or it's in read only mode, disable 'Add Header' button
                if (repo.getChildrenRecordsByType(this.record.id, "header").length || !!editMode.readOnlyMode) {
                    disableItems.push('menu-button-new-header');
                }
                else {
                    enableItems.push('menu-button-new-header');
                }

                if (isAssessmentMode) {
                    if (repo.getParent(this.record).data.pedagogicalLessonType == "auto" || repo.getParent(this.record).data.pedagogicalLoType == "quiz") {
                        disableItems.push('menu-button-new-freeWriting');
                        disableItems.push('menu-button-new-questionOnly');
                        if (repo.getParent(this.record).data.pedagogicalLoType !== "quiz") {
                            //disableItems.push('menu-button-new-applet-task');
                        }
                    }
                }

                if (enableItems.length) {
                    events.fire('enable_menu_item', _.union(enableItems));
                }

                if (disableItems.length) {
                    events.fire('disable_menu_item', _.union(disableItems));
                    events.fire('dispose-cgs-hints');
                    events.fire('init-cgs-hints');
                }


            },

            removeSelectedEditor: function f1022() {
                if (!!this.selectedEditor)
                    this.selectedEditor.stage_view.removeSelected();
                if (!!this.prevSelectedEditor)
                    this.prevSelectedEditor.stage_view.removeSelected();

                this.disableCompareMenuButton();
                this.compareDisabled = true;
            },

            registerMenuEvents: function f1023() {
                this.bindEvents(
                    {
                        'createNewItem': {'type': 'bind', 'func': this.createNewItem,
                            'ctx': this, 'unbind': 'dispose'},
                        'deleteItem': {'type': 'register', 'func': function _deleteItem(id) {
                            this.deleteItemById(id);
                        }, 'ctx': this, 'unbind': 'dispose'},
                    });
            },

            createPluginItem: function f1025(data) {
                if (data.type == "sequencePlugin") {

                    var elemId = null;
                    //set the currect template path
                    var pluginModel = require("models/pluginModel");
                    pluginModel.createItem(data.data.pluginName, this.config.id, _.bind(this.renderPluginItem, this));
                }
            },

            renderPluginItem: function f1026(response) {
                if (response && response.response) {
                    this.router.load(this.config.id);
                }
            },

            renderNewItem: function f1027(elemId) {
                if (elemId) {
                    events.once('scrollToItem', _.bind(function f1028() {
                        this.scrollToItem(elemId);
                    }, this));
                }

                this.router.load(this.config.id)
            },

            endEditing: function () {
                this.needValidate = true;

                this._super();
            },

            dispose: function f1029() {
                this.selectedEditor = null;
                this.endEditing();// for disposing events in 'endEditing'
                this.unbindEvents('dispose');
                events.unbind('end_load_of_menu', this.onEndOfLoadMenu, this);
                events.unbind('compare_items');
                this.sequenceHelp && this.sequenceHelp.dispose();
                this.growingListComponent && this.growingListComponent.dispose();
                this.teacherGuideComponent && this.teacherGuideComponent.dispose();
                this.commentsComponent && this.commentsComponent.dispose();// dispose of comment component
                this.standardsList && this.standardsList.dispose();

                this._super();

                delete this.sequenceHelp;
                delete this.growingListComponent;
                delete this.teacherGuideComponent;
                delete this.commentsComponent;
                delete this.standardsList;
            },

            addSharedContent: function f1030() {
                this.createItem({parentId: this.config.id, type: 'sharedContent'});
            },

            deleteSharedContent: function f1031() {
                var shared_children = repo.getChildrenRecordsByType(this.config.id, 'sharedContent'), self = this;

                shared_children.forEach(function f1032(child) {
                    self.deleteItem(child.id);
                });

                _.each(this.record.children, function f1019(childId) {
                    var childData = repo.get(childId);
                    if (childData.data.sharedIntegration) {
                        repo.updateProperty(childId, "sharedIntegration", null, false);
                    }
                }, this);
            },

            setCompareButtonState: function f1033(editor) {
                if (!!this.prevSelectedEditor)
                    this.prevSelectedEditor.stage_view.removeSelected();
                this.prevSelectedEditor = this.selectedEditor;
                this.selectedEditor = editor;

                if (!!this.prevSelectedEditor) {
                    //check if tasks are already in compare state
                    if (keyboardManager.isCtrlPressed() && this.areTasksInCompare()) {
                        this.prevSelectedEditor.stage_view.setSelected();
                        if (!editMode.readOnlyMode) {
                            this.enableCompareMenuButton('Uncompare');
                            this.compareDisabled = false;
                        }
                    } else {
                        //check if ctrl is pressed and tasks are one after the other
                        if (keyboardManager.isCtrlPressed() && this.areTasksSuccessive()) {
                            this.prevSelectedEditor.stage_view.setSelected();
                            if (!editMode.readOnlyMode) {
                                this.enableCompareMenuButton('Compare');
                                this.compareDisabled = false;
                            }
                        } else {
                            this.disableCompareMenuButton();
                            this.compareDisabled = true;
                            this.prevSelectedEditor.stage_view.removeSelected();
                        }
                    }
                }
            },

            areTasksInCompare: function f1034() {
                return (repo.get(this.prevSelectedEditor.record.parent).type == 'compare' &&
                    repo.get(this.selectedEditor.record.parent).type == 'compare');
            },

            areTasksSuccessive: function f1035() {
                if (this.prevSelectedEditor.isTask && this.selectedEditor.isTask &&
                    this.prevSelectedEditor.record.type != 'header' && this.selectedEditor.record.type != 'header') {
                    if (this.prevSelectedEditor.record.parent == this.selectedEditor.record.parent) {
                        var prevIndexOfParent = repo.get(this.prevSelectedEditor.record.parent)
                            .children.indexOf(this.prevSelectedEditor.record.id);
                        var currentIndexOfParent = repo.get(this.selectedEditor.record.parent)
                            .children.indexOf(this.selectedEditor.record.id);

                        if (Math.abs(prevIndexOfParent - currentIndexOfParent) == 1) {
                            return true;
                        }
                    }
                }
                return false;
            },

            compareItems: function f1036() {

                repo.startTransaction();

                //uncompare
                if (this.areTasksInCompare()) {
                    repo.removeItemAndSetChildrenToParent(this.prevSelectedEditor.record.parent);
                    //compare two items
                } else {

                    var prevIndexOfParent = repo.get(this.prevSelectedEditor.record.parent)
                        .children.indexOf(this.prevSelectedEditor.record.id);
                    var currentIndexOfParent = repo.get(this.selectedEditor.record.parent)
                        .children.indexOf(this.selectedEditor.record.id);

                    indexToAdd = Math.min(prevIndexOfParent, currentIndexOfParent);

                    // create new compare item
                    var compareConfig = {
                        type: 'compare',
                        parentId: this.selectedEditor.record.parent,
                        insertAt: indexToAdd
                    };
                    var compare = this.createItem(compareConfig);

                    // remove items from sequence
                    var newChildren = require('cgsUtil').cloneObject(repo.get(this.prevSelectedEditor.record.parent).children);
                    var removedItems = newChildren.splice(indexToAdd + 1, 2);
                    repo.updateProperty(this.prevSelectedEditor.record.parent, 'children', newChildren, true);

                    // add children to compare
                    repo.updateProperty(compare, 'children', repo.get(compare).children.concat(removedItems), true);

                    //update removed items parent
                    _.each(removedItems, function f1037(item, i) {
                        repo.updateProperty(item, 'parent', compare, true);
                    });
                }

                repo.endTransaction();

                this.renderNewItem();
            },

            changeTypeNotification: function f1038(continueCallback, options) {
                var dialogConfig = {

                    title: "Sequence type change",

                    content: {
                        text: "Are you sure want to change sequence type from shared to basic?",
                        icon: 'warn'
                    },

                    buttons: {
                        yes: { label: 'yes' },
                        cancel: { label: 'cancel' }
                    }
                };

                events.once('onSequenceTypeChange', function f1039(response) {
                    this.onSequenceTypeChange(response, continueCallback, options);
                }, this);

                var dialog = dialogs.create('simple', dialogConfig, 'onSequenceTypeChange');
            },

            afterDialogResponse: function f1040(value, options) {
                if (!!this.dontShowDialog) {
                    return;
                }

                var redirect = false;

                if (value == "shared" && options.model.previous(options.field) != "shared") { //change to shared type
                    repo.startTransaction();
                    this.addSharedContent();
                    redirect = true;
                    options.commit();
                    repo.endTransaction();
                } else if (value != "shared" && options.model.previous(options.field) == "shared") { //change from shared type
                    var shared_children = repo.getChildrenRecordsByType(this.config.id, 'sharedContent');
                    if (shared_children.length && shared_children[0].children.length) {
                        this.changeTypeNotification(this.deleteSharedContent, options);  //in case of share content ask user if he sure want to change sequence type
                    } else {
                        repo.startTransaction();
                        options.commit();
                        this.deleteSharedContent();  //in case of empty share content - delete it
                        repo.endTransaction();
                    }
                }

                if (redirect) {
                    this.loadElement(this.config.id);
                }
            },

            onSequenceTypeChange: function f1041(response, continueCallback, options) {

                if (response == 'yes') {
                    repo.startTransaction();
                    options.commit();  //perform repo update
                    continueCallback.call(this);
                    repo.endTransaction();
                }
                else {
                    this.view.setType('#sequence_type', this.record.data.type); //return prev sequence type
                }
            },

            disableCompareMenuButton: function f1042() {
                events.fire('setMenuButtonState', 'menu-button-compare', 'disable');
                events.unbind('compare_items', this.compareItems);
                events.fire('setMenuButtonState', 'menu-button-compare', 'changeLabel', {label: 'Compare'});
            },

            enableCompareMenuButton: function f1043(buttonText) {
                events.fire('setMenuButtonState', 'menu-button-compare', 'enable');
                events.bind('compare_items', this.compareItems, this);
                events.fire('setMenuButtonState', 'menu-button-compare', 'changeLabel', {label: buttonText});
            },

            deleteItemById: function f1044(id) {
                var index = this.record.children.indexOf(id);
                this.deleteItem(id);
                //events.unbind('deleteItem'); //This line was removing the event of deleting tasks from sequences, why?
                if (index > 0) {
                    this.scrollToItem(this.record.children[index - 1]);
                }
            },

            revert_sequence: function f1046() {
                var dialogConfig = {
                    title: "Revert back to PDF",
                    content: {
                        text: "are you sure you want to revert this item?",
                        icon: 'warn'
                    },
                    buttons: {
                        yes: { label: 'Revert' },
                        cancel: { label: 'Cancel' }
                    }
                };

                events.once('onRevertResponse', function f1047(response) {
                    if (response === 'yes') {
                        repo.updateProperty(this.config.id, 'type', 'html_sequence', true);
                        repo.removeChildren(this.config.id);
                        this.router.load(this.config.id);
                    }
                }, this);

                var dialog = dialogs.create('simple', dialogConfig, 'onRevertResponse');
            }

        }, {

            type: 'SequenceEditor',

            postValid: function f1048(elem_repo) {
                //There must be at least one  task in the sequence and the tasks must be valid
                var ret, valid = true;

                var arr_children = repo.getChildrenRecordsWithoutTypes(elem_repo.id, 'header,sharedContent,help'),
                    invalidChildren = _.filter(elem_repo.children, function (child) {
                        return !repo.get(child).data.isValid;
                    });

                valid = !!arr_children && !!arr_children.length && !invalidChildren.length;

                if (valid) {
                    ret = { valid: true, report: [] };
                } else {
                    ret = { valid: false, report: [
                        {
                            editorId: elem_repo.id,
                            editorType: elem_repo.type,
                            editorGroup: require('types')[elem_repo.type].group,
                            msg: 'There must be at least one task in the sequence',

                        }
                    ]};
                }

                return ret;
            }


        });

        return SequenceEditor;

    });