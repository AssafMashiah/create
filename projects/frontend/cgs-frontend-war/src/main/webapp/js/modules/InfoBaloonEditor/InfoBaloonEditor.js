define(['modules/BaseTaskEditor/BaseTaskEditor', 'events', './config', 'repo',
	'./InfoBaloonPropsView', './InfoBaloonStageView'],
	function(BaseTaskEditor, events, config, repo, InfoBaloonPropsView, InfoBaloonStageView ) {

		var InfoBaloonEditor = BaseTaskEditor.extend({

			initialize: function(configOverrides) {
				this.setStageViews({
					small: InfoBaloonStageView,
					normal: InfoBaloonStageView
				});

                this._super(/*config*/{
                    menuInitFocusId: config.menuInitFocusId,
                    menuItems: []
                }, configOverrides);

				if (!this.config.previewMode) {
					this.startStageEditing();
					this.startPropsEditing();
					this.registerEvents();
					this.setButtonsState();
				}
			},

			startPropsEditing: function(){
				this.view = new InfoBaloonPropsView({controller:this});
			},

			startStageEditing: function(){
				this.showStagePreview($('#stage_base'), {bindEvents: true});
			},

			registerEvents: function(){
				this.bindEvents({
					'createIbItem': {'type':'register', 'func': this.createNewItem , 'ctx':this, 'unbind':'dispose'},
					'end_load_of_menu': {'type': 'bind', 'func': this.setButtonsState, 'ctx':this, 'unbind':'dispose'},
					'contentEditorDeleted': { 'type': 'register', 'func': this.setButtonsState, 'ctx': this, 'unbind': 'dispose'}
				});
				
			},
			createNewItem: function(args){
				if (this.record.children.length < 1) {
					if(args.type == 'imageViewer'){
						args = _.extend(args, {'data': {"isThinMode" : true	}});
					}
					this._super(args);
				}
			},
			renderNewItem: function(){
				this.renderChildren();
				this.setButtonsState();
				require('validate').isEditorContentValid(this.record.id);
			},
			onEditorLoad: function f785(id) {
				var controller = require('repo_controllers').get(this.record.parent);
				if (controller) {
					setTimeout(controller.startEditing.bind(controller), 100);
				}
			},

			setButtonsState: function(id){

				MenuButtons= ['menu-button-new-text', 'menu-button-new-image', 'menu-button-new-sound-button'];

				_.each(MenuButtons , function f787(button) {
					events.fire('setMenuButtonState', button, this.record.children.length > 0 ? 'disable' : 'enable');
				}, this);
			},
			dispose: function f788() {
				events.once('load', this.onEditorLoad, this);
				this._super();
			}

		}, {
			type: 'InfoBaloonEditor',
			
			setScreenLabel: 'InfoBaloon Content',
			
			showTaskSettingsButton: false,
			
			displayTaskDropdown: false,

			postValid : function f790(elem_repo){
				if (!elem_repo.children.length ){
					return {
						valid :false , 
						report : [require('validate').setReportRecord(elem_repo,'The Info Balloon must contain at least one content item.')]
					};
				}
				if( _.any(elem_repo.children, function(child){
					return !repo.get(child).data.isValid;

				})){
					return {
						valid :false , 
						report : [require('validate').setReportRecord(elem_repo,'The Info Balloon contains an invalid component. Verify that all components contain content.')]
					};

				}
				return {valid : true, report : []};
			}

		});

		return InfoBaloonEditor;

	});