define(['lodash', 'jquery', 'configModel'], function(_, $, configModel)
{

	function _dataFilter(data, type) {
		if (type == 'json' && !data) {
			return null;
		}
		return data;
	}

	var rest = function() {
	};

	rest.prototype.api = function( pathData, data, callback, error, disableCache )
	{
		
		var config = configModel.getConfig();
		
		var ajaxData = {
			url: (config && config.basePath || location.origin + '/cgs/rest/') + pathData.path,
			type: pathData.method,
			dataFilter: _dataFilter,
			dataType: pathData.dataType,
			contentType: pathData.contentType,
			success: callback,
			error: error,
			cache: !disableCache
		};

		if (pathData.async !== undefined) {
			ajaxData.async = pathData.async;
		}
		
		if( pathData.sendAs == "url" ) {
			if ($.param( data ).trim()) {
				if(pathData.hasParam){
					ajaxData.url += '&' + $.param( data ) ;
				}else{
					ajaxData.url += '?' + $.param( data ) ;
				}
			}
		} else if( pathData.dataType == "json" ) {
			ajaxData.data = JSON.stringify( data) ;
		} else {
			ajaxData.data = data ;
		}
		
        return $.ajax(ajaxData);
    };
	
	return new rest;
});
