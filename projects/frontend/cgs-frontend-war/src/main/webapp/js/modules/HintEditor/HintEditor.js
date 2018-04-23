define(['modules/BaseTaskEditor/BaseTaskEditor', 'repo', 'events', './config',
		'./HintPropsView', './HintStageView', './HintSmallStageView'
	],
	function(BaseTaskEditor, repo, events, config, HintPropsView, HintStageView, HintSmallStageView) {

		var HintEditor = BaseTaskEditor.extend({

			initialize: function(configOverrides) {
				this.setStageViews({
					small: HintSmallStageView,
					normal: HintStageView
				});


				this._super( /*config*/ {
					menuInitFocusId: config.menuInitFocusId,
					menuItems: []
				}, configOverrides);

				if (!this.config.previewMode) {
					this.startPropsEditing();
					this.registerEvents();
					this.setButtonsState();
					this.startStageEditing();
				}
			},

			startPropsEditing: function() {
				this.view = new HintPropsView({
					controller: this
				});
			},

			startStageEditing: function() {
				this.showStagePreview($('#stage_base'), {
					bindEvents: true
				});
			},

			registerEvents: function() {

				this.bindEvents({
					'createNewHintSubItem': {
						'eventName': 'createNewHintSubItem',
						'type': 'register',
						'func': this.createNewItem,
						'ctx': this,
						'unbind': 'endEditing'
					},
					'contentEditorDeleted': {
						'type': 'register',
						'func': this.setButtonsState,
						'ctx': this,
						'unbind': 'dispose'
					},
					'openSubMenu': {
						'type': 'bind',
						'func': this.setButtonsState,
						'ctx': this,
						'unbind': 'dispose'
					}
				});
			},
			createNewItem: function(args) {
				if (this.record.children.length < 1) {
					this._super(args);
					this.setButtonsState();
				}
			},
			renderNewItem: function() {
				this.renderChildren();
				this.setButtonsState();
				require('validate').isEditorContentValid(this.record.id);
				
			},

			setButtonsState: function() {
				MenuButtons = ['menu-button-new-text', 'menu-button-new-image', 'menu-button-new-sound-button', 'menu-button-new-audio-player', 'menu-button-new-video'];

				_.each(MenuButtons, function f768(button) {
					events.fire('setMenuButtonState', button, this.record.children.length > 0 ? 'disable' : 'enable');
				}, this);
			}

		}, {
			type: 'HintEditor',

			setScreenLabel: 'Hint Content',

			showTaskSettingsButton: false,

			displayTaskDropdown: false,

			mapChildrenForValidation: function(elem_repo){
				if(require('repo').get(elem_repo.parent).data.show_hint){
					return repo.getChildren(elem_repo);
				}
				return [];
			},

			postValid: function f769(elem_repo) {
				if (require('repo').get(elem_repo.parent).data.show_hint){
					if(!elem_repo.children.length) {
						return {
							valid: false,
							report: [require('validate').setReportRecord(elem_repo, 'The Hint editor must contain at least one content item.')]
						};
					}
					if (_.filter(elem_repo.children, function(child) {
						return !repo.get(child).data.isValid;
					}).length) {
						return {
							valid: false,
							report: []
						};
					}
				}
				return {
					valid: true,
					report: []
				};
			}

		});

		return HintEditor;

	});