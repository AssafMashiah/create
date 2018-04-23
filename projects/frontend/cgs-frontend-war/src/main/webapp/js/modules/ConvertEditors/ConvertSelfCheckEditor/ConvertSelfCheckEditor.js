define(['BaseContentEditor', 'repo', 'events', './config', './ConvertSelfCheckView'], 
	function f486(BaseContentEditor, repo, events, config, ConvertSelfCheckView) {
	var ConvertSelfCheckEditor = BaseContentEditor.extend({
		initialize: function f487(options) {
			this._super(config, options);
			this.stage_view = new ConvertSelfCheckView({ controller: this });		
		}
	}, { type: 'ConvertSelfCheckEditor' });

	return ConvertSelfCheckEditor;
});