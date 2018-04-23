define(['BaseContentEditor', 'repo', 'events', 'validate', './config', './TocEditorView', './TocStageView', 'modules/LessonsTableComponent/LessonsTableComponent', 'assets', 'dialogs'],
function(BaseContentEditor, repo, events, validate, config, TocEditorView, TocStageView, LessonsTableComponent, assets, dialogs) {

	var TocEditor = BaseContentEditor.extend({

		tocIndex: '',

		initialize: function(configOverrides) {

			this._super(config, configOverrides);
			this.view = new TocEditorView({controller: this});
            this.stage_view = new TocStageView({controller: this});

			this.lessonsTable = new LessonsTableComponent(this.config);

			this.registerEvents();
		},

		startPropsEditing: function() {
            // prevent super start editing
        },

		dispose: function() {
            this.unbindEvents('dispose');
			this.lessonsTable && this.lessonsTable.dispose();
			
			this._super();

			delete this.lessonsTable;
		},

		registerEvents: function() {

			this.bindEvents({
				'TreeComponentReady':{'type':'register', 'func':this.onReadyTreeComponentView}
			});
			
			var record = repo.get(this.config.id),
				changes = {
					title: this.propagateChanges(record, 'title', validate.requiredField, true),
					hideTitle: this.propagateChanges(record, 'hideTitle', true),
					hideOverview: this.propagateChanges(record, 'hideOverview', true),
					overview: this.propagateChanges(record, 'overview', true),
					keywords: this.propagateChanges(record, 'keywords', true)
				};

			this.model = this.screen.components.props.startEditing(record, changes);

			this.model.on('change:title', function(child, val) {
				this.stage_view.$el.find('.lessonTableTitle h3').html(val);
			}, this);


			this.model.on('change:keywords', function(child, val) {
				repo.startTransaction({ appendToPrevious: true });
				this.createArrayAndSaveToRepo(val, 'keywords')
				repo.endTransaction();
			}, this);
		},

		unbindEvents: function(unbindMethod){
			this.lessonsTable && this.lessonsTable.unbindEvents(unbindMethod);
			this._super(unbindMethod);
		},

		onReadyTreeComponentView: function(id){
			var span = $('[href="#load/' + id + '"]').find('.node-index');
			if (span.length) {				
				$("#tocIndex").html(span.html());
			}
		},
		
		openImageCropperDialogue : function(){

                var self = this;
                this.currentImageId = this.controller.record.id;
                var repoId = this.controller.record.id;
                //No image was chosen. Can't open dialog
                if( !this.currentImageId ){
                    return;
                }

                var dialogConfig = {
                    buttons: {
                        ok:     { label: 'OK' },
                        cancel:  { label: 'Cancel' }
                    },
                    content: {},
                    data: {
                        img: this.controller.record.data.image,
                        beforeTerminationCallback: function (blob) {
                            assets.uploadBlobAndSaveItLocally(blob, function (filePathInsideMediaFolder) {
                                self.controller.onImageFileUpload(filePathInsideMediaFolder);
                            });
                        }
                    }
                };
                this.previewDialog = dialogs.create('imageCropper', dialogConfig);
            },

            onImageFileUpload: function f519(image) {
                if (!image) return;

                var imageUrl = assets.serverPath(image);
                this.view.updateImgSrc(imageUrl);
                this.view.enableImageCropperButton(true);
	            repo.updateProperty(this.config.id, "image", image);
                repo.updateProperty(this.config.id, "imageResourceRef", image);
                repo.updateProperty(this.config.id, "imageUrl", imageUrl);
            },

	}, {type: 'TocEditor'});

	return TocEditor;

});
