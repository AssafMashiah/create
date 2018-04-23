define(['modules/OverlayElementEditor/OverlayElementEditor', 'repo', 'assets', 'validate', './config', './OverlayVideoPropsView'],
function(OverlayElementEditor, repo, assets, validate, config, OverlayVideoPropsView) {

	var OverlayVideoEditor = OverlayElementEditor.extend({

		registerEvents: function() {

			var changes = {
				overlaySrc:   this.propagateChanges(this.record, 'overlaySrc', true),
				overlayType:  this.propagateChanges(this.record, 'overlayType', true)
			};

			this.model = this.screen.components.props.startEditing(this.record, changes);

			this.model.on('change:overlayType', function() {
				this.record.data.embeddedUrl = null;
				this.record.data.overlaySrc = null;
				this.refresh();
				this.updateOverlay();
			}, this);

			this.model.on('change:overlaySrc', function () {
				var url = this.record.data.overlaySrc,
					videoId = this.getYoutubeId(url);

				if (videoId) {
					this.saveVideoYoutube(videoId, url);
				} else {
					this.record.data.embeddedUrl = null;
					this.record.data.overlaySrc = null;
					require('showMessage').clientError.show({
						errorId: 'URL_VALIDATION_ERROR1'
					});
				}

				this.updateOverlay();

			}, this);
		},

		startPropsEditing: function(){
			this._super(null, OverlayVideoPropsView);
			this.registerEvents();
		},

		onVideoFileUpload: function(response){
			var videoElem;
			if(response){
				videoElem = document.createElement('video');
				videoElem.src = require('assets').serverPath(response);
				videoElem.onloadedmetadata = function(e) {
					repo.updateProperty(this.config.id, 'embeddedUrl', null);
					repo.updateProperty(this.config.id, 'width', e.target.videoWidth);
					repo.updateProperty(this.config.id, 'height', e.target.videoHeight);

					this.updateOverlay();
					this.refresh();
				}.bind(this);
			}
		},

		getYoutubeId: function (url) {
			var regExp;
			var match;
			if(!url) {
				return null;
			}
			regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&\?]*).*/;
			match = url.match(regExp);

			if (match && match[2].length == 11) {
				return match[2];
			} else {
				return null;
			}
		},

		saveVideoYoutube: function (videoId, overlaySrc) {
			var embeddedUrl = 'https://www.youtube.com/embed/' + videoId + '?html5=1&fs=1';
			var size = {'width': 560, 'height': 315};

			repo.updateProperty(this.config.id, 'overlaySrc', embeddedUrl);
			repo.updateProperty(this.config.id, 'embeddedUrl', embeddedUrl);
			repo.updateProperty(this.config.id, 'overlayType', 'VIDEO_YOUTUBE');

			repo.updateProperty(this.config.id, 'width', size.width);
			repo.updateProperty(this.config.id, 'height', size.height);
		}

	}, {
		type: 'OverlayVideoEditor',
		valid:function (elem_repo) {

			var valid_obj = {};

			if (!elem_repo.data.overlaySrc) {
				valid_obj = {
					valid: false,
					report: [validate.setReportRecord(elem_repo, 'Video source missing')]
				};

			}

			return valid_obj;
		}
	});

	return OverlayVideoEditor;

});