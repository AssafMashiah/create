define(['modules/BaseTaskEditor/BaseTaskEditor', 'events',  './config', './TaskTemplate', 'repo',
	 './HeaderStageView', './HeaderSmallStageView' ,'./HeaderPropsView'],
function(BaseTaskEditor, events, config, taskTemplate, repo, HeaderStageView, HeaderSmallStageView, HeaderPropsView) {

	var HeaderEditor = BaseTaskEditor.extend({

		initialize: function(configOverrides) {
			this.setStageViews({
				small: HeaderSmallStageView,
				normal: HeaderStageView
			});

			this._super(config, configOverrides);

			if (!this.config.previewMode) {
				this.startStageEditing();
				this.startPropsEditing();
			}
		},

		startStageEditing: function(){
			this.showStagePreview($('#stage_base'), {bindEvents:'true'});

		},

		startPropsEditing: function(cfg) {
			var config = _.extend({controller: this}, cfg ? cfg : null);
			this.view = new HeaderPropsView(config);
			this.registerEvents();
		},

		registerEvents:function () {
			var changes = {
				showGenericTitle:this.propagateChanges(this.record, 'showGenericTitle', true),
				showGenericSubTitle:this.propagateChanges(this.record, 'showGenericSubTitle', true)
			};


			this.model = this.screen.components.props.startEditing(this.record, changes, $('.header_editor'));

			this.model.on('change:showGenericTitle', this.onShowChange.bind(this, 'genericTitle'));
			this.model.on('change:showGenericSubTitle', this.onShowChange.bind(this, 'genericSubTitle'));
		},

		onShowChange: function (type, obj, value) {
			var titleToEdit = repo.getChildrenByTypeRecursive(this.record.id, type)[0];

			repo.startTransaction({ appendToPrevious: true });

			repo.updateProperty(titleToEdit.id, 'hide', !value);
			//disable or enable the othe title checkbox
			repo.updateProperty(this.record.id, type === "genericTitle" ? "disableGenericSubTitle" : "disableGenericTitle",  !value);

			repo.endTransaction();
		
			this.startPropsEditing();
			this.stage_view.render();
			this.renderChildren();
			this.refresh();
			
		},

	}, {type: 'HeaderEditor',
		showTaskSettingsButton: true,
		displayTaskDropdown: false,
		setScreenLabel: 'Header',
		template : taskTemplate.template,
		
		postValid: function(elem_repo){
			if(_.filter(elem_repo.children, function(child){
						return !repo.get(child).data.isValid ;
					}).length){
						return {
							valid: false,
							report : []
						};
					}
			if(!elem_repo.data.showGenericSubTitle && !elem_repo.data.showGenericTitle){
				return {
					valid: false,
					report : [require('validate').setReportRecord(elem_repo,"The Header must contain content.")]
				};
			}

			return {valid : true , report :[]};

		}
	});

	return HeaderEditor;

});
