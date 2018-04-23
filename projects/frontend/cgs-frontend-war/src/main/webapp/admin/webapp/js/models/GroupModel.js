define(['lodash', 'backbone_super', "publisher_defaults"], function (_, Backbone, publisher_defaults) {
	var GroupModel = Backbone.Model.extend({
		url: "/cgs/rest/groups",
		idAttribute: "accountId",
		defaults: _.clone(_.extend(publisher_defaults, { relatesTo: { "_id": -1, "type": "SUPER_USER" }, name: "New Group", type: 'GROUP' }))
	});

	return GroupModel;
});