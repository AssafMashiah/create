define(['jquery', 'IconAndFileUpload', 'BasePropertiesView', 'PropertyPreviewUtil',
 'text!modules/SoundButtonEditor/templates/SoundButtonProps.html'],
function($,  IconAndFileUpload, BasePropertiesView, PropertyPreviewUtil, template) {

	var SoundButtonPropsView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
			
			// file uploads		
			new IconAndFileUpload({
				itemId: '#SoundButtonUploader',
				repoItemName: 'sound',
				type: 'sound',
				callback: this.onSoundFileUpload.bind(this),
                context: this.controller,
				recordId: this.controller.config.id,
				srcAttr: 'sound',
				enableAssetManager: this.controller.enableAssetOrdering
			});
			this.setInputMode();

            if (this.controller.record.data.isValid) {
                this.initPreview();
            }
		},

		render: function() {
			this._super();		
		},

        onSoundFileUpload: function(response) {
            this.initPreview();
            this.controller.onSoundFileUpload(response);
        },

        initPreview: function() {
            this.mediaPreviewConfig = {
                'mediaType': 'sound',
                'previewTargetSelector': '#SoundButtonUploader div:first-child',
                'src': this.controller.record.data.sound
            };

            PropertyPreviewUtil.initMediaPreview(this.mediaPreviewConfig);
        },

        dispose: function(){
            PropertyPreviewUtil.disposeMediaPreview(this.mediaPreviewConfig);
            this._super();
        }

	}, {type: 'SoundButtonPropsView'});
	return SoundButtonPropsView;

});