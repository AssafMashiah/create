define(['modules/LivePageElementEditor/LivePageElementEditor', 'repo', 'assets', 'editMode', 'appletModel', './config', './LivePageMultimediaPropsView', 'validate',
	'./LivePageMultimediaStageView'],
function(LivePageElementEditor, repo, assets, editMode, appletModel, config, LivePageMultimediaPropsView, validate,
	LivePageMultimediaStageView) {

	var LivePageMultimediaEditor = LivePageElementEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				normal: LivePageMultimediaStageView
			});

			// this._super(configOverrides);
			this._super( /*config*/ {
				menuInitFocusId: config.menuInitFocusId,
				menuItems: []
			}, configOverrides);
			
			if (!this.config.previewMode) {
				this.startStageEditing();
				this.startPropsEditing();
				this.registerEvents();
			}
		},

		registerEvents: function() {
			var changes = {};

			_.extend(changes, this.getGlobalEvents());

			this.model = this.screen.components.props.startEditing(this.record, changes);

			this.attachGlobalEvents();

			if (!this.config.previewMode) {
				this.bindEvents({
					'createNewApplet':{'type':'register', 'unbind':'dispose', 'func': this.createNewApplet, 'ctx':this},
					'createNewItem':{'type':'bind', 'func': this.createNewItem , 'ctx':this, 'unbind':'dispose'}
				});
			}
		},

		createNewApplet: function(args){
			args.parentId = this.config.id;
			appletModel.showAppDialog(args);
		},
		
		startPropsEditing: function(){
			this._super(null, LivePageMultimediaPropsView);
			this.registerEvents();
		},

		startStageEditing: function(){
			this.showStagePreview($('#stage_base'), {bindEvents: true});
		},

		renderNewItem: function(){
			this.renderChildren();
		},

		openEditor: function () {
			this.router.load(this.record.id);
		}
	
	}, {
		type: 'LivePageMultimediaEditor',

		icons: {
			'icon1': 'media/icons/multimedia_01.png',
			'icon2': 'media/icons/multimedia_02.png'
		},
		
		postValid: function f769(elem_repo) {
			if (!elem_repo.children.length) {
				return {
					valid: false,
					report: [require('validate').setReportRecord(elem_repo, 'The Multimedia editor must contain at least one content item.')]
				}
			}
			if (_.filter(elem_repo.children, function(child) {
				return !repo.get(child).data.isValid;
			}).length) {
				return {
					valid: false,
					report: []
				}
			}
			return {
				valid: true,
				report: []
			};
		}
	});

	return LivePageMultimediaEditor;

});
