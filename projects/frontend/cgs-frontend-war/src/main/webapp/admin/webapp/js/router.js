define(['backbone_super', 'lodash', 'load', 'types', 'events', 'files'],
function(Backbone, _,load, types, events, files) {

	var Router = Backbone.Router.extend({
		activeScreen: {/* nothing */},
		activeEditor: {/* nothing */},
		selectedEditor: {/* nothing */},

		routes: {
			'': 'default',
			'logout': 'logout'
		},


		initialize: function() {
			Backbone.history.start();

			events.register('setSelectedEditor', this.setSelectedEditor, this);
			events.register('removeSelectedEditor', this.removeSelectedEditor, this);
		},

		"default": function() {
			var _default_screen = types.screen,
				_editor_type = types[AuthenticationData.editorType];

			if (!!this.activeEditor) {
				if (typeof this.activeEditor.dispose === 'function') this.activeEditor.dispose();
			}

			if (!!this.activeScreen) {
				if (typeof this.activeScreen.dispose === 'function') this.activeScreen.dispose();
			}


			this.activeScreen = this.loadModule(_default_screen, { router: this }, true);
			this.load_editor(_editor_type.editor, { 'screen': this.activeScreen, router: this, data: AuthenticationData });
		},

		logout: function () {
			window.location.href = AuthenticationData.configuration.logoutPath;
		},
		load_editor: function (editorName, data) {
			if(this.activeEditor) {
				if (typeof this.activeEditor.dispose === 'function') this.activeEditor.dispose();    
			}

			this.activeEditor = this.loadModule(editorName, data, false, null);

            return this.activeEditor;
		},

		/* 
			pathPrefix is for loading sub-folder modules inside the modules root 
			example:
				modules/ConvertEditors/*

			the prefix is define inside the types.js file
		*/
		loadModule: function(modName, config, setActive, pathPrefix, options) {
			console.log('Loading module: ' + modName);

			config = _.extend(config || {}, {router: this})


			var mod = new (load(modName, pathPrefix, options))(config);
			
			if (setActive) {
				this.activeScreen = mod;
			}

			return mod;
		},

		setSelectedEditor: function(editor) {
			if (!!this.selectedEditor && typeof this.selectedEditor.removeSelected === 'function')
				this.selectedEditor.removeSelected();
			this.selectedEditor = editor;

		},

		removeSelectedEditor: function() {
			if (!!this.selectedEditor && typeof this.selectedEditor.removeSelected === 'function')
				this.selectedEditor.removeSelected();
			this.selectedEditor = null;
		},

		startEditingActiveEditor: function() {
			this.activeEditor.startEditing && this.activeEditor.startEditing();
		}


	});



	return new Router();

});
