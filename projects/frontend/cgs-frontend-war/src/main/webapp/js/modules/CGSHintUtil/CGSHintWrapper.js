define([ "jquery" , "backbone" , "mustache" , "text!modules/CGSHintUtil/templates/CGSHintWrapper.html" ] ,
    function( $ , Backbone , mustache , template ){

        var CGSHintsWrapper = Backbone.View.extend({

            initialize : function( config ){

                this.$parent = config.$parent;
                this.template = template;

                this.render();

            } ,

            render : function(){

                this.$parent.append( mustache.render( this.template ) );

                this.$el = this.$parent.find( "#cgsHintsWrapper" );

            } ,

            show : function(){

                this.$el.show();

            } ,

            hide : function(){

                this.$el.hide();

            } ,

            empty : function(){

                this.$el.empty();

            }

        });

        return CGSHintsWrapper;

    });