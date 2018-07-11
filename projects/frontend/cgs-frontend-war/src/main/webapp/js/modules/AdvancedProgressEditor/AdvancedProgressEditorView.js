define(['jquery','lodash', 'mustache', 'repo', 'BasePropertiesView', 'lessonModel',
	'text!modules/AdvancedProgressEditor/templates/AdvancedProgressProps.html',
	'text!modules/AdvancedProgressEditor/templates/AdvancedProgressAssessmentProps.html'],
function($, _, Mustache, repo, BasePropertiesView, lessonModel, normalPropsTemplate, assessmentPropsTemplate) {

		var AdvancedProgressPropertiesViews = {
			"lessonModeNormal": normalPropsTemplate,
			"lessonModeAssessment": assessmentPropsTemplate
		};

	var AdvancedProgressEditorView = BasePropertiesView.extend({

		initialize: function(options) {

			//set progress props template according to lesson mode - assessment or normal lesson
			this.isLessonModeAssessment = lessonModel.isLessonModeAssessment() || repo.getAncestorRecordByType(options.controller.record.id, 'quiz')
			var mode = this.isLessonModeAssessment ? "lessonModeAssessment" : "lessonModeNormal";
			this.template = AdvancedProgressPropertiesViews[mode];

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

		show_timer_fields: function () {
			return this.controller.show_timer_fields();
		},

		isQuizMode: function () {
			return !!repo.getAncestorRecordByType(this.controller.record.id, 'quiz')
		},
		getQuiz: function () {
			return repo.getAncestorRecordByType(this.controller.record.id, 'quiz');
		},
		render: function() {

			//get the total score- in case of lesson mode assessment
			if(this.isLessonModeAssessment){
				this.totalSum = this.isQuizMode() ? lessonModel.getAssessmentTotalScore(this.getQuiz().id) : lessonModel.getAssessmentTotalScore();
				this.assessmentTypeAuto = lessonModel.isAssessmentModeAuto() || this.isQuizMode();
			}

			this.on_attempt = [];

			for (var i = 1; i <= this.controller.max_on_attempt; i++) {
				this.on_attempt.push({value: i});
			}

			if (this.isQuizMode()) {
				var quiz = this.getQuiz();

				this.controller.record.data.checking_enabled = true;

				if (quiz.data.taskWeight === 'equal') {
					this.isQuizEqualMode = true;
				}
			}

			this._super(this.template);

		},

		setInputMode: function() {

			this._super();
			// If attempts number less then 3 hint attempts combo should be disabled
			var isReadOnly = require('editMode').readOnlyMode;
			this.controller.getNumOfAttempts();
			$('#field_on_attempt').attr('disabled', isReadOnly || this.controller.disable_on_attempt);
		},

		isLessonModeAssessment: function(){
			return lessonModel.isLessonModeAssessment() || this.isQuizMode();
		}

	}, {type: 'AdvancedProgressEditorView', components:[
		{
			'name': 'ignore_checking',
			'type': 'IgnoreChecking' ,
			'parentContainer': ".advancedProgress_editor",
			'component_model_fields': ['ignore_checking_enabled', 'ignore_checking_list'],
			'condition': function f0() {
				var r = require("repo"),
					intraction,
					hasValidParent = r.getAncestorRecordByType(this.controller.record.id, 'cloze');

					if(hasValidParent){
						intraction = r.getChildrenRecordsByTypeRecursieve(hasValidParent.id, 'cloze_answer')[0].data.interaction;
					}

				return	hasValidParent &&
						require("localeModel").getConfig("ignore_checking") &&
						this.controller.record.data.checking_enabled &&
						intraction == 'write';

			}
		}]
	});

	return AdvancedProgressEditorView;

});
