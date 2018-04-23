define(['jquery', 'BaseNormalStageContentView', 'text!modules/DistructorsEditor/templates/DistructorsStage.html'],
function($, BaseNormalStageContentView, template) {

	var DistructorsStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		},
		render: function f750($parent, $previewConfig) {
			this._super($parent, $previewConfig);
			this.events();
		},
		events: function f751() {
			this.$el.find("#add-option").on("click", function f752() {
				this.controller.addItem();
			}.bind(this));
		}
		
	}, {type: 'DistructorsStageView'});

	return DistructorsStageView;

});
