define(['jquery', 'IconAndFileUpload', '../LivePageElementEditor/LivePageElementPropsView', 'PropertyPreviewUtil',
 'text!modules/VideoPlayerEditor/templates/VideoPlayerProps.html'],
function($,  IconAndFileUpload, LivePageElementPropsView, PropertyPreviewUtil, template) {

	var LivePageVideoPlayerPropsView = LivePageElementPropsView.extend({

		initialize: function(options) {
			this._super(options);
			
			// file uploads		
			new IconAndFileUpload({
				itemId: '#VideoPlayerUpload',
				repoItemName: 'video',
				type: 'video',
				callback: this.onVideoFileUpload.bind(this),
                context: this.controller,
				recordId: this.controller.config.id,
				srcAttr: 'video',
				enableAssetManager: true
			});
			this.setInputMode();
            // todo disabled for entering content purposes
            this.$('#chkTitle').addClass('disabled').attr('disabled', '').unbind('click');
            this.$('#chkVideoPlayerCopyrights').addClass('disabled').attr('disabled', '').unbind('click');
			
            if (this.controller.record.data.isValid) {
                this.initPreview();
            }
		},

		render: function() {
			this.template = template;
			this._super();
		},
		
        onVideoFileUpload: function(response) {
            this.initPreview();
            this.controller.onVideoFileUpload(response);
        },

        initPreview: function() {

            this.mediaPreviewConfig = {
                'mediaType': 'video',
                'previewTargetSelector': '#VideoPlayerUpload [class^="video"]',
                'src' : this.controller.record.data.video
            };

            PropertyPreviewUtil.initMediaPreview(this.mediaPreviewConfig);
        },

        dispose: function(){
            PropertyPreviewUtil.disposeMediaPreview(this.mediaPreviewConfig);
            this._super();
        }

	}, {type: 'LivePageVideoPlayerPropsView'});
	return LivePageVideoPlayerPropsView;

});