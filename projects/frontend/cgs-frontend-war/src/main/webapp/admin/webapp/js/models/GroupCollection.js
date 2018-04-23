define(['lodash', 'backbone_super','group_model'], function (_, Backbone, GroupModel) {
	var GroupCollection = Backbone.Collection.extend({
		url: "/cgs/rest/groups",
		model: GroupModel
	});	

	return GroupCollection;
});