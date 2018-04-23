define(['jquery', 'lodash', 'BaseView', 'rivets'],
function($, _, BaseView, rivets) {

	var BaseStageView = BaseView.extend({

		el: '#stage_base',

		initialize: function(options) {
			this._super(options);
		},

		render: function() {
			if (typeof this.template === 'undefined') {
				throw new Error('No `template` field: ' + this.constructor.type);
			}
			this._super(this.template);
		},

		startEditing: function(model, container) {
			rivets.bind(container ? container : this.$('.editor-wrapper'), {obj: model});
		},

		markValidation: function(val) {
			this.$el[val ? 'removeClass' : 'addClass']('notValid');
			if(!val){
                this.insertInvalidSign();
            }else{
                this.removeInvalidSign();
            }
		},
		insertInvalidSign : function(){
			if(this.controller.record.data.isValid === false){
				require('validate').insertInvalidSign(this.$el , true, this.controller.record.type, require('validate').getInvalidReportString(this.controller.record.data.invalidMessage));
			}
        },
		removeInvalidSign : function(){
            this.$('.validTip').remove();
        }

	}, {type: 'BaseStageView'});

	return BaseStageView;

});
