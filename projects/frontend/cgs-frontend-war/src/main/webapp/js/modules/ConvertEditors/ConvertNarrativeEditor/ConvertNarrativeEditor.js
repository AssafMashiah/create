define(['BaseContentEditor', 'repo', 'events', './config', './ConvertNarrativeEditorView'], 
	function f471(BaseContentEditor, repo, events, config, ConvertNarrativeEditorView) {
	var ConvertNarrativeEditor = BaseContentEditor.extend({
		initialize: function f472(options) {
			this._super(config, options);
			this.stage_view = new ConvertNarrativeEditorView({ controller: this });		
		}
	}, { type: 'ConvertNarrativeEditor' });

	return ConvertNarrativeEditor;
});