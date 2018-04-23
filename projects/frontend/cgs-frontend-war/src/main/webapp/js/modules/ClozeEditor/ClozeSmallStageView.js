define(['jquery', 'BaseStageContentView', 'text!modules/ClozeEditor/templates/ClozeSmallStageView.html'],
function($, BaseStageContentView, template) {

	var ClozeSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'ClozeSmallStageView'});

	return ClozeSmallStageView;

});
