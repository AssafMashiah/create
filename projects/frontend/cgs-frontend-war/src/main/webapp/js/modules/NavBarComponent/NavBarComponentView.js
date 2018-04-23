define([
	'jquery', 
	'BaseView', 
	'events', 
	'text!modules/NavBarComponent/templates/NavBarComponentView.html', 
	'mustache'
	],
function($, BaseView, events, template, Mustache) {

	var NavBarComponentView = BaseView.extend({

		el: '#navbar_base',

		initialize: function(controller) {
			this._super(controller);
			this.$navbarList = this.$('#navbar_list');
		},

		render: function() {
			this._super(template);
		},

		clear: function() {
			this.$('#navbar_list').empty();
		}

	}, {type: 'NavBarComponentView'});

	return NavBarComponentView;

});
