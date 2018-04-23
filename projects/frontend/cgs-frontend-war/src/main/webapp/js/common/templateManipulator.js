define( [ "translate" , "CGSTemplateConverter" ] , function( i18n , CGSTemplateConverter ){

    var TemplateManipulator = function(){

        this.handlers = [
            function (str) {
                return new CGSTemplateConverter().convert(str);
            },
            i18n._.bind( i18n )
        ];

    };

    TemplateManipulator.prototype = {

        render : function( htmlString ,translations){

            this.handlers.forEach( function( fn ){
                htmlString = fn( htmlString ,translations);
            });

            return htmlString;
        }

    };

    return new TemplateManipulator();

});