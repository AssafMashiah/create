define(['lodash', 'jquery', 'BaseView', 'mustache', 'events', 'files', 'FileUpload', 'assets', 'modules/Dialogs/BaseDialogView', 'text!modules/Dialogs/types/pdfuploadOnePage/PdfUploadDialog.html'],
function(_, $, BaseView, Mustache, events, files, FileUpload, assets, BaseDialogView, template) {

	var PdfUploadOnePageView = BaseDialogView.extend({

		tagName:'div',
		className:'css-dialog',

		filePath: "",

		initialize:function f706(options) {
			this.options = options;
			this.customTemplate = template;
			this._super(options);
		},

		totalPages: null,

		pagesToRender: null,

		getPageNum: function f707() {
			var pageNum = $("#pageNum").val() || 1;
			return  pageNum;
		},

		afterFileUpload: function(response){
			var pageNum = this.getPageNum();
			this.controller.setReturnValue('finish', {'filePath' : response, 'pageNum' : pageNum});
			this.controller.onDialogTerminated('finish');
		},

		render: function f708($parent) {
			this._super($parent, this.customTemplate);

			//bind the event for the cancel upload button
			$("#cancel_upload").one('click', _.bind(function f709() {
				//close the dialog
				events.fire('terminateDialog');
			}, this));

			//init the upload button event
			new FileUpload({
				activator: '#pdf_upload_btn',
				options:  _.extend({
                    uploadFileLocalyOnly: true,
                    ignoreSizeLimit: true
                }, FileUpload.params.pdf),
				callback:  this.afterFileUpload,
				context:   this
			});

		}

	}, {type: 'PdfUploadOnePageView'});

	return PdfUploadOnePageView;

});