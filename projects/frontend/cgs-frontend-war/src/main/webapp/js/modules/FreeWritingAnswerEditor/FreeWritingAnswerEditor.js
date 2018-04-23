define(['BaseContentEditor', 'repo', 'events', 'dialogs', './config', './constants',
		'../SubQuestionEditor/TaskTemplate',
	'./FreeWritingAnswerEditorView', './FreeWritingAnswerStageView', './FreeWritingAnswerSmallStageView', './FreeWritingAnswerPropsView'],
function(BaseContentEditor, repo, events, dialogs, config, Constants, subquestionTemplate, FreeWritingAnswerEditorView, FreeWritingAnswerStageView, 
		FreeWritingAnswerSmallStageView, FreeWritingAnswerPropsView) {

	var FreeWritingAnswerEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {
			this.setStageViews({
				small: FreeWritingAnswerSmallStageView,
				normal: FreeWritingAnswerStageView
			});

			this._super(config, configOverrides);
		}

	}, {type: 'FreeWritingAnswerEditor', stageReadOnlyMode: true});

	return FreeWritingAnswerEditor;

});