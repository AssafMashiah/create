define([ "jquery" , "backbone" , "mustache" , "text!modules/CGSTooltipUtil/templates/CGSTooltipWrapper.html" ] ,
    function( $ , Backbone , mustache , template ){

        var CGSTooltipWrapper = Backbone.View.extend({

            initialize : function( config ){

                this.$parent = config.parent;
                this.template = template;

                this.render();

            } ,

            render : function(){

                this.$parent.append( mustache.render( this.template ) );

                this.$el = this.$parent.find( "#CGSTooltipWrapper" );

            } ,

            empty : function(){

                this.$el.empty();

            } ,

            dispose : function(){

                this.$el.remove();

            }

        });

        return CGSTooltipWrapper;

    });