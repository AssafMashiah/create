define(['jquery', 'BaseNormalStageContentView', 'text!modules/ClozeEditor/templates/ClozeNormalStageView.html'],
function($, BaseNormalStageContentView, template) {

	var ClozeNormalStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'ClozeNormalStageView'});

	return ClozeNormalStageView;

});
