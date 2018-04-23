define(function() {
	/* Mustache functions. */
	return {
		add_to: function(obj, undecorate) {
			if (typeof obj["file-path"] === "function" && typeof obj["server-path"] === "function") return;

			if (typeof obj["file-path"] != "function") {
				obj["file-path"] = function () {
					var assets = require("assets");

					// Can't return assets.absPath due to extra args passed.
					return function (path, render) {
						return assets.absPath(typeof render == 'function' ? render(path) : path);
					}
				};

				if (undecorate) {
					obj["file-path"] = obj["file-path"]()
				}
			}
			if (typeof obj["server-path"] != "function") {
				obj["server-path"] = function () {
					var assets = require("assets");

					return function (path, render) {
						return assets.serverPath(typeof render == 'function' ? render(path) : path);
					}
				};

				if (undecorate) {
					obj["server-path"] = obj["server-path"]()
				}
			}
		}
	}
});
