define([], function () {
	var PluginConstants = {
		manifestFileName: 'manifest.json',
		pluginsFileName: 'js/plugins.json',
        templateFileName: "template.json",


		PluginContentEditor: 'modules/PluginEditor/PluginContentEditor',
		TaskEditorTypes: ['SequenceEditor'],
		internalEditorTypes: {
			"content": "pluginExternal",
			"task": "pluginTask",
			"sequence": "pluginContent"
		},

		TASK_TYPE: 'sys:pluginTask',
		CONTENT_TYPE: 'sys:pluginContent',
		VALID_PLUGIN_TYPES: ['pluginTask', 'pluginContent', 'pluginExternal'],
		BASE_PLUGINS_PATH: "plugins",
		editorTypes: {
			"sequence": "LessonScreen",
			"task": "SequenceEditor"
		}
	};

	return PluginConstants;
});