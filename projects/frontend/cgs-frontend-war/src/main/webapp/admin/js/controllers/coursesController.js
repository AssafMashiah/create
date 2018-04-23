define([
  'jquery',  
  'underscore',
  'backbone',
  'views/coursesView',
  'controllers/abstractController',
  'utils/dialogManager'
], function ($, _, Backbone,CoursesView, AbstractController, DialogManager) {

	var CoursesController = AbstractController.extend({

		initialize : function (coursePageModel, coursesView) {


			this.coursesPageModel = coursePageModel;
			this.coursesView = coursesView;

			coursesView.on(CoursesView.DELETE_COURSE_CLICKED, this.handleDeleteCourse, this);
			coursesView.on(CoursesView.SORT_COLUMN_CLICKED, this.handleSortColumn, this);
            coursesView.on(CoursesView.SHOW_DELETE_BUTTON, this.handleShowButton, this);

		},


		handleDeleteCourse : function (courseId) {
			var _this = this;
			DialogManager.showQuestionDialog("Question", "Are you sure you want to delete the course? ", function () {
				_this.coursesPageModel.deleteCourse(courseId);
			});

		},

        handleShowButton : function () {
			var _this = this;
			_this.coursesPageModel.showDeleteButtons();
		},

		handleSortColumn : function (columnName) {
			if(this.coursesPageModel.getSortBy() === columnName) {
				this.coursesPageModel.sortBy(columnName, !this.coursesPageModel.isAscending());
			} else {
				this.coursesPageModel.sortBy(columnName, true);
			}
		}

	});

	return CoursesController;
});
