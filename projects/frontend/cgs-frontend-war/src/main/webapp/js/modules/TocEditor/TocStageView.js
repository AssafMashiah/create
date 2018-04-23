define(['BaseStageView', 'text!modules/TocEditor/templates/TocStage.html'],
function(BaseStageView, template) {

	var TocStageView = BaseStageView.extend({

		el: '#stage_base',

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},

		render: function() {
			this._super(this.template);
		}

	}, {type: 'TocStageView'});

	return TocStageView;

});
