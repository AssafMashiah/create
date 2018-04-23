define(['jquery', 'BaseNormalStageContentView', 'text!modules/InstructionEditor/templates/InstructionStage.html'],
function($, BaseNormalStageContentView, template) {

	var InstructionStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		},

		render: function($parent) {
			this._super($parent);
			this.onChildrenRenderDone();
		},

        onChildrenRenderDone: function f793() {
            //override textviewer defaults to set instruction styles
            this.$el.find("iframe").contents().find("body").css("background","transparent");
        }
			

	}, {type: 'InstructionStageView'});

	return InstructionStageView;

});
