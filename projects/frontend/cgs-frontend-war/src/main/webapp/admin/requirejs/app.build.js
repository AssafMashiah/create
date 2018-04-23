({
	appDir: '../webapp/',
	mainConfigFile: '../webapp/js/main.js',
	optimize: "uglify",
	uglify: {
		toplevel: true
	},
	generateSourceMaps:true,
	removeCombined: false,
	dir: '../../../build/exploded/production',
	optimizeCss: "standard",
	paths:{
        backbone: 'libs/backbone/backbone',
		bootstrap: 'libs/bootstrap/bootstrap',
		canvas_blob: 'libs/canvas-blob/canvas-to-blob',
		cryptojs_sha1: 'libs/cryptojs/sha1',
		jquery: 'libs/jquery/jquery',
        jquery_ui: 'libs/jquery/jquery-ui',
        imgAreaSelect: 'libs/jquery/jquery.imgareaselect',
		cookie: 'libs/jquery/jquery.cookie',
		highlight: 'libs/jquery/rf.Highlight',
		lodash: 'libs/lodash/lodash',
		underscore: 'libs/underscore/underscore',
		mustache: 'libs/mustache/mustache',
		rivets: 'libs/rivets/rivets',
		text: 'libs/require/text',
		jsonpath: 'libs/jsonpath/jsonpath',
		
		/* t2k libs */
		PostMessageManager: 'libs/t2k/PostMessageManager',

		/* pdf.js */
		pdf_js: 'components/pdf/lib/pdf',
		pdf_compat: 'components/pdf/lib/compatibility',
		pdf_to_html: 'components/pdf/pdf_to_html',
		pdf_viewer: 'components/pdf/pdf_viewer',

		/* common */
		backbone_super: 'common/backbone_super',
		mustache_functions: 'common/mustache_functions',
		load: 'common/load',
		files: 'common/files',
		FileUpload: 'common/FileUpload',
		IconAndFileUpload: 'common/IconAndFileUpload',
		assets: 'common/assets',
		uploadUtil: 'common/uploadUtil',
		recent: 'common/recent',
		repo: 'common/repo',
		repo_controllers: 'common/repo_controllers',
		events: 'common/events',
		validate: 'common/validate',
		translate: 'common/translate',
		BaseController: 'common/BaseController',
		BaseScreen: 'common/BaseScreen',
		BaseEditor: 'common/BaseEditor',
		BaseContentEditor: 'common/BaseContentEditor',
		BaseView: 'common/BaseView',
		BaseScreenView: 'common/BaseScreenView',
		BasePropertiesView: 'common/BasePropertiesView',
		BaseStageView: 'common/BaseStageView',
		BaseStageContentView : 'common/BaseStageContentView',
		BaseNormalStageContentView : 'common/BaseNormalStageContentView',
		dialogs: 'common/dialogs',
		standards: 'common/standards',
		modal: 'common/modal',
		editMode: 'common/editMode',
		keyboardManager: 'common/keyboardManager',
		focusManager: 'common/focusManager',
		dao: 'common/dao',
        rest: 'common/rest',
        restDictionary: 'common/restDictionary',
		conversionUtil: 'common/conversionUtil',
		busyIndicator: 'modules/BusyIndicator/BusyIndicator',

		/* models */
		userModel: 'models/userModel',
		courseModel: 'models/courseModel',
		lessonModel: 'models/lessonModel',
		configModel: 'models/configModel',
		lockModel: 'models/lockModel',
		appletModel: 'models/appletModel',
		cgsModel: 'models/cgsModel',
		publishModel: 'models/publishModel',
		learningPathModel: 'models/learningPathModel',

		/* config */
		types: 'config/types',
		settings:'config/settings',

		//player: "../player/scp/players/dl/"+ window.scpConfig.dlVersion +"/player",
		preview: 'models/previewModel',

		showMessage: 'modules/showMessage/showMessage'
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

		imgAreaSelect: {
			deps: ['jquery']
		},

		/* cryptojs */
		cryptojs: {
			exports: 'CryptoJS'
		},

		cryptojs_sha1: {
			deps: ['cryptojs']
		},

		/* pdf.js */
		pdf_js: {
			deps: ['pdf_compat'],
			exports: 'PDFJS'
		}        
    }
})
