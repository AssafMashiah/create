define(['jquery', 'events', 'BaseNormalStageContentView', 'text!modules/LinkingAreaEditor/templates/LinkingAreaNormalStage.html'],
function($, events, BaseNormalStageContentView, template) {

	var LinkingAreaStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		},

		render: function($parent, previewConfig){
			this._super($parent, previewConfig);
			this.events();
		},
		events: function f887() {
			this.$el.find("#add-pair").click(this.addPair.bind(this))
		},
		addPair: function f888() {
			this.controller.createPair();
		}


	}, {type: 'LinkingAreaStageView'});

	return LinkingAreaStageView;

});
