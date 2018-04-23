define(['jquery', 'events', 'BaseNormalStageContentView', 'text!modules/MTQAreaEditor/templates/MTQAreaNormalStage.html'],
function($, events, BaseNormalStageContentView, template) {

	var MTQAreaStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		},

		render: function($parent, previewConfig){

			this._super($parent, previewConfig);
			//bind click event to add new sub question
			if(this.canBeEditable() && this.controller.allowAddSubAnswer()) {
				this.$('#mtq_subQuestion_add_item').click(_.bind(function f941(event) {
					event.preventDefault();
					event.stopPropagation();
					events.fire('setActiveEditor', this.controller);
					require('repo').startTransaction();
					this.controller.createNewSubQuestion();
                    require('router').startEditingActiveEditor();
					require('repo').endTransaction();
				},this));
			}
			else
				this.$('#mtq_subQuestion_add_item').hide();
		},

		dispose: function(){
			this.$('#mtq_subQuestion_add_item').unbind('click');
            this._super();
		}


	}, {type: 'MTQAreaStageView'});

	return MTQAreaStageView;

});
