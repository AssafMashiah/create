define(['lodash', 'BaseController','keyboardManager', 'events', 'cgsModel'],
function(_, BaseController, keyboardManager, events, cgsModel) {

	var BaseScreen = BaseController.extend({

		initialize: function(config, configOverrides) {
			this._super(config, configOverrides);

			this.registerBaseEvents();

			// Delay initialization of components (more readable stack traces)
			this.initializeComponents();

			cgsModel.showCourseReferences();
		},

		registerBaseEvents: function() {
            events.register('setActiveEditor', this.setActiveEditor, this);
            events.register('setActiveEditorEndEditing', this.setActiveEditorEndEditing, this);
			events.register('references_course', cgsModel.showCourseReferences, cgsModel);
			events.register('customizationPack-done-loading', this.customizationPackDoneLoading, this);
        },

		dispose: function() {
			this.setActiveEditorEndEditing();
			if (this.router && this.router.activeEditor && typeof this.router.activeEditor.dispose == 'function') {
				this.router.activeEditor.dispose();
			}
			
			if (this.components) {
				_.each(this.components, function(com) {
					if (typeof com.dispose === 'function') com.dispose();
				});
			}

			events.unbind('setActiveEditor', this.setActiveEditor);
            events.unbind('setActiveEditorEndEditing', this.setActiveEditorEndEditing);
			events.unbind('references_course');
			events.unbind('customizationPack-done-loading', this.customizationPackDoneLoading);

			jQuery.fragments = {};
			this._super();
		},

		initializeComponents: function() {
			$(document).unbind("router.progress.dom_ready");
			$(document).bind("router.progress.dom_ready", _.bind(function (status) {
				if (this.config.components) {
					this.loadComponents();
				}

				$(document).trigger("router.progress.complete");
			}, this));

		},
		loadComponents: function () {
			this.components = {};

			_.each(this.config.components, function(def, name) {
				var config = _.extend(def.config || {}, {'screen': this});
				this.components[name] = this.router.loadModule(def.modName, config);
			}, this);

			this.view.adjustHeight();
			events.register('adjust_screen_height',this.view.adjustHeight);
			// Key events should be inited for each screen
			// keyboardManager.clear();
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
			if(editor.isTask && !editor.ignoreIsTaskOnActiveEditorSet){
				this.activeContentEditor = null;
			}else{
				this.activeContentEditor = editor;
			}
		},

		load: function(id) {

			if (this.components) {

				if (this.components.tree) {
					this.components.tree.load(id);
				}

				if (this.components.navbar) {
					this.components.navbar.load(id);
				}
			}
		},

		customizationPackDoneLoading: function() {
			//placeholder
		}

	}, {type: 'BaseScreen'});

	return BaseScreen;

});