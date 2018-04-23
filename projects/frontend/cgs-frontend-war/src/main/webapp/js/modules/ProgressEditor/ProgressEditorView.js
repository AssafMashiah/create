define(['jquery','lodash', 'mustache', 'BasePropertiesView', 'lessonModel', 'repo',
	'text!modules/ProgressEditor/templates/ProgressProps.html',
	'text!modules/ProgressEditor/templates/ProgressAssessmentProps.html'],
function($, _, Mustache, BasePropertiesView, lessonModel, repo, normalPropsTemplate, assessmentPropsTemplate) {

	var ProgressEditorView = BasePropertiesView.extend({

		initialize: function(options) {
			this.isLessonModeAssessment = lessonModel.isLessonModeAssessment() || repo.getAncestorRecordByType(options.controller.record.id, 'quiz')
			//set progress props template according to lesson mode - assessment or normal lesson
			this.template = this.isLessonModeAssessment ? assessmentPropsTemplate: normalPropsTemplate;

			// Fill num of attempts select
			this.attemptsOptions = [];

			for (var i = 1; i <= options.controller.max_attempts; i++) {
				this.attemptsOptions.push({value: i});
			}

			this._super(options);
		},
		initProgressTypes: function(){
			var types= this.controller.record.data.availbleProgressTypes;

			_.each(types, function(item){
				var mustached = Mustache.render('<option value="{{value}}">(({{name}}))</option>', item);
				$("#field_feedback_type").append(mustached);
			});

		},

		show_num_of_attempts: function() {
			return this.controller.show_num_of_attempts();
		},
		show_feedback_prop: function(){
			return this.controller.show_feedback_prop();
		},
		show_feedback_stage: function() {
			return this.controller.show_feedback_stage();
		},

		show_hint: function() {
			return (this.controller.hintId != 0);
		},

		show_timing: function() {
			return this.controller.show_timing();
		},
		isQuizMode: function () {
			return !!repo.getAncestorRecordByType(this.controller.record.id, 'quiz')
		},
		getQuiz: function () {
			return repo.getAncestorRecordByType(this.controller.record.id, 'quiz');
		},
		render: function() {

			//get the total score- in case of lesson mode assessment
			if(lessonModel.isLessonModeAssessment() || this.isQuizMode()){
				this.totalSum = this.isQuizMode() ? lessonModel.getAssessmentTotalScore(this.getQuiz().id) : lessonModel.getAssessmentTotalScore();
			}

			if (this.isQuizMode()) {
				var quiz = this.getQuiz();

				if (quiz.data.taskWeight === 'equal') {
					this.isQuizEqualMode = true;
				}
			}

			this.on_attempt = [];

			for (var i = 1; i <= this.controller.max_on_attempt; i++) {
				this.on_attempt.push({value: i});
			}
			this._super(this.template);

		},

		setInputMode: function() {

			this._super();
			// If attempts number less then 3 hint attempts combo should be disabled
			var isReadOnly = require('editMode').readOnlyMode;
			repo.startTransaction({ ignore: true });
			this.controller.getNumOfAttempts();
			repo.endTransaction();
			$('#field_on_attempt').attr('disabled', isReadOnly || this.controller.disable_on_attempt);
		}


	}, {type: 'ProgressEditorView'});

	return ProgressEditorView;

});
