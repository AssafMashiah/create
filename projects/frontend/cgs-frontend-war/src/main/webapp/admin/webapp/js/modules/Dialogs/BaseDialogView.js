define(['jquery', 'BaseView', 'mustache', 'events', 'translate', 'text!modules/Dialogs/BaseDialog.html'],
function($, BaseView, Mustache, events, i18n, template) {

	var BaseDialogView = BaseView.extend({

		tagName : 'div',
		className : 'css-dialog',
		customContent: '#dialogContent',
        buttons: [
			{label: "OK", value: "ok"},
			{label: "Cancel", value: "cancel"}
		],
        closeOutside: true,
		
		initialize: function(options) {
			
			this.template = template ;
            this.controller = options.controller;
            this.callbackEvent = options.callbackEvent;
            this.buttonsArr = [] ;

            if( options.config.buttons )
            {
            	var button;

                this.buttons = options.config.buttons;

                
                for(var i in this.buttons) {

             	   
                    button = this.buttons[i];

               		this.buttonsArr.push({'name':i,'label':button.label,'canBeDisabled': button.canBeDisabled});
                    
                    if( typeof button.value == 'undefined' ) {
                    	button.value = i ;
                    }
                    
                    // set btn default return value from config, can be changed any time 
                    this.controller.setReturnValue( i, button.value ) ;
                }
            }

            if(typeof options.config.closeOutside == "boolean"){
                this.closeOutside = options.config.closeOutside;
            }
		},
		
		registerEvents: function() {

            if (this.closeOutside) {
                $('.overlay').click(function(e){
                    e.stopPropagation();
                    events.fire("terminateDialog");
                });
            } else {
	            $('.overlay').unbind('click');
            }

			$("#close").click(function(e){
				e.stopPropagation();
				events.fire("terminateDialog");
			});
		},
		
		render: function( $parent, customTemplate, data, partialCustom ) {
			
		    this._super( this.template );
			
			this.$parent = $parent;
			$parent.append( this.el );
			
			if( customTemplate ) {
				this.createCustom( customTemplate ,data, partialCustom) ;
			}
			
            this.bindControlsEvents();
			this.registerEvents();


		},
		
		createCustom: function( customTemplate, data, partial ) {
			
			var custom = $( Mustache.render( i18n._(customTemplate), (data ? data : this) ,partial) );
			
			$(this.customContent).append( custom );
			
		},

		bindControlsEvents: function() {
			
           var controller = this.controller;
           
			var thi$ = this ;

           for(i in this.buttons) {
        	   
               button = this.buttons[i];

               if (!button.canBeDisabled) {
	                $("#dialogControls #"+ i).click(
	                   function(controller, btnKey) {
	                       return function(event) {
                               //if dialog's beforetermination returns cancel_terminate do not close dialog
	                       		if (thi$.beforeTermination.call(thi$, event) === "cancel_terminate") return ;

	                       		if (thi$.setReturnValueCallback && _.isFunction(thi$.setReturnValueCallback[btnKey])) {
	                       			controller.setReturnValue(btnKey, thi$.setReturnValueCallback[btnKey].call(thi$));
	                       		}
	                           controller.onDialogTerminated(btnKey);
	                       }
	                   }(controller, i) 

	               );
               }
           	}
		},

		beforeTermination: function() {
			// do nothing here
			// override for specific implementaion
		},
		
		unbind: function() {
			
			this.$el.unbind() ;
			
		},

		show: function(view){
			view.render( $('body') ) ;
            $('body').addClass('stop-scrolling');
            $('.overlay').show();
		},
		
		hide: function() {
			require("dialogs").currentOpenDialog = null;

			this.$el.remove();
            $('body').removeClass('stop-scrolling');
            $('.overlay').hide();

		}


	}, {type: 'BaseDialogView'});

	return BaseDialogView;

});
