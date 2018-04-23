define({
	components: [{
		'name': 'rubric',
		'type': 'Rubric' ,
		'parentContainer': "#settings",
		'controllerEvents': {
			'rubrics_enabled': function f762(val) {
				if (val) {
					$("#field_score").attr('disabled', true);
				} else {
					$("#field_score").attr('disabled', false);
				}
			}
		},
		onRendered: function f763() {
			if (this.model.get('rubrics_enabled')) {
				$("#field_score").attr('disabled', true);
			}
		},
		onUpdateDataCallback: function f764() {
			$("#field_score").attr('disabled', true);
		},
		'component_model_fields': ['rubrics_enabled', 'rubrics'],
		'condition': function f765() {
			return require("lessonModel").isLessonModeAssessment();
		}
	}]
})