define(['lodash', 'backbone_super','publisher_model'], function (_, Backbone, PublisherModel) {
	var PublishersCollection = Backbone.Collection.extend({
		url: "/cgs/rest/publishers",
		model: PublisherModel
	});	

	return PublishersCollection;
});