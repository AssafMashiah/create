define(['lodash', 'jquery', 'events'], function(_, $, events) {

	function BaseDialog(viewClass, config, callbackEvent) {

		logger.audit(logger.category.DIALOG, 'Open ' + config.type + ' dialog (' + config.title + ')');
		
		this.view = new viewClass( { config:config, callbackEvent:callbackEvent, controller: this} );

		this.callbackEvent = callbackEvent;

		this.config = config;
		
		this.registerEvents();

	}

	BaseDialog.prototype = {
		
		
		returnMap: {},
			
		show: function(){
			this.view.show(this.view);
		},

		registerEvents : function(){
			events.register('terminateDialog', this.onDialogTerminated, this);
		},
		
		setReturnValue: function(key, value) {
			this.returnMap[key] = value;
		},
		
		onDialogTerminated: function( response, callback ){
			var returnValue = this.returnMap[response];
			
			logger.audit(logger.category.DIALOG, { message: 'Close ' + this.config.type + ' dialog with return value', returnValue: returnValue });

			this.view.unbind(function() {
				this.view.hide();
				events.unbind('terminateDialog', this.onDialogTerminated);

				if(this.callbackEvent){
					events.fire(this.callbackEvent, returnValue, response);
					events.unbind(this.callbackEvent);
				}

				if (this.config.warning && returnValue) {
					events.once(this.config.warningSettings.dialogEvent, this.config.warningSettings.dialogCallback);
					require("dialogs").create(this.config.warningSettings.dialogName, this.config.warningSettings.dialogConfig, this.config.warningSettings.dialogEvent);
				}
				if (typeof callback == 'function') callback();
			}.bind(this));
		}

	}

	return BaseDialog;

});