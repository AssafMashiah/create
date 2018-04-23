define(['lodash', 'backbone_super', 'role_model'], function (_, Backbone, RoleModel) {
	var RolesCollection = Backbone.Collection.extend({
		model: RoleModel
	});	

	return RolesCollection;
});