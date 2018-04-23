define([
  'jquery',
  'underscore',
  'backbone',
  'views/abstractView',
  'models/coursePageModel',
  'text!templates/courses.html'
], function ($, _, Backbone, AbstractView, CoursePageModel, coursesTemplate) {
  var CoursesView = AbstractView.extend({

    //initilize view
    initialize: function(){
      //call init on abstract View - TODO must find a better way to do this
      CoursesView.__super__.initialize.call(this, $("#viewContainer") , coursesTemplate);
      this._keyStrokeBuffer = "";

      var _this = this;
       $(window).keyup(function (event) {

              _this._keyStrokeBuffer += String.fromCharCode(event.keyCode);

              if(_this._keyStrokeBuffer.length > 6) {
                _this._keyStrokeBuffer = _this._keyStrokeBuffer.substr(1);
              }

              console.log("Key up - buffer: " + _this._keyStrokeBuffer);

              if(_this._hashCode(_this._keyStrokeBuffer) === -1837201809) {
                _this.trigger(CoursesView.SHOW_DELETE_BUTTON,$(this));
              }
          });
    },

    _hashCode : function(str){
      var hash = 0;
      if (str.length === 0) {
        return hash;
      }

      for (i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+c;
        hash = hash & hash; // Convert to 32bit integer
      }
      return hash;
    },


    update: function(coursePageModel, updateType) {

      if(updateType === CoursePageModel.COURSES_UPDATED){

        console.log("Drawing CoursesView ");

        // call super
        CoursesView.__super__.update.call(this, coursePageModel);

          //attach listeneres to menu items
          var _this = this;
          $("#viewContainer #table_body a").click(function (event) {
              event.preventDefault();

              _this.trigger(CoursesView.DELETE_COURSE_CLICKED,$(this).attr("cid"));
          });

          $("#viewContainer #table_header a").click(function (event) {
              event.preventDefault();

              _this.trigger(CoursesView.SORT_COLUMN_CLICKED,$(this).attr("columnName"));
          });

      }
    }

  });

  //Static consts
    CoursesView.DELETE_COURSE_CLICKED = "deleteCourseClicked";
    CoursesView.SORT_COLUMN_CLICKED = "sortColumnClicked";
    CoursesView.SHOW_DELETE_BUTTON="showDeleteButton";

  // Returning instantiated views can be quite useful for having "state"
  return CoursesView;
});
