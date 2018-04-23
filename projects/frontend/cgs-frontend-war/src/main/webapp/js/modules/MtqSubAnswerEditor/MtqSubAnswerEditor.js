define(['jquery', 'lodash','repo', 'BaseContentEditor', './config', './MtqSubAnswerStageView', './MtqSubAnswerSmallStageView', './MtqSubAnswerEditorView'],
function($, _, repo,  BaseContentEditor, config, MtqSubAnswerStageView, MtqSubAnswerSmallStageView, MtqSubAnswerEditorView) {

	var MtqSubAnswerEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: MtqSubAnswerSmallStageView,
				normal: MtqSubAnswerStageView
			});

			this._super(config, configOverrides);
		},

		startStageEditing: function(){
			this.showStagePreview($('#stage_base'), {bindEvents:true});
		},
		startPropsEditing: function(cfg){
			this._super(cfg);
            var config = _.extend({controller: this}, cfg ? cfg : null);
            this.view = new MtqSubAnswerEditorView(config);
        }

	},{	type: 'MtqSubAnswerEditor'});
	return MtqSubAnswerEditor;

});
