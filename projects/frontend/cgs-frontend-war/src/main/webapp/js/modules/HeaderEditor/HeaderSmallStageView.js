define(['BaseStageContentView', 'text!modules/HeaderEditor/templates/HeaderSmallStage.html'],
function( BaseStageContentView, template) {

	var HeaderSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
		
	}, {type: 'HeaderSmallStageView'});

	return HeaderSmallStageView;

});
