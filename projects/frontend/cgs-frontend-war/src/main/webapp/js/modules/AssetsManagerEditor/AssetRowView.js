define(['lodash', 'jquery', 'BaseView', 'events', 'repo', 'mustache', 'FileUpload',
		'text!modules/AssetsManagerEditor/templates/AssetTemplate.html', 'editMode'],
function(_, $, BaseView, events, repo, Mustache, FileUpload, template, editMode) {

	var AssetRowView = BaseView.extend({

		tagName: 'tr',
		parentEl: '#assets-table tbody',

		events:{
			'change select.state-list': 'changeAssetState'
		},

		initialize:function f49(options) {
			this._super(options);
		},

		render:function f50() {
			this._super(template);

			this.$el.attr('data', this.options.obj.recordId + '|' + this.options.obj.srcAttr);
			if (this.options.obj.filtered) {
				this.$el.addClass('hidden');
			}
			$(this.parentEl).append(this.el);

			this.fileUpload = new FileUpload({
				activator: this.$('.upload-btn'),
				options: {
					allowFiles: this.options.obj.allowFiles,
					fileMymType: this.options.obj.fileMymType
				},
				context: this,
				callback: function(path) {
					if (this.options.obj.fileMymType == 'cws') {
						require('cgsModel').setCreativeWrapper(this.options.obj.recordId, path, this.refresh.bind(this));
					}
					else {
						var record = repo.get(this.obj.recordId),
							self = this;
						// For image viewer we need also to save image width and height
						if (record.type == 'imageViewer' && this.obj.srcAttr == 'image') {
							var img = new Image();
							img.onload = function(e) {
								repo.startTransaction({ appendToPrevious: true });
								repo.updateProperty(record.id, 'imgWidth', e.target.naturalWidth);
								repo.updateProperty(record.id, 'imgHeight', e.target.naturalHeight);
								self.refresh();
							}
							img.src = require('assets').serverPath(path);
						}
						// For inline image we need also to save image width and height
						else if (record.type == 'inlineImage' && this.obj.srcAttr == 'component_src') {
							var img = new Image();
							img.onload = function(e) {
								repo.startTransaction({ appendToPrevious: true });
								repo.updateProperty(record.id, 'naturalWidth', e.target.naturalWidth);
								repo.updateProperty(record.id, 'naturalHeight', e.target.naturalHeight);
								self.refresh();
							}
							img.src = require('assets').serverPath(path);
						}
						else {
							this.refresh();
						}
					}
				},
				recordId: this.options.obj.recordId,
				srcAttr: this.options.obj.srcAttr,
				enableAssetManager: false
			});
		},

		// Change asset state from assets manager table
		changeAssetState: function(event) {
			var data = $(event.target).closest('tr').attr('data').split('|'),
				newVal = $(event.target).val() == 'done';
				
			if (data.length > 1) {
				var item = repo.get(data[0]);
				if (item) {
					var assets = require('cgsUtil').cloneObject(item.data.assetManager);
					var aData = _.find(assets, function(ad) {
						return ad.srcAttr == data[1];
					});
					if (aData && aData.state !== newVal) {
						repo.startTransaction();
						aData.state = newVal;
						repo.updateProperty(item.id, 'assetManager', assets);
						if (!newVal) {
							this.fileUpload.setPlaceholder.call(this.fileUpload, function(path) {
								if (this.options.obj.fileMymType != 'cws') {
									this.refresh();
								}
								else {
									require('cgsModel').setCreativeWrapper(this.options.obj.recordId, path, this.refresh.bind(this));
								}
							}.bind(this));
						}
						else {
							this.refresh();
						}
					}
				}
			}
		},

		refresh: function() {
			repo.endTransaction();
			this.controller.refresh();
		}

	}, {type: 'AssetRowView'});

	return AssetRowView;

});