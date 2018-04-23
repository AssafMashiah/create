define(['modules/LivePageElementEditor/LivePageElementEditor', 'repo', 'repo_controllers', 'assets', './config',
	'./LivePageImageViewerPropsView', 'validate'],
function(LivePageElementEditor, repo, repo_controllers, assets, config,
	LivePageImageViewerPropsView, validate) {

	var LivePageImageViewerEditor = LivePageElementEditor.extend({

		initialize: function(configOverrides) {
		
			this._super(configOverrides);

			repo.startTransaction({ ignore: true });
			if (!this.record.data.minimumReadable) {
				repo.updateProperty(this.record.id, 'minimumReadable', '50', false, true);
			}

			if (this.record.data.mode && this.record.data.mode === "thin") {
				repo.updateProperty(this.record.id, 'isThinMode', true, false, true);
			}
			repo.endTransaction();
		},

		registerEvents: function() {
			var changes = {
				image: this.propagateChanges(this.record, 'image', true),
				copyrights: this.propagateChanges(this.record, 'copyrights', true),
				caption: this.propagateChanges(this.record, 'caption', true),
				showCopyrights: this.propagateChanges(this.record, 'showCopyrights', true),
				showCaption: this.propagateChanges(this.record, 'showCaption', true),
				showSound: this.propagateChanges(this.record, 'showSound', true),
				minimumReadable: this.propagateChanges(this.record, 'minimumReadable', true)
			};

			_.extend(changes, this.getGlobalEvents());

			this.model = this.screen.components.props.startEditing(this.record, changes);

			this.model.on('change:image', this.stage_view.render, this.stage_view);
			this.model.on('change:copyrights', this.stage_view.render, this.stage_view);
			this.model.on('change:caption', this.stage_view.render, this.stage_view);
			
			this.model.on('change:showCopyrights', function(){
				this.startPropsEditing();
				this.view.setFocus('showCopyrights');
				this.stage_view.render(this.stage_view);
			}, this);

			this.model.on('change:showCaption', function(){
				this.startPropsEditing();
				this.view.setFocus('showCaption');
				this.stage_view.render(this.stage_view);
			}, this);

			this.model.on('change:showSound', function(){
				this.startPropsEditing();
				this.view.setFocus('showSound');
				this.stage_view.render(this.stage_view);
			}, this);

			this.attachGlobalEvents();
		},
		
		startPropsEditing: function(){
			this._super(null, LivePageImageViewerPropsView);
			this.registerEvents();
		},

		onImageFileUpload:function (response) {
			if (response) {
				validate.validatePreviewRecursion(this.record.id);
				var img = $('<img src="' + require('assets').serverPath(response) + '" />').load(function(event) {
					repo.updateProperty(this.record.id, 'imgWidth', event.target.naturalWidth, false, true);
					repo.updateProperty(this.record.id, 'imgHeight', event.target.naturalHeight, false, true);
					this.startPropsEditing();
				}.bind(this));
			}
		}

	}, {
		
		type: 'LivePageImageViewerEditor',

		icons: {
			'icon1': 'media/icons/image_01.png',
			'icon2': 'media/icons/image_02.png'
		},
		
		valid:function (elem_repo) {

			var valid_obj = this.__super__.constructor.valid(elem_repo);

			if (!elem_repo.data.image || elem_repo.data.showSound && !elem_repo.data.sound) {
				validate.uploadInvalidImg(elem_repo.id, 'media/not_valid_image.jpg', {width:126, height:126})
				if (valid_obj.valid) {
					valid_obj = { 
						valid  : false, 
						report : [validate.setReportRecord(elem_repo,'Image viewer without a source is not valid')]
					};
				}
				else {
					valid_obj.report.push(validate.setReportRecord(elem_repo,'Image viewer without a source is not valid'));
				}
			}
			
			return valid_obj;
		}
	});

	return LivePageImageViewerEditor;

});
