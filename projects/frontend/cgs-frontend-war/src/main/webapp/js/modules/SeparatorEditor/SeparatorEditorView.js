define(['jquery', 'files', 'FileUpload','IconAndFileUpload', 'courseModel', 'userModel', 'BasePropertiesView',
		'text!modules/SeparatorEditor/templates/SeparatorEditor.html'],
function($, files, FileUpload,IconAndFileUpload, courseModel, userModel, BasePropertiesView, template) {

	var SeparatorEditorView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},

		render: function() {
            this._super();
			
			// file uploads
			new FileUpload({
				activator: '#button_upload_image',
				callback: this.controller.onImageFileUpload,
				context: this.controller,
				recordId: this.controller.config.id,
				srcAttr: 'separatorImage',
				options : FileUpload.params.image,
				enableAssetManager: this.controller.enableAssetOrdering
			});
            new IconAndFileUpload({
				itemId: '#separatorTitleNarrationUpload',
				repoItemName: 'separatorTitleNarration',
				type: 'narration',
				callback: this.controller.onSeparatorTitleNarrationUpload,
                context: this.controller,
				recordId: this.controller.config.id,
				srcAttr: 'separatorTitleNarration',
				enableAssetManager: this.controller.enableAssetOrdering,
				enableDelete: true
			});

			new IconAndFileUpload({
				itemId: '#separatorSubTitleNarrationUpload',
				repoItemName: 'separatorSubTitleNarration',
				type: 'narration',
				callback: this.controller.onSeparatorSubTitleNarrationUpload,
                context: this.controller,
				recordId: this.controller.config.id,
				srcAttr: 'separatorSubTitleNarration',
				enableAssetManager: this.controller.enableAssetOrdering,
				enableDelete: true
			});
        }

	}, {type: 'SeparatorEditorView'});

	return SeparatorEditorView;

});
