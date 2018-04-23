define(['jquery', 'BaseStageContentView', 'text!modules/CompareEditor/templates/CompareSmallStage.html'],
function($, BaseStageContentView, template) {

	var CompareSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'CompareSmallStageView'});

	return CompareSmallStageView;

});
