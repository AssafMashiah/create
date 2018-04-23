define(['modules/LivePageElementEditor/LivePageElementEditor', 'repo', 'assets', 'editMode', 'appletModel', './config', './LivePageTextViewerWrapperPropsView', 'validate',
	'./LivePageTextViewerWrapperStageView', './TaskTemplate'],
function(LivePageElementEditor, repo, assets, editMode, appletModel, config, LivePageTextViewerWrapperPropsView, validate,
	LivePageTextViewerWrapperStageView, taskTemplate) {

	var LivePageTextViewerWrapperEditor = LivePageElementEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				normal: LivePageTextViewerWrapperStageView
			});

			this._super(configOverrides);
			
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
					'createNewApplet':{'type':'register', 'unbind':'endEditing', 'func': this.createNewApplet, 'ctx':this},
					'createNewItem':{'type':'bind', 'func': this.createNewItem , 'ctx':this, 'unbind':'endEditing'}
				});
			}
		},

		createNewApplet: function(args){
			args.parentId = this.config.id;
			appletModel.showAppDialog(args);
		},
		
		startPropsEditing: function(){
			this._super(null, LivePageTextViewerWrapperPropsView);
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

			// set the TVE in edit mode
			require('repo_controllers').get(this.record.children[0]).startEditing();
		}
	
	}, {
		type: 'LivePageTextViewerWrapperEditor',
		template: taskTemplate.template,
		icons: {
			'icon1': 'media/icons/text_01.png',
			'icon2': 'media/icons/text_02.png'
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

	return LivePageTextViewerWrapperEditor;

});
