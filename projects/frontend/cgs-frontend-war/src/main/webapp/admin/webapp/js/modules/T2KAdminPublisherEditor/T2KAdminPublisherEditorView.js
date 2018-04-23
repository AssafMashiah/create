define(['lodash', 'BaseView', 'events', 'externalAccountsComponent',
		'components/customProperties/customProperties',
		'text!./templates/T2KAdminPublisherEditorView.html', 'bootstrap_tables'],
	function (_, BaseView, events, externalAccountsComponent, customProperties, template) {

		var T2KAdminPublisherEditorView = BaseView.extend({
			el: "#editor_base",

			events: {
				'click #tabs li a': 'handleTabClick',
			},

			initialize: function (options) {
				this.item = options.model;

				this._super();
			},
			handleTabClick: function (e) {

				$("#tabs").children().each(function () {
					$($(this).find('a').attr('href')).addClass('unactive');
				});

				var _target_view = $(e.currentTarget).attr('href');

				$(_target_view).removeClass('unactive').addClass('active');
			},
			render: function () {
				this.logLevels = _.toArray(require('consts').logLevels);
				this.maxFileSize = AuthenticationData.configuration.maxFileSize / 1024 / 1024;
				this.fileSizeLimits = _.compact(_.map(this.item.data.fileSizeLimits, function (limit) {
					if (!_.isString(limit.type)) return;
					return {
						key: limit.type,
						name: limit.type.substr(0, 1).toUpperCase() + limit.type.substr(1),
						size: Math.round(limit.size / 1048576)
					}
				}));

				this.elementsLimit = [
					{
						name: 'Max Embedded Interaction Per Page',
						key: 'maxEmbeddedInteractionsOnPage',
						value: this.item.data.elementsLimit.maxEmbeddedInteractionsOnPage
					},
					{
						name: 'Max eBook Pages',
						key: 'maxEBookPages',
						value: this.item.data.elementsLimit.maxEBookPages
					}
				];

				this.showPublishToUrlConfigurationsInAdmin = AuthenticationData.configuration.showPublishToUrlConfigurationsInAdmin;

				this.pdfConversionLibreries = AuthenticationData.configuration.availablePdfConverters;
				this.accountModes = AuthenticationData.configuration.accountModes;

				this._super(template);

				this.$('#logLevel').val(this.item.data.customization.logLevel);
				this.$('#accountMode').val(this.item.data.accountMode);
				this.$('#contentLocales').val(this.item.data.contentLocales.selected);
				this.$('#interfaceLocales').val(this.item.data.interfaceLocales.selected);
				this.$('#pdfConversionLibrary').val(this.item.data.customization.pdfConversionLibrary);


				var publishSettings = this.model.data.customization.publishSettings;
				var publishCourseSettings = publishSettings.courses;
				var publishLessonSettings = publishSettings.lessons;

				var $T2KPublisherPublish = this.$('#T2KPublisherPublish');
				$T2KPublisherPublish.find('#publishCourseToFile').attr('checked', publishCourseSettings ? publishCourseSettings.enablePublishToFile : false);
				$T2KPublisherPublish.find('#publishCourseToCatalog').attr('checked', publishCourseSettings ? publishCourseSettings.enablePublishToCatalog : false);
				$T2KPublisherPublish.find('#publishLessonToFile').attr('checked', publishLessonSettings ? publishLessonSettings.enablePublishToFile : false);
				$T2KPublisherPublish.find('#publishLessonToCatalog').attr('checked', publishLessonSettings ? publishLessonSettings.enablePublishToCatalog : false);
				$T2KPublisherPublish.find('#enableCourseLevelsCustomizationForScorm').attr('checked', publishLessonSettings ? publishLessonSettings.enableCourseLevelsCustomizationForScorm : false);
				$T2KPublisherPublish.find('#enableDemoPublishView').attr('checked', !!this.model.data.customization.enableDemoPublishView);
				$T2KPublisherPublish.find('#publishLessonToUrl').attr('checked', publishLessonSettings ? publishLessonSettings.enablePublishToUrl : false);
				$T2KPublisherPublish.find('#publishCourseToUrl').attr('checked', publishLessonSettings ? publishCourseSettings.enablePublishToUrl : false);
				$T2KPublisherPublish.find('#enableSampleCourse').attr('checked', !!this.model.data.customization.enableSampleCourse);
				$T2KPublisherPublish.find('#publishPlayServer').val(publishSettings ? publishSettings.publishPlayServerUrl : '');
				$T2KPublisherPublish.find('#publishUploadServer').val(publishSettings ? publishSettings.publishUploadServerUrl : '');


				this.$('#accounts-table').dataTable({
					"sPaginationType": "bootstrap",
					"bPaginate": false,
					"bLengthChange": false,
					"bFilter": true,
					"bInfo": false
				});

				var self = this;

				this.$("#accounts-table").find("tbody").find("tr").click(function (e) {
					self.$("#accounts-table").find("td.selected").removeClass("selected");

					self.$(this).find("td").addClass("selected");
				});

				this.initExternalAcounts();
				this.initCustomProperties();
				
				this.$("#accounts-table").find("thead").find("tr").children().last().removeClass("sorting");

				this.$("#form-add-user").css("display", "none");

				$("a[href='#T2KPublisherEditor']").tab('show');

				this.register_view_events();
			},
			initExternalAcounts: function() {
				new externalAccountsComponent({
					accountId: this.model.data.accountId,
					container: this.$('.externalAccounts')
				});
			},
			initCustomProperties: function(){
				var data =
					[
						{
							'name' :'Subject Area',
							'dataType' : 'subjectAreas',
							'value': this.model.data.subjectAreas
						},
						{
							'name' :'Grade Level',
							'dataType':'gradeLevels',
							'value': this.model.data.gradeLevels
						}
					];

				var customPropertiesComponent = new customProperties({
					el: $("#customPropertiesComponent"),
					data: data,
					updateCallback: function (dataType, newData) {
						this.update_publisher.call(this);
					}.bind(this)
				});
			},			
			register_view_events: function () {
				this.$el.children().off();

				this.$("#publisher_name").bind('blur', this.update_publisher.bind(this, true));
				this.$("#accountMode").bind('change', this.update_publisher.bind(this, true));

				this.$("#publisher_secured").bind('change', this.update_publisher.bind(this));
				this.$("#logLevel").bind('change', this.update_publisher.bind(this));
				this.$("#contentLocales").bind('change', this.update_publisher.bind(this));
				this.$("#interfaceLocales").bind('change', this.update_publisher.bind(this));
				this.$("#pdfConversionLibrary").bind('change', this.update_publisher.bind(this));

				this.$('input.size-input').change(this.update_publisher.bind(this));
				this.$('input.element-limit-input').change(this.update_publisher.bind(this));

				this.$("#save-user").bind('click', this.save_user.bind(this));
				this.$("#add-new-user").one('click', this.new_user);

				this.$(".edit-user.btn").one('click', this.edit_user.bind(this));
				this.$(".remove_user.btn").bind('click', this.remove_user.bind(this));

				//feature flags
				$T2KPublisherFeatures = this.$el.find("#T2KPublisherFeatures");
				$T2KPublisherFeatures.children().children('INPUT').bind('change', this.update_publisher.bind(this, true));
				
				//publish
				$T2KPublisherPublish = this.$el.find("#T2KPublisherPublish");
				$T2KPublisherPublish.find('INPUT').bind('change', this.update_publisher.bind(this, true));

				//ePubConversion
				this.$("input#enableEpubConversion").bind('change', this.update_publisher.bind(this, true));
				this.$("input#ePubConversionConfDelay").bind('change', this.update_publisher.bind(this, true));
			},

			new_user: function () {
				var _form = $("#form-add-user");

				if (!_form.is("display")) {
					_form.show();

					$(this).attr('disabled', true);

					$(".edit-user").attr("disabled", true);
				}
				$(".remove_user").attr("disabled", true);
			},
			save_user: function () {
				this.controller.save({
					'firstName': "dummy",
					'lastName': "dummy",
					'username': this.$("#account_username").val(),
					'email': this.$("#account_email").val(),
					'password': this.$("#account_password").val(),
					'customization': {
						'cgsHintsShowMode': "showAll"
					}
				}, function () {
					this.$("#form-add-user").hide();

					this.$("#add-new-user").attr('disabled', false);
					this.$(".edit-user").attr("disabled", false);
					this.$(".remove_user , .edit-user").attr("disabled", false);
				}.bind(this));
			},
			edit_user: function (e) {
				var _row_container = $(e.target).parents('tr');
				var _user_id = _row_container.attr('model-id');
				var _model_data = this.controller.users.get(parseInt(_user_id)).toJSON();
				var _form = $("#form-add-user").clone();


				this.$("#form-add-user").remove();
				this.$("#add-new-user").attr('disabled', true);

				_form.find("#account_username").attr('value', _model_data.username);
				_form.find("#account_username").attr("disabled", true);

				_form.find("#account_password").attr('value', _model_data.password);
				_form.find("#account_email").attr('value', _model_data.email);

				_row_container.empty();
				_row_container.append(_form.find('tr').html());

				_row_container.find("#save-user").bind("click", function (e) {
					this.controller.update(_user_id, {
						'firstName': "dummy",
						'lastName': "dummy",
						'username': this.$("#account_username").val(),
						'email': this.$("#account_email").val(),
						'password': this.$("#account_password").val(),
						'customization': {
							'cgsHintsShowMode': "showAll"
						}
					});
				}.bind(this))

				_row_container.find(".remove_user.btn").one('click', this.remove_user.bind(this));
				this.$(".remove_user, .edit-user").attr("disabled", true);
			},
			remove_user: function (e) {
				var _row_container = $(e.target).parents('tr');
				var _user_id = _row_container.attr('model-id');

				var dialogConfig = {
					title: "Delete User",
					content: {
						text: "You are about to delete the user, are you sure?",
						icon: 'warn'
					},
					buttons: {
						'yes': {label: 'OK', value: true},
						'cancel': {label: 'Cancel', value: false}
					}
				};

				if (_user_id) {
					events.once('onUserDialogClose', function (val) {
						if (val) {
							this.controller.remove_user(parseInt(_user_id, 10));
						}
					}, this);

					require('dialogs').create('simple', dialogConfig, 'onUserDialogClose');
				}
			},
			update_publisher: function (renderTree, e) {
				var self = this;
				this.$('input.size-input').each(function () {
					var val = parseInt($(this).val()),
						max = parseInt($(this).attr('max')),
						min = parseInt($(this).attr('min'));
					if (val > max) {
						$(this).val(val = max);
					}
					else if (val < min) {
						$(this).val(val = min);
					}

					var limit = _.find(self.item.data.fileSizeLimits, {"type": $(this).attr('size-key')});
					if (limit) {
						limit.size = val * 1048576;
					}
				});

				this.$('input.element-limit-input').each(function () {
					var val = parseInt($(this).val());
					var min = parseInt($(this).attr('min'));
					var key = $(this).attr('limit-key');
					if (isNaN(val) || val < min) {
						$(this).val(val = min);
					}
					self.item.data.elementsLimit[key] = val;
				});

				this.item.data.accountMode = this.$("#accountMode").val();				
				this.item.data.contentLocales.selected = this.$("#contentLocales").val();
				this.item.data.interfaceLocales.selected = this.$("#interfaceLocales").val();
				this.item.data.customization.pdfConversionLibrary = this.$("#pdfConversionLibrary").val();
				this.item.data.customization.ePubConversionConfDelay = parseInt(this.$("#ePubConversionConfDelay").val());

				var model = {};
				model['customization'] = {};

				$T2KPublisherFeatures.children().children('INPUT[type="checkbox"]').map(function (index, inp_elm) {
					return model['customization'][inp_elm.id] = !!self.$("#" + inp_elm.id + ":checked").length
				});

				function assign(obj, keyPath, value) {
					lastKeyIndex = keyPath.length-1;
					for (var i = 0; i < lastKeyIndex; ++ i) {
						key = keyPath[i];
						if (!(key in obj))
							obj[key] = {}
						obj = obj[key];
					}
					obj[keyPath[lastKeyIndex]] = value;
				}

				//update model by model-key html attribute of checkboxes
				var currModel = null, arr_keys = [], modelValue = null, modelKey = null;
				$T2KPublisherPublish.find('INPUT').map(function (index, inp_elm) {
					if(inp_elm.getAttribute('model') && inp_elm.getAttribute('model-key')) {
						currModel = inp_elm.getAttribute('model');
						//create new json level
						if(model[currModel] == null) {
							model[currModel] = {};
						}
						//set json value
						// model[currModel][inp_elm.getAttribute('model-key')] = !!inp_elm.checked;
						var pathArr = inp_elm.getAttribute('model-key').split('.');

						switch (inp_elm && inp_elm.type.toLowerCase()) {
							case 'checkbox':
								assign(model[currModel], pathArr, !!inp_elm.checked);
								break;
							case 'text':
								assign(model[currModel], pathArr, inp_elm.value);
								break;

						}

					}
				});

				model = $.extend(true, model, {
					publisherName: this.$("#publisher_name").val(),
					accountMode: this.$("#accountMode").val(),
					isSecured: !!this.$("#publisher_secured:checked").length,
					logLevel: this.$("#logLevel").val(),
					contentLocales: this.item.data.contentLocales,
					interfaceLocales: this.item.data.interfaceLocales,
					pdfConversionLibrary: this.item.data.customization.pdfConversionLibrary,
					fileSizeLimits: this.item.data.fileSizeLimits,
					elementsLimit: this.item.data.elementsLimit,
					enableDiffLevels: !!this.$("#enableDiffLevels:checked").length,
					enableAssessment: !!this.$("#enableAssessment:checked").length,
					enableBookAlive: !!this.$("#enableBookAlive:checked").length,
					enableBornDigital: !!this.$("#enableBornDigital:checked").length,
					enableEpubConversion: !!this.$("#enableEpubConversion:checked").length,
					ePubConversionConfDelay: this.item.data.customization.ePubConversionConfDelay,

					renderTree: _.isBoolean(renderTree) ? renderTree : null
				});

				this.controller.update_model(model);
			},
			dispose: function () {
				this.$(".remove_user.btn").unbind('click');
				this._super();
			}
		});

		return T2KAdminPublisherEditorView;
	});