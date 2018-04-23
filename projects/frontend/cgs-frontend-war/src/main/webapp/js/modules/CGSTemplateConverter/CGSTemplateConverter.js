define( [ "lodash"] , function( _ ){

    var CGSTemplateConverter = function(){

        var account = require('userModel').getAccount();
        if (!account || !account.enableHints) {
            this.regexp = { "<tooltip( position=\\\"([a-zA-Z\\-]+)\\\")?>([\\s\\S]*?)<\\/tooltip>" : "" };
        }

    };

    CGSTemplateConverter.prototype = {

        regexp : {
            "<tooltip( position=\\\"([a-zA-Z\\-]+)\\\")?>([\\s\\S]*?)<\\/tooltip>" : "<div class=\"cgs-tooltip-button\" data-position=\"$2\" data-title=\"$3\" onmouseover=\"require('CGSTooltipUtil').render.apply(require('CGSTooltipUtil'), arguments)\" onmouseout=\"require('CGSTooltipUtil').empty()\">i</div>"
        } ,

        convert : function( template ){

            _.each( this.regexp , function( replacer , pattern ){

                template = template.replace( new RegExp( pattern , "g" ) , replacer );

            } );

            return template;

        }

    };

    return CGSTemplateConverter;

} );