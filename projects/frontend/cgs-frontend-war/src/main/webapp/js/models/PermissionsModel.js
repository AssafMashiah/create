define(["lodash", "events"], function f1987(_, events) {
	var PermissionsModel = function f1988() {	
		this.menu = {
			'create_course': function f1989(menu, v) {
				!v && menu && menu.disableMenuItem && menu.disableMenuItem('menu-button-new');
			},
			'save_as_course': function f1990(menu, v) {
				!v && menu && menu.disableMenuItem && menu.disableMenuItem('menu-button-save-as-course');
			},
			'new_edition': function f1991(menu, v) {
				!v && menu && menu.disableMenuItem && menu.disableMenuItem('menu-button-edition-course');
			},
			'publish_course': function f1992(menu, v) {
				!v && menu && menu.disableMenuItem && menu.disableMenuItem('menu-button-publish-course');
			},
			'import_lesson': function f1993(menu, v) {
				!v && menu && menu.disableMenuItem && menu.disableMenuItem('menu-button-import-lesson');
			}
		};

		this.lesson_table_component = {
			'create_lesson': function f1994(lesson_table_component_view, v) {
				!v && lesson_table_component_view.disabledCreateLesson();
			}
		};

		this.lesson_table_row_component = {
			'delete_lesson': function f1995(lesson_table_row_view, v) {
				!v && lesson_table_row_view.disableDeleteLesson();
			},
			'edit_lesson': function f1996(lesson_table_row_view, v) {
				!v && lesson_table_row_view.disableEditLesson();
			}
		}

		this.firstScreenDialog = {
			'create_course': function f1997(firstScreenDialog, v) {
				!v && firstScreenDialog.hideLeftPanel();
			}
		}

		this.navigation_bar = {
			'edit_lesson': function f1998(navigation_bar, v) {
				if (this.router.activeScreen.constructor.type === "LessonScreen") {
					!v && navigation_bar.disableEditBar(v);
				}
			},
			'edit_course': function f1999(navigation_bar, v) {
				if (["CourseScreen", "TocScreen"].indexOf(this.router.activeScreen.constructor.type) > -1 ) {
					!v && navigation_bar.disableEditBar(v);
				}
			}
		}

		var checkPermissions = function f2000(type, view) {
			this.permissions = require('userModel').getPermissions();
			
			if (this[type]) {
				_.each(this[type], function f2001(item, index) {
					item.call(this, view, this.permissions[index]);
				}, this);
			}
		};

		this.init = function f2002() {
			this.router = require("router");

			events.register("checkPermissions", checkPermissions.bind(this));
		};
	}

	return new PermissionsModel;
});