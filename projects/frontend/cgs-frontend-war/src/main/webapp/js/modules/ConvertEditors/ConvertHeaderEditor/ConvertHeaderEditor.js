define(['BaseContentEditor', 'repo', 'events', './config', './ConvertHeaderEditorView'], 
	function f424(BaseContentEditor, repo, events, config, ConvertHeaderEditorView) {
	var ConvertHeaderEditor = BaseContentEditor.extend({
		initialize: function f425(options) {
			this._super(config, options);
			this.stage_view = new ConvertHeaderEditorView({ controller: this });		
		}
	}, { type: 'ConvertHeaderEditor' });

	return ConvertHeaderEditor;
});