define(["files"], function (files) {

	var RECENT_FILE = "_recent.json",
		MAX_ITEMS = 10;

	/** [Internal] Save recent list to the local fs. */
	function commitToFile(recent_list, callback) {
		recent_list = _.uniq(recent_list);

		while (recent_list.length > MAX_ITEMS) {
			recent_list.pop();
		}

		files.saveObject(recent_list, "_recent.json", "", function() {
			if (typeof callback == 'function') callback();
		});
	}

	/** Add courseId to recent list. */
	function addRecent(courseId, callback) {
		if (!courseId) {
			if (typeof callback == 'function') callback();
			return;
		}

		files.fileExists(RECENT_FILE, function (result) {
			/* Read recent list from file. */
			if (result) {
				files.loadObject(RECENT_FILE, function (obj) {
					if ($.isArray(obj)) {
						obj.unshift(courseId);
						commitToFile(obj, callback);
					}
				});
			}
			/* Create new recent list. */
			else {
				commitToFile([courseId], callback);
			}
		});
	}

	/** Get recent list. */
	function getRecent(callback, context) {
		files.fileExists(RECENT_FILE, function (result) {
			/* Read recent list from file. */
			if (result) {
				files.loadObject(RECENT_FILE, function (obj) {
					if (!obj || !obj.length) obj = [];
					callback.call(context, obj);
				});
			}
			/* Return empty list. */
			else {
				callback.call(context, [/* nothing */]);
			}
		});
	}

	return {
		addRecent: addRecent,
		getRecent: getRecent
	};
});
