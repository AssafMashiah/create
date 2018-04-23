define(['lodash','jquery', 'BaseView', 'mustache', 'events', 'files', 'FileUpload',
	'modules/Dialogs/BaseDialogView', 'text!modules/Dialogs/types/appletFileManager/AppletFileManagerDialog.html'],
function(_, $, BaseView, Mustache, events, files, FileUpload, BaseDialogView, template) {

	var AppletFileManagerDialogView = BaseDialogView.extend({

		tagName:'div',
		className:'css-dialog',
		
		filePath: "",

		initialize:function f586(options) {
			this.customTemplate = template;
			this._super(options);
		},

		render:function f587($parent) {
			this._super($parent, this.customTemplate);
			this.bindEvents();
		},

        onUploadError: function(error) {
            $('#uploadStatus').text('');
            $('#uploadError').html(error);
        },

		afterFileUpload: function(filePath, originalName, fileBlob){
			this.controller.setReturnValue('cancel', { path: filePath, fileName: originalName, blob: fileBlob });
			events.fire('terminateDialog', 'cancel');
			// $('#uploadStatus').text('file uploaded successfully');
		},

		bindEvents: function() {
			var uploadFileLocalyOnly = this.options.config.fileMymType === 'zip';
			new FileUpload({
				activator: "#addFile",
				options: {
					fileMymType: this.options.config.fileMymType,
					allowFiles: this.options.config.allowFiles,
					uploadFileLocalyOnly: uploadFileLocalyOnly
				},
				callback: this.afterFileUpload,
                errorCallback: this.onUploadError,
				context: this
			});
		}

	}, {type: 'AppletFileManagerDialogView'});

	return AppletFileManagerDialogView;

});