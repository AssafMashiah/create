define(['jquery', 'events', 'BaseNormalStageContentView', 'text!modules/MTQBankEditor/templates/MTQBankNormalStage.html'],
function($, events, BaseNormalStageContentView, template) {

	var MTQBankStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		},

		render: function($parent, previewConfig) {
			this._super($parent, previewConfig);

			if(this.canBeEditable()) {
				//bind click event to plus sign to add new item to bank
				this.$('#mtq_subAnswer_add_item').click(_.bind(function f943(event) {
					event.preventDefault();
					event.stopPropagation();
					events.fire('setActiveEditor', this.controller);
					require('repo').startTransaction();
					this.controller.createNewSubAnswer();
					require('repo').endTransaction();
				},this));
			}
			else
				this.$('#mtq_subAnswer_add_item').hide();
		},

		dispose: function(){
			this.$('#mtq_subAnswer_add_item').unbind('click');
			this._super();
		}


	}, {type: 'MTQBankStageView'});

	return MTQBankStageView;

});
