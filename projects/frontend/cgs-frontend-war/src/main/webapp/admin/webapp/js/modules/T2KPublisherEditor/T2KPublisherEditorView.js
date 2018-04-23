define(['lodash',  'BaseView', 'events',
		'components/customMetadataTable/customMetadata', 'components/customMetadataPackagesTable/customMetadataPackages',
	    'components/customProperties/customProperties', 'text!./templates/T2KPublisherEditorView.html',
	    'tts_list_component', 'bundlesManager', 'moment'],
	function (_,  BaseView, events,
			  customMetaData, customMetadataPackages, customProperties,
			  template, tts_list_component, BundlesManager, moment) {
		var T2KPublisherEditorView = BaseView.extend({
			events: {
				'click #add-new-user': 'new_user',
				'click .edit-user': 'updateUser',
				'click .remove-user': 'removeUser',
				'click #tabs li a': 'handleTabClick',
				'click .remove_course': 'removeCourse',
				'change #T2KSettings #content_language': 'update',
				'change #T2KSettings #interface_language': 'update',
				'change #T2KSettings #default_sequence_exposure': 'update',
				'change #T2KSettings #pdfConversionLibrary': 'update',
				'change #T2KSettings .flagRow input[type="checkbox"]': 'update',
				"click #T2KSettings #uploadFontForPlayer": "uploadFontForPlayer",
				"change #T2KSettings #chooseFontForPlayer": "chooseFontForPlayer",
				"click #T2KSettings #uploadFontForEnrichements": "uploadFontForEnrichements",
				"change #T2KSettings #chooseFontForEnrichements": "chooseFontForEnrichements"
			},
			initialize: function (options) {
				this.model = options.model;
				this.isEnableMediaEncoding = options.isEnableMediaEncoding || false;

				this._super();
			},
			components: {
				"bundles": function () {
					return new BundlesManager(this.controller.config.data.user.relatesTo.id);
				}
			},
			update: function (e) {
				var _values_handlers = {
						'SELECT': function () {
							var _el = $(this).find('option:selected');
							return {
								_model_update : _el.attr('model'),
								_model_key : _el.attr('model-key'),
								_model_value : _el.attr('model-value')
							};
						},
						'checkbox' : function(){
							var _el = $(this);
							return {
								_model_update : _el.attr('model'),
								_model_key : _el.attr('model-key'),
								_model_value : _el.is(':checked')? true : false
							};

						},
						'text' : function(){
							var _el = $(this);

							return {
								_model_update : _el.attr('model'),
								_model_key : _el.attr('model-key'),
								_model_value : _el.attr('model-value')
							};
						}
					},

					getHandlerType = function (e){
						var nodeName = e.currentTarget.nodeName;
						if(nodeName == 'INPUT'){
							return e.currentTarget.type;
						}
						return nodeName;
					},


					_handler_val = _values_handlers[getHandlerType(e)],
					_el,
					_model_update, _model_key, _model_value;

				if (_.isFunction(_handler_val)) {
					modelData = _handler_val.call(e.currentTarget);

					this.controller.updateModel(modelData._model_update, modelData._model_key, modelData._model_value);
				}

			},

			setConfiguration: function () {
				var $T2kSettings = $("#T2KSettings");
				$T2kSettings.find('#content_language option[model-value="' + this.model.publisher.contentLocales.selected + '"]').attr('selected', true);
				$T2kSettings.find('#interface_language option[model-value="' + this.model.publisher.interfaceLocales.selected + '"]').attr('selected', true);
				$T2kSettings.find('#default_sequence_exposure option[model-value="' + this.model.publisher.sequenceExposureDefault.selected + '"]').attr('selected', true);
				$T2kSettings.find('#pdfConversionLibrary option[model-value="' + this.model.publisher.customization.pdfConversionLibrary + '"]').attr('selected', true);
				$T2kSettings.find('#enablePdfConversionLibrarySelection').attr('checked', this.model.publisher.customization.enablePdfConversionLibrarySelection);
				$T2kSettings.find('#enableFullSpellChecker').attr('checked', this.model.publisher.customization.enableFullSpellChecker);
				$T2kSettings.find('#enableDemoPublishView').attr('checked', this.model.publisher.customization.enableDemoPublishView);
				$T2kSettings.find('#enableSampleCourse').attr('checked', this.model.publisher.customization.enableSampleCourse);
				$T2kSettings.find('#enableLo').attr('checked', this.model.publisher.customization.enableLearningObjects);

			},

			translate:  function() {
				return function(text) {
					switch(text) {
						case 'all_exposed': return "All tasks appear at once";
						case 'one_by_one': return "Tasks appear one by one";
					}
				}
			},

			setActiveTab: function (tab) {
				$('a[href=' + tab + ']').click();
			},

			getTableConfiguration: function (_maximum_page_size, _rows_size, _settings_custom) {
				var _settings = {
					"bPaginate": false,
					"bLengthChange": false,
					"sPaginationType": "bootstrap",
					"bInfo": false,
					'bFilter': true
				};


				_settings = _.extend(_settings, _settings_custom);

				return _settings;

			},

			handleTabClick: function (e) {

				$("#tabs").children().each(function () {
					$($(this).find('a').attr('href')).addClass('unactive');
				});

				var _target_view = $(e.currentTarget).attr('href');
				var component = $(e.currentTarget).attr('data-component');

				$(_target_view).removeClass('unactive').addClass('active');

				if (this.components[component]) {
					this.components[component].call(this);
				}
			},

			render: function () {
				this.pdfConversionLibreries = AuthenticationData.configuration.availablePdfConverters;
				this.initCustomIconPacks();

				this._super(template);

				var $editorBase = $("#editor_base");
				var $accountTable = $('#accounts-table');

				$editorBase.empty().append(this.$el);

				$editorBase.css({
					'margin': '0 auto',
					'float': 'none'
				});

				this.$('#accounts-table').dataTable(this.getTableConfiguration(100,  this.model.users.length, {
					bPaginate : true,
					bLengthChange : false,
					bInfo : true,
					iDisplayLength : 100,
					aoColumns: [
						null,
						null,
						null,
						{ bSortable: false },
						{ bSortable: false }
					]
				}));

				$("#courses-list").dataTable(this.getTableConfiguration(10, this.model.courses.length, {
					bPaginate : true,
					bLengthChange : false,
					bInfo : false,
					iDisplayLength : 10,
					aoColumns: [
						{ bSortable: false },
						null,
						null,
						null,
						null,
						{ bSortable: false }
					]
				}));

				$accountTable.find("tbody").find("tr").click(function (e) {
					$("#accounts-table").find("td.selected").removeClass("selected");

					$(this).find("td").addClass("selected");
				});

				$("#form-add-user").css("display", "none");
				$("a[href='#T2KPublisherUsersEditor']").tab('show');
				this.register_view_events();
				this.setConfiguration();
				this.setComponents();
				this.initCustomMetadata();
				this.initCustomMetadataPackages();
				this.initCustomProperties();
			},

			setComponents: function () {
				this.tts_list_component = new tts_list_component({
					el: "#list",
					controller: this.controller,
					data: this.controller.publisher.get('ttsProviders'),
					update_model: this.update_tts_model.bind(this)
				});
			},
			update_tts_model: function (model) {
				this.controller.updateModel('publisher', 'ttsProviders', model)
			},
			initCustomMetadata: function(){

				var metadata = new customMetaData({
					el: $("#customMetadataComponent"),
					data: this.model.publisher.customMetadata,
					updateCallback : _.bind(function(newData){
						this.controller.updateModel('publisher', 'customMetadata' ,  newData);
					},this)

				});
			},

			initCustomMetadataPackages: function(){

				new customMetadataPackages({
					el: $("#customMetadataPackagesComponent"),
					data: this.model.publisher.customMetadataPackages,
					updateCallback : _.bind(function(newData){
						this.controller.updateModel('publisher', 'customMetadataPackages',  newData);
					},this)

				});
			},

			initCustomProperties: function(){

				var data =
					[
						{
							'name' :'Subject Area',
							'dataType' : 'subjectAreas',
							'value': this.model.publisher.subjectAreas
						},
						{
							'name' :'Grade Level',
							'dataType':'gradeLevels',
							'value': this.model.publisher.gradeLevels
						}
					];

				var customPropertiesComponent = new customProperties({
					el: $("#customPropertiesComponent"),
					data: data,
					updateCallback : function(dataType, newData){
						this.controller.updateModel('publisher', dataType ,  newData);
					}.bind(this)

				});
			},

			initCustomIconPacks: function() {
				this.customIconPacks = {
					"player": {
						"isChanged": false,
						"lastModifiedDate": null
					},
					"enrichment": {
						"isChanged": false,
						"lastModifiedDate": null
					}
				};
				var packs = this.model.publisher.customization.customIconsPacks;
				if (typeof packs != "undefined") {
					var self = this;
					packs.forEach(function (item){
						if(item.type == "PLAYER") {
							self.customIconPacks.player.isChanged = true;
							self.customIconPacks.player.lastModifiedDate = dateFormatter(item.creationDate.$date);
						} else if (item.type == "ENRICHMENT") {
							self.customIconPacks.enrichment.isChanged = true;
							self.customIconPacks.enrichment.lastModifiedDate = dateFormatter(item.creationDate.$date);
						}
					});
				}
				function dateFormatter(date) {
					return moment(date).format("MMM, DD, YYYY");
				}
			},

			new_user: function () {
				var _form = $("#form-add-user");

				if (!_form.is("display")) {
					_form.show();

					$(this).attr('disabled', true);

					$(".edit-user").attr("disabled", true);
				}
				$(".remove_user").attr("disabled",true);
			},
			register_view_events: function () {
				this.$el.children().off();

				$("#save-user").bind('click', this.saveUser.bind(this));

				$(".edit-user").one('click', this.updateUser.bind(this));
				$("#add-new-user").one('click', this.new_user);
			},
			saveUser: function (e) {
				var row = $(e.target).closest('tr');
				this.controller.saveUser({
					id: row.attr('model-id'),
					firstname: "dummy",
					lastname: "dummy",
					username: $.trim(row.find("#account_username").val()),
					email: $.trim(row.find("#account_email").val()),
					password: $.trim(row.find("#account_password").val()),
					'customization': {
						'cgsHintsShowMode': "showAll"
					}
				}, $("#account_role").find("option:selected").attr('value'), function () {
					$(".remove_user").attr("disabled",false);
				});
			},
			updateUser: function(e) {
				var _row_container = $(e.target).parents('tr');
				var _user_id = _row_container.attr('model-id');
				var _model_data = this.controller.users.get(parseInt(_user_id)).toJSON();
				var _form = $("#form-add-user").clone();

				$("#form-add-user").remove();
				$("#add-new-user").attr('disabled', true);


				_form.find("#account_username").attr('value', _model_data.username);
				_form.find("#account_username").attr("disabled", true);

				_form.find("#account_password").attr('value', _model_data.password);
				_form.find("#account_email").attr('value', _model_data.email);
				_form.find("#account_role option[value=" + _model_data.role.id + "]").attr("selected", true);

				_row_container.empty();
				_row_container.append(_form.find('tr').html());

				_row_container.find("#save-user").one("click", function (e) {
					this.controller.saveUser({
						'id': _user_id,
						'firstName': "dummy",
						'lastName':  "dummy",
						'username': this.$el.find("#account_username").val(),
						'email': this.$el.find("#account_email").val(),
						'password': this.$el.find("#account_password").val(),
						'customization': {
							'cgsHintsShowMode': "showAll"
						}
					}, $("#account_role").find("option:selected").attr('value'));
				}.bind(this));

				_row_container.find(".remove_user.btn").one('click', this.removeUser.bind(this));
				$(".remove_user").attr("disabled",true);
				$(".edit-user").attr('disabled', true)
			},
			removeUser: function(e) {
				var id = $(e.target).closest('tr').attr('model-id'),
					dialogConfig = {
						title: "Delete User",
						content:{
							text: "You are about to delete the user, are you sure?",
							icon:'warn'
						},
						buttons:{
							'yes': { label:'OK', value: true },
							'cancel': { label:'Cancel', value: false }
						}
					};

				if (id) {
					events.once('onUserDialogClose', function(val) {
						if (val) {
							this.controller.removeUser(id);
						}
					}, this);
					require('dialogs').create('simple', dialogConfig, 'onUserDialogClose');
				}

			},
			showLockingDialog: function (data) {
				var dialogConfig = {
					title: "The is locked for editing by",
					data: data,

					buttons:{
						closeDialog	:	{ label : 'Close'}
					}
				};

				require('dialogs').create('locking', dialogConfig);
			},
			removeCourse: function (e) {
				var id = $(e.currentTarget).attr('data-id');

				var dialogConfig = {
					title:"Security Dialog",
					content:{
						text: "You are about to delete all the course content, this is irreversible process, please type the security code inside the box.",
						icon:'warn'
					},
					buttons:{
						'ok':{ label:'OK', value: true },
						'cancel':{ label:'Close', value: false }
					}
				};

				$(document).keypress(function(e) {
					var $ok = $("#ok");
					if (e.which == 13 && !($ok.attr("disabled") === "disabled")) {
						$ok.click();
					}
				});

				function onCourseDialogClose(val) {
					if (val) {
						this.controller.removeCourse(id);
					}
				}

				events.once('onCourseDialogClose', onCourseDialogClose, this);

				require('dialogs').create('captcha', dialogConfig, 'onCourseDialogClose').show();
				$("#captcha-code:visible").focus();

			},
			uploadFontForPlayer: function (e) {
				$('#chooseFontForPlayer').trigger("click");
            },
            chooseFontForPlayer: function() {
        	  	var files = $('#chooseFontForPlayer')[0].files;
                var file = files && files.length ? files[0] : null;
                if (file) {
                    this.controller.readCustomFontFile(file, "PLAYER");
                }
                // Delete file list from file input
                $('#chooseFontForPlayer').val('');
            },
            uploadFontForEnrichements: function (e) {
				$('#chooseFontForEnrichements').trigger("click");
            },
            chooseFontForEnrichements: function() {
        	  	var files = $('#chooseFontForEnrichements')[0].files;
                var file = files && files.length ? files[0] : null;
                if (file) {
                    this.controller.readCustomFontFile(file, "ENRICHMENT");
                }
                // Delete file list from file input
                $('#chooseFontForEnrichements').val('');
            },
			dispose: function() {
				$(".remove_user").unbind('click');
				this._super();
			}
		});

		return T2KPublisherEditorView;
	});