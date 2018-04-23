define(['jquery', 'FileUpload', 'IconAndFileUpload', '../LivePageElementEditor/LivePageElementPropsView', 'PropertyPreviewUtil',
 'text!modules/ImageViewerEditor/templates/ImageViewerProps.html'],
function($, FileUpload, IconAndFileUpload, LivePageElementPropsView, PropertyPreviewUtil, template) {

	var LivePageImageViewerPropsView = LivePageElementPropsView.extend({

		initialize: function(options) {
			this._super(options);

            this.fileOptionObj = FileUpload.params.image;
			// file uploads
			new FileUpload({
				activator: '#button_upload_image',
				options: this.fileOptionObj,
				callback: this.onImageFileUpload.bind(this),
				context: this.controller,
				recordId: this.controller.config.id,
				srcAttr: 'image',
				enableAssetManager: true
			});
			new IconAndFileUpload({
				itemId: '#captionNarrationUpload',
				repoItemName: 'captionNarration',
				type: 'narration',
				context: this.controller,
				recordId: this.controller.config.id,
				srcAttr: 'captionNarration',
				enableAssetManager: true
			});
			new IconAndFileUpload({
				itemId: '#ImageViewerSoundUpload',
				repoItemName: 'sound',
				type: 'sound',
				context: this.controller,
				recordId: this.controller.config.id,
				srcAttr: 'sound',
				enableAssetManager: true
			});
			this.setInputMode();
		
            if (this.controller.record.data.isValid) {
                this.initPreview();
            }
		},

		render: function() {
			this.template = template;
			this._super();
		},

        onImageFileUpload: function(response) {
            this.initPreview();
            this.controller.onImageFileUpload(response);
        },

        initPreview: function() {
            this.mediaPreviewConfig = {
                'mediaType': 'image',
                'previewTargetSelector': '#field_image_Viewer',
                'src': this.controller.record.data.image
            };
            PropertyPreviewUtil.initMediaPreview(this.mediaPreviewConfig);
        },

        dispose: function(){
            PropertyPreviewUtil.disposeMediaPreview(this.mediaPreviewConfig);
            this._super();
        }

	}, {type: 'LivePageImageViewerPropsView'});
	return LivePageImageViewerPropsView;

});