QUnit.config.autostart = false;

require.config({
	paths: {
		backbone: 'libs/backbone/backbone',
		backbone_super: 'common/backbone_super',
		cryptojs: 'libs/cryptojs/core',
		cryptojs_sha1: 'libs/cryptojs/sha1',
		jquery: 'libs/jquery/jquery',
		cookie: 'libs/jquery/jquery.cookie',
		cookie_test: 'test/cookie_test',
		lodash: 'libs/lodash/lodash',
		mustache: 'libs/mustache/mustache',
		jsonpath: 'libs/jsonpath/jsonpath',
		canvas_blob: 'libs/canvas-blob/canvas-to-blob',
		undo: 'libs/undo-js/undo',

		repo: 'common/repo',
		events: 'common/events',
		files: 'common/files',
		assets: 'common/assets',
		validate: 'common/validate',
		translate: 'common/translate',
		conversionUtil: 'modules/ConversionUtil/conversionUtil',
		dao: 'common/dao',
        rest: 'common/rest',
        restDictionary: 'common/restDictionary',
        repo_controllers: 'common/repo_controllers',
        recent: 'common/recent',

		configModel: 'models/configModel',
		userModel: 'models/userModel',
		learningPathModel: 'models/learningPathModel',
		types: 'config/types',
		settings: 'config/settings',
		appletModel: 'models/appletModel',

		super_test: 'test/super_test',
		super_test_data: 'test/super_test_data',
		repo_test: 'test/repo_test',
		events_test: 'test/events_test',
		files_test: 'test/files_test',
        validate_test: 'test/validate_test',
        translate_test: 'test/translate_test',
        conversion_test: 'test/conversion_test',
		recent_test: 'test/recent_test',
		assets_test: 'test/assets_test'
	},

	shim: {
		backbone: {
			deps: ['lodash', 'jquery'],
			exports: 'Backbone'
		},
		cookie: {
			deps: ['jquery']
		},
		cryptojs_sha1: {
			deps: ['cryptojs']
		}
	}
});

define('busyIndicator', function() {
	return {
		start: function() {},
		stop: function() {}
	}
})

define('showMessage', function() {
	return {
	}
})

define('appletModel', function() {
	return {
	}
})

define('configModel', function() {
	return {
		initParams: function() {},
		configuration: {
			basePath: "http://localhost/cgs/rest/"
		}
	}
})

define('dialogs', function() {
	return  'bar';
})

require(['super_test', 'events_test', 'files_test', 'conversion_test', 'recent_test', 'assets_test', 'validate_test', 'translate_test'], function() {
	QUnit.start();
});