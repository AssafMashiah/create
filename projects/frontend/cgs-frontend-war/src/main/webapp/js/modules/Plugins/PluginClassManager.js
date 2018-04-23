define(['Class', 'lodash', 'jquery', 'configModel', 'pluginGeneral',
    'pluginConstants', 'pluginRepoTemplateConverter'],
    function(Class, _, jquery, configModel, pluginGeneral,
        PluginConstants, PluginRepoTemlpateConverter) {
    var Plugin = Class.extend({
        initialize: function (data, model) {
            //the data recived on loading
            this.pluginData = data.plugin;
            this.bundleData = data.bundle;
            //instances of this plugin
            this.instances = {};
            //prototypes hash map
            this.prototypes = {};
            this.errorCallback = data.errorCallback;
        },
        getManifestConfig: function () {
            return this.manifest.config;
        },
        getFilePath: function(folder, filename) {
            var relPath  = folder ? (folder+"/" +filename) : filename;
            return [require("pluginModel").getBundlesPath(),this.bundleData.id,this.bundleData.version,  relPath].join('/');
        },
        onDataToTasksModelRecieved: function (dataToTasksMethod) {
            this.dataToTaskModel = dataToTasksMethod;
        },
        onDataToPlayerRecieved: function (dataToPlayerMethod) {
            this.dataToPlayerModel = dataToPlayerMethod;
        },
        invokeModelToTasks: function (repoId) {
            var data = require("repo").getSubtreeRecursive(repoId);

            if (!data || !data.length) return [];

            return this.dataToTaskModel(data);
        },
        invokeDataToPlayerConversion: function (data) {
            var helper = {};
            helper.sequenceDataConverter =
            /*
            seqData: {
                settings: {
                    title: ...,
                    type: basic or shared,
                    exposure: ...,
                    sharedBefore: true/false
                },
                helpItems: [{ id: help item id, item: help item caption}, ...],
                sharedArea: shared area id,
                tasks: [tasks ids...]
            }
            */
            function sequenceDataConverter(seqData) {
                var data = {},
                    repo = require("repo");

                var sequence = {
                    id: repo.genId(),
                    parent: null,
                    children: _.union(seqData.tasks, _.pluck(seqData.helpItems, 'id'), (seqData.settings.type == 'shared' && seqData.sharedArea) ? [seqData.sharedArea] : []),
                    data: {
                        help: seqData.helpItems,
                        title: seqData.settings.title,
                        exposure: seqData.settings.exposure,
                        type: seqData.settings.type,
                        sharedBefore: seqData.settings.sharedBefore
                    },
                    type: 'sequence'
                };

                _.each(seqData.tasks, function(taskId) {
                    repo.filterDataById(data, taskId);
                    data[taskId].parent = sequence.id;
                })

                _.each(seqData.helpItems, function(help) {
                    repo.filterDataById(data, help.id);
                    data[help.id].parent = sequence.id;
                });

                if (seqData.settings.type == 'shared' && seqData.sharedArea) {
                    repo.filterDataById(data, seqData.sharedArea);
                    data[seqData.sharedArea].parent = sequence.id;
                }

                data[sequence.id] = sequence;

                var convertedData = require('json2xml').getXML(data, sequence.id);

                if (!convertedData.hasError) {
                    return convertedData.xml_data;
                }
            };
            helper.taskInformation = pluginGeneral.getTaskInformation;

            return this.dataToPlayerModel(data, helper);
        },
        //get the manifest from the plugin root directory
        getManifest: function (success, error) {
            //check that callbacks is pass correctly
            if (!success || !_.isFunction(success)) return false;
            if (!error || !_.isFunction(error)) return false;
            var self = this;

            return $.when($.getJSON(this.getFilePath(this.pluginData.folder, PluginConstants.manifestFileName))).
                done(success).
                fail(function(e){
                    console.error("error in loading manifest file : "+self.pluginData.folder+" - " +PluginConstants.manifestFileName);
                    error(e);
                });
        },
        onEntryPointLoaded: function (success) {
            var self = this;
            //if plugin has repo template we need to make some adjustments to the template content
            if (this.manifest.structureFile) {
                //get file will return the template content
                this.getFile(this.manifest.structureFile, this.onRepoTemplateLoad.bind(this, success),
                    function(error){
                     console.error("error on repo template load : "+ self.manifest.name +" - " +self.manifest.structureFile);
                     self.errorCallback(error);
                });
            } else {
                this.loadPluginResources(function (translations) {
                    require("pluginModel").installMenu(this.manifest, null, translations, function () {
                        success && success();
                    }.bind(this));
                }.bind(this));
            }

        },
        loadPluginEntryPoint: function (success) {
            var req = require("pluginModel").bundlesPathData[this.bundleData.id].require;
            var self = this;

            req([this.manifest.main], function (PluginController) {
                this.plugin = PluginController;
                success();
            }.bind(this),
            function(){
                console.log("error loading file: " + self.manifest.main);  
            });
        },
        //install the current plugin to system
        install: function (onPluginInstallCompleted, onPluginInstallError) {
            var req = require("pluginModel").bundlesPathData[this.bundleData.id].require;
            this.getManifest(function (manifest) {
                this.setManifest(manifest);
                this.setName(this.manifest.name);

                if (this.manifest.dataToTasksFile) {
                    req([this.manifest.dataToTasksFile], function (dataToTasksMethod) {
                        this.onDataToTasksModelRecieved(dataToTasksMethod);

                        //load data to player conversion

                        if (this.manifest.dataToPlayerFile) {
                            req([this.manifest.dataToPlayerFile], function (dataToPlayerMethod) {
                                this.onDataToPlayerRecieved(dataToPlayerMethod);

                                this.loadPluginEntryPoint(this.onEntryPointLoaded.bind(this, onPluginInstallCompleted));
                            }.bind(this))
                        } else {
                            this.loadPluginEntryPoint(this.onEntryPointLoaded.bind(this, onPluginInstallCompleted));
                        }

                    }.bind(this));
                } else if (this.manifest.dataToPlayerFile) {
                    req([this.manifest.dataToPlayerFile], function (dataToPlayerMethod) {
                        this.onDataToPlayerRecieved(dataToPlayerMethod);

                        this.loadPluginEntryPoint(this.onEntryPointLoaded.bind(this, onPluginInstallCompleted));
                    }.bind(this))
                } else {
                    this.loadPluginEntryPoint(this.onEntryPointLoaded.bind(this, onPluginInstallCompleted));
                }
            }.bind(this), onPluginInstallError)

        },
        //on repo task template load - bind the plugin install callback,
        //parse the plugin template content and install is to the system
        onRepoTemplateLoad: function (onPluginInstallCompleted, repoTaskTemplate) {

            var templatesCount = _.size(repoTaskTemplate);
            if (!templatesCount) {
                this.loadPluginResources(function (translations) {
                    onPluginInstallCompleted();
                }.bind(this));
                return;
            }
            for(var repoTemplateId in repoTaskTemplate){
                (function(repoTemplateId){
                    var repoTemplate = repoTaskTemplate[repoTemplateId];
                    repoTemplate[0].type = "plugin:" + this.manifest.name;

                    new PluginRepoTemlpateConverter(this.errorCallback).get(repoTemplate, function (taskTemplate) {
                        this.loadPluginResources(function (translations) {
                            //trigger the callback only after finishing looping over all the repo templates
                            function installMenuCallback(){
                                templatesCount--;
                                if(!templatesCount){
                                    onPluginInstallCompleted();
                                }
                            }
                            require("pluginModel").installMenu(this.manifest, {"template":taskTemplate, "templateId": repoTemplateId}, translations, installMenuCallback);
                        }.bind(this));
                    }.bind(this));
                }.bind(this))(repoTemplateId);

            }

        },

        //get file from the root directory
        getFile: function (templateFileName, success, error) {
            return $.when($.getJSON(this.getFilePath(null, templateFileName))).
                done(success).
                fail(error);
        },
        getLocalManifest: function () {
            return this.manifest;
        },
        loadPluginResources: function (onResourcesLoad) {
            if (this.manifest.resources) {

                //get translation json file
                if (this.manifest.resources.translations && !this.translation) {
                    this.getTanslationFileByLocale(function (translationData) {
                        this.translation = translationData;

                        onResourcesLoad && onResourcesLoad(this.translation);
                    }.bind(this));
                } else {
                    onResourcesLoad && onResourcesLoad();
                }
            } else {
                onResourcesLoad && onResourcesLoad();
            }
        },
        invoke: function (instanceId, methodName, args) {
            //if we dont have instance exsits || no method inside the instance, something goes wrong
            if (!this.instances[instanceId] || !this.instances[instanceId][methodName]) {
                return;
            }

            return this.instances[instanceId][methodName].apply(this.instances[instanceId], _.isArray(args) ? args : [args]);
        },
        //initialize the code prototype for multiple extend
        setPrototype: function (instanceId) {
            //delete the prototype if already exists
            if (this.prototypes[instanceId]) {
                delete this.prototypes[instanceId];
            }
            //clone new object and set the source code to be the prototype
            this.prototypes[instanceId] = function () {
            };
            this.prototypes[instanceId].prototype = new (this.plugin);
        },
        //register api namespace to the plugin, support dot namespacing (CGS.model...)
        registerApi: function (instanceId, property, value) {
            //if prototype is not exists throws error
            if (!this.prototypes[instanceId].prototype) {
                throw new TypeError('Error register api, plugin is already instantiated');
            }

            //check if the name of the property is namespace
            if (~property.indexOf(".")) {
                var props = property.split(".");
                var last = props.splice(props.length - 1, 1)[0];
                var root = this.prototypes[instanceId].prototype;


                _.each(props, function (v) {
                    !root[v] && (root[v] = {});

                    root = root[v];
                });

                root[last] = value;
            } else {
                this.prototypes[instanceId].prototype[property] = value;
            }

        },
        //make new instance of the plugin
        start: function (instanceId) {
            this.instances[instanceId] = new (this.prototypes[instanceId]);
        },
        //return the instance (used in externalApi support)
        getInstance: function (instanceId) {
            return this.instances[instanceId];
        },
        //validate the manifest data
        validate: function (manifest) {
            var validator = {
                response: true,
                message: []
            };

            if (!manifest || !_.isObject(manifest)) {
                validator.response = false;
                validator.push("Manifest is undefined");
            }

            return validator;
        },
        getTanslationFileByLocale: function (callback) {
            //if cached translation exists apply it to the callback
            if (this.translation) {
                callback(this.translation);
            } else {
                //get from user model the system locale
                var currentLocale = require('userModel').account.interfaceLocales.selected.toLowerCase();
                //check if manifest contain translation to the system locale  or if default translation exists
                if (this.manifest && this.manifest.resources && this.manifest.resources.translations &&
                    (this.manifest.resources.translations[currentLocale] || this.manifest.resources.translations.default)) {
                    //set the translation locale to variable
                    var translationFileName =
                        this.manifest.resources.translations[currentLocale] ||
                            this.manifest.resources.translations.default;

                    this.getFile(translationFileName, this.onTranslationFileLoad.bind(this, callback), this.onTranslationFileLoadError.bind(this));
                }
                else {
                    callback(false);
                }
            }
        },
        onTranslationFileLoad: function (callback, file) {
            this.translation = file;

            callback(file);
        },
        onTranslationFileLoadError: function (e) {
            /**
             * @TODO - handling error in translation file load
             **/
             console.error("error on loading translation file");
             this.errorCallback(e);
        },
        setManifest: function (manifest, success) {

            var validator = this.validate(manifest);

            if (!validator.response) {
                throw new TypeError("Plugin - Manifest Error:" + validator.message.join("\n"));
                return;
            }
            manifest.name = this.bundleData.id + ":" + manifest.name;

            this.manifest = manifest;
        },
        getName: function () {
            return this.pluginData.name;
        },
        setName: function (name) {
            this.pluginData.name = name;
        },
        setId: function (id) {
            this.pluginData.id = id;
        },
        getId: function () {
            return this.pluginData.id;
        },
        getPluginEventsContextPrefix: function () {
            return this.pluginData.name.replace(/:/g,"_") + "_";
        }
    });

    return Plugin;
});