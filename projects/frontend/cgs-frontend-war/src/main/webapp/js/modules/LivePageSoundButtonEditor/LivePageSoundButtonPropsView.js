define(['jquery', 'IconAndFileUpload', '../LivePageElementEditor/LivePageElementPropsView', 'PropertyPreviewUtil',
 'text!modules/SoundButtonEditor/templates/SoundButtonProps.html'],
function($,  IconAndFileUpload, LivePageElementPropsView, PropertyPreviewUtil, template) {

	var LivePageSoundButtonPropsView = LivePageElementPropsView.extend({

		initialize: function(options) {
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

	}, {type: 'LivePageSoundButtonPropsView'});
	return LivePageSoundButtonPropsView;

});