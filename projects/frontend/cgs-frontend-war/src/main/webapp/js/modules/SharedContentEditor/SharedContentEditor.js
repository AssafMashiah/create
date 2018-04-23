define(['modules/BaseTaskEditor/BaseTaskEditor', 'events', 'appletModel', 'types', 'clipboardManager',
 './config', './SharedContentPropsView', './SharedContentStageView', './SharedContentSmallStageView'],
function(BaseTaskEditor, events, appletModel, types, clipboardManager, config, SharedPropsView, SharedStageView, SharedSmallStageView) {

	var SharedContentEditor = BaseTaskEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: SharedSmallStageView,
				normal: SharedStageView
			});
			this._super(config, configOverrides);

			if (!this.config.previewMode) {
				this.startStageEditing();
				this.startPropsEditing();
				this.registerEvents();
				clipboardManager.setFocusItem({id: this.record.id});
			}
		},

		startPropsEditing: function(){
			this.view = new SharedPropsView({controller:this});
		},
		
		startStageEditing: function(){
			this.showStagePreview($('#stage_base'), {bindEvents: true});
		},

		registerEvents: function(){
			
			this.bindEvents({
				'createNewApplet': {'type':'register', 'unbind':'endEditing', 'func': this.createNewApplet, 'ctx':this},
				'createNewItem': {'type':'bind', 'func':function(args){
					var id = this.createNewItem(args);
					require('validate').isEditorContentValid(id);
				}, 'ctx':this, 'unbind':'endEditing'},
				'clickOnStage': {'type':'bind', 'func': clipboardManager.setFocusItem.bind(clipboardManager, {id: this.record.id}), 'ctx':clipboardManager, 'unbind':'dispose'}
			});
		},

		createNewApplet: function(args) {
			args.parentId = this.config.id;
			appletModel.showAppDialog(args);
		},

		renderNewItem: function(){
			this.renderChildren();
			

		},
		
		dispose: function(){
			if (this.config && !this.config.previewMode) {
				events.unbind('createSharedContentItem');
			}
			this._super();
		}

	}, {

		type: 'SharedContentEditor',
		
		setScreenLabel: 'Shared Content',
		
		showProperties: false,
		
		displayTaskDropdown: false,
		
		valid:function f1052(elem_repo) {

			if (!elem_repo.children.length) {
				return { 
						valid : false, 
						report : [require('validate').setReportRecord(elem_repo,'The Shared Content must contain at least one component.')]
				};
					}
			return {valid : true, report:[]};
			}
	});

	return SharedContentEditor;

});