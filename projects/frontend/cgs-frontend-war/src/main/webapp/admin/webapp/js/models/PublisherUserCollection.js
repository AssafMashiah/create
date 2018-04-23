define(['lodash', 'backbone_super', 'admin_user_model'], function (_, Backbone, AdminUserModel) {
	var PublisherUsersCollection = Backbone.Collection.extend({
		model: AdminUserModel
	});	

	return PublisherUsersCollection;
});