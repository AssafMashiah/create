define(['lodash', 'jquery', 'files', 'conversionUtil', 'mustache', 'events', 'undo', 'defaultsModel', 'localeModel', 'translate'],
  function (_, $, files, conversionUtil, Mustache, events, undo, defaultsModel, localeModel, i18n) {

    function Repo() {
      this._data = {};
      this._old_manifest = null;
      this._old_lesson = null;
      this._busy = false;

      this._courseId = null; // FIXME: remove this, use courseModel instead.
      this.registerEvents();

      this._listen_change_types = ["url_sequence", "separator", "sequence", "html_sequence", "pluginContent"];
    }

    Repo.prototype = {

      registerEvents: function () {
        events.register('repo_changed');
        events.register('undo_action', this.undo, this);
        events.register('redo_action', this.redo, this);
      },

      createItem: function (itemConfig) {
        var title = "";

        if (itemConfig.title || (itemConfig.data && itemConfig.data.title)) {
          title = itemConfig.title;
        } else {
          if (['textViewer', 'AnswerFieldTypeText'].indexOf(itemConfig.type) == -1) {
            title = i18n.tran('New ' + itemConfig.type);
          }
        }

        if (!!itemConfig.title_addition) {
          title += itemConfig.title_addition;
        }

        var childData = {
          title: title
        };

        if (!!itemConfig.data) {
          childData = _.extend(childData, itemConfig.data);
        }

        this.startTransaction();

        var child = this.set({
            type: itemConfig.type,
            parent: itemConfig.parentId,
            childConfig: itemConfig.childConfig,
            children: [],
            data: childData
          }),
          record = this.get(itemConfig.parentId);

        logger.debug(logger.category.GENERAL, 'New ' + itemConfig.type + ' created, id: ' + child);

        var newChildren = require('cgsUtil').cloneObject(record.children);
        if (itemConfig.insertAt != undefined) {
          newChildren.splice(itemConfig.insertAt, 0, child);
        } else {
          newChildren.push(child);
        }
        this.updateProperty(record.id, 'children', newChildren, true, true);

        this._runAlignDataFunction(child, itemConfig.type, this.endTransaction.bind(this));

        return child;
      },

      /**
       * Run align data function if exists. This function is designed to prepare repo data for render
       * For example: add inline elements for text viewer if exist in template
       * @return {[type]} [description]
       */
      _runAlignDataFunction: function (child, type, callback) {
        var type = require('types')[type];
        editor = type && type.editor && require('load')(type.editor, null, type.loadOptions);

        if (editor && typeof editor['alignData'] == 'function') {
          editor['alignData'](this.get(child), callback);
        } else if (typeof callback == 'function') {
          callback();
        }

      },

      addImportedItem: function (item) {
        //@todo there is a question what to do when the item already exist in the repo
        if (!item.type || !item.parent || !item.id || this._data[item.id]) {
          return;
        }
        var child = this.set(item);
        this._runAlignDataFunction(child, item.type);

        return child;
      },

      set: function (dataRecord, ignoreCollisions, disabledEvent) {
        if (dataRecord instanceof Array) {
          _.each(dataRecord, this.set, this);
          return;
        }

        var setDefaults = false;

        // New record with no id
        if (!dataRecord.id) {
          do {
            dataRecord.id = this.genId();
          }
          // Prevent possible id collision
          while (typeof this._data[dataRecord.id] !== 'undefined');

          setDefaults = true;
        }
        // External record having an id
        else {
          if (!ignoreCollisions) {
            if (typeof this._data[dataRecord.id] !== 'undefined') {
              // Can't prevent an id collision at this point
              logger.error(logger.category.GENERAL, {
                message: 'Repo: id collision, failing',
                record: dataRecord
              });
              throw new Error('Repo: id collision, failing');
            }
          }
          undo.store(dataRecord.id, this._data[dataRecord.id], dataRecord);
        }

        this._data[dataRecord.id] = dataRecord;

        if (setDefaults) {
          this.startTransaction();
          var origRecord = require('cgsUtil').cloneObject(dataRecord);
          undo.store(dataRecord.id, null, origRecord);
          defaultsModel.setDefaults(dataRecord);
          undo.store(dataRecord.id, origRecord, dataRecord);
          this.endTransaction();
        }


        if (!disabledEvent && !this.busy()) {

          if (dataRecord.type &&
            _.isArray(this._listen_change_types) &&
            this._listen_change_types.indexOf(dataRecord.type) !== -1) {
            dataRecord.is_modified = _.isUndefined(dataRecord.is_modified) ? true : dataRecord.is_modified;
          }

          this.fireChangeEvents(dataRecord.id);
          events.fire('repo_changed', dataRecord.id);

        }


        // set courseId - TODO: courseModel.courseId ?
        if (dataRecord.type == 'course')
          this._courseId = dataRecord.id;

        return dataRecord.id;
      },

      fireChangeEvents: function (id) {
        var obj = this._data[id];
        var type = this._listen_change_types.indexOf(obj.type) !== -1 ? 'sequence' : obj.type;
        var event_name = 'repo_' + type + '_changed';

        if (!obj) return false;


        if (events.exists(event_name)) {
          events.fire(event_name, obj.id);
        }

        if (type &&
          _.isArray(this._listen_change_types) &&
          this._listen_change_types.indexOf(type) !== -1) {
          obj.is_modified = true;
        }

        while (obj && obj.parent) {
          obj = this._data[obj.parent];

          if (obj) {
            type = this._listen_change_types.indexOf(obj.type) !== -1 ? 'sequence' : obj.type;
            event_name = 'repo_' + type + '_changed';

            if (events.exists(event_name)) {
              events.fire(event_name, obj.id);
            }

            if (type &&
              _.isArray(this._listen_change_types) &&
              this._listen_change_types.indexOf(type) !== -1) {
              obj.is_modified = true;
            }
          }
        }

      },

      busy: function (val) {
        if (typeof val != "undefined") {
          this._busy = !!val;
        } else {
          return this._busy;
        }
      },

      update: function (dataRecord, oldRecord, disabledEvent) {
        if (dataRecord instanceof Array) {
          _.each(dataRecord, function (rec) {
            this.update(rec, oldRecord, disabledEvent);
          }, this);
          return;
        }

        if (_.isObject(oldRecord)) {
          undo.store(dataRecord.id, oldRecord, dataRecord);
        } else if (_.isBoolean(oldRecord)) {
          disabledEvent = oldRecord;
          oldRecord = null;
        }

        return this.set(dataRecord, true, disabledEvent);
      },

      updateChildrenProperty: function (id, key, value, disabledEvent) {
        var parent = this._data[id];

        _.each(parent.children, function (childId) {
          this.updateProperty(childId, key, value, false, disabledEvent);
        }, this);
      },

      remove: function (id, dontDispose) {
        if (!this._data[id]) return;

        this.startTransaction();

        var parent = this._data[id].parent,
          obj = parent ? this._data[parent] : null;

        if (obj && obj.children) {
          this.updateProperty(obj.id, 'children', _.without(obj.children, id), true, true);
        }

        // remove record's children recursively

        this.removeChildren(id);

        !this.busy() && this.fireChangeEvents(id);

        //before removing editor from repo we want to call dispose if exists
        //dispose also call repo-controller.remove()

        if (!dontDispose) {
          var editorController = require('repo_controllers').get(id);
          if (editorController && editorController.dispose) {
            editorController.dispose();
          }
        }
        undo.store(id, this._data[id], null);
        delete this._data[id];

        !this.busy() && events.fire('repo_changed', id);

        this.endTransaction();

        return parent;
      },

      removeChildren: function (id, /* optional */ excludeTypes, dontDispose) {
        if (this._data[id] && this._data[id].children) {
          if (!_.isArray(excludeTypes)) {
            if (typeof excludeTypes == 'string') {
              excludeTypes = [excludeTypes];
            } else {
              excludeTypes = [];
            }
          }
          _.each(this._data[id].children, function (child) {
            // need to check that the child is in the repo before removing it -
            // cause sequences are not in repo when viewing the course level,
            // but there are pointers to then from lessons/learningObjects
            if (this._data[child] && (excludeTypes.indexOf(this._data[child].type) == -1)) {
              this.remove(child, dontDispose);
            }
          }, this);
        }
      },

      removeItemAndChildrenWithExcludeList: function (itemToRemoveId, excludeArr) {
        // remove all the item and his children except the exclude list

        var parent = this._data[itemToRemoveId].parent,
          obj = parent ? this._data[parent] : null;
        if (obj && obj.children) {
          this.updateProperty(obj.id, 'children', _.without(obj.children, itemToRemoveId), true);
        }

        //remove children
        if (this._data[itemToRemoveId].children) {
          var newChildren = [];
          _.each(this._data[itemToRemoveId].children, function (child) {
            if (excludeArr.indexOf(this._data[child].id) == -1) {
              newChildren.push(child);
            }
          }, this);
          this.updateProperty(itemToRemoveId, 'children', newChildren, true);
        }

        this.remove(itemToRemoveId);
      },

      // remove an item from repo and sets his children to be children of the rmoved item's parent
      removeItemAndSetChildrenToParent: function (itemToRemoveId) {
        var itemToRemove = this._data[itemToRemoveId],
          itemsParent = this._data[itemToRemove.parent],
          newChildren = require('cgsUtil').cloneObject(itemsParent.children),
          index = newChildren.indexOf(itemToRemoveId);

        this.startTransaction();

        //remove item from his parent
        newChildren.splice(index, 1);

        _.each(itemToRemove.children, function (item, i) {
          this.updateProperty(item, 'parent', itemsParent.id, true);
          newChildren.splice(index + i, 0, item);
        }, this);

        this.updateProperty(itemToRemove.id, 'children', [], true);

        this.updateProperty(itemsParent.id, 'children', newChildren, true);

        this.remove(itemToRemoveId);

        this.endTransaction();
      },

      // Move subtree to another parent
      moveItem: function (id, newParentId) {
        var itemToMove = this.get(id);
        var newParent = this.get(newParentId);
        if (itemToMove && newParent) {
          this.startTransaction();
          var oldParent = this.get(itemToMove.parent);
          if (oldParent) {
            this.updateProperty(oldParent.id, 'children', _.without(oldParent.children, id), true);
          }

          this.updateProperty(id, 'parent', newParentId, true);
          this.updateProperty(newParentId, 'children', _.union(newParent.children, [id]), true);
          this.endTransaction();
        }
      },

      /*
       ** Copy (clone) subtree items to another parent
       ** @param data - where are two options for this parameter
       **		1. id of copied element
       **		2. array of alements to clone (can be outside of repo), te first element mast be an ancestor of another elements
       ** @param parentId - parent of the new created subtree
       */
      cloneSubtree: function (data, parentId) {
        var newParent = this.get(parentId);
        if (!newParent)
          return;

        this.startTransaction();

        var source = data instanceof Array ? data : this.getSubtreeRecursive(data);

        var clone = require('cgsUtil').cloneObject(source);
        _.each(clone, function (item) {
          item.id = this.genId();
        }, this);

        var sourceIds = _.pluck(source, 'id'),
          cloneIds = _.pluck(clone, 'id');

        // Replace all old ids with new ids
        var cloneStr = JSON.stringify(clone);
        _.each(sourceIds, function (sid) {
          cloneStr = cloneStr.replace(new RegExp(sid, 'g'), cloneIds[_.indexOf(sourceIds, sid)]);
        })
        clone = JSON.parse(cloneStr);

        this.set(clone);

        this.updateProperty(clone[0].id, 'parent', newParent.id, true);
        this.updateProperty(newParent.id, 'children', _.union(newParent.children, [clone[0].id]), true);

        this.endTransaction();

        return clone;
      },

      changeId: function (oldId, newId) {
        if (this._data[oldId]) {
          // create new element
          this._data[newId] = this._data[oldId];

          undo.store(oldId, this._data[oldId], null);
          undo.store(newId, null, this._data[newId]);

          this._data[newId].id = newId;
          // replace parent id in all children
          _.each(this.getChildren(oldId), function (child) {
            var oldChild = require('cgsUtil').cloneObject(child);
            child.parent = newId;
            undo.store(child.id, oldChild, child);
          });
          // replace child id in parent
          var parent = this.get(this._data[oldId].parent),
            oldParent = require('cgsUtil').cloneObject(parent),
            index = parent.children.indexOf(oldId);
          if (index != -1) {
            parent.children.splice(index, 1, newId);
          }
          undo.store(parent.id, oldParent, parent);

          delete this._data[oldId];
        }
      },

      get: function (id) {
        return this._data[id];
      },

      getSubtreeRecursive: function (id) {
        var rec = this.get(id),
          retval = [];

        if (rec) {
          if (rec.children && rec.children.length) {
            retval = _.union.apply(_, _.map(rec.children, this.getSubtreeRecursive, this));
          }
          retval.unshift(rec);
        }

        return retval;
      },

      getAncestors: function (id) {
        var arr_ancestors = [],
          record = this.get(id);

        while (!!record) {
          id = record.parent;
          record = this.get(id);

          if (!!record) {
            arr_ancestors.push(record);
          }
        }
        return arr_ancestors;
      },

      getAncestorRecordByType: function (id, type) {
        var record = this.get(id);

        while (record && record.type !== type) {
          id = record.parent;
          if (!id) return; // return undefined
          record = this.get(id);
        }
        return record;
      },

      /**
       * return array of object of children types
       * @param id
       */
      getDirectChildrenTypes: function (record) {
        return _.map(record.children, function (id) {
          var type = this.get(id).type,
            obj = {};
          return obj[id] = type;
        }, this);
      },

      /**
       * get the direct repo parent
       * @param record
       */
      getParent: function (record) {
        if (typeof record == 'string') {
          record = this.get(record);
        }
        return this.get(record.parent);
      },

      /**
       * get all children objects
       * @param record
       */
      getChildren: function (record) {
        if (typeof record == 'string') {
          record = this.get(record);
        }
        return _.map(record.children, this.get, this);
      },

      getSimpleChildrenRecursive: function (record) {
        var child;
        if (typeof record == 'string') {
          record = this.get(record);
        }
        if (!record) return null;
        var type = "";
        var extraClass = "";
        if (record.data.isHidden) {
          type = "hidden";
        } else if (record.type == "lesson" && record.data.mode == "assessment") {
          type = "assessment";
          if (record.data && record.data.placement) {
            extraClass = "placement";
          }
        } else {
          type = record.type;
        }
        var result = {
          id: record.id,
          type: type,
          name: record.data.title,
          extraClass: extraClass,
          noOfChildren: 0,
          items: []
        };
        var children = record.children || [];
        for (var i = 0; i < children.length; i++) {
          child = this.get(children[i]);
          var resultData = this.getSimpleChildrenRecursive(child);
          if (resultData) {
            result.noOfChildren += resultData.noOfChildren;
            // Do not include inside lesson objects (like sequence/page) and hidden lessons
            if (resultData.type == "lesson" || resultData.type == "toc" || resultData.type == "assessment") {
              if (resultData.type != "toc") result.noOfChildren++;
              result.items.push(resultData);
            }
          }
        }
        // Put "toc" items to the bottom of the Array
        var tocItems = [];
        for (i = result.items.length - 1; i >= 0; i--) {
          if (result.items[i].type == "toc") {
            tocItems.push(result.items.splice(i, 1)[0]);
          }
        }
        result.items = result.items.concat(tocItems.reverse());
        return result;
      },

      getChildrenRecordsByType: function (id, type) {
        var parent = this.get(id),
          child_obj, self = this,
          ret_arr = [];
        if (parent) {
          $.map(parent.children, function (child, i) {
            child_obj = self.get(child);
            if (child_obj && (child_obj.type == type)) {
              ret_arr.push(child_obj);
              return false;
            }
          });
        }
        return ret_arr;
      },

      getMaxChildOrder: function (id, type) {
        var maxOrder = 0;
        var childrenArr = this.getChildrenRecordsByType(id, type);
        if (!(childrenArr && childrenArr.length)) {
          return maxOrder;
        }

        var undefined_arr = _.filter(childrenArr, function (child) {
          return child.data.overlayOrder == null
        });
        if (undefined_arr && undefined_arr.length) {
          maxOrder = this.getCountChildrenByType(id, type);
        } else {
          var maxOrderChild = _.max(childrenArr, function (child) {
            return child.data.overlayOrder;
          });
          if (maxOrderChild && maxOrderChild.data) {
            maxOrder = maxOrderChild.data.overlayOrder;
          }
        }

        return maxOrder;
      },

      getCountChildrenByType: function (id, type) {
        return this.getChildrenRecordsByType(id, type).length + 1;
      },

      //returns an array of all the elements children of type. search is recursieve
      getChildrenRecordsByTypeRecursieve: function (id, type, ret_arr) {
        var parent = this.get(id),
          child_obj, self = this;
        if (!ret_arr)
          ret_arr = [];

        if (!parent) {
          return ret_arr;
        }

        $.map(parent.children, function (child, i) {
          child_obj = self.get(child);
          if (child_obj && (child_obj.type == type)) {
            ret_arr.push(child_obj);
          } else {
            if (child_obj && child_obj.children && child_obj.children.length > 0) {
              self.getChildrenRecordsByTypeRecursieve(child, type, ret_arr);
            }
          }
        });

        return ret_arr;
      },

      changeChildrenRecordsByTypeRecursively: function (id, parentTargetType, targetType, targetData) {
        var currentItem = this.get(id),
          self = this;
        $.map(currentItem.children, function (child, i) {
          // get child & parent objects from repo
          var target_obj = self.get(child);
          var parent_target_obj = self.get(target_obj.parent);

          if (target_obj && parent_target_obj) {
            // if the current child has our target type and its parent has the parent type - make the change
            if ((target_obj.type == targetType) && (parent_target_obj.type == parentTargetType)) {
              // clone the targetData and add to the new data the current id and the parent id
              var data = require('cgsUtil').cloneObject(targetData);
              data.id = target_obj.id;
              data.parent = target_obj.parent;

              // add the fixed data in the same place at the repo object
              self.set(data, true);
            } else if (target_obj.children && target_obj.children.length > 0) {
              // it the types don't match and the child has children - go recursively over the childrens
              self.changeChildrenRecordsByTypeRecursively(target_obj.id, parentTargetType, targetType, targetData);
            }
          }
        });

        return;
      },

      getChildrenRecordsWithoutTypes: function (id, types) {
        var parent = this.get(id),
          child_obj, self = this,
          ret_arr = [];

        if (!!types && !!types.length) {
          var types_arr = types.split(',');
          $.map(parent.children, function (child, i) {
            child_obj = self.get(child);
            if (child_obj && (_.indexOf(types_arr, child_obj.type) == -1)) {
              ret_arr.push(child_obj.id);
              return false;
            }
          });
        } else {
          ret_arr = parent.children;
        }

        return ret_arr;

      },
      getChildrenByTypeRecursive: function (id, type, results) {
        var record = this.get(id);
        if (!(type instanceof Array)) type = [type];

        if (!results) {
          results = [];
        }
        if (_.isObject(record)) {
          if (~type.indexOf(record.type)) results.push(record);

          if (record.children && record.children.length) {
            _.each(record.children, function (item) {
              return this.getChildrenByTypeRecursive(item, type, results);
            }, this);
          }
        }

        return results;
      },
      // fromRoot - alow you to change the root properties and not the property under data property
      updateProperty: function (id, propertyName, value, fromRoot, disabledEvent) {
        var newRec = this.get(id),
          oldRec = undo._ignoreStore ? disabledEvent : require('cgsUtil').cloneObject(newRec);
        if (!newRec) return;

        if (fromRoot) {
          newRec[propertyName] = value;
        } else {
          newRec.data[propertyName] = value;
        }
        this.update(newRec, oldRec, disabledEvent);
      },
      // fromRoot - alow you to change the root properties and not the property under data property
      deleteProperty: function (id, propertyName, fromRoot, disabledEvent) {
        var newRec = this.get(id),
          oldRec = undo._ignoreStore ? disabledEvent : require('cgsUtil').cloneObject(newRec);
        if (!newRec) return;

        if (fromRoot) {
          delete newRec[propertyName];
        } else {
          delete newRec.data[propertyName];
        }
        this.update(newRec, oldRec, disabledEvent);
      },

      updatePropertyObject: function (id, propertyName, propertyKey, value, disabledEvent) {
        var newRec = this.get(id),
          oldRec = undo._ignoreStore ? disabledEvent : require('cgsUtil').cloneObject(newRec);
        if (!newRec) return;

        if (propertyName && propertyKey) {
          newRec.data[propertyName] = newRec.data[propertyName] || {};
          newRec.data[propertyName][propertyKey] = value;
          this.update(newRec, oldRec, disabledEvent);
        } else {
          logger.error(logger.category.GENERAL, {
            message: 'propertyName/propertyKey error in repo',
            id: id,
            propertyName: propertyName,
            propertyKey: propertyKey
          });
        }
      },

      deletePropertyObject: function (id, propertyName, propertyKey, disabledEvent) {
        var newRec = this.get(id),
          oldRec = undo._ignoreStore ? disabledEvent : require('cgsUtil').cloneObject(newRec);
        if (!newRec) return;

        if (propertyName && propertyKey && newRec.data[propertyName]) {
          delete newRec.data[propertyName][propertyKey];
          this.update(newRec, oldRec, disabledEvent);
        }
      },


      updatePropertyList: function (id, propertyName, value, disabledEvent) {
        var newRec = this.get(id),
          oldRec = undo._ignoreStore ? disabledEvent : require('cgsUtil').cloneObject(newRec);
        if (!newRec) return;

        newRec.data[propertyName] = _.isArray(newRec.data[propertyName]) ? newRec.data[propertyName] : [];
        newRec.data[propertyName].push(value);
        this.update(newRec, oldRec, disabledEvent);
      },

      updateChildrenOrder: function (id, type, new_order, hasMultipleTypes, disabledEvent) {
        var record = this.get(id);
        if (!record) return;

        var parent = this.get(record.parent);
        if (!parent) return;

        var child_obj,
          newChildren,
          elements = new_order.split(',');

        if (hasMultipleTypes) {
          newChildren = _.reject(parent.children, function (child) {
            return elements.indexOf(child) > -1;
          })
        } else {
          newChildren = _.reject(parent.children, function (child) {
            child_obj = this.get(child);
            return child_obj && (child_obj.type == type);
          }, this);
        }
        newChildren = _.union(newChildren, elements);
        this.updateProperty(parent.id, 'children', newChildren, true, disabledEvent);
      },

      childOrder: function (id) {
        return this.getParent(id).children.indexOf(id) + 1;
      },

      childOrderByType: function (id) {
        var currentRecord = this.get(id);
        return _.pluck(this.getChildrenRecordsByType(currentRecord.parent, currentRecord.type), 'id').indexOf(id) + 1;
      },

      loadFile: function (url, callback) {
        var self = this;

        $.getJSON(url, function (json) {

          self.loadJSON(json);

          if (typeof callback === 'function') callback();
        });
      },

      loadJSON: function (json, clean) {
        if (clean) {
          this.clear();
        }

        _.each(json, function (obj, id) {
          obj.id = id;
          this.set(obj);
        }, this);

        // Find and store the course id, or null if not found
        var courseRecord = _.find(this._data, function (rec) {
          return rec.type === 'course';
        });

        this._courseId = courseRecord ? courseRecord.id : null;
      },

      clear: function () {
        this._data = {};
        undo.reset();
      },

      isEmpty: function () {
        return _.size(this._data) === 0;
      },

      // convert repo to remote
      getRemoteJson: function () {
        return conversionUtil.repoToDataRemote(this.getRepo());
      },

      /*return the whole data needed for the scp preview, remove reference sequences and irrelevant lessons and tocs*/
      getRemoteJsonForScp: function (lessonId) {

        var lessonAncestors = [lessonId].concat(_.map(this.getAncestors(lessonId), function (ancestor) {
          return ancestor.id;
        }));

        var dataToConvert = _.omit(this._data, function (item) {

          var isReferenceSequence = item.type == "referenceSequence";
          var isAnotherLesson = item.type == "lesson" && item.id != lessonId;
          var isTocNotAncestorOfLesson = item.type == "toc" && lessonAncestors.indexOf(item.id) == -1;

          return isReferenceSequence || isAnotherLesson || isTocNotAncestorOfLesson;
        }.bind(this));

        var courseEntry = require("cgsUtil").cloneObject(dataToConvert[this._courseId]);

        //remove from course children the irrelevant toc/lesson items
        courseEntry.children = _.filter(courseEntry.children, function (toc) {
          return lessonAncestors.indexOf(toc) > -1;
        });
        dataToConvert[this._courseId] = courseEntry;

        return conversionUtil.repoToDataRemote(dataToConvert);
      },

      getRepo: function () {
        return this._data;
      },
      getRecursiveDeepClone: function (elementId, record) {
        if (!record) {
          var record = $.extend(true, {}, this._data[elementId]);
        }

        if (record && record.children && record.children.length) {
          _.each(record.children, function (v, k) {
            if (this._data[v]) {
              record.children[k] = $.extend(true, {}, this._data[v]);

              if (record.children[k].children.length) {
                this.getRecursiveDeepClone(v, record.children[k]);
              }
            }
          }, this);
        }

        return record;
      },
      setRecursiveCloneToRepo: function (obj) {
        this._data[obj.id] = _.defaults({
          children: []
        }, obj);

        _.each(obj.children, function (v, k) {
          this._data[v.parent].children.push(v.id);

          this.setRecursiveCloneToRepo(v);
        }, this);

      },
      filterDataById: function (arr_result, id) {
        var item, exit = false;

        if (!!this._data[id]) {
          arr_result[id] = $.extend(true, {}, this._data[id]); //deep clone

          this._data[id].children.forEach(function (element, index, array) {
            this.filterDataById(arr_result, element);
          }, this);


        } else {
          exit = true;
        }

        if (exit) {
          return arr_result;
        }
      },

      setFromRemote: function (data) {
        return conversionUtil.dataRemoteToRepo(data);
      },

      addTemplate: function (templateConfig) {
        // Start undo transaction
        this.startTransaction();

        var itemsCount = $.parseJSON(templateConfig.template).length;
        var customizationPackStrings = (localeModel && localeModel.getConfig('stringData') && localeModel.getConfig('stringData').repo) || {};
        var mustacheObj = $.extend(true, {}, templateConfig, customizationPackStrings); //deep clone
        var firstItemId;
        mustacheObj["parentId"] = templateConfig.parentId;

        for (var i = 1; i <= itemsCount; i++) {
          var id;
          do {
            id = this.genId();
          }
          while (typeof this._data[id] !== 'undefined');

          mustacheObj["id" + i] = id;
        }

        if (templateConfig.data) {
          _.each(templateConfig.data, function (item, index) {
            mustacheObj[index] = item;
          });
        }

        //render mustache and parse to object
        var newObjects = $.parseJSON(Mustache.render(templateConfig.template, mustacheObj));

        //add data object to the repo added item
        if (templateConfig.dataConfig) {
          _.each(templateConfig.dataConfig, function (objData, idx) {
            if (objData.extendData) {
              _.extend(newObjects[objData.idx].data, objData.data);
            } else {
              newObjects[objData.idx].data = objData.data;
            }
          });
        }

        _.each(newObjects, function (newObjToAdd) {
          // Store the item into undo transaction
          var origRecord = require('cgsUtil').cloneObject(newObjToAdd);
          undo.store(newObjToAdd.id, null, origRecord);
          this._data[newObjToAdd.id] = newObjToAdd;
          // Apply defaults on new record and add to repo data
          defaultsModel.setDefaults(newObjToAdd);

          // Store the item into undo transaction
          undo.store(newObjToAdd.id, origRecord, newObjToAdd);

          if (newObjToAdd.parent == templateConfig.parentId) {
            // Clone the parent to store it's changes into undo transaction
            var newChildren = require('cgsUtil').cloneObject(this.get(templateConfig.parentId).children);
            if (templateConfig.insertAt === undefined) {
              newChildren.push(newObjToAdd.id);
            } else {
              newChildren.splice(templateConfig.insertAt, 0, newObjToAdd.id);
            }
            this.updateProperty(templateConfig.parentId, 'children', newChildren, true);
            firstItemId = newObjToAdd.id;
          }
          this.startTransaction();
          this._runAlignDataFunction(newObjToAdd.id, newObjToAdd.type, this.endTransaction.bind(this));
        }, this);

        !this.busy() && events.fire('repo_changed', firstItemId);
        !this.busy() && this.fireChangeEvents(firstItemId);

        // End undo transaction
        this.endTransaction();

        return firstItemId;
      },

      // Filter all data that not exist in parent-children
      filterData: function () {
        _.chain(this._data)
          .filter(function (item) {
            return item.parent && (!this.get(item.parent) || this.get(item.parent).children.indexOf(item.id) === -1);
          }, this)
          .each(function (item) {
            this.remove(item.id);
          }, this)
          .values();

        _.each(this._data, function (item) {
          item.children = _.filter(item.children, function (child) {
            return this.get(child);
          }, this);
        }, this);
      },

      /****************** Undo-Redo methods ******************/

      startTransaction: function () {
        undo.startTransaction.apply(undo, arguments);
      },

      endTransaction: function () {
        undo.endTransaction.apply(undo, arguments);
      },

      ignoreNext: function () {
        undo.ignoreNext();
      },

      revert: function () {
        undo.revert.apply(undo, arguments);
      },

      reset: function () {
        undo.reset();
      },

      undo: function () {
        this.restorePosition(undo.undo());
      },

      redo: function () {
        this.restorePosition(undo.redo());
      },

      restorePosition: function (restoreData) {
        var router = require('router'),
          activeMenuTab = router.activeScreen && router.activeScreen.components.menu && router.activeScreen.components.menu.menuInitFocusId;

        if (router.activeScreen && router.activeScreen.editor && router.activeScreen.editor.endEditing) {
          router.activeScreen.editor.endEditing();
        }

        _.each(restoreData.changes, function (change) {
          if (change.record) {
            this._data[change.id] = change.record;
            events.fire('repo_changed', change.id);
          } else {
            delete this._data[change.id];
          }
        }, this);

        // Reload screen
        if (this.get(restoreData.urlId)) {
          router.load(restoreData.urlId, restoreData.urlTab);
        } else {
          router.reload();
        }

        // Start editing the last editor
        var controller = require('repo_controllers').get(restoreData.activeEditorId) || require('repo_controllers').get(restoreData.activeEditorId);
        if (controller && controller.startEditing) {
          controller.startEditing();
        }

        // Return to last menu tab
        router.activeScreen.components.menu.setMenuTab(activeMenuTab);

        // Restore props tab
        $('#props_base .nav-tabs a[href="' + restoreData.activePropsTab + '"]').trigger('click');

        // Restore scrolling
        if (!isNaN(restoreData.stageScroll)) {
          $('#stage_base').scrollTop(restoreData.stageScroll);
        }
        if (!isNaN(restoreData.treeScroll)) {
          $('#tree_base').scrollTop(restoreData.treeScroll);
        }
        if (!isNaN(restoreData.propsScroll)) {
          $('#props_base').scrollTop(restoreData.propsScroll);
        }
      },

      /****************** End of Undo-Redo methods ******************/




      /**
      UUID v4 generator in JavaScript (RFC4122 compliant)

      RFC text:   http://tools.ietf.org/html/rfc4122
      Taken from: http://blog.snowfinch.net/post/3254029029/uuid-v4-js
      License:	Public domain
      */
      genId: function () {
        var uuid = "",
          i, random;

        for (i = 0; i < 32; i++) {
          random = Math.random() * 16 | 0;

          if (i == 8 || i == 12 || i == 16 || i == 20) {
            uuid += "-"
          }
          uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
        }
        return uuid;
      }

    }

    return new Repo();

  });
