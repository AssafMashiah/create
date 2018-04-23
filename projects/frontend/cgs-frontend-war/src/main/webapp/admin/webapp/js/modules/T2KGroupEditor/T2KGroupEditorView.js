define(['lodash', 'BaseView', 'events', 'text!./templates/T2KGroupEditorView.html'],
	function (_, BaseView, events, template) {
	var T2KGroupEditorView = BaseView.extend({
		el: "#editor_base",

		initialize: function (options) {
			this.item = options.model;

			this._super();
		},
		render: function () {
            this.logLevels = _.toArray(require('consts').logLevels);

            this._super(template);

            $('#logLevel').val(this.item.data.customization.logLevel);

			$('#accounts-table').dataTable( {
				"sPaginationType": "bootstrap",
				"bPaginate": false,
		        "bLengthChange": false,
		        "bFilter": false,
		        "bInfo": false
			});

			$("#accounts-table").find("tbody").find("tr").click(function (e) {
				$("#accounts-table").find("td.selected").removeClass("selected");
				
				$(this).find("td").addClass("selected");
			});

			$("#accounts-table").find("thead").find("tr").children().last().removeClass("sorting");

			$("#form-add-user").css("display", "none");

			this.register_view_events();
		},

		register_view_events: function () {
			this.$el.children().off();

			$("#publisher_name").bind('blur', this.update_publisher.bind(this));
			$("#logLevel").bind('change', this.update_publisher.bind(this));
			$("#save-user").bind('click', this.save_user.bind(this));
			$("#add-new-user").one('click', this.new_user);

			$(".edit-user.btn").one('click', this.edit_user.bind(this));
			$(".remove_user.btn").bind('click', this.remove_user.bind(this));
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
		save_user: function () {
			this.controller.save({
				'firstName': "dummy",
				'lastName':"dummy",
				'username': this.$el.find("#account_username").val(),
				'email': this.$el.find("#account_email").val(),
				'password': this.$el.find("#account_password").val()
			}, function() {
				$("#form-add-user").hide();

				$("#add-new-user").attr('disabled', false);
				$(".edit-user").attr("disabled", false);
                $(".remove_user").attr("disabled",false);
			});
		},
		edit_user: function (e) {
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

			_row_container.empty();
			_row_container.append(_form.find('tr').html());

			_row_container.find("#save-user").bind("click", function (e) {
				this.controller.update(_user_id, {
					'firstName': "dummy",
					'lastName': "dummy",
					'username': this.$el.find("#account_username").val(),
					'email': this.$el.find("#account_email").val(),
					'password': this.$el.find("#account_password").val()
				});
			}.bind(this))

			_row_container.find(".remove_user.btn").one('click', this.remove_user.bind(this));
            $(".remove_user").attr("disabled",true);
		},
		remove_user: function (e) {
			var _row_container = $(e.target).parents('tr');
			var _user_id = _row_container.attr('model-id');

			var dialogConfig = {
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

			if (_user_id) {
				events.once('onUserDialogClose', function(val) {
					if (val) {
						this.controller.remove_user(parseInt(_user_id, 10));
					}
				}, this);

				require('dialogs').create('simple', dialogConfig, 'onUserDialogClose');
			}

		},
		update_publisher: function (e) {
			this.controller.update_model({
                publisherName: this.$el.find("#publisher_name").val(),
                logLevel: this.$("#logLevel").val()
            });
		},
		dispose: function() {
			$(".remove_user.btn").unbind('click');
			this._super();
		}
	});

	return T2KGroupEditorView;
});