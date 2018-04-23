define(['modules/BaseTaskEditor/BaseTaskEditor', 'events', 'pluginModel',
    './PluginEditorNormalStageView', './PluginEditorSmallStageView', "pluginMenuModel",
    "./PluginEditorView", "pluginSpinnerModel", "pluginDialogModel" , "pluginEventsModel",
    "pluginRenderTemplateModel", "pluginExternalApiModel", "pluginRecordModel", "pluginHiddenModel",
    "pluginValidationModel", "pluginGeneral"],
    function (BaseTaskEditor, events, PluginModel, PluginEditorNormalStageView,
              PluginEditorSmallStageView, PluginMenuModel, PluginEditorView, PluginSpinnerModel,
              PluginDialogModel, PluginEventsModel, PluginRenderTemplateModel, PluginExternalApiModel, PluginRecordModel,
              PluginHiddenModel, PluginValidationModel, PluginGeneral) {

        var PluginHiddenEditor = BaseTaskEditor.extend({

            initialize: function (configOverrides) {
                this.setStageViews({
                    small: PluginEditorSmallStageView,
                    normal: PluginEditorNormalStageView
                });

                var rec = require('repo').get(configOverrides.id);
                if (rec && rec.data.menuTitle) {
                    configOverrides.screen.components.menu.extendedConfig[0].label = '((' + rec.data.menuTitle + '))';
                }

                this._super({
                    menuItems: [],
                    menuInitFocusId: 'menu-button-task',
                    childrenTypesToExcludeFromShowInStage: 'pluginHidden,help'
                }, configOverrides);

                this.elementName = '';
                this.elementType = this.record.data.name;
                this.instanceId = this.record.id;

                //on menu initialize throw event to the plugin code
                events.bind('end_load_of_menu', this.onMenuInitialize, this);

                //get plugin class manager from plugin model
                this.pluginClassManagerInstance = PluginModel.getPluginByPath(this.record.data.path);

                this.config = _.extend(this.config, this.pluginClassManagerInstance.getManifestConfig());

                this.pluginClassManagerInstance.setPrototype(this.instanceId);


                //register the model api
                this.pluginClassManagerInstance.registerApi(this.instanceId, 'CGS.model', new PluginRecordModel(this.record));
                this.pluginClassManagerInstance.registerApi(this.instanceId, 'CGS.spinner', PluginSpinnerModel);
                this.pluginClassManagerInstance.registerApi(this.instanceId, 'CGS.dialogs', PluginDialogModel);
                this.pluginClassManagerInstance.registerApi(this.instanceId, 'CGS.externalApi', new PluginExternalApiModel(this.record));
                this.pluginClassManagerInstance.registerApi(this.instanceId, 'CGS.events', new PluginEventsModel(this.pluginClassManagerInstance.getPluginEventsContextPrefix()));
                this.pluginClassManagerInstance.registerApi(this.instanceId, 'CGS.RenderTemplate', new PluginRenderTemplateModel(this.pluginClassManagerInstance.translation));
                this.pluginClassManagerInstance.registerApi(this.instanceId, 'CGS.hidden', new PluginHiddenModel(this.record.id)) ;
                this.pluginClassManagerInstance.registerApi(this.instanceId, 'CGS.validation', PluginValidationModel) ;
                this.pluginClassManagerInstance.registerApi(this.instanceId, 'CGS.general', PluginGeneral);

                if (!this.config.stagePreviewMode) {
                    //initialize the menu API only in preview mode
                    this.pluginClassManagerInstance.registerApi(this.instanceId, 'CGS.menu', new PluginMenuModel(this.pluginClassManagerInstance));
                    /*
                    options:
                        childrenToRender: [] - array of children to render
                        disableEndEditing: true/false - option to disable active editor end editing
                        disableStartPropsEditing: true/false - option to disable props start editing
                    */
                    this.pluginClassManagerInstance.registerApi(this.instanceId, 'CGS.render', function (options) {
                        options = options || {};
                        var screen = require('router').activeScreen;
                        if (!options.disableEndEditing && screen && screen.editor && screen.editor.endEditing) {
                            screen.editor.endEditing();
                        }
                        this.renderChildren({ childrenToRender: options.childrenToRender });

                        if (!options.disableStartPropsEditing) {
                            this.startPropsEditing();
                        }
                        else if (screen && screen.editor && screen.editor.startPropsEditing) {
                            screen.editor.startPropsEditing();
                        }
                    }.bind(this));
                    
                    this.pluginClassManagerInstance.registerApi(this.instanceId, 'CGS.startEditing', this.startEditingById.bind(this))

                    this.pluginClassManagerInstance.start(this.instanceId);

                    this.startStageEditing();
                    this.startPropsEditing();
                } else {
                    this.pluginClassManagerInstance.start(this.instanceId);
                }


                this.pluginClassManagerInstance.invoke(this.instanceId, 'onInitialize', {
                    state: !this.config.stagePreviewMode ? 'edit' : 'preview'
                });


            },
            startEditingById: function (id) {
                var controller = id ? require("repo_controllers").get(id) : this;

                if (!controller) {
                    throw new TypeError("Editor is not exists");
                    return;
                }

                controller.setSelected();
                controller.startEditing();
            },
            onMenuInitialize: function () {
                this.pluginClassManagerInstance.invoke(this.instanceId, 'onMenuInitialize');
            },

            startPropsEditing: function () {
                this._super();
                
                var template = this.pluginClassManagerInstance.invoke(this.instanceId, 'getPropertiesView');

                this.view = new PluginEditorView({
                    controller: this,
                    template: template || ''
                });

                this.pluginClassManagerInstance.invoke(this.instanceId, "onPropertiesViewLoad", [this.view.$el]);

            },

            startStageEditing: function () {
                this.showStagePreview($('#stage_base'), { bindEvents: true, bindTaskEvents: true });

            },

            startEditing: function () {
                this._super.apply(this, arguments);

                this.pluginClassManagerInstance.invoke(this.instanceId, 'onStartEdit');
            },

            endEditing: function (info) {
                this._super.apply(this, arguments);

                this.pluginClassManagerInstance.invoke(this.instanceId, 'onEndEdit');
            },

            onEditorLoad: function() {
                if (!this.nextActiveId) return;

                var controller = require('repo_controllers').get(this.nextActiveId);
                if (controller) {
                    controller.startEditing();
                    controller.setSelected();
                }
                this.nextActiveId = null;
            },

            dispose: function () {
                if (this.nextActiveId) {
                    events.once('load', this.onEditorLoad, this);
                }

                this._super.apply(this, arguments);

                events.unbind('end_load_of_menu', this.onMenuInitialize, this);

                this.pluginClassManagerInstance.invoke(this.instanceId, 'onDispose');
            }


        }, {
            showProperties: true,
            displayTaskDropdown: false,
            type: 'PluginHiddenEditor',
            valid: function(elem_repo){

                var pluginToValidate = PluginModel.getPluginByPath(elem_repo.data.path),
                validationResponse = {
                    'valid': true,
                    'report': []
                };

                if(pluginToValidate){
                    // run validation function if plugin has implemented the function 
                    if(pluginToValidate.instances[elem_repo.id] &&
                        pluginToValidate.instances[elem_repo.id].validate){

                        var validationFunctionResponse = pluginToValidate.instances[elem_repo.id].validate();
                        //convert the validation response from the plugin, to the format used in the validation mechanism
                        validationResponse = require("validate").convertValidationMessage(
                            _.extend({"id":elem_repo.id},validationFunctionResponse));
                    }

                }
                return validationResponse;
            }
        });

        return PluginHiddenEditor;
    });