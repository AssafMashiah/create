define(['lodash', 'backbone_super'], function (_, Backbone) {
	var PublisherUserModel = Backbone.Model.extend({
		idAttribute: "userId",
		defaults: {
		}
	});
 
	return PublisherUserModel;
});