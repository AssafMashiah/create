define(['BaseContentEditor', 'repo', 'events', './config', './AssessmentQuestionEditorView',
    './AssessmentQuestionStageView', './AssessmentQuestionSmallStageView','appletModel'],
function(BaseContentEditor, repo, events, config, AssessmentQuestionEditorView,
         AssessmentQuestionStageView, AssessmentQuestionSmallStageView , appletModel) {

	var AssessmentQuestionEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: AssessmentQuestionSmallStageView,
				normal: AssessmentQuestionStageView
			});

            this._super(/*config*/{
                menuInitFocusId: config.menuInitFocusId,
                menuItems: [],
                sortChildren: config.sortChildren
            }, configOverrides);

            this.screen.components.menu.config.menuItems[0].label =
            require('translate').tran('assesment_question_label_type_'+
                repo.getAncestorRecordByType(configOverrides.id,"sequence").data.sq_type);
            this.initMenu();

            if (!this.config.previewMode) {
                this.registerEvents();
                this.startStageEditing();
                this.startPropsEditing();
            }
		},

		registerEvents: function(){
			this.bindEvents({
				'createNewApplet': {'type': 'register', 'unbind': 'dispose', 'func': this.createNewApplet, 'ctx': this},
				'createNewItem': {'type': 'bind', 'func': this.createNewItem, 'ctx': this, 'unbind': 'dispose'},
				'deleteItem': {
					'type': 'register',
					'ctx': this,
					'unbind': 'dispose',
					'func': function f1024(id, dontShowDeleteNotification) {
						this.deleteItemById(id);

					}
				}
			});
		},
		deleteItemById: function (elementId) {
            
            var index = repo.get(repo.get(elementId).parent).children.indexOf(elementId),
            parentEditorId = repo.remove(elementId);

            this.stage_view.$("[data-elementId='"+elementId+"']").remove();

            if (this.router && this.router.activeEditor) {
                this.router.activeEditor.startEditing();
            }
            
            //after delete apply validation on parent
            require('validate').isEditorContentValid(parentEditorId);
            this.renderChildren();

        },


        startStageEditing: function(){
            this.showStagePreview($('#stage_base'), {bindEvents: true});

        },
		startPropsEditing: function(cfg){
			this._super(cfg);
			var config = _.extend({controller: this}, cfg ? cfg : null);
			this.view = new AssessmentQuestionEditorView(config);
		},

		createNewApplet: function(args){
			args.parentId = this.config.id;
			appletModel.showAppDialog(args);
		},

		renderNewItem: function(){
			this.renderChildren();
		}


	}, {type: 'AssessmentQuestionEditor'});

	return AssessmentQuestionEditor;

});