define(['BaseContentEditor', 'repo', 'events', './config', './ConvertQuestionOnlyView'], 
	function f481(BaseContentEditor, repo, events, config, ConvertQuestionOnlyView) {
	var ConvertQuestionOnlyEditor = BaseContentEditor.extend({
		initialize: function f482(options) {
			this._super(config, options);
			this.stage_view = new ConvertQuestionOnlyView({ controller: this });		
		}
	}, { type: 'ConvertQuestionOnlyEditor' });

	return ConvertQuestionOnlyEditor;
});