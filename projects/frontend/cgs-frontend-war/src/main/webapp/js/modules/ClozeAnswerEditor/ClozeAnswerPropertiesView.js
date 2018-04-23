define(['jquery', 'mustache', 'BasePropertiesView',
    'text!modules/ClozeAnswerEditor/templates/ClozeAnswerPropertiesView.html'],
function($, Mustache, BasePropertiesView, template) {

	var ClozeAnswerPropertiesView = BasePropertiesView.extend({
		initialize: function(options) {
			this.template = template;
			this._super(options);
		},

		render: function() {
			this._super();
			this.checkReuseState();
			this.checkBankItemsType();
			this.$('#field_FractionOverFraction').on('change', this.controller.onMathfieldMaxHeightChange.bind(this.controller));
		},

		checkReuseState: function() {
			var disabled = require('editMode').readOnlyMode ||
							!this.controller.record.data.useBank;
			this.$('#field_reuseItems').attr({
				'disabled': disabled,
				'cantBeEnabled': 'true'
			});
			this.$('[for="field_reuseItems"]').text(require('translate').tran(this.controller.record.data.interaction == 'dd' ? 'task.fill_in_gaps.props.cb.reuse_bank' : 'task.fill_in_gaps.props.cb.identical_answers'));
		},

		setBankItemsType: function(mode) {
            console.warn("setBankItemsType to " + mode);
			switch (mode) {
                case 'disabled':
                    this.$('#bankItemsTypeWrapper').attr({
                        'disabled': true,
                        'cantBeEnabled': 'true'
                    });
                    break;
                case 'hidden':
                    this.$('#bankItemsTypeWrapper').hide();
                    break;
                default:
                    this.$('#bankItemsTypeWrapper').show();
            }
		},

		checkBankItemsType: function() {
            if (this.controller.record.data.interaction == 'dd' && !this.controller.record.data.reuseItems) {
                if (require('editMode').readOnlyMode) {
                    this.$('#bankItemsTypeWrapper').attr({
                        'disabled': true,
                        'cantBeEnabled': 'true'
                    });
                    console.log("checkBankItemsType disabled");
                } else {
                    this.$('#bankItemsTypeWrapper').show();
                    console.log("checkBankItemsType show")
                }
            } else {
                this.$('#bankItemsTypeWrapper').hide();
                console.log("checkBankItemsType hide")
            }
		},

		disableFieldWidth: function() {
			return this.controller.disableFieldWidth();
        },
        fractionOverFraction: function(){
			return this.controller.record.data.maxHeight == 'secondLevel';
        }
        
	}, {type: 'ClozeAnswerPropertiesView'});

	return ClozeAnswerPropertiesView;

});
