define(['Class', 'lodash'], function (Class, _) {
	var PluginsCollection = Class.extend({
		initialize: function () {
			this.plugins = [];
		},
		add: function (plugin) {
			this.plugins.push(plugin);
		},
		getByUUID: function (id) {
			return _.find(this.plugins, function (plugin) {
				return plugin.getId() === id;
			});	
		},
		getByName: function (name) {
			return _.find(this.plugins, function (plugin) {
				return plugin.getName() === name;
			});	
		}
	});

	return PluginsCollection;
});