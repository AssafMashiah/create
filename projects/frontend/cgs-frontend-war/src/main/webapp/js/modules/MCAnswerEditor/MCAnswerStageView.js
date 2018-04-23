define(['jquery', 'lodash','repo', 'BaseAnswerNormalStageContentView', 'text!modules/MCAnswerEditor/templates/MCAnswerStage.html','events'],
function($, _, repo, BaseAnswerNormalStageContentView, template, events) {

	var MCAnswerStageView = BaseAnswerNormalStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},

		// override parent function for read only mode check 
		showStagePreview: function($parent, previewConfig) {
			this._super($parent, previewConfig);

			if(this.canBeEditable()) {
				this.$('#mc_answer_add_item').click(_.bind(function f906(event) {
					event.preventDefault();
					event.stopPropagation();
					events.fire('setActiveEditor', this.controller);
					repo.startTransaction();
					this.controller.createNewOption();
					repo.endTransaction();
				},this));
			}
			else
				this.$('#mc_answer_add_item').hide();
		},

		dispose: function(){
			this.$('#mc_answer_add_item').unbind('click');
			this._super();
		}
		
	}, {type: 'MCAnswerStageView'});

	return MCAnswerStageView;

});
