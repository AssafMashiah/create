define(['jquery', 'events', 'modules/Dialogs/BaseDialogView', 'text!modules/Dialogs/types/propertyPreview/PropertyPreview.html'],
	function($, events, BaseDialogView, template) {

	var propertyPreviewDialogView = BaseDialogView.extend({

		tagName : 'div',
		className : 'css-dialog-property-preview',

		initialize: function(options) {

			this.config = options.config;

			this.customTemplate = template;
			
			this._super(options);
		},

		render: function( $parent ) {
			this._super($parent, this.customTemplate);

				this.$media = $('#propertyPreview .preview-media', this.$dialog);

				// If we're previewing image or video, fit the dialog to the media size.
				// If we're previewing audio or sound, fit the dialog to the html5 controls
				if ('image' in this.config.data) {
					this.$media.on('load', this.resetPosition.bind(this));
				}
				else if ('video' in this.config.data) {
					this.$media.on('loadedmetadata', this.resetPosition.bind(this));
				}
				else { // audio/soundBtn
					this.$dialog.addClass('fixed-size');
					this.resetPosition();
				}

				this.bindEvents();

		},

        bindEvents: function() {
			var self = this;
            $(window).resize(function() {
                self.resetPosition.call(self);
            });

            events.register("terminateDialog", this.terminateDialog, this)
		},

        terminateDialog: function() {
            this.dispose();
        },

        dispose: function() {
            // Stop media if it's sound/audio/video
            var mediaElement = this.$media[0];
            if ('pause' in mediaElement) {
                mediaElement.pause();
            }

            // remove jquery/dom events
            if ('image' in this.config.data) {
                this.$media.off('load');
            }
            else if ('video' in this.config.data) {
                this.$media.off('loadedmetadata');
            }

            // remove our code events
            events.unregister("terminateDialog");
        }

	}, {type: 'propertyPreviewDialogView'});

	return propertyPreviewDialogView;

});
