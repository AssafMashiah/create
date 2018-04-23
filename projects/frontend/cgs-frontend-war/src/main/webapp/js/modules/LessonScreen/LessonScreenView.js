define(['jquery', 'BaseScreenView', 'text!modules/LessonScreen/templates/LessonScreenView.html'],
function($, BaseScreenView, template) {

	var LessonScreenView = BaseScreenView.extend({

		el: '#base',

		initialize: function(controller) {
			this._super(controller);
		},

		render: function() {
			this._super(template);
		}

	}, {type: 'LessonScreenView'});

	return LessonScreenView;

});
