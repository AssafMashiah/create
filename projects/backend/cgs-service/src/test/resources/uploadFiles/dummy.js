require.config({

	baseUrl: 'js',

	paths: {
		/* libs */
		backbone: 'libs/backbone/backbone',
		bootstrap: 'libs/bootstrap/bootstrap',
		cryptojs: 'libs/cryptojs/core',
		cryptojs_sha1: 'libs/cryptojs/sha1',
		jquery: 'libs/jquery/jquery',
        jquery_ui: 'libs/jquery/jquery-ui',
		cookie: 'libs/jquery/jquery.cookie',
		highlight: 'libs/jquery/rf.Highlight',
		lodash: 'libs/lodash/lodash',
		mustache: 'libs/mustache/mustache',
		rivets: 'libs/rivets/rivets',
		text: 'libs/require/text',

		/* common */
		backbone_super: 'common/backbone_super',
		load: 'common/load',
		files: 'common/files',
		repo: 'common/repo',
		events: 'common/events',
		validate: 'common/validate',
		translate: 'common/translate',
		BaseController: 'common/BaseController',
		BaseScreen: 'common/BaseScreen',
		BaseEditor: 'common/BaseEditor',
		BaseView: 'common/BaseView',
		BaseScreenView: 'common/BaseScreenView',
		BasePropertiesView: 'common/BasePropertiesView',
		BaseStageView: 'common/BaseStageView',
		dialogs: 'common/dialogs',
		standards: 'common/standards',
		modal: 'common/modal',
		editMode: 'common/editMode',
		keyboardManager: 'common/keyboardManager',
		focusManager: 'common/focusManager',
		dao: 'common/dao',
		rest: 'common/rest',
		restDictionary: 'common/restDictionary',

		/* models */
		userModel: 'models/userModel',
		courseModel: 'models/courseModel',

		/* config */
		types: 'config/types',
		settings:'config/settings'
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

		highlight: {
			deps: ['jquery']
		},

		/* cryptojs */
		cryptojs: {
			exports: 'CryptoJS'
		},

		cryptojs_sha1: {
			deps: ['cryptojs']
		}
	},

	/* require-css */
	map: {
		'\u002a': {
			css: 'libs/require-css/css'
		}
	}

});

/* require-css baseUrl hack */
require(['css'], function(css) {
	var _load = css.load;

	css.load = function(id, req, load, config) {
		config.baseUrl = 'css/';
		_load.apply(this, arguments);
		config.baseUrl = 'js/';
	}
});


/* --- This didn't work and thus was commented out ---

require(['userModel', 'files', 'rivets', 'standards', 'events'], function(userModel, files, rivets, standards, events) {

	files.allocate();

	// register initCGS event
	events.register('initCGS', function(){
		require(['router']);
	});

	userModel.init();

--- until here --- */

require(['rivets', 'router'], function(rivets) {

	/* rivets configuration for backbone models */
	rivets.configure({
		adapter: {
			subscribe: function(obj, keypath, callback) {
				obj.on('change:' + keypath, callback)
			},

			unsubscribe: function(obj, keypath, callback) {
				obj.off('change:' + keypath, callback)
			},

			read: function(obj, keypath) {
				return obj.get(keypath)
			},

			publish: function(obj, keypath, value) {
				obj.set(keypath, value)
			}
		}
	})

});
