define(["jquery", "lodash", "files", "mustache"], function($, _, files, Mustache) {

	// internals
	var _order_button = "{{#enableAssetManager}}<button class='btn btn-small btn-position' {{^isNotOrdered}}canBeDisabled='false' disabled{{/isNotOrdered}}>Order</button>{{/enableAssetManager}}",
		_input_html = "<input type='file' class='hide-file-upload' />\
			{{#enableAssetManager}}<div class='order-data' {{#isNotOrdered}}hidden{{/isNotOrdered}}>\
			<span>Asset ID:</span><input type='text' class='asset-id' {{#assetId}}value='{{assetId}}'{{/assetId}} /><br>\
			<span>Status:</span><select class='asset-state' value='{{#isDone}}1{{/isDone}}{{^isDone}}0{{/isDone}}'><option value='1' {{#isDone}}selected{{/isDone}}>Done</option><option value='0' {{^isDone}}selected{{/isDone}}>Not Done</option></select>\
			</div>{{/enableAssetManager}}",
		placeholders = {
			image: 'media/placeholder.png',
			audio: 'media/placeholder.mp3',
			video: 'media/placeholder.mp4',
			cws: 'media/placeholder.cws',
		};

	// initialize

	/*
	** @param activator - the upload button selector [mandatory]
	** @param options - additional options (file allowed types, ignore size limits, etc...) [optional]
	** @param callback - callback function for file upload [optional]
	** @param context - callback context [optional]
	** @param recordId - repo record Id [optional]
	** @param srcAttr - data src attribute into repo record for uploaded file url [optional]
	** @param enableAssetManager - true/false for showing order asset data [optional]
	** @param errorCallback - if exists, don't show popup with error, call the callback
	*/
	function FileUpload(config) {

		this.config = config;
		this.init();
		this.bind();
	}

	FileUpload.params = {
			'image': {
				fileMymType: "image",
				allowFiles: ["image/png", "image/svg+xml"]
			},
			'audio': {
				fileMymType: 'audio',
				allowFiles: ['audio/mp3']
			},
			'video': {
				fileMymType: 'video',
				allowFiles: ['video/mp4']
			},
			'all': {
				fileMymType:"attachment",
				allowFiles:["*"]
			},
			'cws': {
				fileMymType:"cws",
				allowFiles:["cws"]
			}
	}

	FileUpload.prototype = {

		init: function() {
			this.config.options = this.config.options || {};

			if(this.config.options.allowFiles && !this.config.options.fileMymType || !this.config.options.allowFiles &&  this.config.options.fileMymType) {
				throw new Error("Both alowFiles array and fileMymType should be in options");
	        }

	        this.activator = $(this.config.activator);

			// if (this.config.activator is an array - throw)
			if (this.activator.length > 1)
				throw new Error('File upload activator should be a single element');

			// Check if asset is done - checkbox should be checked
			var record = require('repo').get(this.config.recordId);
			if (record) {
				// Get record's assets manager data
				var assetItem = _.find(record.data.assetManager, function(item) { return item.srcAttr == this.config.srcAttr; }, this);
				this.config.isDone = assetItem && assetItem.state;
				this.config.isNotOrdered = !assetItem || (assetItem.state === null);
				this.config.assetId = assetItem ? assetItem.assetId : null;
				// if asset was ordered and it's done the activator button should be disabled
				if (!this.config.isNotOrdered && this.config.isDone) {
					this.activator.attr({
						canBeDisabled: 'false',
						disabled: true
					});
				}
			}

			var orderDOM = $(Mustache.render(_input_html, this.config)).insertAfter(this.activator);
			this.file_input = orderDOM.filter('[type=file]'); // input[type=file]
			this.order_data = orderDOM.filter('.order-data');
			// render order button and adjust it's margins according to activator
			this.order_button = $(Mustache.render(_order_button, this.config)).insertBefore(this.activator);
			this.order_button.css('margin', this.activator.css('margin'));
			this.order_button.css('margin-right', '5px');
		},

		bind: function() {
			var pid = require("userModel").getPublisherId(),
				cid = require("courseModel").getCourseId(),
				self = this;

			if (pid === null || cid === null) {
				throw new Error("Cannot upload files without publisher id or course id.");
			}
			
			// Order button click
			this.order_button.on('click', function() {
				self.setState(false);
				self.setOrderData('', false);

				// Put placeholder media for ordered asset if srcAttr is still empty
				var ph = placeholders[self.config.options.fileMymType],
					filename = ph.substr(ph.lastIndexOf('/') + 1),
					record = require('repo').get(self.config.recordId);

				if (record && !record.data[self.config.srcAttr] && ph) {
					files.downloadFile(ph, pid, cid, filename, 'media', function() {
						require('repo').updateProperty(self.config.recordId, self.config.srcAttr, '/' + ph);

						if (self.config.callback instanceof Function) {
							self.config.callback.call(self.config.context || window, '/' + ph);
						}
					});
				}
			});

			// Change asset id
			this.order_data.find('.asset-id').on('change', function() {
				self.setAssetId($(this).val());
			});

			// Change asset state
			this.order_data.find('.asset-state').on('change', function() {
				self.setState(!!parseInt($(this).val()));
			});

			// File upload activator click
			this.activator.on("click", function(event) {
				self.file_input.trigger(event);
			});

			this.file_input.on("change", function(event) {

	            var allFilesAreAllowed = 0;
	            if(event.target.files && self.config.options.allowFiles && self.config.options.fileMymType){ //&& self.config.options.allowFiles.indexOf('*') == -1
	                for(var i=0; i<event.target.files.length;i++){

	                    if(event.target.files[i].type.indexOf(self.config.options.fileMymType) != -1){

	                        if(self.config.options.allowFiles.indexOf(event.target.files[i].type) < 0){
	                            allFilesAreAllowed = 2
	                        }

	                    } else {

	                    	// check mymType vs. name, for unrecognisable cgs types (as 'cws') 
	                    	if (event.target.files[i].name.indexOf(self.config.options.fileMymType) == -1)
	                        	allFilesAreAllowed = 1;

	                    }

	                }
	                if(allFilesAreAllowed == 1 ){
	                	self.throwError('C002');
	                	$(this).val('');
	                	return ;
	                }
	                if(allFilesAreAllowed == 2){
	                	self.throwError('C001');
	                	$(this).val('');
	                    return ;
	                }
	            }
				files.prepareDirs(pid, cid, function() {
					var originalName = event.target.files.length > 0 ? event.target.files[0].name : '';
					if (self.config.options.rename && _.isFunction(self.config.options.rename)) {
						var newName;

						_.each(event.target.files, function (item) {
							newName = self.config.options.rename(item.name);
						});
					}
					files.saveAsset({
						event_files: event.target.files,
						publisherId: pid,
						courseId: cid,
						callback: function(file) {
							self.fileUploaded(files.removeCoursePath(pid, cid, file.fullPath), originalName);
						},
						is_ref: self.config.options.is_ref,
						newName: newName,
						ignoreSizeLimit: self.config.options.ignoreSizeLimit,
						errorCallback: self.throwError.bind(self)
					});
				});

			});
		},

		setOrderData: function(assetId, state) {
			if (state === null) {
				this.order_button.attr('disabled', false);
				this.order_data.hide();
			}
			else {
				this.order_button.attr('disabled', true);
				this.order_data.show();
				this.order_data.find('.asset-id').text(assetId);
				this.order_data.find('.asset-state').val(state ? 1 : 0);
			}
		},

		setState: function(state) {
			this.setAssetData({state: state});
			
			// If asset is done the activator should be disabled
			this.activator.attr('disabled', state);
			this.order_data.find('.asset-state').val(state ? 1 : 0);
		},

		setAssetId: function(assetId) {
			this.setAssetData({assetId: assetId});
		},

		setAssetData: function(data) {
			data = data || {};
			var record = require('repo').get(this.config.recordId);
				needFireChangeEvent = false;
			if (record) {
				var assetItem = _.find(record.data.assetManager, function(item) { return item.srcAttr == this.config.srcAttr; }, this);
				if (assetItem) { // The asset manager data already exists for this asset
					if (typeof data.assetId != 'undefined' && assetItem.assetId !== data.assetId) {
						assetItem.assetId = data.assetId;
						needFireChangeEvent = true;
					}
					if (typeof data.state != 'undefined' && assetItem.state !== data.state) {
						assetItem.state = data.state;
						needFireChangeEvent = true;
					}
				}
				else { // There is no asset manager data, create it with default values
					record.data.assetManager = record.data.assetManager || [];
					record.data.assetManager.push({
						srcAttr: this.config.srcAttr,
						assetId: data.assetId ? data.assetId : null,
						state: !!data.state,
						allowFiles: this.config.options.allowFiles,
						fileMymType: this.config.options.fileMymType
					});
					needFireChangeEvent = true;
				}
			}

			if (needFireChangeEvent)
				this.fireChangeEvent();
		},

		// After file upload
		fileUploaded: function(response, originalName) {
			if (this.config.recordId && this.config.srcAttr) {
				// Set record property with uploaded file path
				require('repo').updateProperty(this.config.recordId, this.config.srcAttr, response);
				// Set asset as done
				this.setState(true);
			}
			
			if (this.config.callback instanceof Function) {
				this.config.callback.call(this.config.context || window, response, originalName);
			}
		},

		// Upload error occurred
		throwError: function(errCode) {
			var showMessage = require('showMessage')
			// If errorCallback exists - don't show popup, call the callback with error message
			if (typeof this.config.errorCallback == 'function') {
				var err = showMessage.getErrorById(errCode);
				if (err)
        			this.config.errorCallback(err.description + ' - ' + err.message);
        		else
        			this.config.errorCallback('Unexpected error!');
        	}
        	// If errorCallback doesn't exists - show error popup
        	else {
        		showMessage.clientError.show({errorId: errCode});
        	}
		},

		fireChangeEvent: function() {
			require('events').fire('repo_changed', this.config.recordId);
		}

	}

	return FileUpload;
});