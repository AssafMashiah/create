define(['jquery', 'FileUpload', '../OverlayElementEditor/OverlayElementPropsView', 'assets',
 'text!modules/OverlayAudioEditor/templates/OverlayAudioPropsView.html'],
function($,  FileUpload, OverlayElementPropsView, assets, template) {

	var OverlayAudioPropsView = OverlayElementPropsView.extend({

		initialize: function(options) {
			this._super(options);

            this.setInputMode();

            this.initPreview();
		},

		render: function() {
			this.template = template;
			this._super();		
		},

		initFileUpload: function() {
			// file uploads
			new FileUpload({
				activator: '#button_upload_audio',
				options: FileUpload.params['audio'],
				callback: this.onAudioFileUpload.bind(this),
				context: this.controller,
				recordId: this.controller.config.id,
				srcAttr: 'overlaySrc',
				enableAssetManager: false,
				enableEdit: true
			});
		},

        onAudioFileUpload: function(response) {
            this.controller.onAudioFileUpload(response);
        },

        initPreview: function() {
	        this.initFileUpload();
        }

	}, {type: 'OverlayAudioPropsView'});
	return OverlayAudioPropsView;

});