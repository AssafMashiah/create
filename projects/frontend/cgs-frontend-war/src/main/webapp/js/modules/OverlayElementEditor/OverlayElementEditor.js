define(['BaseContentEditor', 'repo', 'repo_controllers', 'editMode', 'validate', 'events', 'files', './config',
		'./OverlayElementPropsView', 'teacherGuideComponentView', 'StandardsList', 'standardsModel'],
function(BaseContentEditor, repo, repo_controllers, editMode, validate, events, files, config,
		 OverlayElementPropsView, teacherGuideComponentView, StandardsList, standardsModel) {

	var OverlayElementEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {

			if (arguments.length > 1) {
				this._super.apply(this, arguments);
			}
			else {
				this._super(config, configOverrides);
			}

		},

		startPropsEditing: function (cfg, view) {
			this._super(cfg);
			var config = _.extend({controller: this}, cfg || null);
			this.view = view ? new view(config) : new OverlayElementPropsView(config);
		},

		updateOverlay: function() {
			events.fire('updateOverlayElement', this.record);
		},

		attachGlobalEvents: function() {
			this.teacherGuideComponent = new teacherGuideComponentView({
				el: '#overlay_teacherGuide',
				data: this.model.get('teacherGuide'),
				title: 'teacherGuide',
				column_name: 'teacherGuide',
				update_model_callback: _.bind(function f995(data) {
					this.model.set('teacherGuide', data);
				}, this)
			});

			var sequences = repo.getChildren(this.record.id);
			var id = this.record.id;
			if (sequences.length > 0 && sequences[0].type == 'sequence') {
				id = sequences[0].children[0];
			}

			if (this.enableStandards) {
				this.standardsList = new StandardsList({
					itemId: '#overlay_standards_list',
					repoId: id,
					getStandardsFunc: function f997() {
						return standardsModel.getStandards(id);
					}.bind(this)
				});
			}

		}
		
	}, {
		type: 'OverlayElementEditor'

	});

	return OverlayElementEditor;

});