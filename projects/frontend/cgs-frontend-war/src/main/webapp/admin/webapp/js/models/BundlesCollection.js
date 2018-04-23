define(['lodash', 'backbone_super','bundleModel'], function (_, Backbone, BundleModel) {
	var BundlesCollection = Backbone.Collection.extend({
		getUrl: function (publisherId) {
			return "/cgs/rest/publishers/" + publisherId + "/bundles"
		},
		model: BundleModel
	});	

	return new BundlesCollection;
});