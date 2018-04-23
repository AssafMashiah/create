define(['Class'], function (Class) {
	var PluginDialogsModel = Class.extend({
		initialize: function () {

		},
		show: function (data, callback) {
			if (!_.isObject(data) || !data) {
				throw new TypeError('PluginDialogsModel: No data pass to showDialog')
			}

			if (!data.title || !data.buttons) {
				throw new TypeError("PluginDialogsModel: Missing one or more params");
			}

			if (callback && !_.isFunction(callback)) {
				throw new TypeError("Plugin")
			}

			return require('cgsUtil').createDialog(data.title, data.content, "simple", data.buttons, callback);
		}
	});

	return new PluginDialogsModel;
});