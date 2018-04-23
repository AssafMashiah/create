define([
    'jquery',
    'underscore',
    'backbone',
    'models/courseModel'
], function ($, _, Backbone, courseModel) {

    var GET_COURSES_REST =   "/publishers/{publisherId}/courses";
    var DELETE_COURSE_URL = "/publishers/{publisherId}/courses/{courseId}";
    var initialize = function (restBasePath, publisherId) {
        this.restBasePath = restBasePath;
        this.publisherId = publisherId;
    };

    /**
     * Encode URL params into the url string
     *
     * @param  String url    url with encoded parameters
     * @param  Hash params   the parameters to be places into the url
     * @return String        a url with the parameters encoded
     */
    var encodeURL = function (url, params) {
        return _.template(url,params,{interpolate : /\{(\S+?)\}/g});
    };

    var getCourses = function (callback) {
        var actionURL = encodeURL(this.restBasePath + GET_COURSES_REST, {
            publisherId: this.publisherId
        });

        //DEBUG LOG
        console.log("getCourses  URL: " + actionURL);

        $.ajax({
            type: "GET",
            url: actionURL,
            dataType:"json",
            //cache: false,
            success: callback,
            error: callback
        });
    };

    var showDeleteButton= function(){

           console.log("shwo   URL: " + actionURL);


    };


    var deleteCourse= function (courseId, callback) {
        var actionURL = encodeURL(this.restBasePath + DELETE_COURSE_URL, {
            publisherId: this.publisherId,
            courseId: courseId
        });

        //DEBUG LOG
        console.log("deleteCourse  URL: " + actionURL);

        $.ajax({
            type: "DELETE",
            url: actionURL,
            //cache: false
            success: callback,
            error: callback
        });
    };

    return {
        initialize : initialize ,
        getCourses : getCourses ,
        deleteCourse : deleteCourse
    };
});
