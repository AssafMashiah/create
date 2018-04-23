require.config({

	baseUrl: 'admin/webapp/js',

	paths: {
		/* libs */
		backbone: 'libs/backbone/backbone',
		bootstrap: 'libs/bootstrap/bootstrap.min',
		cryptojs: 'libs/cryptojs/core',
		cryptojs_sha1: 'libs/cryptojs/sha1',
		bootstrap_tables: 'libs/bootstrap/bootstrap.tables',
		jquery_tables: 'libs/jquery/jquery.tables',
		jquery: 'libs/jquery/jquery',
        jquery_ui: 'libs/jquery/jquery-ui.min',
        highlight: 'libs/jquery/rf.Highlight',
		cookie: 'libs/jquery/jquery.cookie',
		lodash: 'libs/lodash/lodash',
		underscore: 'libs/underscore/underscore',
		mustache: 'libs/mustache/mustache',
		rivets: 'libs/rivets/rivets',
		text: 'libs/require/text',
		jsonpath: 'libs/jsonpath/jsonpath',
		keyboard: 'libs/keyboard/keyboard',
		'diff-match-patch': 'libs/undo-js/lib/diff-match-patch',
		'tagit':'libs/tagIt/tagit',
		moment: 'libs/moment/moment',

		/* pdf.js */
		canvas_blob: 'libs/canvas-blob/canvas-to-blob',

		/* common */
		backbone_super: 'common/backbone_super',
		mustache_functions: 'common/mustache_functions',
		helpers: 'common/helpers',
		load: 'common/load',
		files: 'common/files',
		FileUpload: 'common/FileUpload',
		IconAndFileUpload: 'common/IconAndFileUpload',
		events: 'common/events',
		translate: 'common/translate',
		BaseEditor: 'common/BaseEditor',
		BaseController: 'common/BaseController',
		BaseScreen: 'common/BaseScreen',
		BaseView: 'common/BaseView',
		BaseScreenView: 'common/BaseScreenView',
		dialogs: 'common/dialogs',
		clipboardManager: 'common/clipboardManager',
		keyboardManager: 'common/keyboardManager',
		focusManager: 'common/focusManager',
		dao: 'common/dao',
        rest: 'common/rest',
        restDictionary: 'common/restDictionary',
		busyIndicator: 'modules/BusyIndicator/BusyIndicator',
		/* config */
		types: 'config/types',
		settings: 'config/settings',
		consts: 'config/consts',

		showMessage: 'modules/showMessage/showMessage',

		/*Models*/
		publisher_defaults: "models/PublisherDefaults",
		group_model: "models/GroupModel",
		group_collection: "models/GroupCollection",
		publisher_model: 'models/PublisherModel',
		publisher_collection: 'models/PublisherCollection',
		admin_user_model: 'models/AdminUserModel',
		standard_model: 'models/StandardModel',
		standards_collection: 'models/StandardsCollection',
		publisher_user_collection: 'models/PublisherUserCollection',
		role_model: "models/RoleModel",
		roles_collection: "models/RolesCollection",
		courses_collection: "models/CourseCollection",
		providers_collection: "models/ProviderCollection",
		course_model: "models/CourseModel",
		tts_list_component: "components/tts_list/TtsListComponentView",
		bundleModel: "models/BundleModel",
		bundlesCollection: "models/BundlesCollection",
		bundlesManager: "components/bundlesManager/BundlesManager",
		externalAccountsComponent: "components/externalAccounts/externalAccountsComponent"
	},

	shim: {
		backbone: {
			deps: ['lodash', 'jquery'],
			exports: 'Backbone'
		},
		
		rivets: {
			exports: 'rivets'
		},

		/* jquery plugins */
		cookie: {
			deps: ['jquery']
		},
		jquery_tables: {
			deps: ['jquery']
		},
		bootstrap: {
			deps: ['jquery']
		},
		bootstrap_tables: {
			deps: ['jquery_tables']
		},
		highlight: {
			deps: ['jquery']
		},

		/* cryptojs */
		cryptojs: {
			exports: 'CryptoJS'
		},

		cryptojs_sha1: {
			deps: ['cryptojs']
		},
		tagit:{
			deps: ['jquery', 'jquery_ui']
		}
	}

}); 
 


/* patch mustache_functions */
/* TODO: move i18n here */
require(['mustache', 'mustache_functions'], function(mustache, functions) {
	var original_render = mustache.render;

	mustache.render = function() {
		if (arguments[1]) functions.add_to(arguments[1]);
		return original_render.apply(mustache, arguments);
	}
});

require(['rivets', 'mustache_functions', 'router', 'busyIndicator'], function(rivets, mustache_functions) {

	/* rivets configuration for backbone models */
	// Rivets.js Backbone adapter
	rivets.adapters[':'] = {
		// set the listeners to update the corresponding DOM element
		subscribe: function(obj, keypath, callback) {
		obj.on('change:' + keypath, callback);
		},
		// this will be triggered to unbind the Rivets.js events
		unsubscribe: function(obj, keypath, callback) {
		obj.off('change:' + keypath, callback);
		},
		// set the values that it's possible to read from the objects passed to Rivets.js
		read: function(obj, keypath) {
		// if we use a collection we will loop through its models otherwise we just get the model properties
		return obj instanceof Backbone.Collection ? obj.models : obj.get(keypath);
		},
		// It gets triggered whenever we want update a model using Rivets.js
		publish: function(obj, keypath, value) {
		obj.set(keypath, value);
		}
	};

	mustache_functions.add_to(rivets.formatters, true)

	/* string formatting helper */

	String.prototype.format = function() {
		var args = arguments
		return this.replace(/{(\d+)}/g, function(match, number) {
			return typeof args[number] !== 'undefined'? args[number]: match
		})
	}

});