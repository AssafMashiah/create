define(['Class', 'lodash', 'jquery', 'pluginConstants', 'pluginsCollection',
    'pluginClassManager'], function (Class, _, $, PluginConstants, PluginsCollection, PluginClassManager) {

    /**
     *@async - return the plugin parent type menu config
     *@type - the parent type is relative to the path convention {{modules/{{type}/config}}}
     *@callback -  recieve the data after require load the file
     **/
    function getMenuConfigByPluginManifestParentType(manifest, repoTaskTemplate, translations, onMenuConfigRecieved) {
        //if no parent button config exists keep the loading of plugin
        if( !manifest.parentButtonConfig || !manifest.parentButtonConfig.length){
            return onMenuConfigRecieved && onMenuConfigRecieved();
        }
        var parentButtonsSize = manifest.parentButtonConfig.length;

        for (var i = 0; i < manifest.parentButtonConfig.length; i++) {
            (function(parentButton){
                //if no parentEditorType exists keep the loading of plugin
                if ((!parentButton.parentEditorType)||
                    //if the repo template recieved dont match the current button temaplte, countinue.
                    (repoTaskTemplate &&  parentButton.templateId && parentButton.templateId !== repoTaskTemplate.templateId)) {
                    parentButtonsSize --;
                    if(!parentButtonsSize){
                        return onMenuConfigRecieved && onMenuConfigRecieved();
                    }
                }else{

                    //parent editor config path
                    var path = "modules/" + parentButton.parentEditorType + "/config";

                    require([path], function (config) {
                        //append the plugin menu to config
                        //@sync method
                        appendPluginMenuConfigToParentConfiguration(config, parentButton, manifest, (repoTaskTemplate && repoTaskTemplate.template), translations);

                        parentButtonsSize--;
                        if(!parentButtonsSize){
                            onMenuConfigRecieved && onMenuConfigRecieved();
                        }
                    }.bind(this));
                }

            }(manifest.parentButtonConfig[i]));
        }
    }

    //this method return the current menu level + the event that we should fire on clicking the plugin
    function getMenuDataByManifestParentType(parent_type_editor, config) {
        var menu;
        var ret = {
            menu: null,
            event: null
        };

        switch (parent_type_editor) {
            //in lesson screen we use the new_lesson_item event
            case 'LessonScreen':
                //search inside the screen components the root level
                ret.menu = _.find(config.components.menu.config.menuItems, function (item) {
                    return item.id === "menu-button-course"
                });
                //assign the correct event name to the return obj
                ret.event = 'new_lesson_item';
                break;
            case 'SequenceEditor':
                ret.menu = config.menuItems[0];

                ret.event = 'createNewItem';
                break;
            default:
                ret = null;
                break;

        }

        return ret;
    };

    function getPluginName(name) {
        var parts = name.split(":");

        return parts[parts.length - 1];
    }

    function trans(text, translations) {
        var ret = null;

        _.each(translations, function (val, key) {
            if ('((' + key + '))' === text) ret = val;
        })

        return ret || text;
    }

    //appendPluginMenuToParentMenuConfiguration
    function appendPluginMenuConfigToParentConfiguration(config, item, manifest, repoTaskTemplate, translations) {
        var extendedConfig = config.get();
        var menuData = getMenuDataByManifestParentType(item.parentEditorType, extendedConfig);
        var uuid = require("repo").genId();

        if (!menuData) return;

        if (!item.menuGroupTitle) {
            throw new TypeError("No group properties defined to parentButtonConfig in " + manifest.name);
        }

        var pluginMenuGroupId = item.menuGroupTitle.replace(" ", "-").toLowerCase();

        var pluginsMenuGroup = _.find(menuData.menu.subMenuItems, { id: pluginMenuGroupId });

        //add group to menu, if not exists
        if(!pluginsMenuGroup){
            var group = {
                "id": pluginMenuGroupId,
                "label": "",
                "type": 'btn_split',
                "icon": "",
                "canBeDisabled" :true,
                "subMenuItems": [
                    {
                        'id': 'menu-button-'+pluginMenuGroupId,
                        'label': item.menuGroupTitle,
                        "canBeDisabled": true,
                        'dropDownItems': []
                    }
                ]
            };

            menuData.menu.subMenuItems.push(group);
            config.set(extendedConfig);
        }

        var menuGroupElement = _.find(menuData.menu.subMenuItems, {"id":pluginMenuGroupId});

        var pluginType = manifest.pluginType === 'task' ? PluginConstants.TASK_TYPE : PluginConstants.CONTENT_TYPE;

        item.id = item.id+ "_" + uuid;
        item.canBeDisabled = true;

        item.label = trans(item.label, translations);

        //this switch case use to build the menu item structure
        switch (PluginConstants.editorTypes[manifest.pluginType]) {
            case 'LessonScreen':
                item = _.extend(item, {
                    "isSequencePlugin": true,
                    "args": {
                        "type": pluginType.replace("sys:", ""),
                        "data": {
                            "uuid": uuid,
                            "title": item.label
                        }
                    }
                });

                if (repoTaskTemplate && item.templateId) {
                    repoTaskTemplate[0].data = _.extend(repoTaskTemplate[0].data, {
                        "uuid": uuid,
                        "title": item.label
                    });

                    item.args = _.extend(item.args, {
                        "template": JSON.stringify(repoTaskTemplate),
                        "templatePath": 'auto'
                    });
                }
                break;
            case 'SequenceEditor':
                item = _.extend(item, {
                    "isTaskPlugin": true,
                    "args": {
                        "template": JSON.stringify(repoTaskTemplate),
                        "templatePath": 'auto',
                        "dataConfig": getTaskDataConfig({
                            "uuid": uuid
                        }),
                        "type": pluginType.replace("sys:", "")
                    }
                });
                break;
        }

        var innerButtonParent ;
        switch(item.buttonType){
            //drop down parent container
            case 'dropdown':
                item.type = 'btn_dropdown';
                item.dropDownItems = [];
                menuGroupElement.subMenuItems[0].dropDownItems.splice((item.menuGroupIndex || 0), 0, item);
                menuGroupElement.subMenuItems[0].type = "btn_split";
            break;
            //drop do
            case 'dropdownElement':
                item.event =  menuData.event;
                var dropdownContainer =  _.find(menuGroupElement.subMenuItems[0].dropDownItems, {"dropdownId":item.containerID});
                if(dropdownContainer){
                    dropdownContainer.dropDownItems.push(item);
                    dropdownContainer.dropDownItems = _.sortBy(dropdownContainer.dropDownItems, function(elem){
                        return elem.label.toLowerCase();
                    });
                }
            break;
            default:
                item.event =  menuData.event;
                menuGroupElement.subMenuItems[0].dropDownItems.splice((item.menuGroupIndex || 0), 0, item);
            break;
        }
    }

    function getTaskDataConfig(data) {
        return [
            {
                idx: 0,
                data: data
            }
        ];
    }

    function loadScripts(bundleData, callback){

        var entryPoints = bundleData.entryPoints;
        var cssFilesPaths = bundleData.resources && bundleData.resources.css;

        var bundleInformation = this.bundlesPathData[bundleData.id];
        //load css files
        _.each(cssFilesPaths, function(path){

            $("<link />").attr({
                'href': bundleInformation.bastPath+ "/" + path,
                'type': "text/css",
                "rel": "stylesheet",
                "media": "all"
            }).appendTo("head");

        });

        //load plugin entry points
        var localRequire = bundleInformation.require;
        var i = 0;
        (function loadScript(index){

            if(index >= entryPoints.length || !entryPoints[index]  || !localRequire){
                callback();
            }
            else{
                var path = entryPoints[index];

                localRequire(["require", path], function(require, y){

                    i++;
                    loadScript(i);
                });

                /*var req = new XMLHttpRequest();

                req.onload = function(){

                    var blob = new Blob( [ req.responseText ] , { type : "text/javascript" } );

                    var url = URL.createObjectURL( blob );

                    var script = document.createElement( "script" );
                    script.src = url;
                    script.type = "text/javascript";
                    script.onload = function(){
                        i++;
                        //console.log(y);
                        loadScript(i);

                        //loadingProcess.setText( "Loading scripts..." );
                        //var size = Math.round( ++loadingProcess.loadedFilesCounter / loadingProcess.totalLoadingFiles * 99 );
                        //loadingProcess.setPercentage( size );

                    };
                    document.body.appendChild( script );

                };

                req.open( "GET" , bundleInformation.bastPath +"/" +path + ".js" , true );

                req.send();*/
            }
        })(i);

    }


    var PluginModel = Class.extend({

        initialize: function () {
            this.plugins = new PluginsCollection();
        },

        onBundleManifestRecieved: function (success, bundles) {
            if (!bundles || !bundles.length) {
                success();
            } else {
                this.installBundles(bundles, success);
            }
        },

        //if reading from plugins.json failed this method will be execute
        onBundleManifestFailed: function (pluginsManifestError, error) {
            /**
             * @TODO: Manage the error handling on manifest/plugin install error
             */
        },

        installBundles: function (bundles, onBundlesInstallComplete, index) {
            index = index || 0;

            if (!bundles[index]) {
                return onBundlesInstallComplete && onBundlesInstallComplete();
            }

            var bundle = bundles[index];

            this.initBundleData(bundle);

            var self = this;


            loadScripts.call(this, bundle, function(){

                self.installPluginsSync(bundle, bundle.plugins, function () {
                    self.installBundles(bundles, onBundlesInstallComplete, ++index);
                });
            });

        },

        /**
         * install plugins in sync mode
         * @param list - the list of the plugin
         * @callback onCompleteInstall - when the all the plugins are installed,
         * @param {Integer} currentIndex - every single plugin install increase the currentIndex
         **/
        installPluginsSync: function (bundle, list, onCompleteInstall, currentIndex) {
            //if the last index is not exists on the list, done load plugins

            currentIndex = currentIndex || 0;

            if (!list[currentIndex]) {
                return onCompleteInstall && onCompleteInstall();
            }

            var onPluginInstallFailed = function (error) {
                /**
                 * Manage the error handling on template/manifest/plugin install error
                 */
                 console.error(error.responseText);
            };
            //make instance of PluginClassManager with the current plugin data and plugin model context
            var pluginClassManager = new PluginClassManager({
                bundle: bundle,
                plugin: list[currentIndex],
                errorCallback : onPluginInstallFailed
            }, this);

            //define private method that call this method each plugin and add it to the plugins collection
            var onPluginInstallCompleted = function () {
                this.plugins.add(pluginClassManager);
                this.installPluginsSync(bundle, list, onCompleteInstall, ++currentIndex);
            };


            return pluginClassManager.install(
                onPluginInstallCompleted.bind(this),
                onPluginInstallFailed.bind(this));
        },

        /**
         * @method installMenu - install plugin menu by parent editor type
         * @param {Object} manifest - use to get the parent type editor
         * @param {Object} repoTaskTemplate - when adding the menu button to the parent editor, there is a taskTemplate param, for initialize the structure of the plugin.
         * @callback onMenuInstallCompleted - loading the menu config use async request, need to keep the install flow step by step.
         **/
        installMenu: function (manifest, repoTaskTemplate, translations, onMenuInstallCompleted) {
            //return the menu configuration, this is return the default menu structure that exists in every editor
            getMenuConfigByPluginManifestParentType(manifest, repoTaskTemplate, translations, onMenuInstallCompleted && onMenuInstallCompleted.bind(this));
        },

        //load plugins from the plugins.json manifest - use inside the main.js file, this function is wrapped for internal methods using
        loadPlugins: function (success) {

            return this.getAllPluginsManifest(
                this.onBundleManifestRecieved.bind(this, success),
                this.onBundleManifestFailed.bind(this, success));
        },

        getPluginType: function (name) {
            var plugin = this.getPluginByPath(name);

            return PluginConstants.internalEditorTypes[plugin.getLocalManifest().pluginType || "content"];
        },

        getPluginByPath: function (path) {
            var p = this.plugins.getByName(path);

            if (!p) {
                require("busyIndicator").stop(true);

                return require('cgsUtil').createDialog("Error loading plugins",
                    "Plugin " + path + " is missing",
                    "simple", {
                        "refresh": {
                            "label": "Refresh"
                        }
                    }, function () {
                        window.location.reload();
                    });
            }

            return p;
        },

        /**
         * read plugins from GET_BUNDLES api
         * @param cb - callback to pass the data from file
         * @param cb.data - the data structure that pass to the callback { url: "plugin relative path" }
         **/
        getAllPluginsManifest: function (success, error) {
            //check that callbacks is pass correctly
            if (!success || !_.isFunction(success)) return false;
            if (!error || !_.isFunction(error)) return false;

            var daoConfig = {
                path: require('restDictionary').paths.GET_BUNDLES,
                pathParams: {
                    publisherId: require('userModel').getPublisherId()
                }
            };

            require('dao').remote(daoConfig, success.bind(this), error.bind(this));
        },

        getBundlesPath: function() {
            return [require('configModel').configuration.basePath, 'publishers', require('userModel').account.accountId, PluginConstants.BASE_PLUGINS_PATH].join('/');
        },

        //init the bundle data- its relative require configuration+ base path
        initBundleData : function(bundle){
            if(!this.bundlesPathData){
                this.bundlesPathData = {};
            }
            if(!this.bundlesPathData[bundle.id]){
                this.bundlesPathData[bundle.id] = {};
            }

            this.bundlesPathData[bundle.id].bastPath = [this.getBundlesPath(), bundle.id, bundle.version].join("/");

            this.bundlesPathData[bundle.id].require = require.config({
                "context": "pluginsRequire_"+bundle.id,
                "baseUrl": this.getBundlesFullPath(bundle.id),
                "paths" :{
                    "text": "/cgs/client/js/libs/require/text"
                },
                "config":{
                    "text": {
                        useXhr: function(url, protocol, hostname, port){
                            return true;
                        }
                    }
                }
            });
        },

        getBundlesFullPath: function(bundleId){
            if(this.bundlesPathData && this.bundlesPathData[bundleId]){
                return this.bundlesPathData[bundleId].bastPath;
            }
            return null;
        },

        setRecordDefaults: function(dataRecord) {
            var plugin = this.getPluginByPath(dataRecord.data.path);
            _.merge(dataRecord.data, plugin && plugin.manifest && plugin.manifest.viewConfig);
        }
    });

    return new PluginModel;
});