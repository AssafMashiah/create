define(['jquery', 'BaseStageContentView', 'rivets',
		'text!modules/ProgressEditor/templates/ProgressSmallStage.html'],
function($, BaseStageContentView, rivets, template) {

	var ProgressStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},
        render : function($parent){
            this._super($parent);
            var containerParent = this.$el.parent().parent();
            this.$el.width(containerParent.width()- 3);
        }
			

	}, {type: 'ProgressStageView'});

	return ProgressStageView;

});
