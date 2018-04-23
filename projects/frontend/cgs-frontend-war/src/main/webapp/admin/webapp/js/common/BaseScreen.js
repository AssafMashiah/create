define(['lodash', 'BaseController', 'events'],
function(_, BaseController, events) {

	var BaseScreen = BaseController.extend({

		initialize: function(config, configOverrides) {
			this._super(config, configOverrides);

			this.registerBaseEvents();

			// Delay initialization of components (more readable stack traces)
			this.loadComponents();
		},

		registerBaseEvents: function() {
            events.register('setActiveEditor', this.setActiveEditor, this);
            events.register('setActiveEditorEndEditing', this.setActiveEditorEndEditing, this);
        },

		dispose: function() {
			if (this.components) {
				_.each(this.components, function(com) {
					if (typeof com.dispose === 'function') com.dispose();
				});
			}

			events.unbind('setActiveEditor', this.setActiveEditor);
            events.unbind('setActiveEditorEndEditing', this.setActiveEditorEndEditing);
			events.unbind('references_course');

			this.view && this.view.remove();

			this._super();
			console.log(this.constructor.type + ' is disposed of');
		},
		loadComponents: function () {
			this.components = {};

			_.each(this.config.components, function(def, name) {
				var config = _.extend(def.config || {}, {'screen': this});
				this.components[name] = this.router.loadModule(def.modName, config);
			}, this);

			this.view.adjustHeight();
			events.register('adjust_screen_height',this.view.adjustHeight);
		},
        setActiveEditorEndEditing: function(){
	        this.activeContentEditor && this.activeContentEditor.endEditing && this.activeContentEditor.endEditing();
        },
		setActiveEditor: function(editor){
			if (!!this.activeContentEditor && typeof this.activeContentEditor.endEditing === 'function'
				&& this.editor != editor) {
				this.activeContentEditor.endEditing();
			}

			this.editor = editor;
			if(editor.isTask){
				this.activeContentEditor = null;
			}else{
				this.activeContentEditor = editor;
			}
		}

	}, {type: 'BaseScreen'});

	return BaseScreen;

});