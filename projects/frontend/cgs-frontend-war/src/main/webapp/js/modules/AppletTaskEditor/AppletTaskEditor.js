define(['modules/BaseTaskEditor/BaseTaskEditor', './config',  'repo',
	'./AppletTaskStageView', './AppletTaskSmallStageView', './TaskTemplate'],
function(BaseTaskEditor, config, repo, AppletTaskStageView, AppletTaskSmallStageView ,taskTemplate) {

	var AppletTaskEditor = BaseTaskEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: AppletTaskSmallStageView,
				normal: AppletTaskStageView
			});

			this._super(config, configOverrides);

			if (!this.config.previewMode) {
				this.startStageEditing();
				this.startPropsEditing();
			}
		},
		
		startEditing: function(event) {
			var applet = _.find(repo.getSubtreeRecursive(this.record.id), function(item) { return item.type == 'applet'; });
			var progress = _.find(repo.getSubtreeRecursive(this.record.id), function(item) { return item.type == 'progress'; });

			if (!applet || !applet.data.isCheckable) {
				if (progress.data.num_of_attempts != 0) {
					repo.updateProperty(progress.id, 'num_of_attempts', 0);
					repo.updateProperty(progress.id, 'feedback_type', 'none');
					var feedback= repo.getChildrenRecordsByType(progress.id, 'feedback');
					if(feedback.length > 0){
						feedback = feedback[0];
						repo.remove(feedback.id);
					}
				}
			}
			else if (progress.data.num_of_attempts == 0) {
				repo.updateProperty(progress.id, 'num_of_attempts', 2);
			}
			this._super(event);
		},
		
		startStageEditing: function(){
			this.showStagePreview($('#stage_base'), {bindEvents:true});
		},

	},{	
		type: 'AppletTaskEditor',
		template: taskTemplate.template,
		showTaskSettingsButton: true,
		displayTaskDropdown: true,
		components: config.components
	});

	return AppletTaskEditor;

});
