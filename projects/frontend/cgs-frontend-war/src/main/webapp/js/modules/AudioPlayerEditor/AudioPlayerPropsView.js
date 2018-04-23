define(['jquery', 'IconAndFileUpload', 'BasePropertiesView', 'PropertyPreviewUtil',
 'text!modules/AudioPlayerEditor/templates/AudioPlayerProps.html'],
function($,  IconAndFileUpload, BasePropertiesView, PropertyPreviewUtil, template) {

	var AudioPlayerPropsView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
			
			// file uploads
			new IconAndFileUpload({
				itemId: '#AudioPlayerUpload',
				repoItemName: 'audio',
				type: 'sound',
				callback: this.onAudioFileUpload.bind(this),
				context: this.controller,
				recordId: this.controller.config.id,
				srcAttr: 'audio',
				enableAssetManager: this.controller.enableAssetOrdering
			});
			this.setInputMode();
            // todo disabled for entering content purposes
            this.$('#chkTitle').addClass('disabled').attr('disabled', '').unbind('click');
            this.$('#chkAudioPlayerCopyrights').addClass('disabled').attr('disabled', '').unbind('click');

            if (this.controller.record.data.isValid) {
                this.initPreview();
            }
		},

        onAudioFileUpload: function(response) {
            this.initPreview();
            this.controller.onAudioFileUpload(response);
        },

        initPreview: function() {
            this.mediaPreviewConfig = {
                'mediaType': 'audio',
                'previewTargetSelector': '#AudioPlayerUpload div:first-child',
                'src': this.controller.record.data.audio
            };

            PropertyPreviewUtil.initMediaPreview(this.mediaPreviewConfig);
        },

        dispose: function(){
            PropertyPreviewUtil.disposeMediaPreview(this.mediaPreviewConfig);
            this._super();
        }

	}, {type: 'AudioPlayerPropsView'});
	return AudioPlayerPropsView;

});