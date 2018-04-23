define(['lodash','jquery', 'BaseView', 'preview' , 'repo', 'mustache', 'events', 'modules/Dialogs/BaseDialogView',
    'modules/Dialogs/types/preview/previewConfig' , 'text!modules/Dialogs/types/preview/PreviewDialog.html'],
function(_, $, BaseView, preview, repo, Mustache, events, BaseDialogView, previewConfig, template) {

	var PreviewDialogView = BaseDialogView.extend({

		tagName : 'div',
		className : 'css-dialog-preview',
		iframeContainer: "#dialogContent #frame",
		config: null,
        lastPlatform: previewConfig.defaults.platform,

        // initially, default settings assigned
        // further, there is a check for stored settings.
        // if found - saved settings applied
        previewSettings: previewConfig.defaults,

        setResolution: function( resolution ){

            this.previewSettings.resolution = resolution;
            localStorage.setItem( "CGSPreviewSettings" , JSON.stringify( this.previewSettings ) );

        },
        getResolution: function(){

            if( !this.previewSettings && localStorage[ "CGSPreviewSettings" ] ){
                this.previewSettings = JSON.parse( localStorage.getItem( "CGSPreviewSettings" ) );
            }
            else this.previewSettings = previewConfig.defaults;
            return this.previewSettings.resolution;

        },

        setMode: function( mode ){

            this.previewSettings.mode = mode;
            localStorage.setItem( "CGSPreviewSettings" , JSON.stringify( this.previewSettings ) );

        },
        getMode: function(){

            if( !this.previewSettings && localStorage[ "CGSPreviewSettings" ] ){
                this.previewSettings = JSON.parse( localStorage.getItem( "CGSPreviewSettings" ) );
            }
            else this.previewSettings = previewConfig.defaults;
            return this.previewSettings.mode;

        },

        setPlatform: function( id ){

            this.lastPlatform = this.getPlatform();

            // Refreshing icons
            $( ".platform-button" )
                .removeClass( this.previewSettings.platform + "-icon" );

            $( ".select-resolution" )
                .css({
                    display: "none"
                });

            this.previewSettings.platform = id;

            $( ".platform-button" )
                .addClass( id + "-icon" );

            $( "#PlatformSelection_" + id )
                .css({
                    display: "inline-block"
                });

            if( this.previewSettings.mode ){
                $( "#PreviewMode_" + id )
                    .css({
                        display: "inline-block"
                    });
            }

            // Storing new settings
            localStorage.setItem( "CGSPreviewSettings" , JSON.stringify( this.previewSettings ) );

            // if no resolution found - getting default resolution for current platform
            if( id != "custom" ){

                var resolution = "";

                _.each( this.availablePlatforms , function( platform ){
                    if( platform.id == id ){
                        resolution = platform.default;
                    }
                }.bind( this ) );

                resolution && this.setResolution( require('cgsUtil').cloneObject( resolution ) );

                this.previewSettings.mode && this.setMode( this.previewSettings.mode );

            }

        },
        getPlatform: function(){

            if( !this.previewSettings && localStorage[ "CGSPreviewSettings" ] ){
                this.previewSettings = JSON.parse( localStorage.getItem( "CGSPreviewSettings" ) );
            }
            else this.previewSettings = previewConfig.defaults;
            return this.previewSettings.platform;

        },

        getPreviewDefaults: function(){

            // checking whether there are saved settings and applying if true
            var settings = localStorage.getItem( "CGSPreviewSettings" );

            if( settings ){
                settings = JSON.parse( settings );
                this.previewSettings.platform = settings.platform || previewConfig.defaults.platform;
                this.previewSettings.mode = settings.mode || previewConfig.defaults.mode;
                this.previewSettings.resolution = settings.resolution;
            }
            // else settings defaults
            else this.setPlatform( this.getPlatform() , true );

            $( ".platform-button" )
                .addClass( this.getPlatform() + "-icon" );

        },

        setToolbar: function( id ){

            // Refreshing toolbar UI
            if( id ) this.setPlatform( id );

            if( this.getPlatform() != "pc" ){

                this.setMode( "inBrowser" );

            }

            if( this.getPlatform() != "custom" ){



                $( "#SetCustomDims" )
                    .css( {
                        "display" : "none"
                    } );

                if( /galaxy/i.test( this.getResolution().name ) ){

                    this.setMode( "galaxy" );

                }

                else{
                    if( !(this.getMode() == "inBrowser" || this.getMode() == "fullScreen") ) this.setMode( "inBrowser" );
                }


                $( "#PlatformSelection_" + this.getPlatform() ).val( this.getResolution().name).css( { display : "inline-block" } );

                if( this.getMode() ){

                    $( "#PreviewMode_" + this.getPlatform() ).val(this.getMode(), true).css( { display : "inline-block" } );

                }

            }

            else{

                $( "#SetCustomDims" )
                    .css( {
                        "display" : "inline-block"
                    } );

                $( "#PreviewWidthValue" )
                    .val( +this.getResolution().values[ 0 ] );

                $( "#PreviewHeightValue" )
                    .val( +this.getResolution().values[ 1 ] );


                this.lastPlatform = this.getPlatform();

            }

            this.playFunction();

        },

        availablePlatforms: previewConfig.platforms ,

        events: {
            "change #locales": "setSecondLocale",
            "click .dropdown-menu li": "selectionHandler",
            "change [id^=PlatformSelection_]": "selectionHandler",
            "change [id^=PreviewMode_]": "selectionHandler",
            "click #ApplyCustomDims": "selectionHandler",
            "change #PreviewWidthValue, #PreviewHeightValue" : "checkValueMinimum"
        },

        checkValueMinimum: function( e ){

            if( +e.target.getAttribute( "min" ) > +e.target.value ) e.target.value = e.target.getAttribute( "min" );

        } ,

        selectionHandler: function( e ){

            var id = "";

            // Handling toolbar action
            if( /PreviewMode_/.test( e.target.id ) ){

                _.each( this.availablePlatforms , function( platform ){

                    _.each( platform.modes , function( mode ){

                        if( mode.type == e.target.selectedOptions.item(0).value ) id = mode.type;

                    }.bind( this ) );

                }.bind( this ) );

                this.setMode( id );

            }

            else if( /PlatformSelection_/.test( e.target.id ) ){

                _.each( this.availablePlatforms , function( platform ){

                    _.each( platform.resolutions , function( resolution ){

                        if( resolution.name + " (" + resolution.description + ")" == e.target.selectedOptions.item(0).innerText.trim() ){
                            id = resolution;
                            if( /galaxy/i.test( id.name ) ){

                                this.setMode( "galaxy" );

                            }
                        }

                    }.bind( this ) );

                }.bind( this ) );

                this.setResolution( id );

            }

            else if( /ApplyCustomDims/.test( e.target.id ) ){

                this.getResolution().values[ 0 ] = +$( "#PreviewWidthValue").val();
                this.getResolution().values[ 1 ] = +$( "#PreviewHeightValue").val();

                this.setResolution( this.getResolution() );
                this.setToolbar();

                return;

            }

            else{

                _.each( this.availablePlatforms , function( platform ){

                    var menuData = e.target.parentNode.getAttribute( "menu-data" ) || e.target.getAttribute( "menu-data" );

                    if( platform.title == menuData ) id = platform.id;

                }.bind( this ) );

                this.setToolbar( id );

                return;

            }

            this.playFunction();

        },

		setSecondLocale: function () {
			this.$("#locales").find('option[selected]').removeAttr('selected');
            var selectedLocale = this.$("#locales").find('option:selected').attr('value');

            this.secondLocale = selectedLocale === 'None' ? null : selectedLocale;

            this.playFunction();
        },
		initialize: function(options) {


			this.config = options.config;
			this.customTemplate = template;

            this.playFunction = this.playPreview;

            this.selectedLocale = require("courseModel").getCourseLocale();
            this.locales = require("courseModel").getMultiNarrationLocales();

            if (this.locales && _.size(this.locales)) {
                this.has_multilanguage = true;
                this.secondLocale = this.locales[0]['locale'];
                this.locales[0]['selected'] = true;
            }

			this._super(options);

		},

		render: function( $parent ) {
			this._super($parent, this.customTemplate);

            this.getPreviewDefaults();

			this.resetPosition();

			this.bindEvents();

            this.setToolbar();
		},

        getScale : function(){
            // settings width and height for the player
            var width = +this.getResolution().values[0];
            var height = +this.getResolution().values[1];
            // if modes exist - reducing the values by mode configs
            if( this.getPlatform() != "custom" && this.getMode() ){
                if(this.getResolution().modes &&
                    this.getResolution().modes[ this.previewSettings.mode ]){
                    width -= +this.getResolution().modes[ this.previewSettings.mode ][ 0 ];
                    height -= +this.getResolution().modes[ this.previewSettings.mode ][ 1 ];
                }
            }

            return {
                width : width ,
                height : height
            };

        } ,

        playPreview: function(){

            var scale = this.getScale();
            var router = require( "router" );

            if( ~[ "sequence", "url_sequence" , "html_sequence" , "separator", "pluginContent" ].indexOf( router.activeEditor.elementType )
                || router.activeScreen.constructor.type == "TaskScreen" ){

                this.isDLPlayer = true;
                preview.playDl({
                    parent: this.iframeContainer,
                    width: scale.width,
                    height: (scale.height + 61),
                    data: this.config.data.repo,
                    seqId: this.config.data.seqId,
                    localeNarrations: _.compact([this.selectedLocale, this.secondLocale]),
                    playerConfig: this.config.playerConfig
                });

                return;
            }

            this.isDLPlayer = false;

			//check if the scp preview was not already initialized
            if( !this.preview ) {
                var self = this;

                this.getLessonData(function(convertedLesson){
                    self.convertedLesson = convertedLesson;
                    require([ "SCPPreview" ], function (SCPPreview) {
                        self.preview = SCPPreview;
                        self.preview.initPreview( {
                            data: self.convertedLesson,
                            container: self.iframeContainer ,
                            scale : {
                                width : scale.width + "px" ,
                                height : (scale.height + 61) + "px"
                            }
                        } );

                    });
                });
            }
            //this will be activated when we already opened the scp preview and now we want to change the resolution/device mode
            else {
	            this.preview.dispose();
	            this.preview.initPreview({
		            data: this.convertedLesson,
		            container: this.iframeContainer,
		            scale: {
			            width: scale.width + "px",
			            height: (scale.height + 61) + "px"
		            }
	            });
            }

        } ,

        getLessonData: function(callback){
            var self = this;
            var lessonId = require("lessonModel").lessonId;
            var convertedLessons = repo.getRemoteJsonForScp(lessonId);

            var lessonData = convertedLessons.lessonsData[lessonId];

            var daoConfig = {
                path:require("restDictionary").paths.CONVERT_LESSON_TO_SCP,
                pathParams: {
                    publisherId: require("userModel").getPublisherId(),
                    courseId: repo._courseId
                },
                data:lessonData
            };

            require('dao').remote(daoConfig, function(lessonInScpFormat) {
                if(lessonInScpFormat){
                    lessonInScpFormat.sequences = require("lessonModel").getSequencesInServerFormat(lessonData.cid);
                    callback(lessonInScpFormat);
                }
            },function(){
                self.dispose();
            });
        },
		bindEvents: function() {
            var self = this;
            $(window).resize(function() {
                self.resetPosition.call(self);
            });
		} ,

        dispose : function(){

            if(this.preview){
                this.preview.dispose();
                this.preview = null;
            }

            events.fire("terminateDialog");
            this._super();
        },

        unbind: function(callback) {
            if (this.isDLPlayer) {
                var superFunc = this._super.bind(this);
                preview.terminatePlayers(function() {
                    superFunc(callback);
                });
            }
            else {
                if(this.preview){
                    this.preview.dispose();
                    this.preview = null;
                }
                this._super(callback);
            }
        }

	}, {type: 'PreviewDialogView'});

	return PreviewDialogView;

});
