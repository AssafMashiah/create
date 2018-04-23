define(['Class', 'lodash', 'repo', 'assets', 'pluginConstants', 'FileUpload'], function (Class, _, repo, assets, PluginConstants, FileUpload) {
	var PluginExternalApiModel = Class.extend({
		//registered api methods
		api: {},
		//manage the actions of repo
		repoMethods: {
			'parent': function (record, args) {
				//get all the ancestors of the record that has a valid plugin type
				var result = _.filter(repo.getAncestors(record.id), function (item) {
					return PluginConstants.VALID_PLUGIN_TYPES.indexOf(item.type) > -1;
				});

				//if no result is return, throws error
				if (!result || !result.length) {
					throw new TypeError("No plugin ancestors");
					return;
				}

				return _.find(result, function (item) {
					return item.data.path === args.type
				});
			},
			'next': function (record) {
				var parent_record = repo.get(record.parent);
				var children = parent_record && parent_record.children;
				var childIndex = children.indexOf(record.id);

				if (!children[childIndex + 1]) {
					throw new TypeError("No sibiling to record: " + record.id);
				}

				var childRecord = repo.get(children[childIndex + 1]);

				if (!~PluginConstants.VALID_PLUGIN_TYPES.indexOf(childRecord.type)) {
					throw new TypeError("Invalid child record: not a plugin");

					return;
				}

				return childRecord;
			},
            'getRecordProperty': function (record, args) {
                if (!args.name) {
                    throw new TypeError("Invalid arguments to getRecordProperty");
                    return;
                }

                var last;
                var root = record;

                if (!~args.name.indexOf(".")) {
                    last = args.name;
                } else {
                    var props = args.name.split(".");

                    last = props.splice(props.length - 1, 1)[0];

                    _.each(props, function (v) {
                        root = root && root[v];
                    });

                }

                return root[last];
            },
            'setRecordProperty': function (record, args) {
                if (!args.name) {
                    throw new TypeError("Invalid arguments to getRecordProperty");
                }

                var path = args.name.split(".");

                switch (path.length) {
                    case 1:
                        repo.updateProperty(record.id, path[0], args.value, true);
                        break;
                    case 2:
                        if (path[0] == 'data') {
                            repo.updateProperty(record.id, path[1], args.value);
                        }
                        else {
                            throw new TypeError("Not supported");
                        }
                        break;
                    case 3:
                        if (path[0] == 'data') {
                            repo.updatePropertyObject(record.id, path[1], path[2], args.value);
                        }
                        else {
                            throw new TypeError("Not supported");
                        }
                        break;
                    default:
                        throw new TypeError("Not supported");

                }
            },
			'prev': function (record) {
				var parent_record = repo.get(record.parent);
				var children = parent_record && parent_record.children;
				var childIndex = children.indexOf(record.id);

				if (!children[childIndex - 1]) {
					throw new TypeError("No sibiling to record: " + record.id);
				}

				var childRecord = repo.get(children[childIndex - 1]);

				if (!~PluginConstants.VALID_PLUGIN_TYPES.indexOf(childRecord.type)) {
					throw new TypeError("Invalid child record: not a plugin");

					return;
				}

				return childRecord;
			},
			'child': function (record, args) {
				var children = _.filter(repo.getChildren(record.id), function (item) {
					return PluginConstants.VALID_PLUGIN_TYPES.indexOf(item.type) > -1;
				});

				if (!children || !children.length) {
					throw new TypeError("No children plugin");
					return;
				}

				var result = null;

				_.each(children, function (item, childIndex) {
					if (item.data.path && item.data.path === args.type && childIndex === args.index) {
						result = item;
					}
				})

				return result;
			}
		},
		//initialize the root record off plugin
		initialize: function (record) {
			this.record = record;
		},
		//add new method (support namespaces)
		register: function (name, method) {
            if (!_.isFunction(method)) {
            	throw new TypeError('Invalid api method is passed');
            	return;
            }

            var root = this.api;
            var last;

            if (~name.indexOf(".")) {
                var props = name.split(".");
                
                last = props.splice(props.length - 1, 1)[0];

                _.each(props, function (v) {
                    !root[v] && (root[v] = {});

                    root = root[v];
                });

            } else {
                last = name;
            }
            
            root[last] = method;

        },
        activate: function (path, methodName, args) {
        	//check if the path is array of PathElement
        	if (!_.isArray(path) || !path.length) {
        		throw new TypeError('Invalid path passed to activate');
        		return;
        	}


        	//declare the return value to null

        	var ret = null;
        	var controller = null, instance = null;

        	_.each(path, function ( item ) {
        		//if the method is not exists on the repoMethod property, throw invalid action
        		if (!item.action || !this.repoMethods[item.action]) {
        			throw new TypeError("Invalid action: " + item.action);
        		}
        		//apply the method on the last return result || the initialize record
        		try {
        			ret = this.repoMethods[item.action](ret || this.record, item.args);
        		} catch (e) {
        			return;
        		}
        	}, this)



            if (path && path[path.length - 1].action === "getRecordProperty") return ret;
            if (path && path[path.length - 1].action === "setRecordProperty") return true;

        	if (!ret) {
        		console.warn("Path is invalid: nothing to call");
        		return false;
        	}

            //check if the method name is string type
            if (!_.isString(methodName) || !methodName.length) {
                throw new TypeError('Invalid methodName passed to activate');
                return;
            }

        	controller = require('repo_controllers').get(ret.id);
            instance = controller && controller.
                //get the plugin from the controller
                pluginClassManagerInstance.
                //get the instance of the plugin code
                getInstance(controller.instanceId);

        	return instance && instance.CGS.externalApi.activateApiMethod(methodName, args, instance);
        },
        activateApiMethod: function (methodName, args, context) {
        	if (!_.isString(methodName)) {
            	throw new TypeError('Invalid api method is passed');
            	return;
            }

            var root = this.api;

            if (~methodName.indexOf(".")) {
                var props = methodName.split(".");
                var last = props.splice(props.length - 1, 1)[0];


                _.each(props, function (v) {
                    root = root && root[v];
                });



                return root[last].apply(context, args);
            } else {
                return root[methodName].apply(context, args);
            }
        },

        // start repo transaction
        startTransaction: function () {
            repo.startTransaction.apply(repo, arguments);
        },

        // end repo transaction
        endTransaction: function () {
            repo.endTransaction.apply(repo, arguments);
        },

        // revert changes from last repo transaction
        revert: function() {
            repo.revert.apply(repo, arguments);
        },

        // get current selected editor id
        getSelectedEditorId: function() {
            var editor = require('router').selectedEditor;
            return editor && editor.record && editor.record.id;
        },

        // upload file from client
        fileUpload: function(options) {
            if (options && typeof options.srcAttr == 'string' && options.srcAttr.indexOf('.') == -1) {
                options.srcAttr = 'assets.' + options.srcAttr;
            }
            return new FileUpload(options);
        },

        getAssetAbsolutePath: function(path) {
            return assets.absPath(path);
        }
	});

	return PluginExternalApiModel;
})