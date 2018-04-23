define(['lodash','jquery',  'modules/Dialogs/BaseDialogView',
	'text!modules/Dialogs/types/addApplet/AddAppletDialog.html'],
	function(_, $, BaseDialogView, template) {

	var AddAppletDialogView = BaseDialogView.extend({

		tagName:'div',
		className:'css-dialog',

		initialize:function f584(options) {

			this.customTemplate = template;
			
			this.appletList =  options.config.content;
			this._super(options);
			this.controller.setReturnValue( 'open', true ) ;
		},

		render: function($parent){
			this._super($parent, this.customTemplate);
			this.bindEvents();
		},

		bindEvents: function() {
			var self = this;
			
			// select and/or select+approve
			this.$parent.find('.appletThumb').click( function( event ) {
				self.setActiveOrDisabledModeToAppletThumb(self, $(this));
			}).dblclick( function( event ) {
					self.controller.setReturnValue( 'open', $(this).attr('id') ) ;
					self.controller.onDialogTerminated('open');
			});

			this.$parent.find('#dialogControls #open').unbind('click').click(function() {
				var active = self.$parent.find('.appletThumb.active');
				self.controller.setReturnValue('open', active.attr('id'));
				self.controller.onDialogTerminated('open');
			});
		},

		setActiveOrDisabledModeToAppletThumb: function(selfObj, thisObj){
			var listThumb = selfObj.$parent.find('.appletThumb'),
				bttnOpen = selfObj.$parent.find('#dialogControls #open'),
				tmpId = $(thisObj).attr('id');

			_.each(listThumb, function f585(item) {
				$(item).removeClass("active");
			});

			thisObj.addClass("active");

			bttnOpen.removeClass('disabled').removeAttr('disabled');
			// bttnOpen.click(
			// 	function(event) {
			// 		selfObj.controller.setReturnValue( 'open', tmpId ) ;
			// 		selfObj.controller.onDialogTerminated('open');
			//     }
			// );
		}


		

	}, {type: 'AddAppletDialogView'});
	
	return AddAppletDialogView;

});