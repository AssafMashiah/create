define(['jquery', 'BaseStageContentView', 'text!modules/SoundButtonEditor/templates/SoundButtonSmallStage.html'],
function($, BaseStageContentView, template) {

	var SoundButtonSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}	

	}, {type: 'SoundButtonSmallStageView'});

	return SoundButtonSmallStageView;

});
