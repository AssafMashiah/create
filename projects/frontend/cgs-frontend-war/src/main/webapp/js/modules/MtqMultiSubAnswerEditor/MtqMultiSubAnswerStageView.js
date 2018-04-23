define(['jquery', 'events', 'BaseNormalStageContentView', 'text!modules/MtqMultiSubAnswerEditor/templates/MtqMultiSubAnswerStage.html'],
function($, events, BaseNormalStageContentView, template) {

	var MtqMultiSubAnswerStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		},
		render: function($parent, previewConfig){

			this._super($parent, previewConfig);
			if(this.canBeEditable()) {
				//bind click event to add new sub question
				this.$('#mtq_MultiSubAnswer_add_item').click(_.bind(function f945(event) {
					event.preventDefault();
					event.stopPropagation();
					events.fire('setActiveEditor', this.controller);
					require('repo').startTransaction();
					this.controller.createNewSubAnswer();
					require('repo').endTransaction();
				},this));
			}
			else{
				this.$('#mtq_MultiSubAnswer_add_item').hide();
			}
		},

		dispose: function(){
			this.$('#mtq_MultiSubAnswer_add_item').unbind('click');
			this._super();
		}

	}, {type: 'MtqMultiSubAnswerStageView'});

	return MtqMultiSubAnswerStageView;

});
