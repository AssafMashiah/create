define(['modules/Dialogs/BaseDialogView', "./openAndNewCourse", "cgsUtil",
		"events"],
	function (BaseDialogView, openAndNewCourse, cgsUtil, events) {

		var openAndNewCourseDialogView = BaseDialogView.extend({

			render: function render($parent) {
				//allow adding of new courses if the user has the right permission (role)
				//OR this is a open course dialog
				var isOpenModeOnly = this.options.config.isOpenModeOnly || 
					!require("userModel").user.role.permissions.create_course;

				this._super($parent);
				openAndNewCourse.render(document.getElementById("dialog"), this.newCourseHandler.bind(this), isOpenModeOnly);
			},

			newCourseHandler: function newCourseHandler(action, args) {
				this.controller.setReturnValue(action, args);
				events.fire("terminateDialog", action);
			}

		}, {type: 'openAndNewCourseDialogView'});

		return openAndNewCourseDialogView;

	});