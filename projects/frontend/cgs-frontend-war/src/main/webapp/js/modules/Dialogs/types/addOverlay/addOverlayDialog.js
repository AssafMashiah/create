define(['modules/Dialogs/BaseDialogView', 'translate', 'FileUpload', 'mustache', 'events', 'helpers', 'assets',
	'text!modules/Dialogs/types/addOverlay/templates/addOverlay.html'],
function(BaseDialogView, translate, FileUpload, mustache, events, helpers,assets, dialogTemplate ) {

	var overlayAddDialogView = BaseDialogView.extend({
		tagName: 'div',
        id: 'overlay-add-dialog',

		initialize: function (options) {
            this.customTemplate = dialogTemplate;
            this._super(options);

			this.overlayType = options.config.overlayType;
			this.showAddingType = options.config.showAddingType;
        },

        render: function ($parent) {
            this._super($parent, this.customTemplate);

            this.loader = this.$("#loader");

			this.$('#dialog').addClass(this.overlayType);

			if(['all', 'upload'].indexOf(this.showAddingType) >= 0) {
				this.$("#overlay-upload-subtitle").html(translate.tran("ebook.addOverlay.dialog.upload.subtitle." + this.overlayType));
			} else {
				this.$('#column-upload').hide();
			}

			if(['all', 'url'].indexOf(this.showAddingType) >= 0) {
				this.$("#overlay-url-subtitle").html(translate.tran("ebook.addOverlay.dialog.url.subtitle." + this.overlayType));
				this.$("#overlay-url-text").html(translate.tran("ebook.addOverlay.dialog.url.text." + this.overlayType));
				this.$("#url-error").html(translate.tran("ebook.addOverlay.dialog.url.error." + this.overlayType));
			} else {
				this.$("#column-url").hide();
			}

            // Only in case dialog type is URL - display URL preview iframe
            if (this.showAddingType === "url"){
                this.showUrlIframePreview = true;
            }else {
                this.showUrlIframePreview = false;
                this.$("#link-iframe").hide();
            }

            this.bindEvents();
        },

        bindEvents: function(){
			//init the upload button event
			var options = FileUpload.params[this.overlayType], self = this, timer, delay = 500;

			if(options) {
				//init file upload button
				new FileUpload({
					activator: "#upload-overlay-btn",
					dropzone: "#upload-drop",
					options: options,
					callback: this.afterFileUpload,
					context: this,
					enableAssetManager: false
				});
			}

			this.$('#url-save-form').on("submit",
				_.bind(this[(this.overlayType === 'video') ? 'saveVideoUrl' : 'saveUrl'], this));

			// this should be replaced with _.throttle or _.debounce, using timer is bad.
	        this.$("#overlay-url").on("input",
		        function () {
			        window.clearTimeout(timer);
			        timer = window.setTimeout(function () {
				        self.validateUrl();
			        }, delay);
		        });

	        //prevent default drag and drop behaviour on dialog content
	        this.$el[0].addEventListener("dragover",function(e){
		        e = e || event;
		        e.preventDefault();
	        },false);
	        this.$el[0].addEventListener("drop",function(e){
		        e = e || event;
		        e.preventDefault();
	        },false);
        },

		//after file upload function hendler
		afterFileUpload: function(response){

			function _returnValue(json) {

				var json_params = {
					type: this.overlayType.toUpperCase(),
					overlayType: this.overlayType.toUpperCase() + '_FILE',
					path: response
				};

				json_params = _.extend(json_params, json);

				this.controller.setReturnValue('filesave', json_params);
				events.fire('terminateDialog', 'filesave');
			}

			var size = {};

			if (this.overlayType === 'image') {
				var img = $('<img src="' + assets.serverPath(response) + '" />').load(function (event) {
					size.width = event.target.naturalWidth;
					size.height = event.target.naturalHeight;
					_returnValue.call(this, {size: size});
				}.bind(this));
			} else if (this.overlayType === 'video') {
				var videoElem = document.createElement('video');
				videoElem.src = assets.serverPath(response);
				videoElem.onloadedmetadata = function(event) {
					size.width = event.target.videoWidth;
					size.height = event.target.videoHeight;
					_returnValue.call(this, {size: size});
				}.bind(this);
			} else {
				_returnValue.call(this);
			}
		},

		saveVideoUrl: function(event) {
		//	VIDEO_YOUTUBE
		//	VIDEO_URL
			event.preventDefault();
			event.stopImmediatePropagation();
			event.stopPropagation();
			var overlayUrl = this.$('#overlay-url').val(),
				overlayType = this.overlayType.toUpperCase(),
				embeddedUrl = '';

			//get youtube video id
			function getId(url) {
				var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
				var match = url.match(regExp);

				if (match && match[2].length == 11) {
					return match[2];
				} else {
					return null;
				}
			}

			var videoId = getId(overlayUrl);
			//if url contains youtube video id, make embed youtube url
			if (videoId) {
				overlayType += "_YOUTUBE";
				embeddedUrl = 'https://www.youtube.com/embed/' + videoId + '?html5=1&fs=1';

				var size = {'width': 560, 'height': 315};

				this.controller.setReturnValue('urlsave', {
					'type': 'VIDEO', 'overlayType': overlayType, path: embeddedUrl,
					embeddedUrl: embeddedUrl, displayType: "EMBEDDED", size: size
				});

				events.fire('terminateDialog', 'urlsave');
			} else if (overlayUrl && overlayUrl.length) {
				this.$("#save-url").attr("disabled", true);
				this.$("#url-save-form").addClass("error");
			}

		},

		saveUrl: function(event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			event.stopPropagation();
			var overlayUrl = this.$('#overlay-url').val(),
				overlayType = this.overlayType.toUpperCase();
			if (overlayType != 'URL') {
				overlayType += '_URL';
			} else {
				overlayType = 'EXTERNAL_URL';
			}

			this.controller.setReturnValue('urlsave',
				{'overlayType': overlayType, 'displayType': "ICON", path: this.addhttp(overlayUrl)});
			events.fire('terminateDialog', 'urlsave');
		},

		validateUrl: function() {
			var urlValue = this.$('#overlay-url').val(),
			 	isValid = this.constructor.validationUrl.test(urlValue);

			this.$("#save-url").attr("disabled", !isValid);
			this.$("#url-save-form")[isValid ? "removeClass" : "addClass"]("error");
			
			//re-render the preview iframe
            if (this.showUrlIframePreview){
                var myIframe = this.$("#link-iframe");
                if (myIframe.length > 0){
                    myIframe.remove();
                }
                if (isValid){
                    this.loader.show();

                    myIframe = $("<iframe>",{
                        src: this.addhttp(urlValue),
                        height: 250,
                        width: 490,
                        frameborder: 0,
                        id:"link-iframe"
                    });

                    myIframe.on("load", _.bind(function(){
                        this.loader.hide(200);
                    },this));

                    myIframe.insertBefore(this.loader);
                }else {
                    this.loader.hide(200);
                }
            }
		},

		addhttp: function (url) {
			if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
				url = "http://" + url;
			}
			return url;
		}

	}, {type: 'overlayAddDialogView',
		validationUrl : /^(http:\/\/|https:\/\/)?(www.)?([a-zA-Z0-9]+).[a-zA-Z0-9]*.[a-z]{0,3}.?([a-z]+)?/i
        // Better url reg ex
        //validationUrl : /_^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\x{00a1}-\x{ffff}0-9]+-?)*[a-z\x{00a1}-\x{ffff}0-9]+)(?:\.(?:[a-z\x{00a1}-\x{ffff}0-9]+-?)*[a-z\x{00a1}-\x{ffff}0-9]+)*(?:\.(?:[a-z\x{00a1}-\x{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$_iuS/g
	});

	return overlayAddDialogView;

});