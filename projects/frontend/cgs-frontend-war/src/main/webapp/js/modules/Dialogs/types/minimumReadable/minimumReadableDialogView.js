define(['lodash','jquery', 'BaseView', 'mustache', 'events', 'preview', 'modules/Dialogs/BaseDialogView', 'text!modules/Dialogs/types/minimumReadable/minimumReadable.html'],
function(_, $, BaseView, Mustache, events, preview, BaseDialogView, template) {

	var minimumReadableDialogView = BaseDialogView.extend({

		tagName : 'div',
		className : 'css-dialog-preview',

		initialize: function(options) {

			this.config = options.config;

			this.customTemplate = template;
			
			this._super(options);

		},

        setNewImageSize: function(){

            var size = +this.$( "#minimumValue" ).val();
            var width = this.config.data.width * size / 100;
            var height = this.config.data.height * size / 100;

            this.$( "img" ).css({
                width: width + "px" ,
                height: height + "px"
            });

        },

        moveSliderByStep: function(e){

            var step = +this.$( "#minimumValue" ).attr( "step" );
            var val = +this.$( "#minimumValue" ).val();

            if( /out/.test( e.target.className ) ){

                this.$( "#minimumValue" )
                    .val( val - step );

            }
            else{

                this.$( "#minimumValue" ).val( val + step );

            }

            this.setNewImageSize();

        },

        setReturnValueCallback: {
            "ok" : function(){
                return this.$( "#minimumValue" ).val();
            }
        },

        events: {
            "change #minimumValue": "setNewImageSize",
            "click #toolbar .zooming-button": "moveSliderByStep"
        },

		render: function( $parent ) {
			this._super($parent, this.customTemplate);

			this.resetPosition();
            this.setNewImageSize();

			this.bindEvents();
		},

		bindEvents: function() {
            var self = this;
			$(window).resize(function(){
                self.resetPosition.call(self);
            });
		}

	}, {type: 'minimumReadableDialogView'});

	return minimumReadableDialogView;

});
