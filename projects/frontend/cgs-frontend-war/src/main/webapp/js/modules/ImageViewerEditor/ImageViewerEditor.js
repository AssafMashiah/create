define(['BaseContentEditor', 'repo', 'events', 'repo_controllers', 'assets', './config', './ImageViewerPropsView', 'validate',
		'./ImageViewerStageView','./ImageViewerSmallStageView', 'files'],
function(BaseContentEditor, repo, events, repo_controllers, assets, config,
	ImageViewerPropsView, validate, ImageViewerStageView, ImageViewerSmallStageView, files) {

	var ImageViewerEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {
			this.setStageViews({
				small: ImageViewerSmallStageView,
				normal: ImageViewerStageView
			});
		
			this._super(config, configOverrides);

			repo.startTransaction({ ignore: true });
			if (!this.record.data.minimumReadable) {
				repo.updateProperty(this.record.id, 'minimumReadable', '70', false, true);
			}

			if (this.record.data.mode && this.record.data.mode === "thin") {
				repo.updateProperty(this.record.id, 'isThinMode', true, false, true);
			}
			repo.endTransaction();
		},

		registerEvents: function(propsContainer) {
			var changes = {
				image: this.propagateChanges(this.record, 'image', true),
				copyrights: this.propagateChanges(this.record, 'copyrights', true),
				caption: this.propagateChanges(this.record, 'caption', true),
				showCopyrights: this.propagateChanges(this.record, 'showCopyrights', true),
				showCaption: this.propagateChanges(this.record, 'showCaption', true),
				showSound: this.propagateChanges(this.record, 'showSound', true),
				minimumReadable: this.propagateChanges(this.record, 'minimumReadable', true)
			};

			var model = this.screen.components.props.startEditing(this.record, changes, propsContainer ? $(propsContainer) : null);

			model.on('change:image', this.handleImageChange, this);
			model.on('change:copyrights', this.stage_view.render, this.stage_view);
			model.on('change:caption', this.stage_view.render, this.stage_view);
			
			model.on('change:showCopyrights', function(){
				this.view.setFocus('showCopyrights');
				this.stage_view.render();
				this.startPropsEditing();
			}, this);

			model.on('change:showCaption', function(){
				this.view.setFocus('showCaption');
				this.stage_view.render();
				this.startPropsEditing();
			}, this);

			model.on('change:showSound', function(){
				this.view.setFocus('showSound');
				this.stage_view.render();
				this.startPropsEditing();
			}, this);
		},
		
		startPropsEditing: function(){
			this._super();
			this.view = new ImageViewerPropsView({controller: this});

			// If addParentProps is true, render parent's props into current props view
			// It's required for table cell props rendering
			var record = this.record;
			if (record && record.data && record.data.addParentProps) {
				this.view.$el.find('#properties').wrapInner('<div id="original-props" />');
				this.view.$el.find('#properties').prepend('<div id="parent_properties" />');

				var parentController = repo_controllers.get(record.parent);
				if (parentController) {
					parentController.startPropsEditing({
						'clearOnRender': false,
						'hideHeader': true,
						'contentSelector': '.tab-content #properties',
						'appendToSelector': '.tab-content #parent_properties'
					});
				}
				this.registerEvents('.tab-content #original-props');
			}
			else {
				this.registerEvents('.tab-content #properties');
			}
		},
        updateMinimumReadable: function( id , value ){

            repo.updateProperty( id , "minimumReadable" , value );

        },

        handleImageChange: function(){
            this.stage_view.render();
            this.view.setAdvancedButtonState();
		},

		onImageFileUpload :function (response) {

			if (response) {
				validate.validatePreviewRecursion(this.record.id);

				this.stage_view.render();

				//if this is placeholder image measure the place holder
				if(!this.isShowImagePreview()) {
					var imgElm = this.stage_view.$el.find('.previewImage');
					if(imgElm) {
						repo.startTransaction({ appendToPrevious: true });
						repo.updateProperty(this.record.id, 'imgWidth', imgElm.innerWidth(), false, true);
						repo.updateProperty(this.record.id, 'imgHeight', imgElm.innerHeight(), false, true);
						repo.endTransaction();
						this.startPropsEditing();
					}
				} else {
					this.stage_view.$el.find('.previewImage').load(function f783(event) {
						repo.startTransaction({ appendToPrevious: true });
						repo.updateProperty(this.record.id, 'imgWidth', event.target.naturalWidth, false, true);
						repo.updateProperty(this.record.id, 'imgHeight', event.target.naturalHeight, false, true);
						repo.endTransaction();
						this.startPropsEditing();
					}.bind(this));
				}
				
				events.fire('repo_changed');
			}
		},

		isShowImagePreview: function () {
			return this.record.data.image;
		}

	}, {
		
		type: 'ImageViewerEditor',
		
		valid:function f784(elem_repo) {
			
			if (!!elem_repo.data.image &&
				(!elem_repo.data.showSound || !!elem_repo.data.sound)) {
				return  { valid:true, report:[] };
			} else {
				validate.uploadInvalidImg(elem_repo.id, 'media/not_valid_image.jpg', {width:126, height:126})
				return  { 
					valid  : false, 
					report : [validate.setReportRecord(elem_repo,'Image viewer without a source is not valid')]
				};
			}
		}
	});

	return ImageViewerEditor;

});
