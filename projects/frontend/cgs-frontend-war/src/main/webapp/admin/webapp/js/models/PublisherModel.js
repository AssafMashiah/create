define(['lodash', 'backbone_super', 'publisher_defaults'], function (_, Backbone, publisher_defaults) {
	var PublisherModel = Backbone.Model.extend({
		url: "/cgs/rest/publishers",
		idAttribute: "accountId",
		save: function () {
			this.unset('type');
			this.unset('');

			Backbone.Model.prototype.save.apply(this, arguments);
		},
		defaults: _.clone(_.extend(publisher_defaults, { relatesTo: { "_id": -1, "type": "SUPER_USER" }, type: 'PUBLISHER', name: "New Publisher" }))
	});

	return PublisherModel;
});