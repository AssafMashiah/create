define(['jquery', 'BaseScreenView', 'text!modules/BaseDialogScreen/templates/BaseDialogScreenView.html'],
function($, BaseScreenView, template) {

	var BaseDialogScreenView = BaseScreenView.extend({

		el: '#base',

		initialize: function(controller) {
			this.initTemplate();
			this._super(controller);
			console.log('BaseDialogScreenView initialized');
		},
		initTemplate: function(){
			this.template = template;
		},

		render: function() {

			this._super(this.template);
			this.addScreenBg();
			
		},

		addButton: function(name, cssClass, func) {

			var div_wrapper = jQuery('<div></div>', {'id' : 'div_'+name+'_wrapper'}).addClass(cssClass);
			var button = jQuery('<button/>', {'id' : 'btn_'+name, 'class' : 'btn btn-primary', 'canBeDisabled' : 'false'});
			button.html(name);
			button.click(func);
					
			div_wrapper.append(button);

			$('#dialog_bottom_row').append(div_wrapper);
		},

		backToTask: function(event) {
			$('#stage_base').click();
			history.back();
		},

		addScreenBg: function() {
			$('body').addClass('dialog_screen');
		},

		removeScreenBg: function() {
			$('body').removeClass('dialog_screen');
		},

		//override
		adjustHeight: function () {
			var headerHeight = $('.screen-header').outerHeight();
			var footerHeight = $('.screen-footer').outerHeight();
			$('.screen-content').height("-webkit-calc(100% - " + ( (headerHeight== null? 0 : parseInt(headerHeight)) + (footerHeight== null? 0 :parseInt(footerHeight) )) + "px)");
		}

	}, {type: 'BaseDialogScreenView'});

	return BaseDialogScreenView;

});