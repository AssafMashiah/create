define(['BaseContentEditor', 'events', 'pluginModel', 'repo', 'types', "repo_controllers",
    './PluginExternalNormalStageView', './PluginExternalSmallStageView', "pluginMenuModel",
    "./PluginEditorView", "pluginSpinnerModel", "pluginDialogModel", "pluginEventsModel",
    "pluginRenderTemplateModel", "pluginExternalApiModel", "pluginRecordModel",
    "pluginHiddenModel", "pluginValidationModel", "pluginGeneral"],
    function (BaseContentEditor, events, PluginModel, repo, types, repo_controllers, PluginExternalNormalStageView,
              PluginExternalSmallStageView, PluginMenuModel, PluginEditorView, PluginSpinnerModel,
              PluginDialogModel, PluginEventsModel, PluginRenderTemplateModel, PluginExternalApiModel, PluginRecordModel,
              PluginHiddenModel, PluginValidationModel, PluginGeneral) {

        var PluginExternalEditor = BaseContentEditor.extend({

            initialize: function (configOverrides) {
                this.setStageViews({
                    small: PluginExternalSmallStageView,
                    normal: PluginExternalNormalStageView
                });

                this._super({
                    menuItems: [],
                    menuInitFocusId: 'menu-button-task',
                    childrenTypesToExcludeFromShowInStage: 'pluginHidden,help'
                }, configOverrides);
                this.elementType = this.record.data.name;
                this.instanceId = this.record.id;

                //on menu initialize throw event to the plugin code
                events.bind('end_load_of_menu', this.onMenuInitialize, this);
                events.bind('openSubMenu', this.onSubMenuOpen, this);
                events.register('contentEditorDeleted', this.childDeleted, this);
                events.register('childEndEditing', this.childEndEditing,this);
                events.register('childStartEditing', this.childStartEditing,this);
                events.register('appletCustomData', this.appletCustomData,this);

                //get plugin class from plugin model
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
                        if(options.renderItemId){
                            var record = repo.get(options.renderItemId);
                            
                            var itemConfig = {
                                "id" : options.renderItemId, 
                                "bindEvents":true, 
                                "children": record.children,
                                "screen": this.config.screen,
                                "previewMode": true
                            };
                            
                            var elementType = record.type;
                            var elementEditorType = types[elementType].editor;
                            var itemController = require('router').loadModule(elementEditorType, itemConfig, false, types[elementType].prefix || null, types[elementType].loadOptions);
                            var parent = repo.get(record.parent);
                            var parentContainer = $('[data-elementid=' + record.parent + '] .'+parent.data.name + "_content");
                            if( itemController && itemController.stage_view){

                                itemController.stage_view.showStagePreview(parentContainer, itemConfig);

                                var parentType= repo.get(record.parent).type;
                                var parentEditorType = types[parentType].editor;
                                var parentController = repo_controllers.get(record.parent);
                                if(parentController && parentController.stage_view && parentController.stage_view.sortChildren){
                                    parentController.stage_view.sortChildren(parentContainer);
                                }
                            }

                           // var parentController = require('router').loadModule(parentEditorType, itemConfig, false, types[elementType].prefix || null, types[elementType].loadOptions);
                            
                        }else{
                            this.renderChildren({ childrenToRender: options.childrenToRender });

                            if (!options.disableStartPropsEditing) {
                                this.startPropsEditing();
                            }
                            else if (screen && screen.editor && screen.editor.startPropsEditing) {
                                screen.editor.startPropsEditing();
                            }
                        }
                    }.bind(this));

                    this.pluginClassManagerInstance.registerApi(this.instanceId, 'CGS.startEditing', this.startEditingById.bind(this));

                    this.pluginClassManagerInstance.start(this.instanceId);
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

            onSubMenuOpen: function() {
                this.pluginClassManagerInstance.invoke(this.instanceId, 'onSubMenuOpen');
            },

            startPropsEditing: function () {
                this._super();

                var template = this.pluginClassManagerInstance.invoke(this.instanceId, 'getPropertiesView');

                this.view = new PluginEditorView({
                    controller: this,
                    template: template || ""
                });

                this.pluginClassManagerInstance.invoke(this.instanceId, "onPropertiesViewLoad", [this.view.$el]);
            },

            startEditing: function () {
                this._super.apply(this, arguments);

                this.pluginClassManagerInstance.invoke(this.instanceId, 'onStartEdit');
            },

            endEditing: function () {
                this._super.apply(this, arguments);

                this.pluginClassManagerInstance.invoke(this.instanceId, 'onEndEdit');
            },
            onChildrenRenderDone: function(){
                this.pluginClassManagerInstance.invoke(this.instanceId, 'onChildrenRenderDone');
            },


            childStartEditing : function(childId){
                //invoke child start editing function on plugin, in case the start edit child is its child
                if(this.record.children.indexOf(childId) >=0){
                    this.pluginClassManagerInstance.invoke(this.instanceId, 'onChildStartEditing',[childId]);
                }

            },
            childEndEditing: function(childId){
                //invoke child end editing function on plugin, in case the end edit child is its child
                if(this.record.children.indexOf(childId) >=0 && repo.get(childId)){
                    this.pluginClassManagerInstance.invoke(this.instanceId, 'onChildEndEditing',[childId]);
                }
            },

            childDeleted: function(id, index, childId) {
                if (id == this.instanceId) {
                    this.pluginClassManagerInstance.invoke(this.instanceId, 'onChildDeleted', [childId, index]);
                }
            },
            appletCustomData: function(args){
                if(this.record.children.indexOf(args.appletWrapperId) >=0){
                    this.pluginClassManagerInstance.invoke(this.instanceId, 'onAppletCustomDataSent', [args]);
                }

            },

            dispose: function () {

                events.unbind('end_load_of_menu', this.onMenuInitialize, this);
                events.unbind('openSubMenu', this.onSubMenuOpen, this);
                events.unbind('contentEditorDeleted', this.deleted, this);
                events.unbind('childEndEditing', this.childEndEditing, this);
                events.unbind('childStartEditing', this.childStartEditing, this);
                events.unbind('appletCustomData', this.appletCustomData,this);

                this.pluginClassManagerInstance.invoke(this.instanceId, 'onDispose');

                //run super function in the end of disposing the plugin
                this._super.apply(this, arguments);
            }


        }, {
            showProperties: true,
            displayTaskDropdown: true,
            type: 'PluginExternalEditor',
            valid: function(elem_repo){

                var pluginToValidate = PluginModel.getPluginByPath(elem_repo.data.path),
                validationResponse = {
                    'valid': true,
                    'report': []
                };

                if(pluginToValidate){
                    if(pluginToValidate.instances[elem_repo.id]){

                        // run validation function if plugin has implemented the function
                        if(pluginToValidate.instances[elem_repo.id].validate){

                            var validationFunctionResponse = pluginToValidate.instances[elem_repo.id].validate();
                            //convert the validation response from the plugin, to the format used in the validation mechanism
                            validationResponse = require("validate").convertValidationMessage(
                                _.extend({"id":elem_repo.id},validationFunctionResponse));
                        }
                        //run child validation function on the element's children
                        if(pluginToValidate.instances[elem_repo.id].validateChild){
                            validationResponse.childCustomValidation = {};

                            _.each(elem_repo.children, function(childId){
                                var childValidationFunctionResponse = pluginToValidate.instances[elem_repo.id].validateChild(childId);

                                //convert the validation response from the plugin child, to the format used in the validation mechanism
                                var childValidation = require("validate").convertValidationMessage(
                                    _.extend({"id":childId},childValidationFunctionResponse));
                                //add the child validation to the validation element response
                                validationResponse.childCustomValidation[childId] = childValidation;
                            });
                        }
                    }
                }
                return validationResponse;
            }
        });

        return PluginExternalEditor;
    });