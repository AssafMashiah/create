define(['lodash', 'BaseEditor', './config', 'admin_user_model', 'publisher_collection','group_model', 'group_collection', 'publisher_user_collection', 'publisher_model',
		'./T2KGroupEditorView', 'backbone_super', 'showMessage'], function (_, BaseEditor, config, AdminUserModel, PublishersCollection, GroupModel, GroupCollection, PublisherUsersCollection, PublisherModel,
			T2KGroupEditorView, Backbone, showMessage) {
	var T2KGroupEditor = BaseEditor.extend({
		initialize: function (options) {
			this._super(options);

			this.screen.components.menu.setItems(config.menuConfig.menuItems, true, config.menuConfig.menuInitFocusId);

			this.initTree();

			this.registerEvents();


		},
		registerEvents: function () {
        	this.bindEvents({
                'new-publisher': {
                	'type': 'register',
                	'func': this.create_publisher,
                	'ctx': this
                },
                'delete-publisher': {
                	'type': 'register',
                	'func': this.delete_publisher,
                	'ctx': this
                }
        	});
        },
        create: function (type, collection) {
        	var _models = this.models;
        	var _new_model = type === "GROUP" ? new GroupModel() : new PublisherModel();

        	_new_model.set("relatesTo", {
        		_id: this.config.data.user.relatesTo.id,
        		type: 'GROUP'
        	});

        	_new_model.unset('type');
        	_new_model.save({},{
        		success: function (model) {
        			_new_model.set('type', type);
        			_new_model.set('accountId', model.get('accountId'));
        			
        			collection.add(_new_model);

        			_models.push(_new_model);

        			this.screen.components.tree.setItems(_models, this.initStage, this, true);
        		}.bind(this),
        		error: this.showError,
        		converters: {
                    "text json": function (response) {
                        return response && response.length ? JSON.parse(response) : response;
                    }
                }
        	})
        },
        delete_publisher: function() {

        	var _current_model = this.getCurrentModel();

        	if (_current_model.model) {
        		_current_model.model.url = "/cgs/rest/publishers/" + _current_model.model.get("accountId");
        		_current_model.model.destroy({
        			success: function(model) {
        				this.initTree();
        				this.initStage();
        			}.bind(this),
        			converters: {
                        "text json": function (response) {
                            return response && response.length ? JSON.parse(response) : response;
                        }
                    },
        			error: this.showError
        		})
        	}
        },
        create_publisher: function () {
        	return this.create('PUBLISHER', this.group_publishers);
        },
        get_publishers: function (callback) {
        	this.models = [];

        	this.group_publishers = new PublishersCollection();

        	this.group_publishers.url = '/cgs/rest/publishers/' + this.config.data.user.relatesTo.id + '/search?type=' + this.config.data.user.relatesTo.type;

        	this.group_publishers.fetch({
        		success: function (result) {
        			this.models = _.union(this.models, result.models);

        			callback.call(this, this.models);
        		}.bind(this),
        		converters: {
                    "text json": function (response) {
                        return response && response.length ? JSON.parse(response) : response;
                    }
                },
        		error: this.showError
        	})
        	return;
        },
		initTree: function () {
			this.get_publishers(function (data) {
				this.screen.components.tree.setItems(data, this.initStage, this, true);
			});
		},
		getCurrentModel: function () {
        	var model = null , collection = null, type = null, _sub_collection_url = null;

        	switch (this.model.data.type) {
        		case 'GROUP':
        			model = this.groups.get(parseInt(this.model.data.accountId));
        			collection = this.groups;
        			type = 'GROUP';
        			_sub_collection_url = "/cgs/rest/accounts/" + this.model.data.accountId + "/users/group?role=GROUP_ADMIN";
        		break;
        		case 'PUBLISHER':
        			model = this.group_publishers.get(parseInt(this.model.data.accountId));
        			collection = this.group_publishers;
        			type = 'PUBLISHER';
        			_sub_collection_url =  "/cgs/rest/accounts/" + this.model.data.accountId + "/users/publisher?role=ACCOUNT_ADMIN";
        		break;
        	}

        	return { model: model, collection: collection, relatesTo: {
        		type: type
        	}, _sub_collection_url: _sub_collection_url }
        },
		initStage: function (e, model) {
			this.view && this.view.dispose();
			this.view && this.view.remove();

			if (model) {
				this.model = model;
				require('events').fire('setMenuButtonState', 'menu-button-delete-publisher', 'enable');
			}
			else {
				this.model = null;
				require('events').fire('setMenuButtonState', 'menu-button-delete-publisher', 'disable');
			}

			this.get_model(function (data) {
				if (data) {
					this.view = new T2KGroupEditorView({
						model: { data: data },
						controller: this
					});
				}
			}.bind(this));
			
		},
		get_model: function (callback) {
			if (!this.model) {
				callback(null);
				return;
			}

			var _current_model = this.getCurrentModel();
			var model = _current_model.collection.get(parseInt(_current_model.model.get('accountId'), 10));
			var json_model = null;

			if (model) {

				this.users = new PublisherUsersCollection();
				this.users.url = _current_model._sub_collection_url;

				this.users.fetch({
					success: function (result) {
						json_model = model.toJSON();
						json_model.users = result.toJSON();

						callback(json_model);
					},
					converters: {
                        "text json": function (response) {
                            return response && response.length ? JSON.parse(response) : response;
                        }
                    },
					error: this.showError
				})
			}
		},
		save: function (item, callback) {
			var _current_model = this.getCurrentModel();
			var json_model = null;

			if (_current_model.model) {
				var _admin_user = new AdminUserModel(item);

				_admin_user.set("relatesTo", {
					id: this.model.data.accountId,
					type: this.model.data.type
				});

				_admin_user.url = "/cgs/rest/accounts/" + this.model.data.accountId + "/users";

				_admin_user.save({}, {
					success: function (model) {
						if (typeof callback == 'function') callback();

						_admin_user.set('userId', model.get('userId'));

						this.get_model(function (data) {
							this.initStage(null, { data:  data });
						}.bind(this));
						
					}.bind(this),
					converters: {
                        "text json": function (response) {
                            return response && response.length ? JSON.parse(response) : response;
                        }
                    },
					error: this.showError
				})
			}
		},
		update: function (_user_id, data) {
			var user = this.users.get(parseInt(_user_id, 10));

			if (user) {
				data.password = data.password || null;
				user.set(data);
				user.url = '/cgs/rest/accounts/' + this.model.data.accountId + '/users/' + _user_id;
				user.save(null, {
					success: function (model) {
						this.get_model(function (data) {
							this.initStage(null, { data:  data });
						}.bind(this));
					}.bind(this),
					converters: {
                        "text json": function (response) {
                            return response && response.length ? JSON.parse(response) : response;
                        }
                    },
					error: this.showError
				});
			}
		},
		// params = {publisherName, logLevel}
        update_model: function (params) {
			var _current_model = this.getCurrentModel();

			if (_current_model.model) {

				var prevName = _current_model.model.get('name');
                var customization = _current_model.model.get('customization');
                var prevLogLevel = customization.logLevel;
				var _type = _current_model.model.get('type');

				_current_model.model.unset("_id");
				_current_model.model.set('name', params.publisherName);
                customization.logLevel = params.logLevel;
                _current_model.model.set('customization', customization);
				_current_model.model.set("relatesTo", {
					'_id': this.config.data.user.relatesTo.id,
					'type': 'GROUP'
				});
				_current_model.model.unset('type');

				_current_model.model.save({ },{
					success: function () {
						_current_model.model.set('type', _type);
						this.initTree();
					}.bind(this),
					error: function(model, xhr) {
						_current_model.model.set('type', _type);
						_current_model.model.set('name', prevName);
                        customization.logLevel = prevLogLevel;
                        _current_model.model.set('customization', customization);

						this.initStage(null, { data:  _current_model.model.toJSON() });
						this.showError(model, xhr);
					}.bind(this),
					converters: {
                        "text json": function (response) {
                            return response && response.length ? JSON.parse(response) : response;
                        }
                    }
				})
			}
		},

		remove_user: function (_user_id) {
			var user = this.users.get(parseInt(_user_id, 10));

			if (user) {
				user.url = '/cgs/rest/accounts/' + this.model.data.accountId + '/users/' + _user_id;
				user.destroy({
					success: function (response) {
						this.get_model(function (data) {
							this.initStage(null, { data:  data });
						}.bind(this));
					}.bind(this),
					converters: {
                        "text json": function (response) {
                            return response && response.length ? JSON.parse(response) : response;
                        }
                    },
					error: this.showError
				});
			}
		},

		showError: function (model, xhr) {
			try {
				var error = JSON.parse(xhr.responseText);
				if (error) {
					showMessage.clientError.show(error);
				}
			}
			catch(e) {
				showMessage.clientError.show({});
			}
		}
	}, { type: 'T2KGroupEditor' });

	return T2KGroupEditor
});