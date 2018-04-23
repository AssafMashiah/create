define(["lodash", "jquery", "modules/ConversionUtil/schema"], function f176(_, $, schema) {
	var ConversionUtil = (function f177() {
		var _repo_item_schema = {
			id: null,
			type: null,
			parent: null,
			data: {},
			children: []
		},
		handlers = {
			"_default": function f178(propertyValue, propertyName, _path, _course_data, _repo_data, schema_type) {
				var _convert_ref = function f179(obj) {
					var _ref = obj && obj._ref || obj,
						_isNull = obj && obj._isNull || "";

					return getJSONPath(_ref.replace('$', ''), _course_data) || _isNull || "";
				};

				var hasModifiers = function f180(obj, has_flag) {
					if (!has_flag) {
						var has_flag = false;
					}

					_.each(obj, function f181(v, k) {
						if (_.isObject(v) && !_.isArray(v)) {
							return hasModifiers(v, has_flag);
						} else {
							if (_.isString(v) && v.indexOf('$') === 0) {
								has_flag = true;
							}
						}
					});

					return has_flag;
				};

				if (_.isString(propertyValue) || _.isBoolean(propertyValue)) {
					_path[propertyName] = propertyValue;
                }
                else if (_.isArray(propertyValue) && propertyValue.length === 0) {
					_path[propertyName] = propertyValue;
				}
				else {
					_.each(propertyValue, function f182(defaultPropertyValue, defaultPropertyName) {
						if (_.isObject(defaultPropertyValue)) {
							if (defaultPropertyValue._ref) {
								propertyValue[defaultPropertyName] = _convert_ref(defaultPropertyValue)
								_path[propertyName] = propertyValue;
							} else {
								if (hasModifiers(defaultPropertyValue)) {
									handlers._default.call(this, defaultPropertyValue, propertyName, _path, _course_data, _repo_data, schema_type);
								} else {
									_path[propertyName] = propertyValue;
								}
							}
						} else {
							if (_.isString(defaultPropertyValue) && defaultPropertyValue.indexOf("$") === 0) {
								propertyValue[defaultPropertyName] = _convert_ref(defaultPropertyValue);
							}
						}
					});
				}
			},
			"_reference": function f183(propertyValue, propertyName, _path, _course_data, _repo_data, schema_type) {
				var val = getJSONPath(propertyValue, _course_data);

				if (val) {
					_path[propertyName] = val;
				}
			},
			"_list":  function f184(propertyValue, propertyName, _path, _course_data, _repo_data, schema_type) {
				if (_.isObject(propertyValue)) {

					if (!_path[propertyName]) {
						_path[propertyName] = {};
					}

					var _path_context = _path[propertyName];

					_.each(propertyValue, function f185(item, innerPropertyName) {
			 			var _handlers = _.keys(item);

			 			_.each(_handlers, function f186(handler) {
	                        handlers[handler] && _.isFunction(handlers[handler]) && handlers[handler](item[handler], innerPropertyName, _path_context, _course_data, _repo_data, schema_type);
			 			}, this);
					}, this);

					if (!_.size(_path[propertyName])) {
						delete _path[propertyName];
					}
			 	}
			},
			"_helper": function f187(propertyValue, propertyName, _path, _course_data, _repo_data, schema_type, globalScope) {
				var _helper = getSchemaHelper.call(this, schema_type, propertyValue);

				if (_.isFunction(_helper)) {
					var _helper_value = _helper.call(_course_data, _repo_data, _path, globalScope);

					if (_helper_value) {
						_path[propertyName] = _helper_value;
					}
				}
			},
			"_global": function f188(propertyValue, propertyName, _path, _course_data, _repo_data, schema_type, globalScope) {
				var _helper = getSchemaGlobalHelper.call(this, propertyValue);

				if (_.isFunction(_helper)) {
					var _helper_value = _helper.call(_course_data, _repo_data, _path, globalScope);

					if (_helper_value) {
						_path[propertyName] = _helper_value;
					}
				}
			}
		};

		function hasSchema(type) {
			return getSchema(type) ? true : false;
		}

        function _create_repo_schema(schema_data_item, parentId, _repo_schema, _server_schema) {
			var _schema = getSchema(schema_data_item.type);
			var _repo_new_item_schema = $.extend(true, {}, _repo_item_schema);
	        var repo = require('repo');

			if (!_schema) {
				throw new TypeError("Schema isn't exists");
				return false;
			}

			function _call_helper(_helper_key, type, context, _server_schema, course) {
				return getSchemaHelper(type, _helper_key).call(context, _server_schema, _repo_schema, course);
			};

			function _call_repo_helper(_helper_key, type, context, _server_schema, course, args) {
				var _helper_args = args && args.length ? args : [_server_schema, _repo_schema, course];

				return getRepoSchemaHelper(_helper_key).apply(context, _helper_args);
			};

			function _get_nested_schema(propertyData, propertyDataName, context) {
				if (_.isObject(propertyData) && propertyData._schema && context[propertyDataName]) {
					if (propertyData.type === "collection") {
						var _schema_collection = context[propertyDataName];

						_.each(_schema_collection, function f189(item) {
                        	if (item && hasSchema(item.type)) {
                        		var _index = item[propertyData.child_index] || item[propertyData.parent_index];

                        		if (_index && (_repo_schema[_index] == null)) {
			                        _repo_schema[_index] = _create_repo_schema(item, context[propertyData.parent_index], _repo_schema, _server_schema);

			                        _.each(item, function f190(subItem, subItemPropertyName) {
				                        if (_.isArray(subItem) && subItem.length) {
					                        var typesArray = _.uniq(_.pluck(subItem, 'type'));

					                        _.each(typesArray, function f191(itemType) {
						                        if (itemType && hasSchema(itemType)) {
							                        var elemSchema = getSchema(itemType);
							                        var temp_obj = {
								                        _schema: itemType,
								                        type: "collection",
								                        parent_index: propertyData.parent_index,
								                        child_index: elemSchema._serverChildIndex || elemSchema._collectionIndex
							                        }
							                        _get_nested_schema(temp_obj, subItemPropertyName, item);
						                        }
						                        subItemItem = null;
					                        });
				                        }
			                        });
								}
							}
						});

						return _repo_schema;
					}
				}
			};


	        _.each(_schema.repo, function f192(propertyValue, propertyName) {
		        var _repo_keys = _.keys(_schema.repo),
			        courseData = _.filter(_.defaults({}, _repo_schema, repo._data), function f193(item) {
				        return item.type === "course"
			        })[0];

		        if (_.isObject(propertyValue) && propertyValue._schema && schema_data_item[propertyName]) {
			        return _get_nested_schema(propertyValue, propertyName, schema_data_item);
		        } else {
			        if (["data", "parent"].indexOf(propertyName) === -1 && _repo_keys.indexOf(propertyName) !== -1) {

				        if (!_.isArray(propertyValue) && _.isObject(propertyValue)) {
					        var property_keys = _.keys(propertyValue),
						        property_values = _.values(propertyValue),
						        v = property_values[0];

					        if (property_keys.indexOf("args") !== -1) {
						        var args = propertyValue["args"];
						        var argsResult = [];

						        _.each(args, function f194(item) {
							        argsResult.push(getJSONPath(item, schema_data_item))
						        });
					        }

					        if (v.indexOf('_') === 0) {
						        v = v.replace('_', '');
						        _repo_new_item_schema[propertyName] = _call_repo_helper(v, schema_data_item.type, schema_data_item, _server_schema, courseData, argsResult);
					        }
				        } else {
					        if (propertyName === "children") {
						        if (schema_data_item[propertyValue]) {
							        _repo_new_item_schema[propertyName] = schema_data_item[propertyValue];
						        } else {
							        _repo_new_item_schema[propertyName] = [];
						        }
					        } else {
						        _repo_new_item_schema[propertyName] = schema_data_item[propertyValue];
					        }

				        }
			        } else if (propertyName === "data") {
				        _.each(propertyValue, function f195(item) {
					        if (!_.isObject(item)) {
						        _repo_new_item_schema.data[item] = schema_data_item[item];
					        } else {
						        var property_keys = _.keys(item),
							        property_values = _.values(item),
							        v = property_values[0],
							        k = _.keys(item)[0],
							        helper = null;

						        if (property_keys.indexOf("args") !== -1) {
							        var args = item["args"]
							        var argsResult = [];

							        _.each(args, function f196(item) {
								        argsResult.push(getJSONPath(item, schema_data_item))
							        });
						        }

						        if (v.indexOf("_") === 0) {
							        v = v.replace("_", "");

							        _repo_new_item_schema.data[k] = _call_repo_helper(v, schema_data_item.type, schema_data_item, _server_schema, courseData, argsResult) || null;
						        } else if (v.indexOf("@") === 0) {
							        _repo_new_item_schema.data[k] = v.substr(1);
						        } else {
							        _repo_new_item_schema.data[k] = schema_data_item[v] || null;
						        }
					        }
				        });
			        } else if (propertyName === "parent" && parentId) {
				        var potentialParent = _.find(_repo_schema, function f197(item) {
					        return item.children.indexOf(_repo_new_item_schema.id) !== -1
				        });

				        if (potentialParent)
					        _repo_new_item_schema[propertyName] = potentialParent.id;
				        else
					        _repo_new_item_schema[propertyName] = parentId;

			        }
		        }
	        });

			return _repo_new_item_schema;
		}

		function toRepo(_data_collection, parentId, _repo_data) {
			//clone the repo schema object
			var _repo_schema = {},
				_ref_parent_id;


			if (schema._toRepoBefore && _.isFunction(schema._toRepoBefore)) {
				schema._toRepoBefore.call(_data_collection);
			}

			function _set_parent_id(item) {
				if (item.type === "course") {
					_ref_parent_id = null;
				} else {
					if (parentId) {
						_ref_parent_id = parentId;
					}
				}
			};

			function _convert_specific_item(item, _server_schema) {
				var _repo_new_item_schema = _create_repo_schema(item, _ref_parent_id, _repo_schema, _server_schema || item);
				_repo_schema[_repo_new_item_schema.id] = _repo_new_item_schema;

				/*if (_ref_parent_id && _repo_schema[_ref_parent_id]) {
					_repo_schema[_ref_parent_id].children.push(_repo_new_item_schema.id);
				}*/
			};

			function _convert_array_items(items) {
				_.each(items, _convert_specific_item);
			};


            function _convert_collection(_data_collection) {
				_.each(_data_collection, function f198(item) {
					if (!item) return;

					_set_parent_id(item);

					if (_.isArray(item)) {
						_convert_array_items(item);
					} else {
						_convert_specific_item(item, _data_collection)
					}
				})
			};

			if (_.size(_data_collection) > 1 && !_data_collection.type) {
				_convert_collection(_data_collection);
			} else {
				_set_parent_id(_data_collection);
				_convert_specific_item(_data_collection);
			}

			var repo_item;
			for (var index in _repo_schema) {
				repo_item = _repo_schema[index];
				if (repo_item.type !== "course") {
					if (repo_item.id && repo_item.id.indexOf("00000000-0000-4000-9000-") === -1) {
						if (_repo_schema[repo_item.parent] && _repo_schema[repo_item.parent].children.indexOf(repo_item.id) === -1) {
							_repo_schema[repo_item.parent] && _repo_schema[repo_item.parent].children.push(repo_item.id);
						}
					}
				}
				repo_item = null;
			}

			if (schema._toRepoAfter && _.isFunction(schema._toRepoAfter)) {
				schema._toRepoAfter.call(_repo_schema, _repo_data);
			}

			return _repo_schema;
		}

		function _resources_set_default_server(obj, resources) {
			_.each(obj, function f200(item, itemName) {
				if (_.isObject(item) && itemName !== "resources") {
					return _resources_set_default_server(item, resources);
				} else {
					_.each(obj, function f201(propertyValue, propertyKey) {
						if (_.isString(propertyValue)) {
							_.each(resources, function f202(_resource_item) {
								if ((propertyValue === _resource_item.href) || (propertyValue === _resource_item.baseDir) && propertyValue.indexOf('resource_') === -1) {
									obj[propertyKey] = _resource_item.resId;
	                            }
							});
						}
					});
				}
			});
		}

		function toServer(_original_repo) {
			if (!_original_repo || !_.isObject(_original_repo)) {
				throw new TypeError("Data is invalid");
			}

			var _repo_data = require('cgsUtil').cloneObject(_original_repo);
			var _repo_data_indexed = _.sortBy(_repo_data, function(item) {
				switch (item.type) {
					case 'course':
						return 0;
					case 'lesson':
					case 'assessment':
						return 1;
					case 'quiz':
						return 2;
					case 'lo':
						return 3;
					case 'page':
						return 4;
					case 'sequence':
						return 5;
					case 'differentiatedSequenceParent':
						return 6;
					default:
						return 7;
				}
			});

			if (schema._toServerBefore && _.isFunction(schema._toServerBefore)) {
				schema._toServerBefore.call(_server_json_struct, _repo_data);
			}

			var _server_json_struct = {
				lessonsData: {},
				course: {},
				lo: {},
				pages: {},
				sequences: {}
			};

			_.each(_repo_data_indexed, function f203(item) {
				var schema = getSchema(item.type),
					schema_repo_data = item;
				var _path;

				if (schema.isCollection) {
					if (!_server_json_struct[schema._map_type_json]) {
						_server_json_struct[schema._map_type_json] = {};
					}
					_server_json_struct[schema._map_type_json][schema_repo_data[schema._collectionIndex]] = {};
					_path = _server_json_struct[schema._map_type_json][schema_repo_data[schema._collectionIndex]];
				} else {
					_path = _server_json_struct[schema._map_type_json];
				}

				_.each(schema.properties, function f204(propertyValue, propertyName) {
					if (_.isObject(propertyValue)) {
						var _handlers = _.keys(propertyValue);

						_.each(_handlers, function f205(handler) {
							handlers[handler] &&
								_.isFunction(handlers[handler]) &&
								handlers[handler].call(this, propertyValue[handler], propertyName, _path, schema_repo_data, _repo_data, item.type, _server_json_struct);
						});
					}
				});

				if (schema._schema_settings) {
					_.each(schema._schema_settings, function f206(item, itemKey) {
						getSchema(itemKey)._schema_settings = item;
					});
				}

				if (schema.parent_schema) {
					_.each(schema.parent_schema, function(schemaName) {
						var properties = schema.parent_schema_property[schemaName];
						var pSchema = getSchema(schemaName);
						var pSchemaData = _server_json_struct[pSchema._map_type_json] && _server_json_struct[pSchema._map_type_json][schema_repo_data.parent];
						var childSchema = getSchema(properties.schemaName);

						if (childSchema._schema_settings && childSchema._schema_settings[schemaName]) {
							var _schema_settings = childSchema._schema_settings[schemaName];

							if (_schema_settings.ignore_parent_schema && _.size(_server_json_struct[pSchema._map_type_json]) > 0) {
								if (schema_repo_data.parent && _repo_data[schema_repo_data.parent]) {
									pSchema = getSchema(_repo_data[schema_repo_data.parent].type);
									if (_server_json_struct[pSchema._map_type_json]) {
										pSchemaData = _server_json_struct[pSchema._map_type_json][schema_repo_data.parent];
									} else {
										pSchema = null;
									}
								}
							}
						}

						if (pSchemaData) {
							var reindex_schema_data = null;


							if (schema.isCollection) {
								reindex_schema_data = _.map(_.filter(_server_json_struct[schema._map_type_json], function f207(item) {
									return item.cid === schema_repo_data.id;
								}), function f208(item) {
									return item;
								});
							}

							if (properties.parent_property) {
								pSchemaData = pSchemaData[properties.parent_property]
							}

							if (!pSchemaData[properties.key]) {
								pSchemaData[properties.key] = [];
							}

							_.each(reindex_schema_data, function f209(item) {
								if (_repo_data[schema_repo_data.parent].children.indexOf(item.cid) !== -1) {
									pSchemaData[properties.key].push(item);
								}
							});

							pSchemaData[properties.key] = _.sortBy(pSchemaData[properties.key], function(item) {
								return _repo_data[schema_repo_data.parent].children.indexOf(item.cid);
							});
						}
					}, this);
				}

				if (schema.has_resources) {

					if (_.isArray(schema.resources_settings.key)) {
						_.each(schema.resources_settings.key, function f210(_resource_property_name) {
							_resources_set_default_server(_path, _path[_resource_property_name]);
						});
					} else {
						_resources_set_default_server(_path, _path[schema.resources_settings.key]);
					}
				}
			});


			if (schema._toServerAfter && _.isFunction(schema._toServerAfter)) {
				schema._toServerAfter.call(_server_json_struct, _repo_data);
			}


			return _server_json_struct;
		}

		function getSchema(type) {
			if (schema._aliases_schema_name[type]) {
				type = schema._aliases_schema_name[type];
			}
			
			return schema && schema[type] || false;
		}

		function getSchemaHelper(type, helper) {
            return schema && schema[type] && schema[type].helpers && schema[type].helpers[helper] || false;
		}

		function getRepoSchemaHelper(helper) {
			return schema && schema._repo_helpers && schema._repo_helpers[helper] || false;
		}

		function getSchemaGlobalHelper(helper) {
			return schema && schema._helper_global && schema._helper_global[helper] || false;
		}

		function getJSONPath(path, obj) {
			var keys = path.indexOf(".") !== -1 ? path.split(".") : [path];
			var v = null;

			keys.every(function f211(item) {
				v = _.isObject(v) ? v[item] || false : obj[item] || false;

				if (!v) {
					v = null;
					return false;
				}

				return true;
			});

			return v;
		}

		return {
			dataRemoteToRepo: toRepo,
			repoToDataRemote: toServer
		};

	})();

	return ConversionUtil;
});