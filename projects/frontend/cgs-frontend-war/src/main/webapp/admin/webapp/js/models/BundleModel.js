define(['lodash', 'backbone_super'], function (_, Backbone) {
	var BundleModel = Backbone.Model.extend({
		idAttribute: "id"
	});

	return BundleModel;
});