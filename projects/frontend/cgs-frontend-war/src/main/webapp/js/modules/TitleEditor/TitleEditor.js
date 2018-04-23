define(['BaseContentEditor', './config', './TitleEditorPropsView', './TitleEditorStageView', './TitleEditorSmallStageView'],
function(BaseContentEditor,  config, TitleEditorPropsView, TitleEditorStageView, TitleEditorSmallStageView) {

	var TitleEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {
			
			this.setStageViews({
				small: TitleEditorSmallStageView,
				normal: TitleEditorStageView
			});

			this._super(config, configOverrides);
		},

		startPropsEditing: function(cfg) {
			this._super(cfg);
			var config = _.extend({controller: this}, cfg ? cfg : null);
			this.view = new TitleEditorPropsView(config);
			this.registerEvents();
		},

		registerEvents:function f1372() {
			var changes = {
				show:this.propagateChanges(this.record, 'show', true)
			};

			this.model = this.screen.components.props.startEditing(this.record, changes, $('.title_editor'));

			this.model.on('change:show', this.onShowChange, this);
		},

		onShowChange: function f1373() {
			this.stage_view.render();
			this.renderChildren();
			this.refresh();
		}

	}, {type: 'TitleEditor',
		//dont validate the title's text viewer if the title is not shown
		mapChildrenForValidation : function(repo_elem){
			if(!repo_elem.data.show){
				return [];
			}else{
				return require('repo').getChildren(repo_elem);
			}
		}
	});

	return TitleEditor;

});