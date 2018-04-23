define(['require', 'config/modules'], function(require) {

	return function(modName, prefix,options) {

		try {
			if (prefix) {
				return require(['modules', prefix, modName, modName].join('/'));
			}else if(options){
                return require(['modules',options.folderName, modName].join("/"));
            }
            else {
				return require(['modules', modName, modName].join('/'));
			}
		}
		catch (err) {
			throw new Error('Module "' + modName + '" not in config/modules');
		}

	};
	
});
