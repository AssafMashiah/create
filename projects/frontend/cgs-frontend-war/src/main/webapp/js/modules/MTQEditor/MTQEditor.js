define(['modules/BaseTaskEditor/BaseTaskEditor','./config', './MTQStageView', './MTQSmallStageView',
	'./MatchingTemplate', './SortingTemplate', './SequencingTemplate'],
function(BaseTaskEditor, config, MTQStageView, MTQSmallStageView ,MatchingTemplate ,SortingTemplate, SequencingTemplate) {

	var MTQEditor = BaseTaskEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: MTQSmallStageView,
				normal: MTQStageView
			});

			this._super(config, configOverrides);

			if (!this.config.previewMode) {
				this.startStageEditing();
				this.startPropsEditing();
			}
		},

		startStageEditing: function(){
			this.showStagePreview($('#stage_base'), {bindEvents:true});
		}

	},{	type: 'MTQEditor',
	//three templates to the different mtq editors
		templates: { matching: MatchingTemplate.template, sorting: SortingTemplate.template, sequencing: SequencingTemplate.template},
		showTaskSettingsButton: true,
		displayTaskDropdown: true
	});

	return MTQEditor;

});
