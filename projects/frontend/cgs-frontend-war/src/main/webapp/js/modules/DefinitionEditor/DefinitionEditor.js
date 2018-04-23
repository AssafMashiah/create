define(['jquery', 'lodash','repo', 'BaseContentEditor', './config', './DefinitionStageView', './DefinitionSmallStageView'],
function($, _, repo,  BaseContentEditor, config, DefinitionStageView, DefinitionSmallStageView) {

	var DefinitionEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: DefinitionSmallStageView,
				normal: DefinitionStageView
			});

			this._super(config, configOverrides);

			var parentRec = repo.get(this.record.parent);
			this.definitionType = parentRec.data.definitionType;

			if (!this.config.previewMode) {
				this.startPropsEditing();
				this.startStageEditing();
			}
		},

		startStageEditing: function(){
			this.showStagePreview($('#stage_base'), {bindEvents:true});
		}

	},{	type: 'DefinitionEditor'});
	return DefinitionEditor;

});
