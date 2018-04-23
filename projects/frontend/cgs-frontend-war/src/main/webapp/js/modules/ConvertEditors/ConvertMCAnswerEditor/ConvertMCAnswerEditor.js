define(['BaseContentEditor', 'repo', 'repo_controllers', 'events', './config', './ConvertMCAnswerEditorView'], 
	function f429(BaseContentEditor, repo, repo_controllers, events, config, ConvertMCAnswerEditorView) {
	var ConvertMCAnswerEditor = BaseContentEditor.extend({
		initialize: function f430(options) {
			this._super(config, options);
			this.startEditing();

			this.stage_view = new ConvertMCAnswerEditorView({ controller: this });	
			this.stage_view.render();
		},

		update: function f431(data) {
			repo.updateProperty(this.record.parent, 'checked', data, false, true);
			return true;
		},

		getChecked: function f432() {
			var pController = repo_controllers.get(this.record.parent);
			//return the last checked answers
			return (pController.record.data && pController.record.data.checked) ? 
					pController.record.data.checked : false;
		}


	}, { type: 'ConvertMCAnswerEditor' });

	return ConvertMCAnswerEditor;
});