define(['jquery', 'BaseNormalStageContentView', 'text!modules/SelfCheckEditor/templates/SelfCheckStage.html'],
function($, BaseNormalStageContentView, template) {

	var SelfCheckStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		},
		onChildrenRenderDone : function(){
			if(this.controller.record.data.isValid !== true){
				this.insertInvalidSign();
			}
		},
		insertInvalidSign : function(){
            require('validate').insertInvalidSign(this.$('.instruction_message') , true, this.controller.record.type,
                require('validate').getInvalidReportString(this.controller.record.data.invalidMessage));
        }
		
	}, {type: 'SelfCheckStageView'});

	return SelfCheckStageView;

});
