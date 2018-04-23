define(['BasePropertiesView', 'StandardsList', 'standardsModel', 'FileUpload','text!modules/TocEditor/templates/TocEditor.html', 'assets'],
function(BasePropertiesView, StandardsList, standardsModel, FileUpload, template, assets) {

	var TocEditorView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
			
			this.fileOptionObj = FileUpload.params.image;
			if (this.controller.record.data && this.controller.record.data.image) {
				this.controller.record.data.imageUrl = assets.serverPath(this.controller.record.data.image);
			}

			new FileUpload({
				activator: '#button_upload_image',
				options: this.fileOptionObj,
				callback: this.controller.onImageFileUpload,
				context: this.controller
			});

			$('.toc_img #image_cropper_button').on( "click" , this.controller.openImageCropperDialogue.bind( this ) );
		},
		updateImgSrc: function f548(path) {
		        this.$('#toc_image').attr('src', path);
	        },
	        enableImageCropperButton: function(show){
		        var $cropperButton = this.$('.toc_img #image_cropper_button');
		        if (show){
			        $cropperButton.show();
		        } else {
			        $cropperButton.hide();
		        }
	        },
        render: function() {
            this._super();
	        if (this.controller.enableStandards) {
		        this.standardsList = new StandardsList({
			        itemId: '#standards_list',
			        repoId: this.controller.config.id,
			        getStandardsFunc: _.bind(function () {
				        return standardsModel.getStandards(this.controller.config.id);
			        }, this)
		        });
	        }
        }

	}, {type: 'TocEditorView'});

	return TocEditorView;

});
