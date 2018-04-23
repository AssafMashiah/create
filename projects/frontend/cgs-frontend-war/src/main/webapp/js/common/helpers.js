define(function() {
	/**
	 * Helper function:
	 * convert array to a repo-like object (key-value store).
	 */
	function arrayToRepoLikeObject(array) {
		var retval = {}

		_.each(array, function(obj) {
			retval[obj.id] = require('cgsUtil').cloneObject(obj)
		})

		return retval
	}

	function arrayRemoveProperty(array, property, fromRoot) {
		_.each(array, function (result, index) {

			if (fromRoot) {
				if (result[property]) {
					delete result[property];
				}
			} else {
				if (result.data[property]) {
					delete result.data[property];
				}
			}

		});
	}

	function bytesToSize(bytes) {
		var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		if (bytes == 0) return '0 Byte';
		var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
	}

	return {
		arrayToRepoLikeObject: arrayToRepoLikeObject,
		arrayRemoveProperty: arrayRemoveProperty,
		bytesToSize: bytesToSize
	}
})
