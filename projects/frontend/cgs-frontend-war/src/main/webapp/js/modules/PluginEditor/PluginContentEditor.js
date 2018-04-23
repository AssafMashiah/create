define(['BaseContentEditor', 'events', 'repo', 'pluginModel', './PluginContentStageView', "pluginMenuModel", "./PluginEditorView",
    "pluginSpinnerModel", "pluginDialogModel", 'pluginEventsModel', "pluginRenderTemplateModel", "pluginExternalApiModel", "pluginRecordModel",
    "pluginHiddenModel", "pluginValidationModel", "pluginGeneral", "StandardsList", "standardsModel", "teacherGuideComponentView"],
    function (BaseContentEditor, events, repo, PluginModel, PlugintContentStageView, PluginMenuModel, PluginEditorView,
              PluginSpinnerModel, PluginDialogModel, PluginEventsModel, PluginRenderTemplateModel, PluginExternalApiModel, PluginRecordModel,
              PluginHiddenModel, PluginValidationModel, PluginGeneral, StandardsList, standardsModel, teacherGuideComponentView) {

        var PluginContentEditor = BaseContentEditor.extend({

            initialize: function (configOverrides) {
                this._super({
                    menuItems: [],
                    menuInitFocusId: 'menu-button-course',
                    childrenTypesToExcludeFromShowInStage: 'pluginHidden,help'
                }, configOverrides);


                //on menu initialize throw event to the plugin code
                events.bind('end_load_of_menu', this.onMenuInitialize, this);

                this.instanceId = this.record.id;

                //get plugin instance from plugin model
                this.pluginClassManagerInstance = PluginModel.getPluginByPath(this.record.data.path);

                this.config = _.extend(this.config, this.pluginClassManagerInstance.getManifestConfig());

                this.pluginClassManagerInstance.setPrototype(this.instanceId);

                //register the model api
                this.pluginClassManagerInstance.registerApi(this.instanceId, 'CGS.model', new PluginRecordModel(this.record));
                //register the busyIndicator API
                this.pluginClassManagerInstance.registerApi(this.instanceId, 'CGS.spinner', PluginSpinnerModel);
                //register the dialogs API
                this.pluginClassManagerInstance.registerApi(this.instanceId, 'CGS.dialogs', PluginDialogModel);
                //register the events API
                this.pluginClassManagerInstance.registerApi(this.instanceId, 'CGS.events', new PluginEventsModel(this.pluginClassManagerInstance.getPluginEventsContextPrefix()));
                this.pluginClassManagerInstance.registerApi(this.instanceId, 'CGS.RenderTemplate', new PluginRenderTemplateModel(this.pluginClassManagerInstance.translation));
                //register the menu API
                this.pluginClassManagerInstance.registerApi(this.instanceId, 'CGS.menu', new PluginMenuModel(this.pluginClassManagerInstance));
                this.pluginClassManagerInstance.registerApi(this.instanceId, 'CGS.externalApi', new PluginExternalApiModel(this.record));
                this.pluginClassManagerInstance.registerApi(this.instanceId, 'CGS.hidden', new PluginHiddenModel(this.record.id));
                //register the validation API
                this.pluginClassManagerInstance.registerApi(this.instanceId, 'CGS.validation', PluginValidationModel);

                this.pluginClassManagerInstance.registerApi(this.instanceId, 'CGS.general', PluginGeneral);

                this.pluginClassManagerInstance.start(this.instanceId);

                this.stage_view = new PlugintContentStageView({controller: this, template: this.pluginClassManagerInstance.invoke(this.instanceId, 'getContentStageView') });

                this.showStagePreview($('#stage_base'), {bindTaskEvents: true, bindEvents: false, stagePreviewMode: 'small'});

                this.pluginClassManagerInstance.invoke(this.instanceId, 'onInitialize', {
                    state: this.config.previewMode ? 'preview' : 'edit'
                });

                var template = this.pluginClassManagerInstance.invoke(this.instanceId, 'getPropertiesView');

                if (template && template.length) {
                    this.view = new PluginEditorView({
                        controller: this,
                        template: template
                    });

                    this.pluginClassManagerInstance.invoke(this.instanceId, "onPropertiesViewLoad", [this.view.$el]);
                }

                this.registerEvents();
                this.bindFormEvents();

                if (this.view) {
                    if (this.view.$('#standards_list').length && this.enableStandards) {
                        this.standardsList = new StandardsList({
                            itemId: '#standards_list',
                            repoId: this.record.id,
                            getStandardsFunc: standardsModel.getStandards.bind(standardsModel, this.record.id)
                        });
                    }

                    if (this.view.$('.teacherGuide-placeholder').length) {
                        this.teacherGuideComponent = new teacherGuideComponentView({
                            el: '.teacherGuide-placeholder',
                            data: this.model.get('teacherGuide'),
                            title: 'teacherGuide',
                            column_name: 'teacherGuide',
                            update_model_callback: this.model.set.bind(this.model, 'teacherGuide')
                        });
                    }
                }
            },
            bindFormEvents: function () {
                var changes = {
                    title: this.propagateChanges(this.record, 'title', require("validate").requiredField, true),
                    teacherGuide: this.propagateChanges(this.record, 'teacherGuide', true),
                };

                if (this.screen && this.screen.components && this.screen.components.props) {
                    this.model = this.screen.components.props.startEditing(this.record, changes);
                }
            },
            deleteItemById: function f1044(id) {
                this.deleteItem(id);
            },

            registerEvents: function () {
                this.bindEvents(
                    {
                        'menu_lesson_item_delete': {'type': 'register', 'func': function () {
                            events.fire('delete_lesson_item', this.config.id);
                        }, 'ctx': this, 'unbind': 'dispose'},
                        'deleteItem': {'type': 'register', 'func': function f1024(id) {
                            this.deleteItemById.call(this, id);
                        }, 'ctx': this, 'unbind': 'dispose'},
                        'new_lesson_item': {'type': 'register', 'func': function f1009(args) {

                                //set parent of new created item to be the parent of current element 
                                var parentId = this.record.parent;

                                //in case we want to create a "Lo" item , his parent needs to bee the lesson element
                                if (args.type == "lo") {
                                    var lessonParentRecord = repo.getAncestorRecordByType(this.record.id, "lesson");
                                    parentId = lessonParentRecord.id;
                                }
                                var itemConfig = _.extend({parentId: parentId}, args);

                                events.fire('createLessonItem', itemConfig);
                            }, 'ctx': this, 'unbind': 'dispose'}

                    });
            },

            onMenuInitialize: function () {
                this.pluginClassManagerInstance.invoke(this.instanceId, 'onMenuInitialize');
            },


            startEditing: function () {
                this._super.apply(this, arguments);

                this.pluginClassManagerInstance.invoke(this.instanceId, 'onStartEdit');
            },

            endEditing: function () {
                this._super.apply(this, arguments);

                this.pluginClassManagerInstance.invoke(this.instanceId, 'onEndEdit');
            },

            dispose: function () {
                this.teacherGuideComponent && this.teacherGuideComponent.dispose();
                this.standardsList && this.standardsList.dispose();

                events.unbind('end_load_of_menu', this.onMenuInitialize, this);

                this._super.apply(this, arguments);

                delete this.teacherGuideComponent;
                delete this.standardsList;

                this.pluginClassManagerInstance.invoke(this.instanceId, 'onDispose');

            }


        }, {
            type: 'PluginContentEditor'
        });

        return PluginContentEditor;
    });