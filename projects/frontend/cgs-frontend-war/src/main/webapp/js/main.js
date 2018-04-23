require.config({

	baseUrl: 'js',

	paths: {
		/* libs */
		backbone: 'libs/backbone/backbone',
		bootstrap: 'libs/bootstrap/bootstrap.min',
		bootstrap_timepicker: 'libs/bootstrap/bootstrap-timepicker.min',
		cryptojs: 'libs/cryptojs/core',
		cryptojs_sha1: 'libs/cryptojs/sha1',
		Class: 'libs/Class/Class',
		jquery: 'libs/jquery/jquery',
        jquery_ui: 'libs/jquery/jquery-ui',
        imgAreaSelect: 'libs/jquery/jquery.imgareaselect',
		datepicker: 'libs/jquery/jquery-ui-1.10.3.custom.min',
		tooltip: 'libs/jquery/jquery-ui-1.10.4.tooltip.min',
		cookie: 'libs/jquery/jquery.cookie',
		highlight: 'libs/jquery/rf.Highlight',
		lodash: 'libs/lodash/lodash',
		underscore: 'libs/underscore/underscore',
		mustache: 'libs/mustache/mustache',
		rivets: 'libs/rivets/rivets',
		rivets2: 'libs/rivets/rivets-0.6.9.min',
		text: 'libs/require/text',
		jsonpath: 'libs/jsonpath/jsonpath',
		zip_js: 'libs/zipjs/zip',
		keyboard: 'libs/keyboard/keyboard',
		moment: 'libs/moment/moment',
		_mathfield: 'components/mathfield/internal/_mathfield.not-minified',
		undo: 'libs/undo-js/undo',
		'diff-match-patch': 'libs/undo-js/lib/diff-match-patch',
		mathjax: 'libs/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML',
		browserDb: 'libs/db.js/db',
		log4javascript: 'libs/log4javascript/log4javascript',
		cropperJS: 'libs/cropperJS/cropper',	 /* used for image cropper */
		react: 'libs/react/build/react',
		"react-dom": 'libs/react/build/react-dom',
		sockjs:'libs/socks/sockjs-0.3.4',
		stomp:'libs/socks/stomp',

		/* t2k libs */
		PostMessageManager: 'libs/t2k/PostMessageManager',

		/* pdf.js */
		canvas_blob: 'libs/canvas-blob/canvas-to-blob',
		pdf_js: 'components/pdf/lib/pdf',
		pdf_compat: 'components/pdf/lib/compatibility',

		/* common */
		BrowserDbToAjaxAppender: 'common/logger/BrowserDbToAjaxAppender',
		logger: 'common/logger/logger',
		backbone_super: 'common/backbone_super',
		mustache_functions: 'common/mustache_functions',
		helpers: 'common/helpers',
		load: 'common/load',
		files: 'common/files',
		FileUpload: 'common/fileUpload/FileUpload',
		IconAndFileUpload: 'common/fileUpload/IconAndFileUpload',
        HTMLControlFactory: 'common/HTMLControlFactory',
        GenericList: 'common/GenericList',
        StandardsList: 'common/StandardsList',
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
		MtqAnswerEditor: 'common/MtqAnswerEditor',
		BaseView: 'common/BaseView',
		BaseScreenView: 'common/BaseScreenView',
		BasePropertiesView: 'common/BasePropertiesView',
		BaseStageView: 'common/BaseStageView',
		BaseStageContentView : 'common/BaseStageContentView',
		BaseNormalStageContentView : 'common/BaseNormalStageContentView',
        BaseAnswerNormalStageContentView : 'common/BaseAnswerNormalStageContentView',
        BaseComponentView: 'common/BaseComponentView',
        TemplateManipulator: 'common/templateManipulator',
		//** common - Book alive related modules **//
		VirtualPageManager: 'common/bookAlive/VirtualPageManager',
		websocket: 'common/websocket',
		connectionManager: 'common/connectionManager',
		dialogs: 'common/dialogs',
		modal: 'common/modal',
		editMode: 'common/editMode',
		clipboardManager: 'common/clipboardManager',
		keyboardManager: 'common/keyboardManager',
		focusManager: 'common/focusManager',
		dao: 'common/dao',
        rest: 'common/rest',
        restDictionary: 'common/restDictionary',
		conversionUtil: 'modules/ConversionUtil/conversionUtil',
		CGSTemplateConverter: 'modules/CGSTemplateConverter/CGSTemplateConverter',
		CGSTooltipUtil: 'modules/CGSTooltipUtil/CGSTooltipUtil',
		migrationUtil: 'modules/MigrationUtil/migrationUtil',
		cgsUtil : 'common/cgsUtil',
		busyIndicator: 'modules/BusyIndicator/BusyIndicator',
        thumbnailCreator : 'common/thumbnailCreator',
        appletFilesManager: 'common/appletFilesManager',
        importLessonUtil: 'common/importLessonUtil',
        importSequenceUtil : 'common/importSequenceUtil',
        styleAndEffectsUtil : 'common/styleAndEffectsUtil',
        "SCPPreview" : "modules/SCPPreview/SCPPreview" ,
		ebookSdk: 'dynamic_player/sdk',
		ebookPlayerSdk: 'dynamic_player/sdk_book_player',
		ebookComm: 'dynamic_player/communicator',
		ebookCallbacks: 'dynamic_player/callbacks',
        ebookPlayer: 'dynamic_player/lessonPlayer',

		/* models */
		userModel: 'models/userModel',
		courseModel: 'models/courseModel',
		lessonModel: 'models/lessonModel',
		configModel: 'models/configModel',
		lockModel: 'models/lockModel',
    appletModel: 'models/appletModel',
		toolboxModel: 'models/toolboxModel',
		cgsModel: 'models/cgsModel',
		publishModel: 'models/publishModel',
        standardsModel: 'models/standardsModel',
        defaultsModel: 'models/defaultsModel',
        localeModel: 'models/localeModel',
        learningPathModel : 'models/learningPathModel',
        PermissionsModel: "models/PermissionsModel",
        ttsModel: "models/ttsModel",
        ttsComponent: "components/TTSComponent/TTSComponent",
        multiNarrationComponent: "components/MultiNarrationComponent/MultiNarrationComponent",

        /*validation*/
        repoValidation : 'validation/repoValidation',


		/* config */
		types: 'config/types',
		settings:'config/settings',
		preview: 'models/previewModel',

		showMessage: 'modules/showMessage/showMessage',

		json2xml : 'conversion/json2xml',
		repo2livePage: 'conversion/repo2livePage',


		/* components */
		growingListComponentView : 'components/growing_list/growingListComponentView',
		growingDoubleListComponentView : 'components/growingDouble_list/growingDoubleListComponentView',
		mathfieldGrowingListView : 'components/growing_list/mathfieldGrowingListView',
		teacherGuideComponentView : 'components/teachers_guide/teacherGuideComponentView',
		commentsComponent: 'components/comments/comments',
		devTools		: 'components/dev/devTools',
		Rubric: 'components/Rubric/Rubric',
		IgnoreChecking: 'components/IgnoreChecking/IgnoreChecking',
		customCourseMetadata : 'components/customCourseMetadata/customCourseMetadataComponentsController',
        validateUtil : 'modules/ValidateUtil/validateUtil',
		cp_instructionComponent : 'components/customizationPackInstructions/CP_instructionsComponent',
		cp_feedbackComponent : 'components/customizationPackFeedbacks/CP_feedbacksComponent',
		cp_PlayerInterfaceComponent : 'components/customizationPackPlayerInterface/CP_playerInterfaceComponent',
		cp_FontsComponent : 'components/customizationPackFonts/CP_fontsComponent',
		cp_stylesAndEffects : 'components/customizationPackStylesAndEffects/cp_stylesAndEffects',
        cp_playersComponent : 'components/customizationPackPlayers/CP_playersComponent' ,
		propsTextViewer : 'components/propsTVE/propsTextViewerView',
		alertComponent: 'components/alertComponent/alertView',
		dialogComponent: 'components/dialogComponent/dialogView',

		cgsHintUtil: 'modules/CGSHintUtil/cgsHintUtil',
		PropertyPreviewUtil: 'modules/Dialogs/types/propertyPreview/PropertyPreviewUtil',
        NotificationsService: 'common/NotificationsService/NotificationsService',
        Notifications: 'modules/Notifications/NotificationsController',

		/**
		*Plugins Definition
		**/


		pluginClassManager: 'modules/Plugins/PluginClassManager',
		pluginModel: 'modules/Plugins/PluginModel',
		pluginConstants: 'modules/Plugins/PluginConstants',
		pluginsCollection: 'modules/Plugins/PluginsCollection',
        pluginRecordModel: 'modules/Plugins/PluginRecordModel' ,
        pluginRepoTemplateConverter: 'modules/Plugins/PluginRepoTemlpateConverter',
        pluginMenuModel: 'modules/Plugins/PluginMenuModel',
        pluginSpinnerModel: 'modules/Plugins/PluginSpinnerModel',
        pluginDialogModel: 'modules/Plugins/PluginDialogModel',
        pluginRenderTemplateModel: 'modules/Plugins/PluginRenderTemplateModel',
        pluginExternalApiModel: 'modules/Plugins/PluginExternalApiModel',
        pluginEventsModel: 'modules/Plugins/PluginEventsModel',
        pluginHiddenModel: 'modules/Plugins/PluginHiddenModel',
        pluginValidationModel: 'modules/Plugins/PluginValidationModel',
        pluginGeneral: 'modules/Plugins/PluginGeneral',

		/* Amplitude */
		/* amplitude: 'libs/amplitude/amplitude.min' */

	},

	shim: {
		backbone: {
			deps: ['lodash', 'jquery'],
			exports: 'Backbone'
		},
		Class: {
			exports: 'Class'
		},
		mathjax: {
			exports: 'MathJax'
		},

		rivets: {
			exports: 'rivets'
		},

		log4javascript: {
			exports: 'log4javascript'
		},

		/* jquery plugins */
		cookie: {
			deps: ['jquery']
		},
		datetimepicker: {
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

		ebookCallbacks : {
			deps: ['ebookSdk']
		},

		ebookComm : {
			deps: ['ebookSdk']
		},

		ebookPlayerSdk: {
			deps: ['ebookSdk','ebookComm', 'ebookCallbacks']
		},

		ebookPlayer: {
			deps: ['ebookPlayerSdk']
		},



		/* pdf.js */
		pdf_js: {
			deps: ['pdf_compat', 'canvas_blob'],
			exports: 'PDFJS'
		},
		zip_js: {
			exports: 'zip'
		}
	}
});

require(['logger', 'rivets', 'rivets2', 'mustache_functions', 'router', 'busyIndicator', 'cgsHintUtil', 'userModel', 'mustache', 'mustache_functions','pluginModel', 'TemplateManipulator', 'CGSTooltipUtil', 'events'],
	function(logger, rivets, rivets2, mustache_functions, Router, busyIndicator, cgsHintUtil, userModel, mustache, functions,PluginModel, TemplateManipulator, CGSTooltipUtil, events) {

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
		});

		_.extend(rivets2.formatters, {
			length: function(value) {
				return value && value.length ? value.length : undefined;
			},

			equals: function(value, arg) {
				return value===arg;
			},

			equalsOne: function(value /*, args */) {
				var args = Array.prototype.slice.call(arguments, 1);

				for (var i = 0; i < args.length; i++) {
					if (value===args[i]) {
						return true;
					}
				}
				return false;
			},

			percent: function(value){
				return value ? value + '%' : '';
			}
		});

		_.extend(rivets2.binders, {
			addclass: function(el, value) {
				if(el.addedClass) {
					$(el).removeClass(el.addedClass);
					delete el.addedClass
				}

				if(value) {
					$(el).addClass(value);
					el.addedClass = value
				}
			}
		});

		mustache_functions.add_to(rivets.formatters, true);

		/* string formatting helper */

		String.prototype.format = function() {
			var args = arguments;
			return this.replace(/{(\d+)}/g, function(match, number) {
				return typeof args[number] !== 'undefined'? args[number]: match
			})
		};

		/**
		 * capitalize the sting
		 * @return {string} [the string capitalized]
		 */
		String.prototype.capitalize = function() {
			return this.charAt(0).toUpperCase() + this.slice(1);
		};

		Storage.prototype.setObject = function(key, value) {
			this.setItem(key, JSON.stringify(value));
		};

		Storage.prototype.getObject = function(key) {
			var value = this.getItem(key);
			return value && JSON.parse(value);
		};

		Error.prototype.toJSON = function() {
			return {
				name: this.name,
				message: this.message,
				stack: this.stack
			}
		};

		userModel.init(function () {
			var original_render = mustache.render;
			var account = userModel.getAccount();

			if (account.logLevel in logger.LogLevels) {
				logger.setLogLevel(account.logLevel);
			}

			mustache.render = function() {
				if (arguments[1]) functions.add_to(arguments[1]);
				//the fourth argument is a boolean value that determine whether to use the template manipulator + i18n translation,
				//if true, we use the original mustache render without the other functions
				if(arguments[3]){
					return original_render.apply(mustache, arguments);
				}else{

					return TemplateManipulator.render(original_render.apply(mustache, arguments));
				}
			};


			PluginModel.loadPlugins(function () {
				Router.start(function () {
					cgsHintUtil.onInitializeStart();
				});

				events.fire('initCGS');
			});

		});

		var acceptedHosts = [
			'http://cgs4mhe.timetoknow.com/cgs',
			'https://editis-cgs.timetoknow.com/cgs',
			'https://cgs-emea.timetoknow.com/cgs/',
			'http://sesi-create.timetoknow.com/cgs/',
			'http://create.timetoknow.com/cgs'
		];


		var amplitudeProperties = {
			"Host": AuthenticationData.configuration.basePath,
			"Email": AuthenticationData.user.email,
			"Role": AuthenticationData.user.role.name,
			"AccountName": AuthenticationData.account.name,
			"AccountMode" : AuthenticationData.account.accountMode,
			"User ID" : AuthenticationData.account.userId
		};
		amplitude.setUserId(AuthenticationData.user.userId);
		amplitude.setUserProperties(amplitudeProperties);
		amplitude.setVersionName(AuthenticationData.configuration.version);
		amplitude.logEvent('Login / Refresh event');
	});
