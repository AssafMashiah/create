define(['jquery', 'BaseView'], function($, BaseView) {

	var BaseScreenView = BaseView.extend({

		initialize: function(options) {
			this.removeModals();
			this._super(options);
		},

		// This function isn't really needed.
		removeModals: function() {
			$('body>.modal').remove();
		},

		adjustHeight: function () {
			var headerHeight = $('.screen-header').outerHeight();
			$('.screen-content').height("-webkit-calc(100% - " + headerHeight + "px)");
		}

	}, {type: 'BaseScreenView'});

	return BaseScreenView;

});
