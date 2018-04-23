define(['lodash', 'jquery', 'events'], function(_, $, events) {

	function BaseDialog(viewClass, config, callbackEvent) {
		
		this.view = new viewClass( { config:config, callbackEvent:callbackEvent, controller: this} );

		this.callbackEvent = callbackEvent ;
		
		this.registerEvents();

	}

	BaseDialog.prototype = {
		
		
		returnMap: {},
			
		show: function(){
			this.view.show( this.view ) ;
		},

		registerEvents : function(){
			events.register( 'terminateDialog', this.onDialogTerminated, this ) ;
		},
		
		setReturnValue: function( key, value ) {
			this.returnMap[ key ] = value;
		},
		
		onDialogTerminated: function( response ){
			events.unbind( 'terminateDialog', this.onDialogTerminated ) ;
			var returnValue = this.returnMap[ response ] ;
			this.view.unbind();
			this.view.hide();

			if(this.callbackEvent){
				events.fire(this.callbackEvent, returnValue, response) ;
				events.unbind(this.callbackEvent);
			}
		}

	}

	return BaseDialog;

});