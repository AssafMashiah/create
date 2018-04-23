define(['modules/BaseTaskEditor/BaseTaskEditor', 'repo', 'events', './config', 'appletModel',
	 './HelpStageView', './HelpPropsView'],
	function(BaseTaskEditor, repo, events, config, appletModel, HelpStageView, HelpPropsView ) {

		var HelpEditor = BaseTaskEditor.extend({

			initialize: function(configOverrides) {
				this.setStageViews({
					small: HelpStageView,
					normal: HelpStageView
				});


                this._super(/*config*/{
                    menuInitFocusId: config.menuInitFocusId,
                    menuItems: [],
                    sortChildren: config.sortChildren
                }, configOverrides);

				if (!this.config.previewMode) {
					this.startPropsEditing();
					this.registerEvents();
					this.startStageEditing();
				}
			},
			startPropsEditing: function(){
				this.view = new HelpPropsView({controller:this});
			},

			startStageEditing: function(){
				this.showStagePreview($('#stage_base'), {bindEvents: true});
			},

			registerEvents: function(){

				this.bindEvents(
				{
					'createNewApplet':{'type':'register', 'unbind':'endEditing', 'func': this.createNewApplet, 'ctx':this},
					'createNewItem':{'type':'bind', 'func': function(args){
						var id = this.createNewItem(args);
						require('validate').isEditorContentValid(id);
					}, 'ctx':this, 'unbind':'endEditing'}
				});
			},
			createNewApplet: function(args){
				args.parentId = this.config.id;
				appletModel.showAppDialog(args);
			},

			renderNewItem: function(){
				this.renderChildren();
			},
			deleteItemById: function(elementId){
				this._super(elementId);
				this.renderChildren();

			}


		},{
			type: 'HelpEditor',
			
			setScreenLabel: 'Help Content',
			
			showTaskSettingsButton: false,
			
			displayTaskDropdown: false,

			postValid: function(elem_repo){
				if(!elem_repo.children.length) {
					return {
						valid : false,
						report : [require('validate').setReportRecord(elem_repo,"The Help editor must contain at least one content item.")]
					};
				}
				
				if(_.filter(repo.getSubtreeRecursive(elem_repo.id), function(child){
						return child.id!= elem_repo.id && !child.data.isValid ;
					}).length){
						return {
							valid: false,
							report : [require('validate').setReportRecord(elem_repo,"The Help editor contains an invalid component. Verify that all components contain content.")]
						}
				}
				return{	valid: true, report: []	}
			}
		});

		return HelpEditor;

	});