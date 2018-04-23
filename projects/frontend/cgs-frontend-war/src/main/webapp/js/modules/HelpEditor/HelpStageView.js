define(['jquery', 'BaseNormalStageContentView',  'text!modules/HelpEditor/templates/HelpStage.html'],
function($, BaseNormalStageContentView, template) {

	var HelpStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		},
		render: function(parent){
			this._super(parent);
			this.addClassToDialog();
		},
		addClassToDialog: function(){
			this.$el.addClass('childcontainerDialog');
		},
		dispose: function() {
			this._super();
			this.remove();
		}
	}, {type: 'HelpStageView'});

	return HelpStageView;

});