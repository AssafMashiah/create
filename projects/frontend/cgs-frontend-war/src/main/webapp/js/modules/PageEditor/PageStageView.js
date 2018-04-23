define(['BaseStageView', 'assets', 'lessonModel', 'editMode', 'text!modules/PageEditor/templates/PageStage.html'],
function(BaseStageView, assets, lessonModel, editMode, template) {

	var PageStageView = BaseStageView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);

		},

		render: function($parent) {
			this._super($parent);
			this.$el.addClass('PageStageView');
		},

		dispose: function() {
			this.$el.removeClass('PageStageView');
			this._super();
		}

	}, {type: 'PageStageView'});

	return PageStageView;

});
