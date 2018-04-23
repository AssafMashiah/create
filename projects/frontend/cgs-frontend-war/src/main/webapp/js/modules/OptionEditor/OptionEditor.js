define(['jquery', 'lodash','repo', 'repo_controllers', 'events', 'BaseContentEditor', './config', './OptionEditorView', './OptionStageView', './OptionSmallStageView'],
function($, _, repo, repo_controllers, events, BaseContentEditor, config, OptionEditorView, OptionStageView, OptionSmallStageView) {

	var OptionEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: OptionSmallStageView,
				normal: OptionStageView
			});

			this._super(config, configOverrides);

			var parentRec = repo.get(this.record.parent);
			this.optionsType = parentRec.data.optionsType;
			this.isMmc = (parentRec.data.answerMode == 'mmc');
			//check if can be deleted according to parents data
			repo.startTransaction({ ignore: true });
			repo.updateProperty(this.config.id, 'disableDelete', !parentRec.data.canDeleteChildren, false, true);
			repo.endTransaction();

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
			this.view = new OptionEditorView(config);
		},

		createOptionData: function(childConfig){
			//creating TV/IV/SB according to optionType
			if(!childConfig) {
				childConfig = {"disableDelete":true};
			}

			this.createNewItem({"type":this.optionsType, "data": childConfig});
		},

		setCorrectOption:function f957() {
			var mcAnswer = repo_controllers.get(this.record.parent);

			if (mcAnswer && mcAnswer.updateCorrectOptionsArray) {
				mcAnswer.updateCorrectOptionsArray(this.elementId, this.record.data.correct);
			}

			require('validate').isEditorContentValid(this.record.id);
		}

	},{	type: 'OptionEditor'});
	return OptionEditor;

});
