define(['BaseContentEditor', 'repo', 'events', './config', './ConvertPedagogicalStatementView'], 
	function f476(BaseContentEditor, repo, events, config, ConvertPedagogicalStatementView) {
	var ConvertPedagogicalStatementEditor = BaseContentEditor.extend({
		initialize: function f477(options) {
			this._super(config, options);
			this.stage_view = new ConvertPedagogicalStatementView({ controller: this });		
		}
	}, { type: 'ConvertPedagogicalStatementEditor' });

	return ConvertPedagogicalStatementEditor;
});