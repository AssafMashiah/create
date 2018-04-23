define(['jquery', 'FileUpload', 'dialogs', 'events', 'IconAndFileUpload', 'BasePropertiesView', 'PropertyPreviewUtil',
 'text!modules/ImageViewerEditor/templates/ImageViewerProps.html','repo', 'assets'],
function($, FileUpload, dialogs, events, IconAndFileUpload, BasePropertiesView, PropertyPreviewUtil, template, repo, assets) {

	var ImageViewerPropsView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
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
				enableAssetManager: this.controller.enableAssetOrdering
			});
			new IconAndFileUpload({
				itemId: '#captionNarrationUpload',
				repoItemName: 'captionNarration',
				type: 'narration',
				context: this.controller,
				recordId: this.controller.config.id,
				srcAttr: 'captionNarration',
				enableAssetManager: this.controller.enableAssetOrdering
			});
			new IconAndFileUpload({
				itemId: '#ImageViewerSoundUpload',
				repoItemName: 'sound',
				type: 'sound',
				context: this.controller,
				recordId: this.controller.config.id,
				srcAttr: 'sound',
				enableAssetManager: this.controller.enableAssetOrdering
			});
			this.setInputMode();

            this.setAdvancedButtonState();

            $( "#ImageViewerAdvanced" )
                .on( "click" , this.openMinimumReadableDialog.bind( this ) );

            $( '#button_image_editor').on( "click" , this.openImageCropperDialogue.bind( this ) );

            if (this.controller.record.data.isValid) {
                this.initPreview();
            }
		},

        currentImageId: null,

        onMinimumReadableDialogClose: function( response ){
            if( response && response != "cancel" ){
                this.controller.updateMinimumReadable( this.currentImageId , response );
                this.currentImageId = null;
            }
        },

        setAdvancedButtonState: function(){

            if( this.controller.record.data.image && !require( "editMode" ).readOnlyMode ){
                this.$( "#ImageViewerAdvanced" )
                    .prop( "disabled" , false );
            }

            else{
                this.$( "#ImageViewerAdvanced" )
                    .prop( "disabled" , true );
            }

        },

        openMinimumReadableDialog: function(){

            this.currentImageId = this.controller.record.id;

            //No image was chosen. Can't open dialog
            if( !this.currentImageId ){
                return;
            }

            var dialogConfig = {
                buttons: {
                    ok:		{ label: 'OK' },
                    cancel:		{ label: 'Cancel' }
                },

                content: {
                },

                data: {
                    img: this.controller.record.data.image,
                    width: this.controller.record.data.imgWidth,
                    height: this.controller.record.data.imgHeight,
                    minimum: this.controller.record.data.minimumReadable
                }
            };

            events.once( 'onMinimumReadableDialogClose', this.onMinimumReadableDialogClose, this);

            this.previewDialog = dialogs.create('minimumReadable', dialogConfig, 'onMinimumReadableDialogClose');
        },

        openImageCropperDialogue : function(){
            var self = this;
            this.currentImageId = this.controller.record.id;
            var repoId = this.controller.record.id;
            //No image was chosen. Can't open dialog
            if( !this.currentImageId ){
                return;
            }

            var dialogConfig = {
                buttons: {
                    ok:     { label: 'OK' },
                    cancel:     { label: 'Cancel' }
                },

                content: {
                },

                data: {
                    img: this.controller.record.data.image,
                    beforeTerminationCallback: function(blob){
	                    var repoId = self.controller.record.id;
	                    assets.uploadBlobAndSaveItLocally(blob, function (filePathInsideMediaFolder) {
		                    /// update this.record.data.image to be the new path to image
		                    repo.updateProperty(repoId, "image", filePathInsideMediaFolder);
		                    // update the stage view and image preview
		                    self.onImageFileUpload("/" + filePathInsideMediaFolder);
	                    }); //uploading image and rendering afterwards
                    }
                }
            };

            this.previewDialog = dialogs.create('imageCropper', dialogConfig);
        },

		render: function() {
			this.isShowImagePreview = this.controller.isShowImagePreview.bind(this.controller);

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

		isShowImageCropperButton : function(){
			if (this.controller.record.data && this.controller.record.data.assetManager && this.controller.record.data.assetManager[0])
				return this.controller.record.data.assetManager[0].state;
			return false;
		},

        dispose: function(){
            PropertyPreviewUtil.disposeMediaPreview(this.mediaPreviewConfig);
            this._super();
        }


	}, {type: 'ImageViewerPropsView'});
	return ImageViewerPropsView;

});