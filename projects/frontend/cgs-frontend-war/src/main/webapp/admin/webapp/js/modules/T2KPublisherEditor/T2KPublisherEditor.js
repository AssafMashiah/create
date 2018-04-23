define(['lodash', 'BaseEditor', './config', 'publisher_user_collection', 'roles_collection', 'admin_user_model', 'publisher_model', 'providers_collection', './T2KPublisherEditorView', 'showMessage'],
    function (_, BaseEditor, config, PublisherUsersCollection, RolesCollection, AdminUserModel, PublisherModel, ProvidersCollection, T2KPublisherEditorView, showMessage) {
        var T2KPublisherEditor = BaseEditor.extend({
            initialize: function (options) {
                this._super(options);

                this.screen.components.menu.setItems(config.menuConfig.menuItems, true, config.menuConfig.menuInitFocusId);

                this.options = options;
                this.isEnableMediaEncoding = false;

                this.getData(options.data.user.userId, function (data) {
                    this.initStage();
                }.bind(this));

                this.initTree();

                this.bindEvents({
                    'show-users': {
                        'type': 'register',
                        'func': $.noop,
                        'ctx': this
                    }
                });

                this.getCourses();

            },
            getProviders: function () {
                return this.providers.toJSON();
            },
            removeCourse: function (id) {
                require('busyIndicator').start();
                var model = this.courses.get(id);

                model.url = model.getUrl(this.config.data.user.relatesTo.id);

                model.destroy({
                    success: function () {
                        this.getData(this.options.data.user.userId, function (data) {
                            require('busyIndicator').stop();
                            this.initStage();
                            this.view.setActiveTab('#T2KCourses');
                        }.bind(this));
                    }.bind(this),
                    error: function (model, xmlHttpResponse) {
                        var _json_response;

                        require('busyIndicator').stop();

                        this.courses.add(model);

                        try {
                            _json_response = JSON.parse(xmlHttpResponse.responseText);
                        } catch (e) {
                            throw new TypeError("error: response is not a valid json format");
                        }

                        if (_json_response.httpStatus === "LOCKED") {
                            this.view.showLockingDialog(_json_response.data);
                        }
                    }.bind(this),
                    converters: {
                        "text json": function (response) {
                            return response && response.length ? JSON.parse(response) : response;
                        }
                    }
                })

                console.log(model)
            },
            getCourses: function (callback) {
                require(['courses_collection'], function (_collection) {
                    var _instance_collection = new _collection();

                    _instance_collection.url = _instance_collection.getUrl(this.config.data.user.relatesTo.id);
                    _instance_collection.fetch({
                        success: function (model) {
                            _.each(model.models, function (model) {
                                model.set('basePath', this.options.data.configuration.cmsBasePath + '/publishers/' + this.config.data.user.relatesTo.id + '/courses/');
                            }, this)

                            this.courses = model;

                            if (callback) {

                                callback();
                            }
                        }.bind(this),
                        error: this.showError,
                        converters: {
                            "text json": function (response) {
                                return response && response.length ? JSON.parse(response) : response;
                            }
                        }
                        
                    });
                }.bind(this));

            },
            getRoles: function (callback) {
                this.roles = new RolesCollection();

                this.roles.url = '/cgs/rest/accounts/' + this.config.data.user.relatesTo.id + '/users/roles?type=' + this.config.data.user.relatesTo.type;
                this.roles.fetch({
                    success: function (model, response, options) {
                        callback();
                    }.bind(this),
                    converters: {
                        "text json": function (response) {
                            return response && response.length ? JSON.parse(response) : response;
                        }
                    }
                })
            },
            getData: function (accountId, callback) {

                this.publisher = new PublisherModel();

                this.publisher.clear();

                this.publisher.set('accountId', this.config.data.user.relatesTo.id);

                this.providers = new ProvidersCollection();

                this.providers.fetch({
                    success: function (model) {
                        return;
                    }
                });

                this.getRoles(function () {
                    this.publisher.fetch({
                        success: function(model, response, options) {
                            this.publisher = new PublisherModel(_.find(model.attributes, function(pub) { return pub && pub.accountId == this.publisher.get('accountId') }, this));

                            // Ask server if media encoding service is available
                            var url = "/cgs/rest/publishers/{0}/mediaTranscodingServiceEnabled".format(
                                this.publisher.get('accountId')
                            );
                            $.ajax({
                              url: url,
                              method: "GET"
                            }).done(function(response) {
                                this.isEnableMediaEncoding = response || false;

                                // Fetch users
                                this.users = new PublisherUsersCollection();
                                this.users.url = '/cgs/rest/accounts/' + this.config.data.user.relatesTo.id + '/users/publisher';
                                this.users.fetch({
                                    success: function(model, response, options) {
                                        this.getCourses(callback);
                                    }.bind(this),
                                    error: this.showError
                                });

                            }.bind(this));
                        }.bind(this),
                        converters: {
                            "text json": function (response) {
                                return response && response.length ? JSON.parse(response) : response;
                            }
                        }
                    })
                }.bind(this))
            },
            initStage: function () {
                if (this.view && typeof this.view.dispose == 'function') {
                    this.view.dispose();
                }


                this.view = new T2KPublisherEditorView({
                    model: {
                        users: this.users.toJSON(),
                        publisher: this.publisher.toJSON(),
                        availibleRoles: this.roles.toJSON(),
                        courses: this.courses.toJSON()
                    },
                    controller: this,
                    isEnableMediaEncoding: this.isEnableMediaEncoding
                });
            },
            initTree: function () {
                this.screen.components.tree.setItems({}, this.initStage, this);
            },
            updateModel: function (model, key, value) {

                if (~key.indexOf('.')) {
                    var _slice = key.split('.'),
                        _lastKey = _slice[_slice.length-1],
                        _main_key = _slice.shift(),
                        modelObj = this[model].get(_main_key);


                    
                    _slice.splice(_slice.length-1, 1);

                    var _currentKey = {}, _currentRef = modelObj;
                 
                    _.each(_slice, function (k) {
                        if(!_currentRef[k]){
                            _currentRef[k] ={};
                        }
                        _currentRef = _currentRef[k];

                    });

                    _currentRef[_lastKey] = value;

                    this[model] && this[model].set(_main_key, modelObj);
                } else {
                    this[model] && this[model].set(key, value);
                }

                this[model].save(null, {
                        error: this.showError,
                        converters: {
                            "text json": function (response) {
                                return response && response.length ? JSON.parse(response) : response;
                            }
                        }
                    });
            },
            saveUser: function (user, roleId, onSuccess) {
                var id = 1,
                    publisherUser;

                if (user.id) {
                    //update
                    publisherUser = this.users.get(user.id);
                    publisherUser.url = '/cgs/rest/accounts/' + this.publisher.get('accountId') + '/users/' + user.id + '?roleId=' + roleId;

                    if (publisherUser) {
                        publisherUser.set({
                            firstName: "dummy",
                            lastName: "dummy",
                            username: user.username,
                            email: user.email,
                            password: user.password === "" ? null : user.password,
                            'customization' : user.customization
                        });

                        publisherUser.unset("role");
                    }
                }
                else {
                    publisherUser = new AdminUserModel({
                        'firstName': "dummy",
                        'lastName': "dummy",
                        'username': user.username,
                        'email': user.email,
                        'password': user.password,
                        'relatesTo': {
                            'id': this.config.data.user.relatesTo.id,
                            'type': this.config.data.user.relatesTo.type
                        },
                        'customization' : user.customization
                    });
                    publisherUser.url = '/cgs/rest/accounts/' + this.publisher.get('accountId') + '/users?roleId=' + roleId;
                }

                publisherUser.save(null, {
                    success: function(model, response, options) {
                        publisherUser.unset("password");
                        publisherUser.set("role", this.roles.find(function (model) {
                            return model.get("id") === roleId;
                        }).toJSON());

                        this.users.add(publisherUser);

                        this.initStage();

                        if (onSuccess) {
                            onSuccess.call();
                        }
                    }.bind(this),
                    converters: {
                        "text json": function (response) {
                            return response && response.length ? JSON.parse(response) : response;
                        }
                    },
                    error: this.showError
                });
            },
            removeUser: function(id) {
                var user = this.users.get(id);
                if (user) {
                    user.url = '/cgs/rest/accounts/' + this.publisher.get('accountId') + '/users/' + id;

                    user.destroy({
                        success: function(model, response, options) {
                            this.initStage();
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
            readCustomFontFile: function(file, type) {
                require('busyIndicator').start();
                var url = "/cgs/rest/publishers/" + this.config.data.user.relatesTo.id + "/addCustomFontFile/";
                var formData = new FormData();
                formData.append('multiPartFile', file);
                $.ajax({
                    url: url + type,
                    method: "POST",
                    data: formData,
                    cache: false,
                    processData: false, 
                    contentType: false
                }).done(function(data, textStatus, jqXHR) {
                    if (data.objectCreated) {
                        addCustomIconToPublisherModel(data.objectCreated, this.publisher);
                        this.initStage();
                        this.view.setActiveTab('#T2KSettings');
                    } else {
                        handleErrors(null);
                    }
                }.bind(this)).fail(function(data, textStatus, jqXHR) {
                    handleErrors(data.responseJSON);
                }.bind(this)).always(function() {
                    require('busyIndicator').stop();
                });
                function addCustomIconToPublisherModel(data, publisher) {
                    if (typeof publisher.attributes.customization.customIconsPacks == "undefined") {
                        publisher.attributes.customization.customIconsPacks = [];
                    }
                    var customIconsModel = publisher.attributes.customization.customIconsPacks;
                    if (customIconsModel.length) {
                        for (var i = 0; i < customIconsModel.length; i++) {
                            if (customIconsModel[i].type == data.type) {
                                customIconsModel[i] = data;
                                break;
                            } else if (customIconsModel.length - 1 == i) {
                                customIconsModel.push(data);
                            }
                        }
                    } else {
                        customIconsModel.push(data);
                    }
                }
                function handleErrors(data) {
                    var errorStack = {
                        errorId: 4000,
                        data: ["bookaliveCustomization.title"]
                    };
                    if (data && data.errors && data.errors.substr(0, 12) == "CUSTOM_ERROR") {
                        var serverErrors = data.errors.split(',');
                        _.each(serverErrors.slice(1, serverErrors.length), function (err) {
                           errorStack.data.push(err.trim());
                        }, this);
                    } else {
                        errorStack.data = ["bookaliveCustomization.internalError"];
                    }
                    showMessage.clientError.show(errorStack);
                }
            },
            showError: function (model, xhr) {
                require('busyIndicator').stop(true);
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
        },{ type: 'T2KPublisherEditor' });

        return T2KPublisherEditor
    });