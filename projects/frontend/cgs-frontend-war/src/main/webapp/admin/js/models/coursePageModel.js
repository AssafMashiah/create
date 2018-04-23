define([
    'jquery',
    'underscore',
    'backbone',
    'bootstrap',
    'models/pageModel',
    'models/courseModel',
    'services/coursesService',
    'utils/dialogManager'
], function ($, _, Backbone, Bootstrap, PageModel, CourseModel, CoursesService, DialogManager) {

    var CoursePageModel = PageModel.extend({
        initialize : function (name, route) {
            //call super
            CoursePageModel.__super__.initialize.call(this, name, route);

            this.set({
                "sortBy": null,
                "isAscending": true,
                "showDeleteButtons": false
            }, {silent: true});
        },

        setCourses : function (courses) {
            var i;
            var newCourses = [];

            for (i = 0; i < courses.length; i++) {
                var course = new CourseModel(courses[i]);
                newCourses.push(course);
            }

            this.set({"courses" : newCourses});
            this.notifyUpdate(CoursePageModel.COURSES_UPDATED);
        },

        sortBy : function (fieldName, isAscending) {
            this.set({"sortBy" : fieldName, "isAscending": isAscending});
            this.notifyUpdate(CoursePageModel.COURSES_UPDATED);
        },

        clearSort : function () {
            this.set({"sortBy" : null});
            this.notifyUpdate(CoursePageModel.COURSES_UPDATED);
        },

        getSortBy : function () {
            return this.get("sortBy");
        },

        isAscending : function () {
            return this.get("isAscending");
        },

        getCourses : function () {
            var sortedCourses = this.get("courses").slice();
            var _this = this;

            if (_this.getSortBy() !== null) {
                sortedCourses.sort(function(a, b) {
                    var aValue = a.attributes[_this.getSortBy()];
                    var bValue = b.attributes[_this.getSortBy()];

                    if (aValue === null && bValue === null) {
                        return 0;
                    }
                    if (aValue === null) {
                        return -1;
                    }
                    if (bValue === null) {
                        return 1;
                    }
                    if (aValue === bValue) {
                        return 0;
                    }
                    if (aValue > bValue) {
                        return 1;
                    }
                    if (aValue < bValue) {
                        return -1;
                    }
                });

                if (!_this.isAscending()) {
                    sortedCourses.reverse();
                }
            }

            return sortedCourses;
        },

        removeCourse : function (courseId) {
            var i;
            for (i = 0; i < this.get("courses").length; i++) {
                if (this.get("courses")[i].getCid() === courseId) {

                    this.get("courses").splice(i, 1);
                    return;
                }
            }
        },

        deleteCourse: function (courseId) {
            var _this = this;

            CoursesService.deleteCourse(courseId, function (data, returnType) {

                console.log("deleteCourse  returned:" + returnType);

                if (returnType === "success") {
                    _this.removeCourse(courseId);
                    _this.notifyUpdate(CoursePageModel.COURSES_UPDATED);
                } else {

                    //TODO - move dilog to the controller
                    DialogManager.showErrorDialog("Failed deleting course");
                    _this.refreshCourses();
                }

            });
        },
        activate : function () {
            this.refreshCourses();
        },

        refreshCourses: function () {
            var _this = this;


            CoursesService.getCourses(function (data, returnType) {
                if (returnType === "success") {
                    var courses = data;
                    _this.setCourses(courses);
                } else {
                    //TODO - move dilog to the controller
                    DialogManager.showErrorDialog("Failed getting courses");
                }

            });

        },

        showDeleteButtons : function () {
            this.set({ "showDeleteButtons" : true });
            this.refreshCourses();
        }


    });

    CoursePageModel.COURSES_UPDATED = "coursesUpdated";

    return CoursePageModel;
});
