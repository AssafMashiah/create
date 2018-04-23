define(['jquery', 'BaseNormalStageContentView', 'text!modules/SoundButtonEditor/templates/SoundButtonStage.html'],
function($, BaseNormalStageContentView, template) {

	var SoundButtonStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}	

	}, {type: 'SoundButtonStageView'});

	return SoundButtonStageView;

});
