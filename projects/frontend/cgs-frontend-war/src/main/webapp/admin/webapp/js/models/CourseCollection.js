define(['lodash', 'backbone_super','course_model'], function (_, Backbone, CourseModel) {
	var CoursesCollection = Backbone.Collection.extend({
		getUrl: function (publisherId) {
			return "/cgs/rest/publishers/" + publisherId + "/courses/basicInfo"
		},
		model: CourseModel
	});	

	return CoursesCollection;
});