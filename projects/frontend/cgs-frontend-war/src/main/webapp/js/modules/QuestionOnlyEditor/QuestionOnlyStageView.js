define(['jquery', 'BaseNormalStageContentView', 'text!modules/QuestionOnlyEditor/templates/QuestionOnlyNormalStage.html'],
function($, BaseNormalStageContentView, template) {

	var QuestionOnlyStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		},
		onChildrenRenderDone : function () {
			if(this.controller.record.data.isValid !== true){
				this.insertInvalidSign();
			}
		},
		insertInvalidSign : function(){
            require('validate').insertInvalidSign(this.$('.instruction_content.questionStage') , true, this.controller.record.type, require('validate').getInvalidReportString(this.controller.record.data.invalidMessage));
		}
		
	}, {type: 'QuestionOnlyStageView'});

	return QuestionOnlyStageView;

});
