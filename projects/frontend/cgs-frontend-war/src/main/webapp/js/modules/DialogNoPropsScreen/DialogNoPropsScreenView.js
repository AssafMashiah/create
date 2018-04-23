define(['jquery', 'modules/BaseDialogScreen/BaseDialogScreenView', 'text!modules/DialogNoPropsScreen/templates/DialogNoPropsScreenView.html'],
function($, BaseDialogScreenView, template) {

	var DialogNoPropsScreenView = BaseDialogScreenView.extend({

		el: '#base',

		initialize: function(controller) {
			this._super(controller);
		},
		initTemplate: function(){
			this.template = template;
		},

		render: function(){
			this._super();
			this.addButton('Close', 'closeButton', _.bind(function(event){
				//before close function
				if(typeof(this.controller.editor.beforeClose) == "function"){
					this.controller.editor.beforeClose(_.bind(function(){
						event.stopPropagation();
						this.backToTask(event);
					}, this));
				}else{
					event.stopPropagation();
					this.backToTask(event);
				}
			},this));
		},

		adjustHeight: function f583() {
			var headerHeight = $('.screen-header').outerHeight();
			var footerHeight = $('.screen-footer').outerHeight();
			$('.screen-content').height("-webkit-calc(100% - " + ( (headerHeight== null? 0 : parseInt(headerHeight)) + (footerHeight== null? 0 :parseInt(footerHeight))  + "px)"));
			// var navbarHeight = $('#navbar_base_wrapper').outerHeight();
			// $('.screen-content').height("-webkit-calc(100% - " + ( (headerHeight== null? 0 : parseInt(headerHeight)) + (footerHeight== null? 0 :parseInt(footerHeight) )+ (navbarHeight== null? 0 :parseInt(navbarHeight) )) + "px)");
		}

	}, {type: 'DialogNoPropsScreenView'});

	return DialogNoPropsScreenView;

});