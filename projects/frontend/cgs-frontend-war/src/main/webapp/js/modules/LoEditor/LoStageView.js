define(['jquery', 'BaseStageView', 'rivets', 'text!modules/LoEditor/templates/LoStage.html'],
function($, BaseStageView, rivets, template) {

	var LoStageView = BaseStageView.extend({

		el: '#stage_base',

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}
		
	}, {type: 'LoStageView'});

	return LoStageView;

});
