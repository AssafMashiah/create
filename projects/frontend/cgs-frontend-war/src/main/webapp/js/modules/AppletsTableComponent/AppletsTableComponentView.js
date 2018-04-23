define(['jquery', 'BaseView',
	'text!modules/AppletsTableComponent/templates/AppletsTableComponentView.html'],
	function($, BaseView, template) {

		var AppletsTableComponentView = BaseView.extend({

			el: '#applets_table_base',
			clearOnRender: false,
			_placeholder_removed: false,

			events: {
				'click #applets-update-all': 'updateAll'
			},

			initialize: function(options) {
				this._super(options);
			},

			render: function() {
				this._super(template);
			},

			clearApplets: function() {
				$('#applets_list').empty();
			},

			updateAll: function() {
				this.controller.updateAll();
				$('#applets-update-all').hide();
			},

			showUpdateAll: function() {
				$('#applets-update-all').show();
			}

		}, {type: 'AppletsTableComponentView'});

		return AppletsTableComponentView;

	});