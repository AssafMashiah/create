define(['jquery', 'BaseView', 'mustache', 'events', 'text!modules/Dialogs/BaseDialog.html'],
function($, BaseView, Mustache, events, template) {

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

            this.$dialog = this.$el.children('#dialog');
			
			if( customTemplate ) {
				this.createCustom( customTemplate ,data, partialCustom) ;
			}
			
            this.bindControlsEvents();
			this.registerEvents();


		},
		
		createCustom: function( customTemplate, data, partial ) {
			
			var custom = Mustache.render( customTemplate, (data ? data : this) ,partial);
			
			$(this.customContent).append( custom );
			
		},

		bindControlsEvents: function() {
           
            for(i in this.buttons) {
                /*
                button = this.buttons[i];
                if (!button.canBeDisabled){
                    this.bindButtonClick.call(this, this.controller,i);
                }
                */

               $("#dialogControls #"+ i).click(function (i, e) {
                   if ($(e.target).is(':disabled') || $(e.target).hasClass('disabled')) return;
                   else {
                       return (this.bindButtonClick.call(this, this.controller,i))(e);
                   }
               }.bind(this, i));
            }
		},

		bindButtonClick : function(controller, btnKey){
			return function(event) {
				//if dialog's beforetermination returns cancel_terminate do not close dialog
					if (this.beforeTermination.call(this, event) === "cancel_terminate") return ;

					if (this.setReturnValueCallback && _.isFunction(this.setReturnValueCallback[btnKey])) {
						controller.setReturnValue(btnKey, this.setReturnValueCallback[btnKey].call(this));
					}
				controller.onDialogTerminated(btnKey);
			}.bind(this);

		},

		beforeTermination: function() {
			// do nothing here
			// override for specific implementaion
		},
		
		unbind: function(callback) {
			this.$el.children().addBack().unbind().off();
			if (typeof callback == 'function') callback();
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

		},

        resetPosition: function() {
            var $dialog = this.$dialog;
            var marginleft = ($dialog.width()/(-2));
            var margintop = ($dialog.height()/(-2));
            $dialog.css({
                'margin-left': marginleft,
                'margin-top': margintop
            });
            $dialog
                .addClass('position-ready');
        }

	}, {type: 'BaseDialogView'});

	return BaseDialogView;

});
