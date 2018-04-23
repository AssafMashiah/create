define(['jquery', 'BaseScreenView', 'text!modules/TaskScreen/templates/OverlayTaskScreenView.html'],
function($, BaseScreenView, template) {

	var TaskScreenView = BaseScreenView.extend({

		el: '#base',

		render: function() {
			this._super(template);
		},
		//override
		adjustHeight: function f54() {
			var headerHeight = $('.screen-header').outerHeight();
			var footerHeight = $('.screen-footer').outerHeight();
			$('.screen-content').height("-webkit-calc(100% - " + ( (headerHeight== null? 0 : parseInt(headerHeight)) + (footerHeight== null? 0 :parseInt(footerHeight) )) + "px)");
		}

	}, {type: 'TaskScreenView'});

	return TaskScreenView;

});
