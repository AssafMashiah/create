define([ 'BaseNormalStageContentView', 'text!modules/ShortAnswerEditor/templates/ShortAnswerNormalStage.html'],
function( BaseNormalStageContentView, template) {

	var ShortAnswerStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}


		
	}, {type: 'ShortAnswerStageView'});

	return ShortAnswerStageView;

});
