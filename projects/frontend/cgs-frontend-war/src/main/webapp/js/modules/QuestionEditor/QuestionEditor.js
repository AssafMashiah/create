define(['BaseContentEditor', 'repo', 'repo_controllers', 'events', './config', './QuestionEditorView', './QuestionStageView', './QuestionSmallStageView','appletModel'],
function(BaseContentEditor, repo, repo_controllers, events, config, QuestionEditorView, QuestionStageView, QuestionSmallStageView , appletModel) {

	var QuestionEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: QuestionSmallStageView,
				normal: QuestionStageView
			});
			
			this._super(config, configOverrides);
		},

		startEditing: function(){

			this._super();
			this.bindEvents({
				'createNewApplet':{'type':'register', 'unbind':'endEditing', 'func': this.createNewApplet, 'ctx':this},
				'createNewItem':{'type':'bind', 'func': this.createNewItem , 'ctx':this, 'unbind':'endEditing'},
				'contentEditorDeleted': { 'type': 'register', 'func': this.onEditorDeleted, 'ctx': this, 'unbind': 'dispose' }
			});
		},

		startPropsEditing: function(cfg){
			this._super(cfg);
			var config = _.extend({controller: this}, cfg ? cfg : null);
			this.view = new QuestionEditorView(config);
		},

		createNewApplet: function(args){
			args.parentId = this.config.id;
			appletModel.showAppDialog(args);
		},

		renderNewItem: function(){
			this.renderChildren();
		},

		onEditorDeleted: function(editorId, deletedIndex) {
			if(this.record.id == editorId){
				console.log('Question child deleted');
				if (deletedIndex > 0) {
					this.scrollToItem(this.record.children[deletedIndex - 1]);
				}
			}
		}


	}, {type: 'QuestionEditor'});

	return QuestionEditor;

});