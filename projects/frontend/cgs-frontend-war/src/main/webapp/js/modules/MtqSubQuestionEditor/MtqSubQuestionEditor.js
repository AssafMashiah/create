define(['jquery', 'lodash','repo', 'BaseContentEditor', './config', './MtqSubQuestionStageView', './MtqSubQuestionSmallStageView', './MtqSubQuestionEditorView'],
function($, _, repo,  BaseContentEditor, config, MtqSubQuestionStageView, MtqSubQuestionSmallStageView, MtqSubQuestionEditorView) {

	var MtqSubQuestionEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: MtqSubQuestionSmallStageView,
				normal: MtqSubQuestionStageView
			});

			this._super(config, configOverrides);

			if (!this.config.previewMode) {
				this.startPropsEditing();
				this.startStageEditing();
			}
		},

		startStageEditing: function(){
			this.showStagePreview($('#stage_base'), {bindEvents:true});
		},
		startPropsEditing: function(cfg){
			this._super(cfg);
			var config = _.extend({controller: this}, cfg ? cfg : null);
			this.view = new MtqSubQuestionEditorView(config);
		}

	},{	type: 'MtqSubQuestionEditor'});
	return MtqSubQuestionEditor;

});
