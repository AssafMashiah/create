define(['jquery', 'modules/TextViewerEditor/TextViewerStageView', 'rivets', 'events','repo', 'repo_controllers', 'dialogs', 'assets',
	    'keyboard', 'text!modules/TextViewerEditor/templates/TextViewerStagePreview.html'],
function($, TextViewerStageView, rivets, events, repo, repo_controllers, dialogs, assets, keyboard, previewTemplate) {

	var AnswerFieldTypeTextStageView = TextViewerStageView.extend({

		initialize: function(options) {
			this.template = previewTemplate;
			this._super(options);

			this.NoncheckableDblClick = this.handleDblClick.bind(this);

			events.register('text_viewer_dimensions_updated', this.dimensionsUpdated, this);
		},

		render: function(val) {
			this._super(val);
			if (this.controller.record.data.isNoncheckable) {
				setTimeout(this.setNoncheckableWidth.bind(this), 400);
				this.$el.dblclick(this.NoncheckableDblClick);
			}
			// add class to answer field, to look different than regular field
			if(!this.controller.record.data.isNoncheckable){
				this.$el.addClass('AnswerField');
			}
		},

		handleDblClick: function() {
			var parentEditor = repo_controllers.get(this.controller.record.parent);
			if (parentEditor) {
				parentEditor.stage_view.trigger('dblclick');
			}
		},

        dimensionsUpdated: function(id) {
        	if (this.controller.record.id == id && this.iframe) {
        		this.setNoncheckableWidth();
        	}
        },

        setNoncheckableWidth: function() {
        	var setDim = function(width, height) {
        		try {
        			var iframeMaxWidth = parseInt(this.iframe.css('max-width'));
    				width = Math.min(width * 10, iframeMaxWidth);
        		}
        		catch (e) {
        			width *= 10;
        		}
        		height = (height || 1) * 28;
        		this.$el.width(width);
        		this.$el.height(height);
        		if (this.iframe && this.body) {
        			this.iframe
        				.width(width)
						.height(height);

					this.body
						.width('auto')
						.parent().addBack().height('100%');
				}
        	}.bind(this);

        	if (this.controller.record.data.isNoncheckable) {
        		switch (this.controller.record.data.answer_size) {
					case 'Word':
					case 'Line':
						setDim(this.controller.record.data.MaxChars);
						break;
					case 'Paragraph':
						setDim(45, 4);
						break;
					case 'Custom':
						var ceil = Math.ceil(this.controller.record.data.MaxChars / 45),
							width = this.controller.record.data.MaxChars;

						width = width > 45 ? 45 : (width < 5 ? 5 : width);
						setDim(width, ceil);
						break;
				}
        	}
        },

		dispose: function() {
			events.unbind('text_viewer_dimentions_updated', this.dimensionsUpdated);
			this.$el.unbind('dblclick', this.NoncheckableDblClick);
			this._super();
		}

	}, {type: 'AnswerFieldTypeTextStageView'});

	return AnswerFieldTypeTextStageView;

});