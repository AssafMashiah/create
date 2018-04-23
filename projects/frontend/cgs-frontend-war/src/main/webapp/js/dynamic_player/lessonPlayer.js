define( [ "require" ], function( require ) {
	/*
	 All the common enums configuration
	 */

	var enums = {
		/*
		 Player type (VIEWER/EDITOR)
		 */
		PLAYER_TYPE : {
			VIEWER: 1,
			EDITOR: 2
		},

		/*
		 STAGE modes
		 */
		STAGE_MODE : {
			SINGLE_PAGE: 1,
			DUAL_PAGE: 2,
		},

		/*
		 STAGE dual page paging action type
		 */
		PAGING_ACTION_TYPE: {
			INITIAL_PAGE: 0,
			FORWARD: 1,
			BACKWARD: 2
		},

		/*
		 Running mode.
		 */
		RUNNING_MODE : {
			ONLINE: 1,
			OFFLINE: 2
		},

		MESSAGE_ORIGIN: {
			SDK: 1,
			PAGE_FRAME: 2
		}
	};


	enums.OVERLAY_ELEMENT = {
		//Hotspot types
		CONTENT_TYPE: {
			AUDIO_FILE: 1,	// Relative path of an audio file
			AUDIO_URL: 2,	// Absolute path of an audio file
			VIDEO_FILE: 3,	 // Relative path of a video file
			VIDEO_YOUTUBE: 4,	// Absolute path of youtube embed url
			VIDEO_URL: 5,	 // Asolute path of video
			IMAGE_FILE: 6,	 // Relative path of image
			IMAGE_URL: 7,	// Absolute path of an image
			EXTERNAL_URL: 8,	 // Absolute path of a url.
			DL_SEQUENCE: 9,	// DL Sequeunce. (Taken care by the host.)
			ARTICLE: 10, // jouve enrichement
			FILE: 11,// jouve enrichement
			HTML: 12// jouve enrichement
		},

		//Hotspots embed types
		DISPLAY_TYPE: {
			EMBEDDED: 1,			//Embedded as iframe/html5 player
			ICON: 2,				//Icon that opens lightbox.
		}
	};




	function LessonPlayer( host, parent ){

		this.host = host ;
		this.parent = parent ;
		this.baseTime = ( new Date() ).getTime() ;

		this.params = getParams() ;

		console.log( "[LessonPlayer][Params] --> " + JSON.stringify( this.params, null, "\t" ) ) ;
	}

	LessonPlayer.prototype = {

		api: function( config ) {

			var dataString = null ;

			try {
				dataString = JSON.stringify( config.data, null, "\t" ) ;
			} catch ( e ) {
				dataString = config.data ;
			}

			var t_in = (new Date()).getTime() - this.baseTime ;
			console.log( "[LessonPlayer][API][t+ "+ t_in +"] call from Host --> " + config.action + ( dataString ? " --> " + dataString : "" ) );

			var success = config.success ;
			var error = config.error ;

			var that = this ;

			config.success = function() {

				var t_success = (new Date()).getTime() - that.baseTime ;

				console.log( "[LessonPlayer][API][t+ "+ t_success +"] call from Host answer --> " + config.action + " --> SUCCESS!" ) ;

				success.apply( this, arguments ) ;

			};

			config.error = function() {

				var failData ;
				try {
					failData = JSON.stringify( arguments, null, "\t" ) ;
				} catch ( e ) {
					failData = arguments ;
				}

				console.log( "[LessonPlayer][API] call from Host answer --> " + config.action + " --> FAIL!" ) ;
				console.log( "[LessonPlayer][API] fail data --> " + failData ) ;

				error.apply( this, arguments ) ;
			};

			switch ( config.action ) {

				case 'init' :
					this.init( config ) ;
					break ;

				case 'play' :
					this.play( config ) ;
					break ;

				case 'terminate' :
				case 'terminateSequence' :
					if( this.currentPlayer ) {
						this.currentPlayer.api( config ) ;
					} else {
						console.warn( "[LessonPlayer][API] --> calling api."+ config.action +" before getting success callback from previous action" ) ;
						config.success( { msg: " nothing to do, calling success." } ) ;
					}
					break ;

				default :
					this.currentPlayer.api( config ) ;
					//config.success() ;
					break;
			}
		},

		setCurrentPlayer: function( type ) {
			this.currentPlayer = this.player ;
		},


		init: function( config ){

			this.initData = config.data ;
			this.playerPath = config.data.basePaths.player ;


			this.initPlayer( config.data.type, this.initData, function() {
				this.setCurrentPlayer( config.data.type ) ;
				config.success.apply( this, arguments ) ;
			}.bind( this ) ) ;
		},

		play: function( config ){

			var type = config.data.type;
			this.initPlayer( type, this.initData, ( function() {

				this.setCurrentPlayer( type ) ;

				this.currentPlayer.api( {
					action: "play",
					data: config.data,
					success: config.success,
					error: config.error || onError
				} ) ;

			} ).bind( this ) ) ;

			// allow play data access for external application like tests, etc...
			document.t2k = document.t2k || {};
			document.t2k.player = document.t2k.player || {};
			document.t2k.player.lessonData = config.data;
		},

		initPlayer: function( type, data, callback ) {


			//TODO: get RTL from local
			//TODO: change playerType from string to ENUM
			var playerExtra = {
				playerFolder: this.playerPath,
				type: type,
				assetPath: this.initData.basePaths.assetsPath,
				playerType : enums.PLAYER_TYPE[this.initData.playerType],
				useExternalMediaPlayer: this.initData.useExternalMediaPlayer
			};

			var player = this.player;

			var onInit = callback || function(){} ;

			if( !player ) {

				player = this.player = new ContentPlayer( this.host, this.parent, playerExtra ) ;

				player.api( {
					action: "init",
					data: data,
					success: onInit,
					error: onError
				} ) ;



			} else {

				callback() ;

			}
		}
	};

	//////////////////////////////////////////////////////////////////////
	// PRIVATE
	//////////////////////////////////////////////////////////////////////



	function onError() {
		console.error( JSON.stringify( arguments ) ) ;
	}

	function getParams (){
		var urlParams = URLParamsToJSON();
		var localStorageParams = JSON.parse(localStorage.getItem('external_data')) ;
		return _.extend({},localStorageParams,urlParams);
	}

	function URLParamsToJSON() {
		var params = {},
			search = location.search.substring( 1 ),
			jsonString ;

		if( search ) {
			jsonString = '{"' + search.replace( /&/g, '","' ).replace( /=/g,'": "' ) + '"}' ;
			params = JSON.parse( jsonString, function( key, value ) {
				return key === "" ? value : decodeURIComponent( value ) ;
			} ) ;
		}

		return params ;
	}


	/// internal players section - type must be sent in extraData.type
	function ContentPlayer( host, parent, extraData ){

		this.host = host ;
		this.parent = parent ;
		this.extraData = extraData ;
		this.playerTypeStr = extraData.type.toUpperCase();

		this.tracking = {};
	}

	ContentPlayer.prototype = {

		startTracking : function (label) {
			this.tracking[label] = new Date().getTime();
		},

		endTracking : function (label) {
			var ms = (new Date().getTime() - this.tracking[label] );
			console.log( "["+this.playerTypeStr+"][Time] --> "+ label + ": " + ms +  "ms");
		},

		getParameterByName : function(name) {
			name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
			var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
				results = regex.exec(location.search);
			return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
		},

		/**
		 * createCallbackWrapper function
		 * Wrap a success/error callbacks to host with a single callback function that will be called by the innerPlayer.
		 * Returns a function that will receive a data object when called which will contain a success param ( 0 for error,
		 * 1 for success)
		 * @param error - callback on error
		 * @param success - callback on success
		 */
		createCallbackWrapper : function( success, error) {

			return function callbackWrapper(response){
					if( response.success ){
						success && success(response);
					} else {
						error && error(response);
					}
				}

		},

		api: function( config ) {

			var thi$ = this,
				dataString = null ;

			try {
				dataString = JSON.stringify( config.data, null, "\t" ) ;
			} catch ( e ) {
				dataString = config.data ;
			}
			console.log( "["+this.playerTypeStr+"][Player][API] call from Host --> " + config.action + ( dataString ? " --> " + dataString : "" ) );



			var callbackDefferTime = 50 ;
			var success = config.success ;
			var error = config.error ;

			config.success = function() {
				thi$.releaseActionInProgress();
				var argz = arguments ;
				var funcThis = this ;
				setTimeout( function() {
					console.log( "["+this.playerTypeStr+"][Player][API] call from Host answer --> " + config.action + " --> SUCCESS!" ) ;
					thi$.endTracking(config.action);
					success.apply( funcThis, argz ) ;
				}, callbackDefferTime ) ;
			};

			config.error = function() {
				thi$.releaseActionInProgress();
				var argz = arguments ;
				var funcThis = this ;
				setTimeout( function() {
					// console.timeEnd( consoleString ) ;
					var failData ;
					try {
						failData = JSON.stringify( argz, null, "\t" ) ;
					} catch ( e ) {
						failData = argz ;
					}
					console.log( "["+this.playerTypeStr+"][Player][API] call from Host answer --> " + config.action + " --> FAIL!" ) ;
					console.log( "["+this.playerTypeStr+"][Player][API] fail data --> " + failData ) ;
					error.apply( funcThis, argz ) ;
				}, callbackDefferTime ) ;
			};

			if (this.actionInProgress) {
				var errMsg = "["+this.playerTypeStr+"][Player][API] is busy with [" + this.actionInProgress + "] action and can't perform [" + config.action + "] action";
				config.error( errMsg ) ;
				return;
			}

			this.actionInProgress = config.action;

			this.progressTimeout = setTimeout(function() {
				thi$.releaseActionInProgress() ;
			}, 5000 ) ;

			this.startTracking(config.action);
			var callback = this.createCallbackWrapper(config.success, config.error);
			switch ( config.action ) {

				case 'init' :
					this.init( config.data, callback ) ;

					break ;
				case 'terminate' :
					this.terminate( config, callback ) ;
					break ;
				case 'play' :

					this.play( config, callback ) ;
					break;
				case 'moveToPage':


					this.innerPlayer.switch_to_page (config.data.id, callback);
					break;
				case 'setRange':
					var data = {
						limit_page_range:{
							start: (config.data && config.data.start) ?  config.data.start : '-1',
							end: (config.data && config.data.end) ?  config.data.end : '-1'
						}
					};					
					this.innerPlayer.configure(data, callback);
					break;
				case 'suspend':

					//this.innerPlayer.suspend(callback);
					break;
				case 'resume':

					//this.innerPlayer.resume(callback);
					break;
				case 'getState':

					//this.innerPlayer.get_state(callback);
					break;
				case 'disableNavigation':

					var navData = {
						'navigation_enabled':false,
						'thumbnails_bar_enabled' : false
					};
					this.innerPlayer.configure (navData, callback);
					break;
				case 'addOverlayElement':
					this.convertOverlayElement(config.data);
					this.innerPlayer.add_new_overlay_element(config.pageId, config.data, callback);
					break;
				case 'removeOverlayElement':
					this.innerPlayer.remove_overlay_element(config.pageId, config.data,callback);
					break;
				case 'updateOverlayElement':
					this.convertOverlayElement(config.data);
					this.innerPlayer.update_overlay_element(config.pageId, config.id, config.data, callback);
					break;
				case 'deselectAllOverlayElements':
					this.innerPlayer.deselect_all_overlay_elements();
					callback && callback({success:1});
					break;
				case 'refresh': //TODO: update api when call name is chosen
					break;
				case 'getDisplayedPageStyle':
					this.innerPlayer.get_displayed_page_style(callback);
				default :
					//console.error("Unsupported method called by host: " + config.action);
					callback({success:0});
					break;
			}
		},
		
		convertOverlayElement : function(data){
			data.presentation.display_type = enums.OVERLAY_ELEMENT.DISPLAY_TYPE[data.presentation.type];
			data.content.type = enums.OVERLAY_ELEMENT.CONTENT_TYPE[data.content.type];
		},

		releaseActionInProgress: function() {
			clearTimeout(this.progressTimeout);
			this.actionInProgress = null;
		},

		init: function( data, callback ){
			if(data.width == 0 || data.height == 0 ){
				error("Height or Width was not passed to the "+this.extraData.type+", height : " + data.height + " ,width : " + data.width);
				return;
			}

			this.lastInitData = data ;
			callback({'success' : 1});

		},


		play: function( config, callback ){
			var configData = this.createPlayData(config.data);
			var playContent = config.data.isConverted ? config.data.data : this.convertContent(config.data.data);
			var playState = config.data.isConverted ? config.data.state : this.convertState(config.data.state);
			var sdkData = {
				player_url : this.lastInitData.basePaths.player,
				target_id : $(this.parent).attr('id')
			};
			var innerPlayer = new dbp.book_player(sdkData, configData, playContent, playState, callback );
			this.setInnerPlayer(innerPlayer);

		},

		terminate: function( config, callback ){
			if(!this.innerPlayer){
				config.error("terminate player was called with no Inner Player exists");
				return;
			}

			function terminateCallback(response){
				delete this.innerPlayer;
				delete this.eventHandler;
				callback && callback(response);
			}
			this.innerPlayer.terminate(terminateCallback.bind(this)) ;

		},

		setInnerPlayer: function( innerPlayer ) {
			this.innerPlayer = innerPlayer ;
			this.eventHandler = new EventHandler(this.host, this.innerPlayer);
			this.eventHandler.registerToPlayer();
		},

		convertState : function(state) {
			var convertedState = state;
			if( convertedState ) {

				for (var page in convertedState) {
					if (convertedState[page].bookmarks){
						convertedState[page].bookmarks.is_bookmarked = convertedState[page].bookmarks.isBookmarked;
						delete convertedState[page].bookmarks.isBookmarked;
					}
					if(convertedState[page].highlights) {
						convertedState[page].highlights = convertedState[page].highlights.highlights;
					}
				}
			}
			
			return convertedState;

		},

		convertContent : function(data){
			var contentMap = {
				'overlay_elements_data' : 'overlayElements',
				'page_url' : 'href',
				'thumbnail_url' : 'thumbnailHref',
				'id' : 'cid'

			};

			var convertedData = data;
			convertedData['table_of_contents'] = convertedData['pages'];
			delete convertedData['pages'];
			delete convertedData['textSearch'];

			var toc = convertedData['table_of_contents']; // shortcut to toc object

			//replace content objects
			for( var page in toc){
				for( var i in contentMap){
					toc[page][i] =  toc[page][contentMap[i]];
					delete toc[page][contentMap[i]];
				}

				var overlayElem = toc[page]['overlay_elements_data']; // shortcut to toc[overlay_elements_data];

				//replace presentation objects
				for( var elem in overlayElem){
					overlayElem[elem]['id'] = overlayElem[elem]['cid'];

					// replace enums
					var contentTypeEnum = overlayElem[elem]['content']['type'];
					var displayTypeEnum = overlayElem[elem]['presentation']['type'];

					overlayElem[elem]['content']['data']['resource'] = overlayElem[elem]['content']['data']['href'] || overlayElem[elem]['content']['data']['resourceHref'];
					overlayElem[elem]['content']['type'] = enums.OVERLAY_ELEMENT.CONTENT_TYPE[contentTypeEnum.toUpperCase()];

					overlayElem[elem]['presentation']['display_type'] = enums.OVERLAY_ELEMENT.DISPLAY_TYPE[displayTypeEnum.toUpperCase()];
				   
					delete overlayElem[elem]['content']['data']['href'];
				}

				//replace enrichements type enum name to value
				var enrichments = toc[page]['enrichments']; 
				for( var elem in enrichments){
					var contentTypeEnum = enrichments[elem]['type'];
					enrichments[elem]['type'] = enums.OVERLAY_ELEMENT.CONTENT_TYPE[contentTypeEnum.toUpperCase()];
				}

				if (toc[page]['is_absolute_path'] === undefined) {
					toc[page]['is_absolute_path'] = toc[page]['virtualData'] ? true : false;
				}

			}

			return convertedData;

		},

		convertInitData: function(data){

			var playerType = enums.PLAYER_TYPE[data.playerFormat] || enums.PLAYER_TYPE.VIEWER;
			var converted = {
				assets_path_prefix: data.basePaths.assetsPath,
				book_path_prefix: data.basePaths.assetsBasePath,
				player_type : playerType,
				use_external_player: data.useExternalMediaPlayer,
				dual_page_enabled: !data.useExternalMediaPlayer,
				is_rtl : data.locale && data.locale.indexOf('IL') !== -1,
				stage_mode : enums.STAGE_MODE[data.stageMode] || enums.STAGE_MODE.SINGLE_PAGE,
				disable_internal_links : data.disableInternalLinks === undefined ? true : data.disableInternalLinks,
				running_mode: enums.RUNNING_MODE.ONLINE,
				read_only : data.isReadOnly,
				viewer_toolbar_enabled: playerType === enums.PLAYER_TYPE.VIEWER,
				localization_locale: data.locale || 'en_US'
			};

			return converted;

		},

		createPlayData: function (playData){
			var playerConfig = this.convertInitData(this.lastInitData);

			var viewModeParams = {};

			viewModeParams.thumbnails_bar_enabled = playData.thumbnailsBarEnabled;
			viewModeParams.navigation_enabled = playData.navigationEnabled;
			viewModeParams.search_enabled = playData.searchEnabled && !playerConfig.is_rtl;
			viewModeParams.bookmark_enabled = playData.bookmarkEnabled;
			viewModeParams.highlight_enabled = playData.highlightEnabled && !playerConfig.is_rtl;
			viewModeParams.viewer_toolbar_enabled = playData.viewerToolbarEnabled;
			if(playData.primaryColor) {
				viewModeParams.primary_color = playData.primaryColor;
			}

			// update read only mode if defined in play data
			if( playData.isReadOnly !== undefined ){
				viewModeParams.read_only = playData.isReadOnly;
			}

			playerConfig.first_page_id = playData.pageId;
			playerConfig.search_data_path = playData.data.textSearch;

			return _.extend({},playerConfig,viewModeParams);
		}
	};



	function EventHandler(host, player){

		this.host = host;
		this.player = player;
		this.convertEnums();
		var self = this;

		this.eventMapping = {
			'bookmark_added' : self.bookmarkAdded,
			'bookmark_removed' : self.bookmarkRemoved,
			//'highlight_added' : function(){},
			'highlights_state' : self.highlightUpdated,
			'overlay_element_removed' : self.overlayElementRemoved,
			'overlay_element_updated' : self.overlayElementUpdated,
			'overlay_element_selected' : self.overlayElementSelected,
			'overlay_element_deselected' : self.overlayElementDeselected,
			'overlay_element_activated' : self.overlayElementActivated,
			'new_search' : function(){},
			'on_init' : function(){},
			'page_changed' : self.pageChanged,
			'state_changed' : self.stateChanged,
			'embed_dl_sequence' : self.embedDlSequence,
			'dispose_dl_sequence_element': self.sequenceDisposeRequest,
			'player_on_keypressed' : self.playerOnKeypressed,
			'page_rendered': self.pageRendered,
			'external_play_video': self.externalPlayVideo
		};





	}

	EventHandler.prototype ={

		/**
		 * registerToPlayer function
		 *
		 * Register to player events and send data to host when needed
		 * functions for each event are defined in the event mapping
		 */
		registerToPlayer: function(){
			for( var event in this.eventMapping){
				this.player.callbacks.register(event, this.eventMapping[event].bind(this));
			}

		},

		convertEnums : function (){

			function transpose(source, target){
				for( var key in source ){
					target[source[key]] = key;
				}
			}

			this.enumMap = {

			};

			for( var key in enums ){
				this.enumMap[key] = {};
				if( key == "OVERLAY_ELEMENT" ){

					for( var secondary in enums.OVERLAY_ELEMENT ){
						this.enumMap.OVERLAY_ELEMENT[secondary] = {};
						transpose(enums.OVERLAY_ELEMENT[secondary], this.enumMap.OVERLAY_ELEMENT[secondary]);
					}

				} else {

					transpose(enums[key], this.enumMap[key]);
				}
			}

		},
		playerOnKeypressed : function(keyData){
			var notifyData = this.createHostCall('playerOnKeypressed', keyData);
			this.callHostApi(notifyData)
		},

		convertDataToHost : function(data){
			var convertedData = data;

			if(convertedData['id']) {
				convertedData['cid'] = convertedData['id'];
				delete convertedData['id'];

				// replace enums
				var contentTypeEnum = convertedData['content']['type'];
				convertedData['content']['type'] = this.enumMap.OVERLAY_ELEMENT.CONTENT_TYPE[contentTypeEnum];
				var displayTypeEnum = convertedData['presentation']['display_type'];
				convertedData['presentation']['type'] = this.enumMap.OVERLAY_ELEMENT.DISPLAY_TYPE[displayTypeEnum];
				delete convertedData['presentation']['display_type'];
			}

			return convertedData;
		},


		createHostCall : function(method, data, success, error){
			success = success || function(){};
			error = error || function(){};

			var notifyData = {
				action : method,
				data : data,
				success : success,
				error : error
			};

			return notifyData;
		},

		embedDlSequence: function (data) {

			var data = {
				sequenceCid: data.overlay_element.content.data.cid,
				hotspotId: data.overlay_element.id,
				selector: data.selector
				//presentationType: data.overlay_element.presentation.type
			};

			var notifyData = this.createHostCall('embedDlSequence', data);
			this.callHostApi(notifyData);
		},

		sequenceDisposeRequest: function(data) {
			var seqData = {
				sequenceCid: data.overlay_element.content.data.cid
			};

			var success = function () {
				this.player.dispose_dl_sequence_element(data.page_id, data.overlay_element.id);
			}.bind(this);

			var notifyData = this.createHostCall('terminateEmbeddedSeq', seqData, success);
			this.callHostApi(notifyData);
		},

		bookmarkAdded : function(bookmarkData){
			bookmarkData.eventType = "bookmarkAdded";
			bookmarkData.pageCid = bookmarkData.page_id;
			delete bookmarkData.page_id;
			var notifyData = this.createHostCall('pageEvent', bookmarkData);

			this.callHostApi(notifyData)
		},

		bookmarkRemoved : function(bookmarkData) {
			bookmarkData.eventType = "bookmarkRemoved";
			bookmarkData.pageCid = bookmarkData.page_id;
			delete bookmarkData.page_id;
			var notifyData = this.createHostCall('pageEvent', bookmarkData);

			this.callHostApi(notifyData);
		},

		highlightUpdated: function(data) {
			var highlightData ={};
			highlightData.eventType = "highlightUpdated";
			highlightData.pageCid = Object.keys(data.highlights)[0];
			highlightData.data = data.highlights[highlightData.pageCid];
			var notifyData = this.createHostCall('pageEvent', highlightData);

			this.callHostApi(notifyData);
		},

		overlayElementUpdated : function(updateData){
			var convertedData = this.convertDataToHost(updateData);
			var notifyData = this.createHostCall('overlayElementUpdated', convertedData);

			this.callHostApi(notifyData);

		},

		overlayElementSelected : function(elementData){
			var convertedData = this.convertDataToHost(elementData);
			var notifyData = this.createHostCall('overlayElementSelected', convertedData);

			this.callHostApi(notifyData)

		},

		overlayElementDeselected : function(elementData){
			var convertedData = this.convertDataToHost(elementData);
			var notifyData = this.createHostCall('overlayElementDeselected', convertedData);

			this.callHostApi(notifyData)

		},

		overlayElementActivated : function(elementData){
			var convertedData = this.convertDataToHost(elementData);
			var notifyData = this.createHostCall('overlayElementActivated', convertedData);

			this.callHostApi(notifyData)

		},

		overlayElementRemoved : function(id){
			var notifyData = this.createHostCall('overlayElementRemoved', id);

			this.callHostApi(notifyData);
		},

		pageChanged : function(id){
			var notifyData = this.createHostCall('pageChanged', id);

			this.callHostApi(notifyData);

		},

		stateChanged : function(state){

			//var notifyData = this.createHostCall('saveState', state);

			//this.callHostApi(notifyData);

		},

		pageRendered: function(data) {
			var notifyData = this.createHostCall('pageRendered', data);
			this.callHostApi(notifyData);
		},

		externalPlayVideo: function (data) {
			var notifyData = this.createHostCall('playMovie', data);
			this.callHostApi(notifyData)
		},

		/**
		 * callHostApi function
		 * host api call: this.host.api(notifyData) --> notifyData
		 *
		 * @param notifyData, object - {action:string, data:object, success:function, error:function}
		 */
		callHostApi : function(notifyData){
			this.host.api(notifyData)
		}
	};

	return LessonPlayer ;
});
