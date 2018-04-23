define(['lodash', 'jquery', 'configModel'], function(_, $, configModel)
{
	var rest = function(){
	}

	rest.prototype.api = function( pathData, data, callback, error )
	{
		
		var restPath = configModel.configuration.basePath ;
		
		var ajaxData = {
			url: restPath + pathData.path,
			type: pathData.method,
			dataType: pathData.dataType,
			contentType: pathData.contentType,
			success: callback,
			error: error
		};
		
		if( pathData.sendAs == "url" ) {
			if(pathData.hasParam){
				ajaxData.url += '&' + $.param( data ) ;
			}else{
				ajaxData.url += '?' + $.param( data ) ;
				
			}
		} else if( pathData.dataType == "json" ) {
			ajaxData.data = JSON.stringify( data, null, '\t' ) ;
		} else {
			ajaxData.data = data ;
		}
		
        $.ajax(ajaxData);
    }
	
	return new rest;
});
