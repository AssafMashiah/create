define(['jquery', 'lodash', 'repo', 'BaseContentEditor', 'events', './config',
	'./LinkingAreaStageView', './LinkingAreaSmallStageView','./PairTemplate'],
function($, _, repo,  BaseContentEditor, events, config, LinkingAreaStageView,
		LinkingAreaSmallStageView,pairTemplate) {

	var LinkingAreaEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {
			this.setStageViews({
				small: LinkingAreaSmallStageView,
				normal: LinkingAreaStageView
			});

			this.readOnlyMode = require("editMode").readOnlyMode;

			this._super(config, configOverrides);

			if (!this.config.previewMode) {
				this.startStageEditing();
			}


			this.setEvents();

		},
        //overriding _super function
		startEditing: function(){},

		setEvents: function f880() {
			if(this.config.bindEvents){
				events.exists('contentEditorDeleted') ?
						events.bind('contentEditorDeleted', this.editorDeleted, this) :
						events.register('contentEditorDeleted', this.editorDeleted, this);
			}
		},
		setChildren: function f881(callback) {
			_.each(this.record.children, function f882(childId) {
				if (_.isFunction(callback)) {
					callback(require("repo").get(childId));
				}
			});
		},
		editorDeleted: function(itemId){
			if(this.record.id == itemId){
				this.setDeletionState();
			}

		},
		setDeletionState: function f883() {

			var state = null;
			var minimunChildren = this.record.data.useBank? config.minimumPairs.withBank : config.minimumPairs.noBank;

			switch (true) {
				case (this.record.children.length > 2):
					state = false;
				break;
				case (this.record.children.length <= minimunChildren):
					state = true;
				break;
			}

			this.setChildren(function f884(item) {
				repo.startTransaction({ appendToPrevious: true });
				repo.updateProperty(item.id, 'disableDelete', state, false, true);
				repo.endTransaction();
			});

			if (this.router.activeScreen && this.router.activeScreen.editor) {
				if (this.router.activeScreen.editor.elementName === "textViewer") {
					this.router.activeScreen.editor.stage_view.endEditing();
				}
			}
			this.renderChildren();
		},


		dispose:function f885() {
			events.unbind('contentEditorDeleted', this.editorDeleted);
			this._super();
		},

		startStageEditing: function(){
			this.showStagePreview($('#stage_base'), {bindEvents:true});
		},
		createPair: function f886() {
            var parent = repo.get(this.record.parent);
            var dataTemeplate = this.record.data.hasMultiSubAnswers ? pairTemplate.multiTemplate : pairTemplate.basicTemplate;
            var tempalte = {
                "template" : dataTemeplate.template,
                "parentId" : this.record.id,
                "definitionType" : parent.data.definitionType,
                "answerType" : parent.data.answerType,
                "dataConfig":[
                    {
                        "idx":  dataTemeplate.definitionChildIndex,
                        "data": this.buildChildData(parent.data.definitionType),
                        "extendData": true
                    },
                    {   "idx": dataTemeplate.answerChildIndex,
                        "data": this.buildChildData(parent.data.answerType),
                        "extendData": true
                    }
                ]
            };
			repo.startTransaction();

			this.createNewItem(tempalte);
			this.setDeletionState();
			this.renderChildren();

			repo.endTransaction();
            require('router').startEditingActiveEditor();
		}

	},
	{
			type: 'LinkingAreaEditor', disableSortableCss: true
			/*disableSortableCss - property that will prevant the 'sortable' (drag&drop elements to change theire order) to add unwanted css classes*/

	});

	return LinkingAreaEditor;

});
