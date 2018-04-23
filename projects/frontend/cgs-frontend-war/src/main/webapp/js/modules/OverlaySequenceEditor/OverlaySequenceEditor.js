define(['modules/OverlayElementEditor/OverlayElementEditor', 'repo', "repo_controllers", './OverlaySequencePropsView'	],
function(OverlayElementEditor, repo,repo_controllers, OverlaySequencePropsView) {

	var OverlaySequenceEditor = OverlayElementEditor.extend({
		initialize: function(configOverrides) {
			this._super(configOverrides);

		},
		startPropsEditing: function () {
            this._super(null, OverlaySequencePropsView);
			this.registerEvents();
        },

		registerEvents: function() {
			var self = this;

			var changes = {
				teacherGuide: this.propagateChanges(this.record, 'teacherGuide', true)
			};

			this.model = this.screen.components.props.startEditing(this.record, changes);

			this.view.$("#edit_overlay_sequence").on('click',function(){
				if(self.record && self.record.children.length){
					var sequence = repo.get(self.record.children[0]);
					if(sequence && sequence.children.length){
						var taskId = sequence.children[0];

						var lessonModel = require("lessonModel");
						if(!lessonModel.overlatInteractionState){
							lessonModel.overlatInteractionState = {};
						}
						lessonModel.overlatInteractionState[self.record.id] = require("cgsUtil").cloneObject(repo.getSubtreeRecursive(self.record.id));
						require("router").load(taskId);
					}
				}
			});

			this.attachGlobalEvents();
		}
	}, {
		type : 'OverlaySequenceEditor'
	});

	return OverlaySequenceEditor;

});
