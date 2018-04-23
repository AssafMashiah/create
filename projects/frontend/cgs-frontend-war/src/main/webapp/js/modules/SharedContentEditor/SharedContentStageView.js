define(['jquery', 'events', 'BaseNormalStageContentView','text!modules/SharedContentEditor/templates/SharedContentStage.html'],
function($, events, BaseNormalStageContentView, template) {

	var SharedStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		},

		render: function($parent) {
			this._super($parent);

			this.$('.sharedContent_content').click(function() {
				events.fire('clickOnStage');
			});
		}
		
	}, {type: 'SharedStageView'});

	return SharedStageView;

});