define(['lodash', 'jquery', 'backbone', 'mustache', 'text!modules/CGSHintUtil/templates/CGSHintView.html'],
    function (_, $, Backbone, Mustache, template) {

        var CGSHintView = Backbone.View.extend( {

            initialize : function( config ){

                var position = $( config.selector ).offset();

                var el = $( "body" ).append( Mustache.render( template , config ) );

                this.$el = el.find( ".cgs-hint:last-child" );

                this.$el.css({
                    "left" : Math.round( position.left ) + "px" ,
                    "top" : Math.round( position.top ) + "px"
                });

                this.$el.find( "[class^=cgs-hint-close]" ).click( this.close.bind( this ) );

            } ,

            close : function(){

                this.dispose();

            } ,

            dispose : function(){

                this.$el.empty();
                this.remove();

            } ,

            mirror : function( id ){

            }

        } );

        return CGSHintView;

    });