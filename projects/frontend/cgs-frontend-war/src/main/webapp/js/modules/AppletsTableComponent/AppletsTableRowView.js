define(['lodash', 'jquery', 'BaseView', 'appletModel', 'events', 'dialogs', 'mustache',
		'text!modules/AppletsTableComponent/templates/TableRowView.html', 'editMode', 'bootstrap'],
function(_, $, BaseView, appletModel, events, dialogs, Mustache, template, editMode) {

	var TableRowView = BaseView.extend({

		className: 'item',
		tagName: 'tr',
		parentEl: '#applets_list',

		events:{
			'click .update_applet':'updateApplet',
		},

		initialize:function f38(options) {
			this._super(options);

			//Create Bootstrap tooltips
			this.$("[rel=tooltip]").tooltip();

			this.registerEvents();
		},

		registerEvents:function f39() {

		},

		render:function f40() {
			this._super(template);

			$(this.parentEl).append(this.el);
		},

		updateApplet: function() {
			this.controller.updateApplet(this.obj.id);
		}

	}, {type: 'TableRowView'});

	return TableRowView;

});