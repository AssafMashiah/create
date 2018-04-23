define(['lodash', 'backbone_super'], function (_, Backbone) {
	var CourseModel = Backbone.Model.extend({
		idAttribute: 'courseId',
		getUrl: function (publisherId) {
			return "/cgs/rest/publishers/" + publisherId + "/courses/" + this.id;
		},
		defaults: {
			image: function () {
				return this.coverRefId ? [this.basePath, this.courseId, this.coverRefId].join('/') : 'media/insert_image.png';
			},
			lastModified: function () {
				var _date = new Date(this.header['last-modified'].$date);
				
				return _date.toDateString() + ' ' + _date.getHours() + ':' + _date.getMinutes() + ':' + _date.getSeconds();
			}
		}
	});
 
	return CourseModel;
});