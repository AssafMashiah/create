define(['jquery', 'BaseView', 'mustache', 'dialogs', 'events', "busyIndicator", 'FileUpload', 'pdf_js', 'assets', 'files', 'text!components/teachers_guide/template/teachersGuide.html'],
	function f1785($, BaseView, mustache, dialogs, events, busy, FileUpload, pdf_js, assets, files, template) {

		function getSelection() {
			//get text selection
			var selection = document.getSelection();

			if (!selection.baseNode) {
				return false;
			}

			if (selection.baseNode != this.editableDiv[0]) {
				if ($(selection.baseNode).parents('.' + this.editableDiv.attr('class')).length == 0) {
					return false;
				}
			}

			return selection;
		}

		var teachersGuideComponentView = BaseView.extend({
			events:{
				"keyup div.inputField": "updateHtml",
				"click div.inputField": "updateHtml",
				"click #control_bold":  "handleCommand",
				"click #control_italic": "handleCommand",
				"click #control_pdf": "openPdfUploadDialog",
				"click #control_subscript":  "handleCommand",
				"click #control_superscript":  "handleCommand",
			},

			initialize:function f1786(options) {
				this.data = options.data ? require('cgsUtil').cloneObject(options.data) : {html: '', files: []};
				this.update_model_callback = options.update_model_callback;
				this.isReadOnly = require('editMode').readOnlyMode;
				this._super(options);
				//catch the paste event to prevent pasting of rich text
                this.editableDiv.get(0).addEventListener('paste', this.handlePaste.bind(this));
			},

			render:function f1787() {
				this._super(template);

				this.editableDiv = this.$el.find('div.inputField');
				this.editableDiv.html(this.data && this.data.html ? this.data.html : "");
				this.fileOptionObj = FileUpload.params.image;

				// file uploads
				new FileUpload({
					activator:'#control_img',
					options: this.fileOptionObj,
					callback:_.bind(this.onImgFileUpload, this),
					context:this
				});

				new FileUpload({
					activator:'#button_upload_reference',
					callback: this.onReferenceFileUpload,
					context:this,
					options: {
						disableTranscode: true
					}
				});

				this.$el.find('.delete_reference').on('click', _.bind(function(event) {

					var path = $(event.target).closest('li').attr('file'),
					self = this;
					if (path) {
						self.data.files = _.reject(self.data.files, function (file) {
							return file.name == $(event.target).parent().parent().find('a').text() && file.path == path;
						});
						self.updateModel();
						self.render();
					}
				}, this));
			},

			/*handle paste to teacher guid, removed any format and paste plain text only*/
			handlePaste : function(e){
				var selection = getSelection.call(this),
					pastedHtml;

				if (selection){
					this.range = selection.getRangeAt(0);
				}

				try {
	                pastedHtml = e && e.clipboardData && e.clipboardData.getData('text/plain');
                } catch (e) {
                    return e.preventDefault();
                }
                
                if (pastedHtml && pastedHtml.length) {

                    if (selection.type === 'Range') {
                        this.range.extractContents();
                    }
                    pastedHtml = document.createTextNode(pastedHtml);
                    this.range.insertNode(pastedHtml, this.range.endOffset);

					this.updateHtml();
					e.preventDefault();
                }
			},

			updateHtml: function() {
				var selection = getSelection.call(this);
				if (selection)
					this.range = selection.getRangeAt(0);

				this.updateModel();
			},

			/**
			 * update the model with func that is set from the containing object
			 */
			updateModel:function f1788() {
				if (_.isFunction(this.update_model_callback)) {
					this.data.html = this.editableDiv.html()
					this.update_model_callback(require('cgsUtil').cloneObject(this.data));
				}
			},

			/**
			 * handle document command bold/italic
			 * @param e
			 */
			handleCommand:function f1789(e) {
				var command = e.currentTarget.value;

				if (!command) return;

				//get text selection
				var selection = getSelection.call(this);

				if (!selection) return;

				//if we doesn't select any text we don't do anything
				if (selection.type === "Caret") return;

				document.execCommand(command, false, null);

				this.updateModel();
			},

			/**
			 * handle image upload
			 * @param response - file path
			 */
			onImgFileUpload:function f1790(response) {
				if (!response) return;

				//get text selection
				var selection = getSelection.call(this);

				var range = selection ? selection.getRangeAt(0) : this.range;
				if (!range) {
					this.$el.find('.inputField').focus();

					selection = getSelection.call(this);
					range = selection ? selection.getRangeAt(0) : this.range;

					if (!range) {
						return;
					}
				}

				var imagePath = assets.serverPath(response);
				var imgElem = $('<img />', {'src':imagePath, 'relative_path' : response});


				range.setStart(range.startContainer, range.startOffset);
				range.setEnd(range.endContainer, range.endOffset);

				range.insertNode(imgElem[0], range.endOffset);

				this.updateModel();
			},

			/**
			 * open one page pdf upload
			 */
			openPdfUploadDialog: function() {
				var selection = getSelection.call(this);
				if (selection)
					this.range = selection.getRangeAt(0);

				var dialogConfig = {
					title:"Upload the PDF file",
					buttons:{
					},
					closeOutside: false
				};

				events.once('onPdfFileUpload', _.bind(this.onPdfFileUpload, this));

				dialogs.create('pdfuploadOnePage', dialogConfig, 'onPdfFileUpload');
			},

			/**
			 * get upload dialog response
			 * @param response {'filePath' : response, 'pageNum' : pageNum}
			 */
			onPdfFileUpload:function f1791(response) {
				if (!response) return;
				busy.start();

				var filePath = response['filePath'], pageNum = parseInt(response['pageNum']);

				//get text selection
				var selection = getSelection.call(this);

				var range = selection ? selection.getRangeAt(0) : this.range;
				if (!range) {
					this.$el.find('.inputField').focus();

					selection = document.getSelection();
					range = selection.getRangeAt(0);

					if (!range) return;
				}

				var pid = require("userModel").getPublisherId(),
					cid = require("courseModel").getCourseId(),
					fullPath = files.coursePath(pid, cid), self = this;

				fullPath += filePath;

				PDFJS.workerSrc = 'js/components/pdf/lib/pdf.worker.js';

				files.loadObject(fullPath, 'blob_hack', function f1792(blob) {
					pdf_js.getDocument(blob).then(function f1793(pdf) {
						// Using promise to fetch the page exit
						pdf.getPage(pageNum).then(function f1794(page) {
							var scale = 1.5;
							var viewport = page.getViewport(scale);

							var pageDisplayWidth = viewport.width;
							var pageDisplayHeight = viewport.height;

							// Prepare canvas using PDF page dimensions
							var canvas = document.createElement('canvas');
							var context = canvas.getContext('2d');
							canvas.width = pageDisplayWidth;
							canvas.height = pageDisplayHeight;

							// Render PDF page into canvas context
							var renderContext = {
								canvasContext:context,
								viewport:viewport
							};

							var renderObj = page.render(renderContext);

							//render blob into canvas
							renderObj.promise.then(function f1795() {
								canvas.toBlob(function f1796(blob) {
									//save image into filesystem
									assets.uploadBlobAndSaveItLocally(blob, function tg_upload_callback(fullImgPath) {
										self.onImgFileUpload(fullImgPath);
										busy.stop();
									});
								});
							});

						});
					});
				});

			},

			onReferenceFileUpload: function(response, originalName) {
				this.data = this.data || {html: '', files: []};
				this.data.files = this.data.files || [];
				var exists = _.find(this.data.files, function(file) {
					return file.path == response;
				});
				if (!exists) {
					this.data.files.push({
						name: originalName,
						path: response
					});
					this.updateModel();
					this.render();
				}
			}

		});

		return teachersGuideComponentView;
	});