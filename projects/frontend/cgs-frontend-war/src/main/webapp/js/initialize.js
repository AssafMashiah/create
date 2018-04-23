var AuthenticationData = {};
var Initialize = function () {
	var loadingProcess = {

		// DO NOT TOUCH THIS PROPERTY
		// UCOMMENT ON COMMIT
		mainLoadingSize : "8474106" ,


		// COMMENT ON COMMIT
		//mainLoadingSize : "6615935" ,

		loadedFilesCounter : 0 ,
		totalLoadingFiles : 0 ,

		textElem : document.getElementById( "ProgressText" ) ,
		percElem : document.getElementById( "ProgressMask" ) ,
		percTextElem : document.getElementById( "ProgressPercentage" ) ,
		innerPercElem : document.getElementById( "InnerPercentage" ) ,

		setPercentage : function( perc ){

			var deg = 360 * perc / 99 - 90;
			var rad = deg / 180 * Math.PI;

			var y = Math.round( 75 * Math.sin( rad ) + 75 );
			var x = Math.round( 75 * Math.cos( rad ) + 75 );
			var path = loadingProcess.percElem.getAttributeNS( null , "d" ).replace( "M75 0 L75 75 " , "M75 0 L75 75 " + "L" + x + " " + y + " " );
			loadingProcess.percElem.setAttributeNS( null , "d" , path );

			loadingProcess.setPercentageText( perc );

		} ,

		setText : function( text ){
			loadingProcess.textElem.innerText = text;
		} ,

		setPercentageText : function( perc ){
			loadingProcess.percTextElem.innerText = perc + "%";
		} ,

		setInnerPercentage : function( perc ){
			loadingProcess.innerPercElem.style.width = perc;
		}

	};

	var ROLES_CONFIGURATION = {
		"SYSTEM_ADMIN": {
			"main": "admin/webapp/js/main",
			"css_files": ["admin/webapp/css/dist/system-admin.min.css"],
			"editorType": "T2KAdminEditor"
		},
		"GROUP_ADMIN": {
			"main": "admin/webapp/js/main",
			"css_files": ["admin/webapp/css/dist/group-admin.min.css"],
			"editorType": "T2KGroupEditor"
		},
		"ACCOUNT_ADMIN": {
			"main": "admin/webapp/js/main",
			"css_files": ["admin/webapp/css/dist/account-admin.min.css"],
			"editorType": "T2KPublisherEditor"
		},
		"EDITOR": {
			"main": "js/main",
			"css_files": ["js/components/mathfield/internal/_mathfield.not-minified.css", "css/dist/editor.min.css"]
		},
		"AUTHOR": {
			"main": "js/main",
			"css_files": ["js/components/mathfield/internal/_mathfield.not-minified.css", "css/dist/author.min.css"]
		},
		"REVIEWER": {
			"main": "js/main",
			"css_files": ["js/components/mathfield/internal/_mathfield.not-minified.css", "css/dist/reviewer.min.css"]
		}
	};



	var init = function () {

		var role = AuthenticationData.user.role.name;
		var cfg = ROLES_CONFIGURATION[role];

		loadingProcess.totalLoadingFiles = cfg.css_files.length + 1;

		AuthenticationData.editorType = cfg.editorType;

		createEntryPoint(cfg, function () {
			loadMainScript(cfg);
		});

		//createStyleSheet(cfg);
		if (cfg.css_files instanceof Array) {
			cfg.css_files.forEach(function(css) {
				createStyleSheet(css);
			});
		}
	};

	var createStyleSheet = function (href) {
		var style = document.createElement("link");

		style.rel = "stylesheet";
		style.href = href + "?ver=" + AuthenticationData.configuration.version;

		var role = AuthenticationData.user.role.name;
		var cfg = ROLES_CONFIGURATION[role];
		loadingProcess.setText( "Loading styles..." );

		style.onload = function () {
			var prevSize = Math.ceil(loadingProcess.loadedFilesCounter / loadingProcess.totalLoadingFiles * 99);
			var size = Math.ceil(++loadingProcess.loadedFilesCounter / loadingProcess.totalLoadingFiles * 99);
			for (var i = prevSize; i <= size; i++) {
				loadingProcess.setPercentage(i);
			}
			if (loadingProcess.loadedFilesCounter == cfg.css_files.length) loadingProcess.setText("Loading scripts...");
		};

		document.getElementsByTagName("head")[0].appendChild(style);
	};

	var createEntryPoint = function (cfg, callback) {
		var script = document.createElement("script");

		script.src = "js/libs/require/require.js";
		script.onload = callback;

		document.body.appendChild(script);
	};
	var getAuthenticationData = function (callback) {
		var url = '../rest/publishers/getAuthenticationData';
		var xhr = new XMLHttpRequest();

		xhr.open('GET', url, true);

		xhr.onload = function () {
			callback(JSON.parse(xhr.responseText));
		};

		xhr.send();
	};

	var getScpConfig = function (callback) {
		var url = 'player/scp/players/config.json?r=' + Math.random();
		var xhr = new XMLHttpRequest();

		xhr.open('GET', url, true);

		xhr.onload = function () {
			callback(JSON.parse(xhr.responseText));
		};

		xhr.send();
	};

	var mainUrlWithCacheBuster;

	var loadMainScript = function(cfg){

		if( +loadingProcess.mainLoadingSize ){

			loadingProcess.mainLoadingSize = +loadingProcess.mainLoadingSize;

			var req = new XMLHttpRequest();

			req.onprogress = function( event ){

				var size = Math.round( event.loaded / loadingProcess.mainLoadingSize * 99 ) + "%";

				loadingProcess.setInnerPercentage( size );

			};
			

//			mainUrlWithCacheBuster = cfg.main + ".js?ver=" + AuthenticationData.configuration.version;
			mainUrlWithCacheBuster = cfg.main + ".js";
			if (location.origin != 'http://localhost:8000' && location.origin != 'https://localhost:8443') {
				mainUrlWithCacheBuster += "?ver=" + AuthenticationData.configuration.version;
			}
			
			req.onload = function(){

				var script = document.createElement( "script" );
				script.src = mainUrlWithCacheBuster;
				script.type = "text/javascript";
				script.onload = function(){

					loadingProcess.setText( "Loading scripts..." );
					var prevSize = Math.ceil(loadingProcess.loadedFilesCounter / loadingProcess.totalLoadingFiles * 99);
					var size = Math.ceil(++loadingProcess.loadedFilesCounter / loadingProcess.totalLoadingFiles * 99);
					for (var i = prevSize; i <= size; i++) {
						loadingProcess.setPercentage(i);
					}

				};
				document.body.appendChild( script );

			};

			req.open( "GET" , mainUrlWithCacheBuster, true );

			req.send();

		}

		else{

			var script = document.createElement( "script" );

			script.src = cfg.main + ".js";
			script.onload = function(){

				loadingProcess.setText( "Loading scripts..." );
				var size = Math.round( ++loadingProcess.loadedFilesCounter / loadingProcess.totalLoadingFiles * 99 );
				loadingProcess.setPercentage( size );

			};

			document.body.appendChild( script );

		}

	};

	getScpConfig(function(dataConfig) {
		window.scpConfig = dataConfig;

		getAuthenticationData(function (data) {
			var isChrome = navigator.userAgent.indexOf('Chrome') !== -1;
			if (!isChrome) {
				window.location.href = data.configuration.logoutPath;
				return;
			}

			AuthenticationData = data;

			require = {
				waitSeconds: 0,
				urlArgs: (location.origin == 'http://localhost:8000' || location.origin == 'https://localhost:8443')? null : 'ver=' + AuthenticationData.configuration.version
			};

			init();
		});

	});


};

window.decryptScript = window.decryptScript || function(text) { return text; };
