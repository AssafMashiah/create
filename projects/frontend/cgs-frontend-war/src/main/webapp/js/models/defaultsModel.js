define([], function f1905() {

	// New item adding to repo entry points:
	// 1. repo.set, 94
	// 2. repo.addTemplate, 738
	// 3. repo.changeChildrenRecordsByTypeRecursively, 473 - no defaults needed
	// 4. repo.setRecursiveCloneToRepo, 668 - no defaults needed

	// New item args params:
	// title
	// type
	// title_addition
	// data
	// childConfig
	// insertAt

	var defaultsModel = (function() {

		var defaults = {
			'instruction': {
				data: {
					show: false
				}
			},


			'textEditor': {
				data: {
					ShowToolbar: true
				}
			},
			'cloze_answer': {
				data: {
					maxHeight: "firstLevel"
				}
			},

			'textViewer': {
				data: {},
				extend: function(rec) {
					var ancestors = require('repo').getAncestors(rec.id);
					if (_.find(ancestors, function(item) { return item.type == 'help' })) {
						return {
							disableInfoBalloon: true
						}
					}
				}
			},

			'progress': {
				data: {
					num_of_attempts: "2"
				}
			},

			'advancedProgress': {
				data: {
					num_of_attempts: "2"
				}
			},

			'tableCell': {
				data: {
					childType: "Text"
				},
				commands: [
					{
						name: 'addChildren',
						args: {
							type: 'textViewer',
							title: '',
							data: {
								addParentProps: true,
								disableDelete: true,
								maxWidth: "218px",
								minWidth: "50px",
								mode: "thin",
								showNarrationType: true,
								textEditorStyle: "texteditor",
								availbleNarrationTypes: [
									{
										name: 'None',
										value: ''
									},
									{
										name: 'General',
										value: '1'
									}
								]
							}
						}
					}
				]
			},

			'question': {
				commands: [
					{
						name: 'addChildren',
						args: {
							type: 'textViewer',
							title: "",
							data: {
								showNarrationType: true,
								textEditorStyle: "texteditor",
								width: "100%"
							}
						}
					}
				]
			},

			'pluginExternal': {
				commands: [
					{
						name: 'setPluginDefaults'
					}
				]
			},

			'pluginContent': {
				commands: [
					{
						name: 'setPluginDefaults'
					}
				]
			},

			'pluginTask': {
				commands: [
					{
						name: 'setPluginDefaults'
					}
				]
			},

			'pluginHidden': {
				commands: [
					{
						name: 'setPluginDefaults'
					}
				]
			}
		};

		var commands = {
			addChildren: function(args) {
				require('repo').createItem($.extend(true, {parentId: this.id}, args));
			},
			setPluginDefaults: function() {
				require('pluginModel').setRecordDefaults(this);
			}
		}

		return {
			setDefaults: function(dataRecord) {

				var defaultRecord = dataRecord && defaults[dataRecord.type];
				if (!defaultRecord || (dataRecord.data && eval(dataRecord.data.ignore_defaults))) {
					return;
				}

				$.extend(true, dataRecord.data, defaultRecord.data, defaultRecord.extend && defaultRecord.extend(dataRecord));

				_.each(defaultRecord.commands, function(command) {
					commands[command.name].call(dataRecord, command.args);
				});

			}
		};

	})();

	return defaultsModel;

});