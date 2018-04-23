define(['BaseView', 'events', 'text!./templates/T2KAdminStandardsEditorView.html', 'bootstrap_tables'],
	function ( BaseView, events, template) {

		var T2KStandardsView = BaseView.extend({
			el: "#editor_base",


			initialize: function (options) {
				this.item = options.model;

				this._super();
			},/*
			handleTabClick: function (e) {

				$("#tabs").children().each(function () {
					$($(this).find('a').attr('href')).addClass('unactive');
				});

				var _target_view = $(e.currentTarget).attr('href');

				$(_target_view).removeClass('unactive').addClass('active');
			},*/
			render: function () {


				this._super(template);

				this.$('#standards-table').dataTable({
					"sPaginationType": "bootstrap",
					"bPaginate": false,
					"bLengthChange": false,
					"bFilter": true,
					"bInfo": false
				});

				var self = this;

				this.$("#standards-table").find("tbody").find("tr").click(function (e) {
					self.$("#standards-table").find("td.selected").removeClass("selected");

					self.$(this).find("td").addClass("selected");
				});

				this.$("#standards-table").find("thead").find("tr").children().last().removeClass("sorting");

				this.$("#form-add-standard").css("display", "none");

				this.register_view_events();
			},
			register_view_events: function () {
				this.$el.children().off();

				this.$("#save-standard").bind('click', this.save_standard.bind(this));
				this.$("#add-new-standard").one('click', this.new_standard);

				this.$(".edit-standard.btn").one('click', this.edit_standard.bind(this));
				this.$(".remove_standard.btn").bind('click', this.remove_standard.bind(this));
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

				this.controller.update_model({
					publisherName: this.$("#publisher_name").val(),
					isSecured: !!this.$("#publisher_secured:checked").length,
					logLevel: this.$("#logLevel").val(),
					fileSizeLimits: this.item.data.fileSizeLimits,
					elementsLimit: this.item.data.elementsLimit,
					renderTree: _.isBoolean(renderTree) ? renderTree : null
				});
			},

			// Standards Functions
			new_standard: function () {
				var _form = $("#form-add-standard");

				function get_current_date() {
					now = new Date();
					year = "" + now.getFullYear();
					month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
					day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
					hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
					minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
					second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
					return day + "/" + month + "/" + year + " " + hour + ":" + minute + ":" + second;
				};

				var _created = _form.find("#created");
				_created.attr('value', get_current_date());
				_created.attr('disabled', true);

				if (!_form.is("display")) {
					_form.show();

					$(this).attr('disabled', true);
					$(".edit-standard").attr("disabled", true);
				}

				$(".remove_standard").attr("disabled", true);
			},
			save_standard: function () {
				var data = {
					'name': this.$("#name").val(),
					'subjectArea': this.$("#subjectArea").val(),
					'description': this.$("#description").val(),
					'country': this.$("#country").val(),
					'purpose': this.$("#purpose").val(),
					'version': this.$("#version").val(),
					'created': this.$("#created").val(),
				};

				var file = null;
				if(this.$("#button_upload_file") && this.$("#button_upload_file")[0].files.length > 0) {
					file = this.$("#button_upload_file")[0].files[0];
				}

				this.controller.save_standard(data, file);
			},
			edit_standard: function (e) {
				function get_current_date() {
					now = new Date();
					year = "" + now.getFullYear();
					month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
					day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
					hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
					minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
					second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
					return day + "/" + month + "/" + year + " " + hour + ":" + minute + ":" + second;
				};

				var _row_container = $(e.target).parents('tr');
				var _row_id = _row_container.attr('model-id');
				var _standard_id = _row_id.split(",");
				var _model_data = this.controller.standards.get(_standard_id).toJSON();
				var _form = $("#form-add-standard").clone();

				this.$("#form-add-standard").remove();
				this.$("#add-new-standard").attr('disabled', true);

				_form.find("#name").attr('value', _model_data.name);
				_form.find("#subjectArea").attr('value', _model_data.subjectArea);
				_form.find("#description").attr('value', _model_data.description);
				_form.find("#country").attr('value', _model_data.country);
				_form.find("#purpose").attr('value', _model_data.purpose);
				_form.find("#version").attr('value', _model_data.version);
				_form.find("#created").attr('value', get_current_date());

				_form.find("#name").attr("disabled", true);
				_form.find("#subjectArea").attr("disabled", true);
				_form.find("#description").attr("disabled", true);
				_form.find("#country").attr("disabled", true);
				_form.find("#created").attr("disabled", true);

				_row_container.empty();
				_row_container.append(_form.find('tr').html());

				_row_container.find("#save-standard").bind("click", function (e) {
					this.save_standard();
				}.bind(this))

				_row_container.find(".remove_standard.btn").one('click', this.remove_standard.bind(this));
				this.$(".remove_standard, .edit-user").attr("disabled", true);
				this.$(".edit-standard").attr("disabled", true);
			},
			remove_standard: function (e) {
				var _row_container = $(e.target).parents('tr');
				var _row_id = _row_container.attr('model-id');
				var _standard_id = _row_id.split(",");

				var dialogConfig = {
					title: "Delete Standard",
					content: {
						text: "You are about to delete the standard, are you sure?",
						icon: 'warn'
					},
					buttons: {
						'yes': {label: 'OK', value: true},
						'cancel': {label: 'Cancel', value: false}
					}
				};

				if (_standard_id) {
					events.once('onUserDialogClose', function (val) {
						if (val) {
							this.controller.remove_standard(_standard_id);
						}
					}, this);

					require('dialogs').create('simple', dialogConfig, 'onUserDialogClose');
				}
			},

			dispose: function () {
				this.$(".remove_standard.btn").unbind('click');
				this._super();
			}
		});

		return T2KStandardsView;
	});