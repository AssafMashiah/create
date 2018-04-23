define(['jquery', 'backbone', 'mustache', 'cgsUtil' , 'text!modules/CGSTooltipUtil/templates/tooltipTemplate.html'],
    function ( $, Backbone, Mustache , cgsUtil , template) {

        var CGSTooltipView = Backbone.View.extend( {

            initialize : function( config ){

                this.$parent = config.parent;

            } ,

            render : function( data ){

                this.data = data;

                this.$parent.append( Mustache.render( template , {
                    title : require("translate").tran(data.title) ,
                    position : data.position
                } ) );

                this.$el = this.$parent.find( "#CGSTooltipBox" );

                // Extracting position to an object
                var extractPosition = this.data.position.split( "-" );
                this.data.position = {
                    verticalAlign : extractPosition[ 0 ] ,
                    horizontalAlign : extractPosition[ 1 ]
                };

                // Manipulate WIDTH x HEIGHT to fit avoid superlong tolltips
                var CGSTooltip = $( "#CGSTooltip" );
                if( CGSTooltip.height() > CGSTooltip.width()  ){
                    CGSTooltip.css({ width : ( CGSTooltip.width() + CGSTooltip.height() / 2 ) + "px" } );
                }

                this.$el.css({
                    height: ( CGSTooltip.outerHeight() + 10 ) + "px" ,
                    width: ( CGSTooltip.outerWidth() + 10 ) + "px"
                });

                // Align the tooltip box according to tits selector
                this.alignTooltip();

                // After the alignment reassign class to tooltip
                // Needed in case of mirroring while alignment
                this.reassignClass();

            } ,

            reassignClass : function(){
                $( "#CGSTooltipArrow" )[ 0 ].className = this.data.position.verticalAlign + "-" + this.data.position.horizontalAlign;
            } ,

            // Align the position of a hint according to its selector
            alignTooltip : function(){

                // Calculating top-left position
                var top = cgsUtil.alignmentCalculator.calculateTop({
                    elem : this.$el ,
                    selector : this.data.selector ,
                    position : this.data.position
                });

                var left = cgsUtil.alignmentCalculator.calculateLeft({
                    elem : this.$el ,
                    selector : this.data.selector ,
                    position : this.data.position
                });

                // Correcting placement
                left += this.data.position.horizontalAlign == "left" ? 0 : 5;

                this.$el.css({
                    top : top + "px" ,
                    left : left + "px",
                    display : "block"
                });

            } ,

            dispose : function(){

                this.$el.remove();
                this.remove();

            }

        } );

        return CGSTooltipView;

    });