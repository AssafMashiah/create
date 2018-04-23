define(['jquery', 'BaseStageContentView', 'text!modules/LinkingAreaEditor/templates/LinkingAreaSmallStage.html'],
function($, BaseStageContentView, template) {

	var LinkingAreaSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'LinkingAreaSmallStageView'});

	return LinkingAreaSmallStageView;

});
