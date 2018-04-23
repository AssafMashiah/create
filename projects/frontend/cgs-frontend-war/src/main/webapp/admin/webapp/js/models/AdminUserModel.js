define(['lodash', 'backbone_super'], function (_, Backbone) {
	var AdminUserModel = Backbone.Model.extend({
		idAttribute: "userId",
		save: function () {
			this.unset('');

			Backbone.Model.prototype.save.apply(this, arguments);
		}
	});
 
	return AdminUserModel;
});