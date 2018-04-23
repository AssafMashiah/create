define(['lodash', 'backbone_super','course_model'], function (_, Backbone, CourseModel) {
	var ProvidersCollection = Backbone.Collection.extend({
		url: "/cgs/rest/ttsproviders"
	});	

	return ProvidersCollection;
});