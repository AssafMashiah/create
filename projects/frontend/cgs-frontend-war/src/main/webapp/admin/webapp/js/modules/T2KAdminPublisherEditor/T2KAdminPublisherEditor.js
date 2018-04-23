define(['lodash', 'BaseEditor', './config', 'admin_user_model', 'events', 'dialogs', 'publisher_model', 'publisher_collection',
		'publisher_user_collection', 'group_model',	'group_collection',	'./T2KAdminPublisherEditorView', 'backbone_super',
		'showMessage', 'standard_model', 'standards_collection', './T2KStandardsView', 'busyIndicator'],
	function (_, BaseEditor, config, AdminUserModel, events, dialogs, PublisherModel, PublisherCollection, PublisherUsersCollection,
			  GroupModel, GroupCollection, T2KAdminPublisherEditorView, Backbone, showMessage, StandardModel,
			  StandardsCollection, T2KStandardsView, busyIndicator) {

		var T2KAdminPublisherEditor = BaseEditor.extend({
			initialize: function (options) {
				this._super(options);

				this.screen.components.menu.setItems(config.menuConfig.menuItems, true, config.menuConfig.menuInitFocusId);

				this.initTree();

				this.registerEvents();

				this.getStandards();
			},
			
			registerEvents: function () {
				this.bindEvents({
					'new-publisher': {
						'type': 'register',
						'func': this.create_publisher,
						'ctx': this
					},
					'new-group': {
						'type': 'register',
						'func': this.create_group,
						'ctx': this
					},
					'delete-publisher': {
						'type': 'register',
						'func': this.delete_confirmation_dialog,
						'ctx': this
					},
					'show-standards': {
						'type': 'register',
						'func': this.show_standards_table,
						'ctx': this
					}
				});
			},

			// User Functions
			create: function (type, collection) {
				var _models = this.models;
				var _new_model = type === "GROUP" ? new GroupModel() : new PublisherModel();

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
			create_publisher: function () {
				return this.create('PUBLISHER', this.publishers);
			},
			create_group: function () {
				/*TODO: Implement Create Group*/
				return this.create('GROUP', this.groups);
			},
			getCurrentModel: function () {
				var model = null , collection = null, type = null, _sub_collection_url = null

				switch (this.model.data.type) {
					case 'GROUP':
						model = this.groups.get(parseInt(this.model.data.accountId));
						collection = this.groups;
						type = 'GROUP';
						_sub_collection_url = "/cgs/rest/accounts/" + this.model.data.accountId + "/users/group?role=GROUP_ADMIN";
						break;
					case 'PUBLISHER':
						model = this.publishers.get(parseInt(this.model.data.accountId));
						collection = this.publishers;
						type = 'PUBLISHER';
						_sub_collection_url =  "/cgs/rest/accounts/" + this.model.data.accountId + "/users/publisher?role=ACCOUNT_ADMIN";
						break;
				}

				return { model: model, collection: collection, relatesTo: {
					type: type
				}, _sub_collection_url: _sub_collection_url }
			},
			delete_confirmation_dialog: function(){
				var dialogConfig = {
					title: "Delete Publisher",
					content: {
						text: "Are you sure you want to delete this publisher?",
						icon: 'warn'
					},
					buttons: {
						"delete": { label: 'Delete' },
						"cancel": { label: 'Cancel' }
					}
				};

				events.once('onDeleteResponse', function (response) {
					this.onDeleteResponse(response);
				}, this);

				var dialog = dialogs.create('simple', dialogConfig, 'onDeleteResponse');
			},
			onDeleteResponse: function (response) {

				switch (response) {

					case 'cancel' :

						break;

					case 'delete' :

						this.delete_model();

						break;
				}
				amplitude.logEvent('Delete Conformation', {
					userDecision: response
				});
			},
			delete_model: function() {
				var _current_model = this.getCurrentModel();

				if (_current_model.model) {
					_current_model.model.url = _current_model.collection.url + '/' + _current_model.model.get('accountId');
					_current_model.model.destroy({
						success: function(model) {
							this.initTree();
							this.initStage();
						}.bind(this),
						error: this.showError,
						converters: {
							"text json": function (response) {
								return response && response.length ? JSON.parse(response) : response;
							}
						}
					})
				}
			},
			get_models: function (callback) {
				this.publishers = new PublisherCollection();
				this.groups = new GroupCollection();
				this.models = [];

				this.publishers.fetch({
					url: "/cgs/rest/publishers/-1/search?type=SUPER_USER",
					error: this.showError,
					success: function (result) {
						this.models = _.union(this.models, result.models);

						this.models.forEach(function (model) {
							model.set("type", "PUBLISHER");
						});

						this.groups.fetch({
							success: function (result) {
								var _group_models = result.models;

								_group_models.forEach(function (model) {
									model.set("type", "GROUP");
								});

								this.models = _.union(this.models, _group_models);
								callback.call(this, this.models);
							}.bind(this),
							error: this.showError,
							converters: {
								"text json": function (response) {
									return response && response.length ? JSON.parse(response) : response;
								}
							}
						});
					}.bind(this)
				});
			},
			initTree: function () {
				this.get_models(function (data) {
					this.screen.components.tree.setItems(data, this.initStage, this, true);
				});
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
						this.view = new T2KAdminPublisherEditorView({
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
						error: this.showError,
						converters: {
							"text json": function (response) {
								return response && response.length ? JSON.parse(response) : response;
							}
						}
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
						error: this.showError,
						converters: {
							"text json": function (response) {
								return response && response.length ? JSON.parse(response) : response;
							}
						}
					})
				}
			},
			update: function (_user_id, data) {
				var user = this.users.get(parseInt(_user_id, 10));

				if (user) {
					data.password = data.password || null;
					user.set(data);
					user.url = '/cgs/rest/accounts/' + this.model.data.accountId + '/users/' + _user_id + "?roleId=" + user.get("role").id;

					user.unset("role");

					user.save(null, {
						success: function (model) {
							this.get_model(function (data) {
								this.initStage(null, { data:  data });
							}.bind(this));
						}.bind(this),
						error: this.showError,
						converters: {
							"text json": function (response) {
								return response && response.length ? JSON.parse(response) : response;
							}
						}
					});
				}
			},
			// params = {publisherName, isSecured, logLevel, renderTree}
			update_model: function (params) {
				var _current_model = this.getCurrentModel();

				if (_current_model.model) {

					var prevName = _current_model.model.get('name');
					var customization = _current_model.model.get('customization');
					var prevLogLevel = customization.logLevel;
					var _type = _current_model.model.get('type');

					_current_model.model.unset("_id");

					_current_model.model.set('name', params.publisherName);
					_current_model.model.set('accountMode', params.accountMode);					
					var new_customization = {
						isSecured: params.isSecured,
						enableDiffLevels: params.enableDiffLevels,
						enableAssessment: params.enableAssessment,
						enableBookAlive: params.enableBookAlive,
						enableBornDigital: params.enableBornDigital,
						enableEpubConversion: params.enableEpubConversion,
						ePubConversionConfDelay: params.ePubConversionConfDelay
					};

					new_customization = $.extend(true, new_customization, params.customization);
					_current_model.model.set('customization', $.extend(true, customization, new_customization));
					_current_model.model.set('fileSizeLimits', params.fileSizeLimits);
					_current_model.model.set("relatesTo", {
						'_id': -1,
						'type': 'SUPER_USER'
					});
					_current_model.model.unset('type');


					_current_model.model.save({ },{
						wait: true, // We do this because the convertors option is not a valid backbone option and causes this object to merge with the model
						success: function () {
							_current_model.model.set('type', _type)
							if(params.renderTree){
								this.initTree();
							}
						}.bind(this),
						error: function(model, xhr) {
							_current_model.model.set('type', _type)
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
						error: this.showError,
						converters: {
							"text json": function (response) {
								return response && response.length ? JSON.parse(response) : response;
							}
						}
					});
				}
			},

			// Standards Functions
			show_standards_table: function (self) {
				self = self ? self : this;
				self.view && self.view.dispose();
				self.view && self.view.remove();
				require('events').fire('setMenuButtonState', 'menu-button-delete-publisher', 'disable');

				self.view = new T2KStandardsView({
					model: { data: self.standardData },
					controller: self
				});
			},
			getStandards: function (callback) {
				this.standards = new StandardsCollection();
				this.standardData;

				this.standards.fetch({
					url: "/cgs/rest/standards",
					error: this.showError,
					success: function (result) {
						this.standardData = result.toJSON();
						if(callback && _.isFunction(callback)) {
							callback(this);
						}
					}.bind(this)
				});
			},
			save_standard: function (item, file) {
				var self = this;
				var formData = new FormData();
				var xhr = new XMLHttpRequest();

				var errorMsg = {
					title: "Invalid Arguments",
					message: ""
				};

				if (!file) {
					errorMsg.message = "- No standard package file was chosen. Please choose a standard package file.<br>"
				}
				if (!file.name.endsWith(".txt")) {
					errorMsg.message = "- Wrong standards package file type - only *.txt files are allowed.<br>"
				}
				if (!item.name) {
					errorMsg.message = errorMsg.message + "- No name was given to the standard package. Please give a standard package name.<br>"
				}
				if (!item.subjectArea) {
					errorMsg.message = errorMsg.message + "- No subjectArea was given to the standard package. Please give a standard package subjectArea.<br>"
				}
				if (!item.version) {
					errorMsg.message = errorMsg.message + "- No version was defined for the standard package. Please define a standard package version.<br>"
				}
				if (errorMsg.message) {
					showMessage.clientError.show(errorMsg);
					return;
				}

				formData.append("file", file);
				formData.append("data", JSON.stringify(item));

				xhr.onload = function(){
					busyIndicator.stop('all');
					if (this.status == 200) {
						self.getStandards(self.show_standards_table);
					} else {
						var error = JSON.parse(xhr.responseText);
						error.message = error.data;
						error.data = null;
						error.title = "Standards Package Processing Error";
						error.responseText = JSON.stringify(error);
						self.showError(null, error);
					}
				};

				xhr.onerror = this.showError;

				xhr.upload.onprogress = function(ev) {
					if (ev.lengthComputable) {
						busyIndicator.setData('Uploading your standard package...', ev.loaded / ev.total * 100);
					}
				}

				xhr.open("POST", "/cgs/rest/standards");
				xhr.send(formData);
				busyIndicator.start();
			},
			remove_standard: function (_standard_id) {
				var standard = this.standards.get(_standard_id);
				var self = this;
				var xhr = new XMLHttpRequest();

				if (standard) {
					standard.url = '/cgs/rest/standards?name=' + standard.get("name") + '&subjectArea=' + standard.get("subjectArea");

					xhr.onload = function() {
						busyIndicator.stop('all');
						if (this.status == 200) {
							if (this.response) {
								var dialogConfig = {
									title: "Courses Contains Standard Package",
									data: JSON.parse(this.response),
									buttons:{
										'yes': { label:'OK', value: true }
									}
								};

								require('dialogs').create('standardError', dialogConfig, '');
							}

							self.getStandards(self.show_standards_table);
						} else {
							self.showError(null, xhr);
						}
					};

					xhr.upload.onprogress = function(ev) {
						if (ev.lengthComputable) {
							busyIndicator.setData('Deleting your standard package...', ev.loaded / ev.total * 100);
						}
					}

					xhr.open("DELETE", standard.url);
					xhr.send();
					busyIndicator.start();
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
		}, { type: 'T2KAdminPublisherEditor' });

		return T2KAdminPublisherEditor
	});