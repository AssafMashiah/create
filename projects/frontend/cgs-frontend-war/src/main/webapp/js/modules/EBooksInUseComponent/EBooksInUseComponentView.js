define(['jquery', 'BaseView',
	'text!modules/EBooksInUseComponent/templates/EBooksInUseComponentView.html'],
	function($, BaseView, template) {

		var EBooksInUseComponentView = BaseView.extend({

			el: '#ebooks_in_use_base',
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

			clearEbooks: function() {
				$('#ebooks_in_use_list').empty();
			},

			updateAll: function() {
				// this.controller.updateAll();
				// $('#applets-update-all').hide();
			},

			showUpdateAll: function() {
				//$('#applets-update-all').show();
			}

		}, {type: 'EBooksInUseComponentView'});

		return EBooksInUseComponentView;

	});