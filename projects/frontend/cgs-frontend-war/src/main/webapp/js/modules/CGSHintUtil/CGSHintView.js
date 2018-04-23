define(['lodash', 'jquery', 'events', 'backbone', 'mustache', 'editMode' , 'cgsUtil' , 'text!modules/CGSHintUtil/templates/CGSHintView.html'],
    function (_, $, events, Backbone, Mustache, editMode , cgsUtil , template) {

        var CGSHintView = Backbone.View.extend( {

            initialize : function( config ){

                this.data = config.data;
                this.$parent = config.$parent;
                this.controller = config.controller;
                this.selectorEl = $(this.data.selector).first();

                this.render();
                this.align();

            } ,

            render : function() {

                this.$parent.append( Mustache.render( template , this.data ) );

                this.$el = this.$parent.find( "#" + this.data.id);

                // Updates position according to parent's scroll factor
                if (this.data.parentScroll){
                    $( this.data.parentScroll ).scroll( this.align.bind( this ) );
                }



            } ,

            // Align the position of a hint according to its selector
            align : function(){
                this.selectorEl = $(this.data.selector);

                if( !this.selectorEl.is( ":visible" ) ){

                    this.$el.hide();

                    return;

                }

                var display = "block";

                var offsets = cgsUtil.alignmentCalculator.calculate({
                    elem : this.$el ,
                    selector : this.selectorEl,
                    position : this.data.position,
                    disableReposition: this.data.disableReposition
                });

                // Assigning position class to out hint for correct arrow-pointer direction
                this.$el.addClass("{0} {1}".format(this.data.position.verticalAlign, this.data.position.horizontalAlign));

                // If parentScroll fields exists - check, whether the hint is overflowing its frame
                if( this.data.parentScroll ) {

                    var parentScrollOffset = $(this.data.parentScroll).offset().top;

                    if (offsets.top < parentScrollOffset || offsets.top + this.selectorEl.height() > parentScrollOffset + $(this.data.parentScroll).height) {
                        display = "none";
                    }

                }

                this.$el.css({
                    top : offsets.top + "px" ,
                    left : offsets.left + "px",
                    display : display
                });

                this.$el.find('.cgs-hint-text-container').css({
                    top: (this.$el.height() / 2) -  (this.$el.find('.cgs-hint-text-container').height() / 2)
                })


                var arrowDirection = this.$el.find('.cgs-hint-arrow:first').css('float');
                var marginDirection = (arrowDirection == 'left') ? 'right' : 'left';
                this.$el.find('.cgs-hint-text-container').css(marginDirection, '10px');

            } ,

            dispose : function(){

                if (this.data.parentScroll){
                    $( this.data.parentScroll ).unbind('scroll', this.align);
                }

                this.$el.remove();
                this.remove();

            }

        } );

        return CGSHintView;

    });