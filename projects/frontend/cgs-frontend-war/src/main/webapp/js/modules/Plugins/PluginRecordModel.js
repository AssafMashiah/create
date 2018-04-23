/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 02/07/14
 * Time: 14:09
 * To change this template use File | Settings | File Templates.
 */
define(['repo', 'modules/TextViewerEditor/TextViewerEditor'], function (repo, TextViewerEditor) {
    var TYPES = {
        "content": "pluginExternal",
        "sequence": "pluginContent",
        "task": "pluginTask"
    };

    var aliases = {
        'deletable': {
            key: 'disableDelete',
            type: 'boolean',
            reverse: true
        }
    };

    function setPluginPath(record) {
        var parts = record.type.split(":");
        var systemType = parts[0];

        if (systemType === "sys") {
            record.type = parts[1];
        } else if (systemType === "plugin") {
            var bundleName = parts[1];
            var pluginFolder = parts[2];
            var pluginName = parts[3];

            record.data.name = pluginName;
            record.data.path = [bundleName, pluginFolder, pluginName].join(":");
            record.type = require("pluginModel").getPluginType(record.data.path);
        } else {
            throw new TypeError("Invalid type is set, must start with sys/plugin prefix");
        }
    }

    function setObjectAliases(obj) {
        _.each(aliases, function (val, key) {
            if (!_.isUndefined(obj[key])) {
                switch (val.type) {
                    case 'boolean':
                        obj[val.key] = val.reverse ? !obj[key] : obj[key];
                    break;
                    default:
                        obj[val.key] = obj[key];
                    break;
                }
            }

            delete obj[key];
        });
    }

    var PluginRecordModel = function (record) {
        if (!record || !_.isObject(record) || !repo.get(record.id)) {
            throw new TypeError("PluginRecordItem: Invalid Record passed");
        }
        this.record = record;
    };

    /**
    * description - save new item into repo
    * options - object
    *   data - {
        type: [textViewer, pluginTask],
        parentId - must be root record off plugin or sub record of plugin
        data: {}
    }
    **/

    PluginRecordModel.prototype.saveItem = function (options) {
        if (!options || !_.isObject(options) || !options.data || !_.isObject(options.data)) {
            throw new TypeError("PluginRecordModel: Invalid options pass to saveItem");
        }

        repo.startTransaction();

        //get array contains the plugin subtree ids
        var validIds = _.pluck(repo.getSubtreeRecursive(this.record.id), 'id');

        if (!options.data.parentId) {
            options.data.parentId = this.record.id;
        }

        setPluginPath(options.data);

        setObjectAliases(options.data);
        setObjectAliases(options.data.data);

        var pid,
            type = require('types')[options.data.type],
            lessonModeTypes = ['mc', 'ShortAnswer', 'FreeWriting'], // these tasks need lesson mode in 'type' property
            mode = require('lessonModel').isLessonModeAssessment() ? "lessonModeAssessment" : "lessonModeNormal";

        if (type && (type.selectTaskType || options.data.type == 'header')) {
            var opt = {
                templatePath: ['modules', type.editor, type.editor].join('/'),
                type: lessonModeTypes.indexOf(options.data.type) > -1 ? mode : options.data.type,
                parentId: options.data.parentId || this.record.id,
                dataConfig: [{
                    idx: 0,
                    data: options.data.data,
                    extendData: true
                }]
            };

            if (options.data.type == 'header') {
                opt.insertOnce = true;
                opt.insertAt = 0;
            }

            var controller = require('repo_controllers').get(this.record.id);

            if (controller && typeof controller.createNewItem == 'function') {
                pid = controller.createNewItem(opt, true);
            }
        }
        else if (options.data.children && options.data.children.length) {
            var children = _.cloneDeep(options.data.children);

            options.data.children = [];

            pid = repo.createItem(options.data);

            _.each(children, function (item) {
                var child_item = {
                    data: item
                };

                child_item.data.parentId = pid;

                this.saveItem(child_item);
            }, this);
        } else {
            //return the new element id
            pid = repo.createItem(options.data);
        }

        repo.endTransaction();
        return pid;

    };

    PluginRecordModel.prototype.getPluginRecordByName = function (options) {
        if (!options || !_.isObject(options) || !options.name) {
            throw new TypeError("PluginRecordModel: Invalid options pass to getPluginRecordByName");
        }

        var plugins = repo.getChildrenByTypeRecursive(this.record.id, "pluginExternal");

        return _.find(plugins, function (item) {
            return item.data.name === options.name;
        });
    };

    PluginRecordModel.prototype.getItem = function (options) {
        if (!options || !_.isObject(options) || !options.id) {
            throw new TypeError("PluginRecordModel: Invalid options pass to getItem");
        }

        //get array contains the plugin subtree ids
        var validIds = _.union([this.record.id], _.pluck(repo.getSubtreeRecursive(this.record.id), 'id'));

        //check that plugin create item inside the subtree frame
        if (!~validIds.indexOf(options.id)) {
            throw new TypeError("Invalid id");
        }

        return repo.get(options.id);
    };

    PluginRecordModel.prototype.getItemSubTree = function(options){
        if (!options || !_.isObject(options) || !options.id) {
            throw new TypeError("PluginRecordModel: Invalid options pass to getItemSubTree");
        }
        return repo.getSubtreeRecursive(options.id);

    };

    PluginRecordModel.prototype.deleteItem = function (options) {
        if (!options || !_.isObject(options) || !options.id) {
            throw new TypeError("PluginRecordModel: Invalid options pass to deleteItem");
        }

        //get array contains the plugin subtree ids
        var validIds = _.pluck(repo.getSubtreeRecursive(this.record.id), 'id');

        //check that plugin create item inside the subtree frame
        if (!~validIds.indexOf(options.id)) {
            throw new TypeError("Invalid id");
        }

        return repo.remove(options.id);
    };

    PluginRecordModel.prototype.saveProp = function (options) {
        if (!options.propName) {
            throw new TypeError("PluginRecordModel: No property name pass to saveProp");
        }

        return repo.updateProperty(this.record.id, options.propName, options.value, false, options.triggerChange);
    };

    /**
    * description - Add applet child to plugin
    * options - object
    *   appletId - (optional) add specific applet by id
    *   failCallback - (optional) called if the action failed (applet id doesn't exist in GCR)
    *   successCallback - (optional) called on applet adding success
    *   disableDelete - (optional) boolean value indicates whether the applet will have a delete button
    **/
    PluginRecordModel.prototype.addAppletChild = function(options) {

        var args = _.extend(_.pick(options,'appletId','failCallback','successCallback') || {}, {

            templatePath: "modules/AppletWrapperEditor/AppletWrapperEditor",
            parentId: this.record.id,
            "dataConfig":[
            {
                idx: 0,
                data: {"disableDelete": options.disableDelete}
            }]
        });

        require('appletModel').showAppDialog(args);
    };

    /*
    * description - Get text viewer inner html (including css)
    * options - object
    *   id - (required) text viewer id
    */
    PluginRecordModel.prototype.getTextViewerInnerHTML = function(options) {
        var tv = repo.get(options.id),
            tve;

        if (!tv || tv.type != 'textViewer') {
            throw new Error('Text viewer component not found');
        }

        tve = new TextViewerEditor({ is_convertor: true });

        return {
            html: tve.getHtmlFormatted(tv.data.title, tv.data.mathfieldArray),
            scripts: [
                'js/libs/rangy/rangy-core.js',
                'js/libs/rangy/rangy-textrange.js',
                'js/libs/rangy/rangy-cssclassapplier.js',
                'js/libs/rangy/rangy-highlighter.js'
            ]
        };
    };

    return PluginRecordModel;
});