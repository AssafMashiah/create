define(['BaseContentEditor', 'repo', 'events', './config',
	'./InstructionEditorView', './InstructionStageView', './InstructionSmallStageView'],
function(BaseContentEditor, repo, events, config, InstructionEditorView,
 InstructionStageView, InstructionSmallStageView) {

	var InstructionEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {
		
		//initialization of setStageViews must happen before super.
			this.setStageViews({
				small: InstructionSmallStageView,
				normal: InstructionStageView
			});

			this._super(config, configOverrides);
		},

		startPropsEditing: function(cfg) {
			this._super(cfg);
			var config = _.extend({controller: this}, cfg ? cfg : null);
			this.view = new InstructionEditorView(config);
			this.registerEvents();
		},

		registerEvents: function() {
			var changes = {
				show:      this.propagateChanges(this.record, 'show', true),
				emphasize: this.propagateChanges(this.record, 'emphasize', true)
			};

			this.model = this.screen.components.props.startEditing(this.record, changes, $(".instruction_editor"));

			this.model.on('change:show', this.onShowChange, this);
		},

		onShowChange: function f791() {
			this.stage_view.render();
			this.renderChildren();
			this.refresh();
		},

        reloadStage: function () {
            this.onShowChange();
        }

	}, {
		
		type: 'InstructionEditor', 
		
		stageReadOnlyMode: true,
		
		/**
		 * if the instruction is not enabled then we will return a flag
		 * tells the validation process not to keep checking the instruction children
		 * @param  {[type]} elem_repo [description]
		 * @return {[type]}           [description]
		 */
		valid : function f792(elem_repo){
			var result = {valid : true , report : [],dontAllowChildren : false};
			if(!elem_repo.data.show){
				result.dontAllowChildren = true;
			}
			return result;
		}

	});

	return InstructionEditor;

});