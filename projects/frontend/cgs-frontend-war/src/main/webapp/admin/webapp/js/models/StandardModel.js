define(['lodash', 'backbone_super'], function (_, Backbone) {
	var StandardModel = Backbone.Model.extend({
		idAttribute: ["name", "subjectArea"],
		url: "/cgs/rest/standards",
		save: function () {
			this.unset('');

			Backbone.Model.prototype.save.apply(this, arguments);
		}
	});
 
	return StandardModel;
});