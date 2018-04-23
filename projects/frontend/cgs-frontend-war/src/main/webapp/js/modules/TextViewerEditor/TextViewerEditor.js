define(['BaseContentEditor', 'dialogs', 'repo', 'repo_controllers', 'IconAndFileUpload', 'events', 'translate', './config', './TextViewerPropsView', './TextViewerStageView', './TextViewerSmallStageView', "./constants"],
    function(BaseContentEditor, dialogs, repo, repo_controllers, IconAndFileUpload, events, i18n, config, TextViewerPropsView, TextViewerStageView, TextViewerSmallStageView, constants) {

        var TextViewerEditor = BaseContentEditor.extend({

            initialize: function(configOverrides, inheritedConfig) {
                if (configOverrides.is_convertor) {
                    this.formatter = new TextViewerStageView({
                        formatter: true
                    });
                    return false;
                }

                if (!inheritedConfig) {
                    this.setStageViews({
                        small: TextViewerSmallStageView,
                        normal: TextViewerStageView
                    });

                    this.propsView = TextViewerPropsView;
                }

                if (typeof(inheritedConfig) === "object" && _.size(inheritedConfig) === 0) {
                    inheritedConfig = $.extend(true, inheritedConfig, config());
                }

                //change menu buttons config according to text editor type (full, single style rich text, single style plain )
                var record = repo.get(configOverrides.id);
                var customConfig = $.extend(true, {}, inheritedConfig || config());
                // add a class for body according to parent type 
                repo.startTransaction({ ignore: true });
                if ((repo.get(record.parent)).type && (repo.get(record.parent)).type == "definition") {
                    repo.updateProperty(record.id, 'data-placeholder', " " + i18n.tran("click to edit definition") + " ", false, true);
                }


                if (record.type === 'AnswerFieldTypeText') {
                    this.clear_unpermitted_data(record);
                }

                repo.busy(true);

                this.migrate_mode(record, "AnswerFieldTypeText", "ShortAnswer", "plain");

                if (record && record.data && record.data.mode && constants.modes && _.isFunction(constants.modes[record.data.mode])) {
                    constants.modes[record.data.mode].call(this, record, customConfig, record.data.settings);
                }
                //disable hyper link button if needed
                constants.configureHyperLinkButton.call(this, record, customConfig);

                if (_.isUndefined(record.data.showNarrationType)) {
                    repo.updateProperty(record.id,'showNarrationType', _.isUndefined(constants.narration_show[record.data.mode]) ? true : constants.narration_show[record.data.mode], false, true);
                }

                repo.busy(false);
                repo.endTransaction();

                this.multiNarrationsLocales = _.toArray(require("courseModel").getMultiNarrationLocales());
                this.showMultiNarration = this.multiNarrationsLocales.length &&
	                require("userModel").account.enableNarrationAdditionalLanguages;

                this._super(customConfig, configOverrides);

                if (!this.config.previewMode) {
                    this.startPropsEditing();
                    this.startStageEditing();
                }
            },
            getKeyboardPreset: function (mathfieldElem) {
                //mathfield keyboard
                var keyboards = {
                    DEFAULT: 'contentEditorMathField',
                    COMPLETION_TYPE: 'contentEditorMathField_Completion'
                };


                var keyboardConditions = {
                    'cloze': function (record) {
                        if (!mathfieldElem.parents('ANSWERFIELD').length) return keyboards.DEFAULT;

                        var answerFieldId = mathfieldElem.parents('ANSWERFIELD').attr('id');

                        var progress = repo.getChildrenByTypeRecursive(record.id, 'advancedProgress');
                            progress = progress && progress.length && progress[0];

                        var cloze_answer = repo.getChildrenByTypeRecursive(record.id, 'cloze_answer');
                            cloze_answer = cloze_answer && cloze_answer.length && cloze_answer[0];

                        var cloze_text_viewer = repo.getChildrenByTypeRecursive(record.id, 'cloze_text_viewer');
                            cloze_text_viewer = cloze_text_viewer && cloze_text_viewer.length && cloze_text_viewer[0];

                        var answerType = cloze_answer.data.answerType;
                        
                        var checkingEnabled = progress.data.checking_enabled;
                        var interactionType = cloze_answer.data.interaction;
                        var answerfield = cloze_text_viewer.data.answerFields[answerFieldId];


                        if (checkingEnabled && interactionType === 'write' && answerfield && answerfield.completionType === 'C') {
                            return keyboards.COMPLETION_TYPE;
                        } else {
                            return keyboards.DEFAULT;
                        }
                    }
                };
                //get the current editor;
                var editor = repo.getAncestorRecordByType(this.record.id, 'cloze');

                if (!editor) {
                    editor = repo.getAncestorRecordByType(this.record.id, 'ShortAnswer');

                    if (!editor) return keyboards.DEFAULT;
                }

                return keyboardConditions[editor.type] && keyboardConditions[editor.type](editor);

            },
            setMenu: function () {
                if (!this.record.data.narrationType || this.record.data.narrationType !== "2") {
                    events.fire('setMenuButtonState', 'menu-button-insert-narration', 'disable');
                }
                events.fire('setMenuButtonState', 'menu-button-insert-ib', 'disable');
                events.fire('setMenuButtonState', 'menu-button-insert-link', 'disable');

                this.stage_view.endEditing();
            },
            disableMenuItems: function f1123(menuItems, excludeName) {
                for (var i = 0; i < menuItems.length; ++i) {
                    if (menuItems[i].id !== excludeName) {
                        menuItems[i].notImplemented = true;

                        if (menuItems[i].subMenuItems && menuItems[i].subMenuItems.length) {
                            this.disableMenuItems(menuItems[i].subMenuItems, excludeName);
                        }
                    }
                }
            },
            disablesSpecificMenuItem: function f1124(menuItems, excludeName) {
                for (var i = 0; i < menuItems.length; ++i) {
                    if (menuItems[i].id === excludeName) {
                        menuItems[i].notImplemented = true;
                        menuItems.splice(i, 1);
                    } else {
                        if (menuItems[i].subMenuItems && menuItems[i].subMenuItems.length) {
                            this.disablesSpecificMenuItem(menuItems[i].subMenuItems, excludeName);
                        }
                    }
                }
            },
            clear_unpermitted_data: function f1132(rec) {
                var text_viewer_content = $("<div></div>").append(rec.data.title);

                repo.removeChildren(rec.id);

                text_viewer_content.find('component, mathfield, mathfieldtag').remove();

                repo.updateProperty(rec.id, 'mathfieldArray', {}, false, true);
                repo.updateProperty(rec.id, 'title', text_viewer_content.html(), false, true);

            },
            migrate_mode: function f1133(record, parentType, parentEditor, mode) {
                var p = repo.getAncestorRecordByType(record.id, parentType);
                var editor = repo.getAncestorRecordByType(record.id, parentEditor);

                if (p && editor) {
                    repo.updateProperty(record.id, 'mode', mode, false, true);
                }
            },
            getHtmlFormatted: function f1134(text, mathfieldArray) {
                var _iframe = $("<iframe></iframe>");

                _iframe.attr({
                    id: "_fragment_document"
                });
                _iframe.css({
                    visibility: 'hidden'
                });

                _iframe.appendTo('body');

                return this.formatter.getHTMLAsFragment(_iframe, text, mathfieldArray);
            },
            setInternalEvents: function f1135() {
                events.register("executeCommand", this.executeCommand, this);
            },

            executeCommand: function() {
                var command = arguments[0][0],
                    params = arguments[0][1] || false;

                this.stage_view.menuCmd.call(this.stage_view, command, params);
            },

            // @param propsContainer - context for model binding 
            registerEvents: function(propsContainer) {

                this.view.initNarrationTypes();

                var changes = {
                    narrationType: this.propagateChanges(this.record, 'narrationType', true),
                    has_multinarration: this.propagateChanges(this.record, 'has_multinarration', true)
                };

                this.model = this.screen.components.props.startEditing(this.record, changes, propsContainer ? $(propsContainer) : null);

                this.model.on('change:narrationType', this.checkNarrationChanges, this);
                this.model.on('change:has_multinarration', this.onCheckMultiNarration, this);

                //disable insert narration button
                events.fire('setMenuButtonState', 'menu-button-insert-narration', 'disable');

                if (this.record.data.has_multinarration) {
                    this.setMultiNarration();
                }

                //handle narration insertion
                switch (this.record.data.narrationType) {

                    //no narration
                    case "0":
                        break;

                        //General narration upload (from props)
                    case "1":
                        repo.startTransaction({ ignore: true });
                        repo.updateProperty(this.record.id, 'narration', this.record.data.narration || {}, false, true);
                        repo.endTransaction();

                        new IconAndFileUpload({
                            itemId: '#generalNarrationUploader',
                            repoItemName: 'narration',
                            type: 'narration',
                            context: this,
                            recordId: this.config.id,
                            srcAttr: 'narration.' + repo.get(repo._courseId).data.contentLocales[0],
                            enableAssetManager: this.enableAssetOrdering,
                            isNarration: this.enableTextToSpeach
                        });
                    break;

                        //narration per per paragraph, enable narration menu button and register event
                    case "2":
                        events.fire('setMenuButtonState', 'menu-button-insert-narration', 'enable');
                        break;
                }
                
                events.fire('setMenuButtonState', 'menu-button-insert-ib', 'disable');
                events.fire('setMenuButtonState', 'menu-button-insert-link', 'disable');
            },

            setMultiNarration: function() {
                _.each(this.multiNarrationsLocales, function(item) {
                    new IconAndFileUpload({
                        itemId: '#generalNarrationUploader_' + item.locale,
                        repoItemName: 'narration',
                        type: 'narration',
                        context: this,
                        recordId: this.config.id,
                        srcAttr: 'multiNarrations.' + item.locale,
                        enableAssetManager: this.enableAssetOrdering,
                        isNarration: this.enableTextToSpeach,
                        isMultiNarration : true
                    });
                }, this);
            },
            cleanNarrations: function() {
                repo.updateProperty(this.record.id, 'assetManager', _.filter(this.record.data.assetManager, function(item) {
                    return item.srcAttr.indexOf(".") === -1;
                }));

                repo.updateProperty(this.record.id, 'multiNarrations', _.mapValues(this.record.data.multiNarrations, function() {
                    return null;
                }));
            },
            onCheckMultiNarration: function(event, val) {
                repo.startTransaction({ appendToPrevious: true });
                if (val) {
                    repo.updateProperty(this.record.id, 'multiNarrations', _.mapValues(require("courseModel").getMultiNarrationLocales(), function() {
                        return null;
                    }));
                } else {
                    this.cleanNarrations();
                }
                repo.endTransaction();
                
                    this.view.refresh();
                    this.registerEvents();
            },
            checkNarrationChanges: function(event, val) {
                var hasChanges = false,
                    prevValue = event.previousAttributes().narrationType;
                switch (prevValue) {
                    //previous value: general
                    //check if value was inserted
                    case "1":
                        if (this.record.data.generalNarration &&
                            this.record.data.narration) {
                            hasChanges = true;
                        }
                        break;

                        //previous value: peragraph
                        //check if DOM has inline narration icons
                    case "2":
                        if ($(this.stage_view.body).find(".narration_icon").length) {
                            hasChanges = true;
                        }
                        break;
                }
                this.stage_view.isStartEditing = true;
                //changes were made, we need to display the notification dialog
                if (hasChanges) {
                    var dialogConfig = {

                        title: "changes in text narration",

                        content: {
                            text: "You asked to changed the settings of the narration for this text. There are files defined. Changing the narration type setting will cause this files to be lost. Are you sure you want to change type narration type?",
                            icon: 'warn'
                        },

                        buttons: {
                            yes: {
                                label: 'yes'
                            },
                            cancel: {
                                label: 'cancel'
                            }
                        },
                        closeOutside: false

                    };

                    events.once('onNarrationChange', function(response) {
                        this.onNarrationChange(response, this.setNarration, prevValue, val);
                    }, this);

                    var dialog = dialogs.create('simple', dialogConfig, 'onNarrationChange');
                } else {
                    this.setNarration(prevValue, val);
                }

            },
            onNarrationChange: function(response, continueCallback, prevValue, val) {
                switch (response) {
                    case 'cancel':
                        repo.revert();
                        repo.startTransaction({ ignore: true });
                        this.model.set('narrationType', prevValue);
                        // this.view.setType("#narration_type", prevValue); //return prev options type
                        repo.endTransaction();
                        break;

                    case 'yes':
                        continueCallback.call(this, prevValue, val);
                        break;
                }
            },

            //fired after change selection of narration type in props
            setNarration: function(prevValue, val) {

                repo.startTransaction({ appendToPrevious: true });
                require("cgsUtil").setTextViewerNarration({
                    id: this.record.id,
                    type: val,
                    disableCreate: true,
                    clearElement: $(this.stage_view.body)
                });

                if(val == "1") {
                    repo.updateProperty(this.record.id, 'multiNarrations', _.mapValues(require("courseModel").getMultiNarrationLocales(), function() {
                        return null;
                    }));
                    repo.updateProperty(this.record.id, 'has_multinarration', true);
                }
                repo.endTransaction();

                //RE-render props, will set the narration configuration
                this.startPropsEditing();
            },


            startPropsEditing: function() {
                this._super();
                this.view = new this.propsView({
                    controller: this
                });

                // If addParentProps is true, render parent's props into current props view
                // It's required for table cell props rendering
                var record = this.record;
                if (record && record.data && record.data.addParentProps) {
                    this.view.$el.find('#properties').wrapInner('<div id="original-props" />');
                    this.view.$el.find('#properties').prepend('<div id="parent_properties" />');

                    var parentController = repo_controllers.get(record.parent);
                    if (parentController) {
                        parentController.startPropsEditing({
                            'clearOnRender': false,
                            'hideHeader': true,
                            'contentSelector': '.tab-content #properties',
                            'appendToSelector': '.tab-content #parent_properties'
                        });
                    }
                    this.registerEvents('.tab-content #original-props');
                } else {
                    this.registerEvents('.tab-content #properties');
                }
            },

            dispose: function() {
                this.unbindTextViewerEvents();
                this._super();
                /*
                if( this.stageViews ){
                    
                    this.stageViews.normal && this.stageViews.normal.dispose && this.stageViews.normal.dispose();
                    this.stageViews.small && this.stageViews.small.dispose && this.stageViews.small.dispose();
                    
                }*/
            },

            unbindTextViewerEvents: function f1136() {
                //if the narration type is per peragraph, we need to unbind the function from the menu
                if (this.record.data.narrationType == "2") {
                    events.unbind('insertNarration');
                }

                events.unbind('executeCommand', this.executeCommand, this);
            }


        }, {
            type: 'TextViewerEditor',

            /**
             * text
             * @param  {[type]} elem_repo [description]
             * @return {[type]}           [description]
             */
            valid: function f1137(elem_repo) {

                var result = {
                    'valid' : true,
                    'report': []
                }
                // Inline component without src is not valid

                var subtree = repo.getSubtreeRecursive(elem_repo.id);

                var missingSources = _.any(subtree, function(record) {
                    var missingGeneralNarration = record.data.generalNarration && _.isEmpty(record.data.narration);
                    var missingResource = record.data.hasOwnProperty('component_src') && !record.data.component_src;
                    return missingGeneralNarration || missingResource;
                });

                //check if the text viewer is empty- if its not allowed to have an empty text viewer
                if (elem_repo.data.allowEmptyText !== true && !$.trim($('<div>' + elem_repo.data.title + '</div>').text()).length && !$('<div>' + elem_repo.data.title + '</div>').find('mathfield, component').length &&
                    subtree.length <= 1) { /*the first one is the textViewerEditor himself*/
                    result.valid = false;
                    result.report.push(require('validate').setReportRecord(elem_repo, 'The text object does not have any content. Return to the Text editor and enter content.'));
                }

                if (missingSources) {
                    result.valid = false;
                    result.report = result.report.concat(require('validate').setReportRecord(elem_repo, 'The Text object is missing a file in the General Narration'));
                }

                if (_.any(subtree, function(child) {
                    return child.type == 'hyperlink' && !require('modules/Dialogs/types/hyperlink/hyperlinkDialogView').validationUrl.test(child.data.url || '');
                })) {
                    result.valid = false;
                    result.report.push(require('validate').setReportRecord(elem_repo, 'component.textviewer.invalid_url_validation_error.msg_text'));
                }

                return result;

            },
            postValid: function(elem_repo) {
                var ans = {
                    'valid': true,
                    'report': []
                };

                // if all children are valid, maybe the text viewer was not valid, and the recursion did not run on the children.
                var notValidChildren = _.filter(elem_repo.children, function(child) {
                    return repo.get(child).data.isValid === false;
                });
                if (!notValidChildren.length) {

                    //run validation on children
                    _.each(elem_repo.children, function(child){

                        var childValidation = require('validate').validatePreviewRecursion(child);
                        if(childValidation && childValidation.report.length){
                            ans.valid = false;
                            ans.report = ans.report.concat(childValidation.report);
                        }
                    });
                }else{
                    ans.valid= false;
                    _.each(notValidChildren, function(notValidChild){
                        ans.report = ans.report.concat(repo.get(notValidChild).data.invalidMessage.report);
                    });
                }

                return ans;

            },

            alignData: function(elem_repo, callbak) {
                require('busyIndicator').start();
                var data = $('<div />').html(elem_repo.data.title),
                    inlineElements = [],
                    index = 0;

                data.find('inlinefile').each(function() {
                    inlineElements.push({
                        fileId: $(this).text(),
                        type: $(this).attr('type').replace(/\\"/g, "")
                    });
                });

                (function copyFile(obj) {
                    if (obj) {
                        require('cgsUtil').getInlineComponent(elem_repo.id, obj.fileId, obj.type, function(compData) {
                            obj.component = compData;
                            copyFile(inlineElements[++index]);
                        });
                    } else {

                        // Create all inline elements and replace with component id
                        data.find('inlinefile').replaceWith(function() {
                            var compData = _.where(inlineElements, {
                                fileId: $(this).text(),
                                type: $(this).attr('type').replace(/\\"/g, "")
                            });

                            compData = compData.length ? compData[0].component : null;

                            // insert returned object props into repo element
                            _.each(compData, function(value, key) {
                                if (value && key != 'componentText') {
                                    if (elem_repo.data[key] instanceof Array) {
                                        if(key === 'assetManager'){
                                            //need to set the new value of the asset manager key
                                            repo.updateProperty(elem_repo.id, key, _.remove(elem_repo.data[key], function(assetManagerItem){
                                                    return assetManagerItem.srcAttr === value[0].srcAttr;
                                            }), false, true);
                                        }
                                        
                                        repo.updateProperty(elem_repo.id, key, _.union(elem_repo.data[key], value), false, true);
                                    }else{
                                        repo.updateProperty(elem_repo.id, key, value, false, true);
                                    }
                                }
                            });

                            return compData.componentText;
                        });
                        var customStyle = elem_repo.data.styleOverride || 'normal';
                        if (data.find('div.cgs').length) {
                            repo.updateProperty(elem_repo.id, 'title', data.html(), false, true);
                        } else if (data.html().trim() == '') {
                            repo.updateProperty(elem_repo.id, 'title', '<div class="cgs ' + customStyle + '" style="width: 100%; min-width: 28px; min-height: 28px; margin: 0px 10px 0px 0px; padding: 0px; outline: none; white-space: pre-wrap; float: left; clear: both; -webkit-user-select: none;" contenteditable="false" customstyle="' + customStyle + '"></div>', false, true);
                        } else {
                            var defaultStyle = 'style="min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto" contenteditable="false" customStyle="' + customStyle + '"';

                            repo.updateProperty(elem_repo.id, 'title', _.map(_.compact(_.invoke(data.html().split('<br>'), 'trim')), function(par) {
                                return '<div class="cgs ' + customStyle + '" ' + defaultStyle + '>' + par + '</div>'
                            }).join(''), false, true);
                        }
                        repo.updateProperty(elem_repo.id, 'mathfieldArray', {}, false, true);
                        repo.updateProperty(elem_repo.id, 'textEditorStyle', 'texteditor cgs', false, true);
                        repo.deleteProperty(elem_repo.id, 'tvPlaceholder', false, true);

                        var tvc = require('repo_controllers').get(elem_repo.id);
                        if (tvc) {

                            tvc.renderChildren();
                        }

                        require('busyIndicator').stop();
                        if (_.isFunction(callbak)) {
                            callbak();
                        }

                    }
                })(inlineElements[index]);
            }
        });

        return TextViewerEditor;

    });