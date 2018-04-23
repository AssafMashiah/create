define(['jquery', 'BaseNormalStageContentView',  'text!modules/HintEditor/templates/HintStage.html'],
function($, BaseNormalStageContentView, template) {

	var HintStageView = BaseNormalStageContentView.extend({

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
		
	}, {type: 'HintStageView'});

	return HintStageView;

});