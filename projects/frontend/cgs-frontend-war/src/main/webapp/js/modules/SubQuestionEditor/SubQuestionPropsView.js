define(['jquery', 'BasePropertiesView', 'repo',
	'text!modules/SubQuestionEditor/templates/SubQuestionProps.html'],
function($, BasePropertiesView,repo, template) {

	var SubQuestionPropsView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},
		render: function(){
			this._super();
			this.$(".field_FractionOverFraction").on('change',this.controller.onMathfieldHeightChange.bind(this.controller));
		},
		disableQuestion: function(){
			return !require("repo").get(this.controller.record.parent).data.has_questions;
		},
		fractionOverFraction: function(){
			return this.controller.record.data.mathfield_height == 'secondLevel';
		}
		
	}, {type: 'SubQuestionPropsView'});

	return SubQuestionPropsView;

});
