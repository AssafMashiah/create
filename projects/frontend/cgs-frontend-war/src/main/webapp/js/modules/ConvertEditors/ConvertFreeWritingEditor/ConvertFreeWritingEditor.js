define(['lodash', 'BaseContentEditor', 'repo', 'repo_controllers', 'events','./constants', './config', 
	'./ConvertFreeWritingView', './ConvertFreeWritingPropsView','localeModel'], 
	function f407(_, BaseContentEditor, repo, repo_controllers, events, constants, config, 
		ConvertFreeWritingView, ConvertFreeWritingPropsView, localeModel) {
	var ConvertFreeWritingEditor = BaseContentEditor.extend({
		initialize: function f408(options) {
			this._super(config, options);
			this.config.previewMode = false;

			repo.startTransaction({ ignore: true });
			//set props default values (because we have a multiple props views for any mc, so we can't do the set through the task template)
			_.each(constants.fields, _.bind(function f409(item) {
				if (typeof this.record.data[item.name + '_' + this.record.id] === 'undefined') {
					repo.updateProperty(this.record.id, item.name + '_' + this.record.id, item.value, false, true);
					repo.updateProperty(this.record.id, item.name, item.value, false, true);
				}
			}, this));

			repo.updateProperty(this.record.id, 'question_instruction', localeModel.getConfig('stringData').repo['freeWritingInstruction'], false, true);
			repo.endTransaction();
			
			//initialize the stage view
			this.stage_view = new ConvertFreeWritingView({ controller: this });	

			events.fire('setActiveEditor', this);
		},
		loadProps: function f410() {
			//load the props view
			this.view = new ConvertFreeWritingPropsView({ controller: this });
			//set the props events
			this.registerEvents();
		},

		registerEvents: function f411() {
			var changes = {},
				model = null;

			_.each(constants.fields, function f412(item) {
				changes[item.name + '_' + this.record.id] = this.propagateChanges(this.record, item.name + '_' + this.record.id, true);
			}, this);
			
			model = this.screen.components.props.startEditing(this.record, changes);

			_.each(constants.fields, function f413(item) {
				model.on('change:' + item.name + '_' + this.record.id, 
						this['on' + (item.name.charAt(0).toUpperCase() + item.name.slice(1)) + "Change"], this);
			}, this);
		},

		onSizeChange: function f414() {
			repo.updateProperty(this.record.id, 'size', this.record.data['size_' + this.record.id]);

			switch (this.record.data.size) {
				case 'Line':
					repo.updateProperty(this.record.id, 'MaxChars', '45');
					break;
				case 'Paragraph':
					repo.updateProperty(this.record.id, 'MaxChars', '150');
					break;
				case 'FullText':
					repo.updateProperty(this.record.id, 'MaxChars', '500');
					break;
			}

			this.stage_view.update_textarea_size(this.record.data['size']);
		},

		onTypeChange: function f415() {
			repo.startTransaction({ appendToPrevious: true });
			repo.updateProperty(this.record.id, 'type', this.record.data['type_' + this.record.id]);
			repo.endTransaction();
		},
		onToolbarChange: function f416() {
			repo.startTransaction({ appendToPrevious: true });
			repo.updateProperty(this.record.id, 'toolbar', this.record.data['toolbar_' + this.record.id]);
			repo.endTransaction();
		}
	}, { type: 'ConvertFreeWritingEditor' });

	return ConvertFreeWritingEditor;
});