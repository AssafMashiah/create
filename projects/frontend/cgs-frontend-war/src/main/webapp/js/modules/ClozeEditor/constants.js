define({
	components: [{
		'name': 'rubric',
		'type': 'Rubric' ,
		'parentContainer': "#settings",
		'controllerEvents': {
			'rubrics_enabled': function f113(val) {
				if (val) {
					$("#field_score").attr('disabled', true);
				} else {
					$("#field_score").attr('disabled', false);
				}
			}
		},
		onRendered: function f114() {
			if (this.model.get('rubrics_enabled')) {
				$("#field_score").attr('disabled', true);
			}
			if(require('repo').getChildrenRecordsByType(this.controller.record.id,'advancedProgress')[0].data.checking_enabled) {
				this.$el.hide();
			}
			
		},
		onUpdateDataCallback: function f115() {
			$("#field_score").attr('disabled', true);
		},
		
		'component_model_fields': ['rubrics_enabled', 'rubrics'],
		
		condition: function f116() {
			return   require("lessonModel").getAssessmentType() == 'mixed' ;
		}
	}]
})