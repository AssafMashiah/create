define(['backbone_super', 'BaseController', './config', './StageComponentView', 'events'],
function(Backbone, BaseController, config, StageComponentView, events) {

	var StageComponent = BaseController.extend({

		initialize: function(configOverrides) {
			this._super(config, configOverrides);
			this.view = new StageComponentView();

			this.registerEvents();
		},

		registerEvents: function() {
			//fires after deleting an item from a task

			//event fired when clicking on stage, closes the active editor and sets the editor to be the default
			this.bindEvents({
				'clickOnStage': {'type':'register', 'func': function f1095() {
					//prevent setting the default editor twice (if clicking twice on stage)
					if (this.screen.editor.elementId != this.router.activeEditor.elementId) {
						events.fire('removeSelectedEditor');
						this.router.startEditingActiveEditor();}
				},
				'ctx': this, 'unbind':'dispose'}
			});
		},

		startEditing: function(record, changes, container) {
			var Model = Backbone.Model.extend({}),
				model = new Model(record.data);

			if (changes) {
				_.each(changes, function(callback, field) {
					model.on('change:' + field, callback);
				});
			}

			this.config.screen.editor.stage_view.startEditing(model, container);

			return model;
		}

	}, {type: 'StageComponent'});

	return StageComponent;

});
