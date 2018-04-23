define(['jquery',  'translate', 'mustache', 'BaseAnswerNormalStageContentView', 'text!modules/ShortAnswerAnswerEditor/templates/ShortAnswerAnswerStage.html'],
function($, i18n,  Mustache, BaseAnswerNormalStageContentView, template) {

	var ShortAnswerAnswerStageView = BaseAnswerNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		},

		// override for disable add button in read only mode
		showStagePreview: function($parent, previewConfig) {
			this._super($parent, previewConfig);

			if (this.canBeEditable()) {
				this.$('.add-question-button').click(_.bind(function f1084(event) {
					event.preventDefault();
					event.stopPropagation();
					if(this.controller.screen.activeContentEditor &&
						this.controller.screen.activeContentEditor.endEditing){
							this.controller.screen.activeContentEditor.endEditing();
					}
					
					require('repo').startTransaction();
					this.controller.createSubQuestionEditor();
					require('repo').endTransaction();
					this.controller.renderChildren();
					this.controller.elemStartEditing(this.controller.addedChild);
				},this));
			}
			else
				this.$('.add-question-button').hide();
		}

	}, {type: 'ShortAnswerAnswerStageView'});

	return ShortAnswerAnswerStageView;

});
