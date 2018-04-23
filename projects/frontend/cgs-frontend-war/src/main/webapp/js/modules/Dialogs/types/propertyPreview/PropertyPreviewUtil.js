define(['jquery', 'dialogs'],
    function($, dialogs) {

	var PropertyPreviewUtil = function() {};

    PropertyPreviewUtil.prototype = {

        initMediaPreview: function(mediaPreviewConfig) {
            this.$previewTarget = $(mediaPreviewConfig.previewTargetSelector);

            var propertyPreviewButtonClass = 'property-preview-trigger-button';
            this.propertyPreviewButtonSelector = '.{0}'.format(propertyPreviewButtonClass);

            var $propertyPreviewButton = $('<a/>', {
                'href': 'javascript:void(0)',
                'class': propertyPreviewButtonClass,
                'title': 'Preview'
            });

            // If preview target has already a trigger, remove it
            if (this.$previewTarget.parent().hasClass(propertyPreviewButtonClass)) {
                this.$previewTarget.unwrap();
                $(this.propertyPreviewButtonSelector).off('click');
            }

            // Add preview trigger to the target
            this.$previewTarget.wrap($propertyPreviewButton);
            $(this.propertyPreviewButtonSelector)
                .on("click", function() {
                    this.openPropertyPreviewDialog(mediaPreviewConfig);
                }.bind(this));
        },

        openPropertyPreviewDialog: function(mediaPreviewConfig){

            var dialogConfigData = {};
            dialogConfigData[mediaPreviewConfig.mediaType] = mediaPreviewConfig.src;

            var dialogConfig = {
                closeIcon: true,
                data: dialogConfigData,
                closeOutside: true
            };

            dialogs.create('propertyPreview', dialogConfig);
        },

        disposeMediaPreview: function(mediaPreviewConfig) {
            this.dispose(mediaPreviewConfig);
        },

        dispose: function(mediaPreviewConfig) {
            if (mediaPreviewConfig) {
                // remove jquery/dom event
                var mediaPreviewTarget = $(mediaPreviewConfig.previewTargetSelector);
                var $propertyPreviewButton = $(this.propertyPreviewButtonSelector).find(mediaPreviewConfig.previewTargetSelector);
                
                if ($propertyPreviewButton.length > 0) {
                    $propertyPreviewButton.parents(this.propertyPreviewButtonSelector).off('click');
                }
            }
        }

	};

	return new PropertyPreviewUtil();

});
