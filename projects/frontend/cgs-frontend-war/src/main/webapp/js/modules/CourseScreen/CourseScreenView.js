define(['jquery', 'mustache', 'BaseScreenView', 'text!modules/CourseScreen/templates/CourseScreenView.html'],
function($, Mustache, BaseScreenView, template) {

	var CourseScreenView = BaseScreenView.extend({

		el: '#base',

		initialize: function(options) {
			this.template = template;
            this._super(options);
		},

		render: function() {
			this._super(this.template);
		}

	}, {type: 'CourseScreenView'});

	return CourseScreenView;

});
