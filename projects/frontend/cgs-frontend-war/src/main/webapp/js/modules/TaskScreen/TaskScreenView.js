define(['jquery', 'BaseScreenView', 'text!modules/TaskScreen/templates/TaskScreenView.html'],
function($, BaseScreenView, template) {

	var TaskScreenView = BaseScreenView.extend({

		el: '#base',

		initialize: function(controller) {
			this._super(controller);
		},

		render: function() {
			this._super(template);
		}

	}, {type: 'TaskScreenView'});

	return TaskScreenView;

});
