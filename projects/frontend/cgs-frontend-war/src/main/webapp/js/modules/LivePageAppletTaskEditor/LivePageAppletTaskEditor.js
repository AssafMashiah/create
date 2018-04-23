define(['modules/LivePageBaseTaskEditor/LivePageBaseTaskEditor', './config',  'repo',
	'./LivePageAppletTaskStageView', './TaskTemplate'],
function(LivePageBaseTaskEditor, config, repo, LivePageAppletTaskStageView, taskTemplate) {

	var LivePageAppletTaskEditor = LivePageBaseTaskEditor.extend({

		initialize: function(configOverrides) {

			if (!configOverrides.previewMode) {
				configOverrides = $.extend(true, _.clone(config), configOverrides);
			}

			this.setStageViews({
				normal: LivePageAppletTaskStageView
			});

			this._super(configOverrides);

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
		type: 'LivePageAppletTaskEditor',
		icons: {
			'icon1': 'media/icons/applet_01.png',
			'icon2': 'media/icons/applet_02.png',
		},
		template: taskTemplate.template,
		showTaskSettingsButton: true,
		displayTaskDropdown: false,
		components: config.components
	});

	return LivePageAppletTaskEditor;

});
