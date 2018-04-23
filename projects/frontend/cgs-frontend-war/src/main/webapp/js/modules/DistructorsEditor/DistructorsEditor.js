define(['modules/BaseTaskEditor/BaseTaskEditor', './config', './DistructorsStageView',
	'./DistructorsSmallStageView', 'events'],
function(BaseTaskEditor, config, DistructorsStageView, DistructorsSmallStageView ,events) {

	var DistructorsEditor = BaseTaskEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: DistructorsSmallStageView,
				normal: DistructorsStageView
			});

			this.readOnlyMode = require("editMode").readOnlyMode;

			this._super(config, configOverrides);

			if (!this.config.previewMode) {
				this.startStageEditing();
				this.startPropsEditing();
			}

			this.setEvents();
		},
		startStageEditing: function(){
			this.showStagePreview($('#stage_base'), {bindEvents:true});
		},
		setChildren: function f743(callback) {
			_.each(this.record.children, function f744(childId) {
				if (_.isFunction(callback)) {
					callback(require("repo").get(childId));
				}
			});
		},
		setEvents: function f745() {
			if(this.config.bindEvents){
				this.bindEvents({
					'contentEditorDeleted':{'type':'register', 'func': this.setDeletionState,
							'ctx':this, 'unbind':'dispose'}
				});
			}
		},

		setDeletionState: function f746() {
			var state = null;

			switch (true) {
				case (this.record.children.length > 1):
					state = false;
				break;
				case (this.record.children.length === 1):
					state = true;
				break;
			}

			this.setChildren(function f747(item) {
				require("repo").updateProperty(item.id, 'disableDelete', state, false, true);
			});

			_.each(this.record.children, function f748(item) {
				var _controller = require("repo_controllers").get(item);

				if (_controller) {
					_controller.stage_view.endEditing();
				}
			});

			this.renderChildren();
		},
		addItem: function f749() {
            var data = this.buildChildData(this.record.data.answerType);
			this.createItem({
				type: this.record.data.answerType,
				data: data,
				parentId: this.record.id
			});

			this.setDeletionState();
            require('router').startEditingActiveEditor();
		}

	},{
		type: 'DistructorsEditor',
	});

	return DistructorsEditor;

});
