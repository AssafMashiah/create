define(['jquery', 'BaseStageContentView', 'text!modules/AssetsManagerEditor/templates/AssetsManagerSmallStage.html'],
function($, BaseStageContentView, template) {

	var AssetsManagerSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'AssetsManagerSmallStageView'});

	return AssetsManagerSmallStageView;

});