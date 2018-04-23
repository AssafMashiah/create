define(['jquery', 'repo', 'customCourseMetadata', 'BasePropertiesView', 'text!modules/LessonEditor/templates/LessonEditor.html', 'StandardsList',
    'standardsModel', 'FileUpload', 'assets'],
    function f808($, repo, customCourseMetadata, BasePropertiesView, template, StandardsList, standardsModel, FileUpload, assets) {

        var LessonEditorView = BasePropertiesView.extend({

            initialize: function f809(options) {
                this.template = template;
                this._super(options);

	            this.fileOptionObj = FileUpload.params.image;
				if (this.controller.record.data && this.controller.record.data.image) {
	            	this.controller.record.data.imageUrl = assets.serverPath(this.controller.record.data.image);
				}

	            // file uploads
	            new FileUpload({
		            activator: '#button_upload_image',
		            options: this.fileOptionObj,
		            callback: this.controller.onImageFileUpload,
		            context: this.controller
	            });

	            $('.lesson_img #image_cropper_button').on( "click" , this.controller.openImageCropperDialogue.bind( this ) );
            },
	        updateImgSrc: function f548(path) {
		        this.$('#lesson_image').attr('src', path);
	        },
	        enableImageCropperButton: function(show){
		        var $cropperButton = this.$('.lesson_img #image_cropper_button');
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

                var metadataComponent = new customCourseMetadata({
                    parent: $("#customCourseMetadata"),
                    data: repo.get(this.controller.record.id).data.customMetadataFields,
                    updateCallback: _.bind(function(data) {
                        require('repo').updateProperty(this.controller.record.id, 'customMetadataFields', data);
                    }, this)
                });
            }

        }, {type: 'LessonEditorView'});

        return LessonEditorView;

    });
