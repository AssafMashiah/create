/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 02/07/14
 * Time: 15:09
 * To change this template use File | Settings | File Templates.
 */
define(['repo'], function (repo) {

    //return plugin type by path plugin:bundleName || sys:internalEditor
    function getPluginInternalType(type, callback, errorCallback) {
        var parts = type.split(":");
        var systemType = parts[0];

        if (systemType === "sys") {
            return callback && callback(parts[1]);
        } else if (systemType === "plugin") {
            var bundleName = parts[1];
            var pluginFolder = parts[2];
            var pluginName = parts[3];

            $.when($.getJSON([require('pluginModel').getBundlesFullPath(bundleName), 'plugins', pluginFolder, pluginName, 'manifest.json'].join('/'))).
            done(function (manifest) {
                callback(manifest.pluginType || "content", pluginName, bundleName + ":" + pluginFolder +":" + pluginName);
            }).fail(function(e){
                console.error("error loading manifest file: " +bundleName+ "- "+ pluginFolder +"/"+ pluginName );
                errorCallback(e);
            });
        }
    }


    function getRecordObj(config, pluginName, pluginPath, manifestType) {
        return {
            id: config.id,
            parent: config.parentId,
            children: [],
            type:  this.config.types[manifestType] || manifestType,
            data: this.config.types[manifestType] ? _.extend(config.item.data || {}, {
                name: pluginName,
                path: pluginPath
            }) : config.item.data || {}
        };
    }

    var PluginRepoTemlpateConverter = function (errorCallback) {
        //assing global index for saving the index of the children
        this.index = 1;
        this.errorCallback = errorCallback;
    }

    //parsing recursive the children of each record define on the template
    PluginRepoTemlpateConverter.prototype.setRecordChildren = function (config, success) {
        config.currentIndex = config.currentIndex || 0;

        if (!config.template || !config.template[config.currentIndex]) {
            return success && success(config.result);
        } else {
            this.parse(config, success);
        }
    }


    PluginRepoTemlpateConverter.prototype.setAliases = function (config, record) {
        _.each(this.config.aliases, function (val, key) {
            if (!_.isUndefined(config.item[key])) {
                switch (val.type) {
                    case 'boolean':
                        record[val.key] = val.reverse ? !config.item[key] : config.item[key];
                    break;
                    default:
                        record[val.key] = config.item[key];
                    break;
                }
            }

            if (config.item.data && !_.isUndefined(config.item.data[key])) {
                switch (val.type) {
                    case 'boolean':
                        record.data[val.key] = val.reverse ? !config.item.data[key] : config.item.data[key];
                    break;
                    default:
                        record.data[val.key] = config.item.data[key];
                    break;
                }
            }

            delete config.item[key]
            config.item.data && (delete config.item.data[key]);
        })

        return record;
    }

    PluginRepoTemlpateConverter.prototype.config = {
        //make some adjustment to the core configuration, replace wrong named properties with conventional properties
        aliases: {
            'deletable': {
                key: 'disableDelete',
                type: 'boolean',
                reverse: true
            }
        },
        //map the availible plugin type {{manifestType}}->{{RealCgsType}}
        types: {
            //plugin without parent
            "content": "pluginExternal",
            //task plugin
            "task": "pluginTask",
            //content plugin
            "sequence": "pluginContent"
        }
    }


    PluginRepoTemlpateConverter.prototype.parse = function (config, success) {
        //the template result to return
        config.result = config.result || [];
        //the current record parent id
        config.parentId = config.parentId || '{{parentId}}'
        //the current index while looping through the template record
        config.currentIndex = config.currentIndex || 0;

        //if no more record to convert call the success callback
        if (!config.template[config.currentIndex]) return success(config.result);

        if (config.record) {
            config.record.children.push('{{id' + ++this.index + '}}');
            config.id = '{{id' + this.index + '}}';
        }

        var recordConfig = {
            //the id structure
            id: config.id || '{{id' + this.index + '}}',
            //the current parent id
            parentId: config.parentId,
            item: config.template[config.currentIndex]
        };

        //get the record @async becuase need to get the record type by the manifest editor type

        getPluginInternalType(recordConfig.item.type, function (manifestType, pluginName, pluginPath) {
            var record = getRecordObj.call(this, recordConfig, pluginName, pluginPath, manifestType);

            record = this.setAliases(recordConfig, record);

            config.result.push(record);

            if (config.template[config.currentIndex].children && config.template[config.currentIndex].children.length) {
                this.setRecordChildren({
                    record: record,
                    result: config.result,
                    parentId: record.id,
                    template: config.template[config.currentIndex].children
               }, function () {
                    ++config.currentIndex;

                    this.parse(config, success)
               }.bind(this))
            } else {
                ++config.currentIndex;
                this.parse(config, success);
            }
        }.bind(this),
        this.errorCallback);
    }

    PluginRepoTemlpateConverter.prototype.get = function (template, success) {
        return this.parse({
            template: template
        }, success);
    }

    return PluginRepoTemlpateConverter;
})