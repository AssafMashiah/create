define(['jquery', 'mustache', 'BaseScreenView', './constants',
	    'text!modules/T2KAdminScreen/templates/T2KAdminScreenView.html'],
function($, Mustache, BaseScreenView, constants, template) {

	var T2KAdminScreenView = BaseScreenView.extend({

		el: '#base',

		initialize: function(options) {
			this._super(options);
			console.log('CourseScreenView initialized');
		},

		render: function() {
			this._super(template);
		}

	}, {type: 'T2KAdminScreenView'});

	return T2KAdminScreenView;

});
