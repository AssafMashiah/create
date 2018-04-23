define( [ "jquery" , "backbone" , "mustache" , "userModel", "text!modules/CGSHintUtil/templates/CGSHintToggleView.html" ] ,
    function( $ , Backbone , mustache , userModel, template ){

        var CGSHintsToggleView = Backbone.View.extend({

            initialize : function( config ){
                this.controller = config.controller;
                this.$parent = config.$parent;
                this.template = template;
                this.render();

            } ,

            render : function(){
                this.$parent.append( mustache.render( this.template ) );

                this.toggleElem = this.$parent.find( "#cgsHintToggle" );

                this.toggleElem.on('click', this.toggleMode.bind( this ) );

            } ,
            setDisabled: function () {
                this.toggleElem && this.toggleElem.length && this.toggleElem.addClass('disabled') && this.toggleElem.off('click');
            },
            setEnabled: function () {
                this.toggleElem && this.toggleElem.length && this.toggleElem.removeClass('disabled') && this.toggleElem.off('click').on('click', this.toggleMode.bind( this ));
            },
            toggleMode : function(){

                this.controller.showMode == "showAll" ? this.hideAll() : this.showAll();

            } ,

            showAll : function(){

                // Switch the appearance of the toggle button
                $( "#cgsHintToggle" )
                    .removeClass( "toggle-hints-off" )
                    .addClass( "toggle-hints-on" );

                this.controller.showAll();

            } ,

            hideAll : function(){

                // Switch the appearance of the toggle button
                $( "#cgsHintToggle" )
                    .removeClass( "toggle-hints-on" )
                    .addClass( "toggle-hints-off" );

                this.controller.hideAll();

            }

        });

        return CGSHintsToggleView;

    } );