define(['jquery', 'FileUpload', 'IconAndFileUpload', 'dialogs', 'assets', 'repo','../OverlayElementEditor/OverlayElementPropsView',
		'PropertyPreviewUtil', 'text!modules/OverlayImageEditor/templates/OverlayImagePropsView.html'],
	function ($, FileUpload, IconAndFileUpload, dialogs, assets, repo, OverlayElementPropsView, PropertyPreviewUtil, template) {

		var OverlayImagePropsView = OverlayElementPropsView.extend({

			initialize: function (options) {
				this._super(options);

				this.initFileUpload();
				this.initPreview();
			},

			render: function () {
				this.template = template;
				this._super();
			},

			refresh: function() {
				this._super();
				this.initFileUpload();
				this.initPreview();
			},

			initFileUpload: function () {
				// file uploads
				this.fileUpload = new FileUpload({
					activator: '#button_upload_image',
					options: FileUpload.params['image'],
					callback: this.onImageFileUpload.bind(this),
					context: this.controller,
					recordId: this.controller.config.id,
					srcAttr: 'overlaySrc',
					enableAssetManager: false,
					enableEdit: true
				});

				$( '#button_image_editor').on( "click" , this.openImageCropperDialogue.bind( this ) );
			},

			onImageFileUpload: function (response) {
				this.controller.onImageFileUpload(response);
			},

			initPreview: function () {
				this.mediaPreviewConfig = {
					'mediaType': 'image',
					'previewTargetSelector': '#field_image_Viewer',
					'src': this.controller.record.data.overlaySrc
				};
				PropertyPreviewUtil.initMediaPreview(this.mediaPreviewConfig);
			},

			openImageCropperDialogue: function () {
				var self = this;
				this.currentImageId = this.controller.record.id;
				var repoId = this.controller.record.id;
				//No image was chosen. Can't open dialog
				if (!this.currentImageId) {
					return;
				}

				var dialogConfig = {
					buttons: {
						ok: {label: 'OK'},
						cancel: {label: 'Cancel'}
					},

					content: {},

					data: {
						img: this.controller.record.data.overlaySrc,
						beforeTerminationCallback: function (blob) {
							var repoId = self.controller.record.id;
							assets.uploadBlobAndSaveItLocally(blob, function (filePathInsideMediaFolder) {
								/// update this.record.data.overlaySrc to be the new path to image
								repo.updateProperty(repoId, "overlaySrc", filePathInsideMediaFolder);
								// update the stage view and image preview
								self.onImageFileUpload("/" + filePathInsideMediaFolder);
							}); //uploading image and rendering afterwards
						}
					}
				};

				this.previewDialog = dialogs.create('imageCropper', dialogConfig);
			},

			dispose: function () {
				PropertyPreviewUtil.disposeMediaPreview(this.mediaPreviewConfig);
				this._super();
			}

		}, {type: 'OverlayImagePropsView'});
		return OverlayImagePropsView;

	});