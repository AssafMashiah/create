define(['jquery', 'FileUpload', 'assets', '../OverlayElementEditor/OverlayElementPropsView',
 'text!modules/OverlayVideoEditor/templates/OverlayVideoPropsView.html'],
function($,  FileUpload, assets, OverlayElementPropsView, template) {

	var OverlayVideoPropsView = OverlayElementPropsView.extend({

		 initialize: function(options) {
			this._super(options);

			this.setInputMode();
			this.initPreview();
		},

		render: function() {
			this.template = template;
			this._super();
		},

		refresh: function() {
			this._super();
			this.initPreview();
		},

		initFileUpload: function () {
			if(this.showFile()) {
				new FileUpload({
					activator: '#button_upload_video',
					options: FileUpload.params['video'],
					callback: this.onVideoFileUpload.bind(this),
					context: this.controller,
					recordId: this.controller.config.id,
					srcAttr: 'overlaySrc',
					enableAssetManager: false,
					enableEdit: true
				});
			}
		},
		
        onVideoFileUpload: function(response) {
            this.controller.onVideoFileUpload(response);
        },

        initPreview: function() {
	        if (this.showFile()) {
		        this.initFileUpload();
	        }
        },

		showFile: function() {
			return (this.controller && this.controller.record &&
				    this.controller.record.data.overlayType === 'VIDEO_FILE');
		}

	}, {type: 'OverlayVideoPropsView'});
	return OverlayVideoPropsView;

});