define(['jquery', 'BaseNormalStageContentView', 'text!modules/LivePageMultimediaEditor/templates/LivePageMultimediaStage.html'],
function($, BaseNormalStageContentView, template) {

	var LivePageMultimediaStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},
		dispose: function() {
			this._super();
			this.remove();
		}

	}, {type: 'LivePageMultimediaStageView'});

	return LivePageMultimediaStageView;

});
