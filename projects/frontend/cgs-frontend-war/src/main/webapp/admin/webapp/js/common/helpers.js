define(function() {
	/**
	 * Helper function:
	 * convert array to a repo-like object (key-value store).
	 */
	function arrayToRepoLikeObject(array) {
		var retval = {}

		_.each(array, function(obj) {
			retval[obj.id] = _.clone(obj, true)
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

	return {
		arrayToRepoLikeObject: arrayToRepoLikeObject,
		arrayRemoveProperty: arrayRemoveProperty
	}
})
