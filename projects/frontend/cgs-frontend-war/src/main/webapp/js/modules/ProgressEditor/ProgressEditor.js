define(['BaseContentEditor', 'repo', 'validate', 'events', './config', './ProgressEditorView', './ProgressStageView', './ProgressSmallStageView','mustache','translate'],
function(BaseContentEditor, repo, validate, events, config, ProgressEditorView, ProgressStageView, ProgressSmallStageView, Mustache, i18n) {

	var ProgressEditor = BaseContentEditor.extend({

		feedback_rec : {},
		feedbackId : 0,
		empty_feedback : true,
		hintId : 0,
		empty_hint : true,
		max_attempts: 8,
		max_on_attempt: 7,
		disable_on_attempt: false,

		initialize: function(configOverrides, inheritedConfig) {

			if (!inheritedConfig) {
				this.setStageViews({
					small: ProgressSmallStageView,
					normal: ProgressStageView
				});
			}

			this._super(config, configOverrides);

			this.getHintAndFeedbackData();
		},

		show_feedback_prop: function() {
			return !((this.record.data.feedback_type || '') in {'none' : 0, '' : 0});
		},
		show_feedback_stage: function(){
			return !((this.record.data.feedback_type || '') in {'none' : 0, 'local' : 0, '' : 0});
		},

		show_on_attempt: function() {
			return parseInt(this.record.data.hint_timing, 10) > 1;
		},

		show_hint: function() {
			return (this.hintId != 0);
		},

		show_num_of_attempts: function(){
			return this.record.data.num_of_attempts > 0;
		},

		show_timing: function(){
			return (this.show_hint() && this.record.data.show_hint && (this.record.data.num_of_attempts > 1));
		},

		show_timer_fields: function() {
			return this.record.data.timer_enabled === true;
		},

		startPropsEditing: function(cfg, view) {
			this._super(cfg);
			var config = _.extend({controller: this}, cfg || null);
			this.view = view ? new view(config) : new ProgressEditorView(config);
			this.registerEvents();
			repo.startTransaction({ ignore: true });
			this.getNumOfAttempts();
			repo.endTransaction();
		},

		registerEvents: function() {
			//init the feedback types dropdown (before the register events)
			this.view.initProgressTypes();

			var changes = {
				num_of_attempts:this.propagateChanges(this.record, 'num_of_attempts', true),
				show_hint:this.propagateChanges(this.record, 'show_hint', true),
				hint_timing:this.propagateChanges(this.record, 'hint_timing', true),
				on_attempt:this.propagateChanges(this.record, 'on_attempt', true),
				feedback_type:this.propagateChanges(this.record, 'feedback_type', true),
				timer_enabled:this.propagateChanges(this.record, 'timer_enabled', true),
				timer_minutes:this.propagateChanges(this.record, 'timer_minutes', true),
				timer_seconds:this.propagateChanges(this.record, 'timer_seconds', true)
			};
			this.model = this.screen.components.props.startEditing(this.record, changes, $(".progress_editor"));

			if (!!this.feedback_rec.type) {
				var feedback_changes = {
					show_partly_correct:this.propagateChanges(this.feedback_rec, 'show_partly_correct', true)
				};
				var feedback_model = this.screen.components.props.startEditing(this.feedback_rec, feedback_changes, $(".feedback-editor-wrapper"));
			}

			this.model.on('change:show_hint', this.showHint, this);
			this.model.on('change:hint_timing', this.reloadOn_attempt, this);
			this.model.on('change:feedback_type', this.beforeChangeType, this);
			this.model.on('change:num_of_attempts', this.changeNumOfAttempts, this);
			this.model.on('change:score', this.updateTaskScore, this);
			this.model.on('change:timer_enabled', this.updateShowTimer, this);
			this.model.on('change:timer_minutes', this.updateTimerMinutes, this);
			this.model.on('change:timer_seconds', this.updateTimerSeconds, this);
		},

		updateTaskScore: function(event, value){
			repo.startTransaction({ appendToPrevious: true });
			repo.updateProperty(this.record.id, "score", Math.abs(parseInt(value) || 0));
			if (events.exists('score_Changed')) {
					events.fire('score_Changed', this.record.data.score);
			}
			repo.endTransaction();

			this.reload();
		},

		updateShowTimer: function (event, value) {
			repo.startTransaction({ appendToPrevious: true });

			if (this.record.data.timer_enabled === true) {
				// set default value of timer minutes
				if (!Number.isInteger(this.record.data.timer_total_seconds) || this.record.data.timer_total_seconds === 0) {
					repo.updateProperty(this.record.id, "timer_minutes", 2, false, true);
					repo.updateProperty(this.record.id, "timer_seconds", 0, false, true);
					this.updateTimerTotalSeconds();
				}
			} else {
				repo.updateProperty(this.record.id, "timer_minutes", 0, false, true);
				repo.updateProperty(this.record.id, "timer_seconds", 0, false, true);
				this.updateTimerTotalSeconds();
			}

			repo.updateProperty(this.record.id, "timer_enabled", value);
			repo.endTransaction();

			this.reload();
		},

		updateTimerMinutes: function (event, value) {
			var minutes = this.record.data.timer_minutes || "";
			var needToReload = false;

			if (typeof minutes === 'string' && minutes[0] === "0") {
				minutes = minutes.replace(/^0+/, "");
				needToReload = true;
			}

			minutes = parseInt(minutes, 10) || 0;

			if (minutes < 0) {
				minutes = 0;
				needToReload = true;
			}

			if (minutes > 60) {
				minutes = 60;
				repo.updateProperty(this.record.id, "timer_seconds", 0, false, true);
				needToReload = true;
			}

			// update the repo with integer value
			repo.updateProperty(this.record.id, "timer_minutes", minutes, false, true);

			if (needToReload) {
				this.reload();
			}

			this.updateTimerTotalSeconds();
		},

		updateTimerSeconds: function (event, value) {
			var seconds = this.record.data.timer_seconds || "";
			var minutes = parseInt(this.record.data.timer_minutes, 10) || 0;
			var needToReload = false;

			if (typeof seconds === 'string' && seconds[0] === "0") {
				seconds = seconds.replace(/^0+/, "");
				needToReload = true;
			}

			seconds = parseInt(seconds, 10) || 0;

			if (minutes == 60) {
				seconds = 0;
				needToReload = true;
			}

			if (seconds < 0) {
				seconds = 0;
				needToReload = true;
			}

			if (seconds > 59) {
				seconds = 59;
				needToReload = true;
			}

			// update repo with integer value
			repo.updateProperty(this.record.id, "timer_seconds", seconds, false, true);

			if (needToReload) {
				this.reload();
			}

			this.updateTimerTotalSeconds();
		},

		updateTimerTotalSeconds: function () {
			var minutes = parseInt(this.record.data.timer_minutes, 10) || 0;
			var seconds = parseInt(this.record.data.timer_seconds, 10) || 0;

			repo.updateProperty(this.record.id, "timer_total_seconds", minutes * 60 + seconds, false, true);
		},

		showHint : function(){
			var hint_obj = repo.getChildrenRecordsByType(this.record.id, 'hint');
			if(hint_obj.length){
				hint_obj = hint_obj[0];
				require('validate').isEditorContentValid(hint_obj.id);

				this.isValidHint = hint_obj.data.isValid;
				if(!this.isValidHint){
					this.invalidHintmsg = validate.getInvalidReportString(hint_obj.data.invalidMessage);
				}
			}
			this.reload();
		},

		getNumOfAttempts: function(){
			if (this.record.data.num_of_attempts < 3) {
				this.disable_on_attempt = true;
				this.max_on_attempt = 1;
			}
			else {
				this.disable_on_attempt = false;
				this.max_on_attempt = this.record.data.num_of_attempts - 1;
			}
			if(this.record.data.on_attempt > this.max_on_attempt)
				repo.updateProperty(this.record.id, 'on_attempt', 1, false, true);
		},

		// Change number of on_attempt according to max attempts value
		changeNumOfAttempts: function() {
			repo.startTransaction({ appendToPrevious: true });
			this.getNumOfAttempts();
			repo.endTransaction();
			this.reload();
		},

		beforeChangeType: function (child, value) {
			// If feedback is changing from basic/advanced, show a warning dialog because other feedback types
			// contain values entered by the user that are going to be lost
			var previousValue = this.model.previous("feedback_type");
			if (this.revertingToPreviousFeedbackType ||  previousValue == 'local') {
				this.changeType(value);
			} else {
				var dialogConfig = {
					title: "Warning - Feedback Type Change",
					content: {
						text: "progressEditor.feedbacks.changeType",
						icon: 'warn'
					},
					buttons: {
						ok:		{ label: 'OK' },
						cancel:	{ label: 'Cancel' }
					}
				};

				events.once( 'ProgressEditor.onFeedbackTypeChange', function( response ) {
					if(response && response == 'ok') {
						this.changeType(value);
					} else { // revert to previous value
						this.revertingToPreviousFeedbackType = true;
						this.model.set("feedback_type", previousValue);
					}
				}, this);

				require('dialogs').create('simple', dialogConfig, 'ProgressEditor.onFeedbackTypeChange');
			}
		},

		changeType: function(value, noNavigate) {
			this.revertingToPreviousFeedbackType = false;
			this.getHintAndFeedbackData();

			repo.startTransaction({ appendToPrevious: true });
			//var progress= repo.get(repo.get(this.feedbackId).parent);
			var progress= repo.get(this.elementId);
			switch(value){

				case 'local':
					repo.updateProperty(this.feedback_rec.id, 'feedbacksToDisplay', []);
					repo.updateProperty(this.feedback_rec.id, 'feedbacks_map', {});
					repo.updateProperty(this.feedback_rec.id, 'feedbacks_map_specific', {});

					repo.removeChildren(this.feedback_rec.id);
				break;
				case 'advanced':
					var AdvancedFeedbacksToDisplay = require('cgsUtil').cloneObject(repo.get(this.feedback_rec.parent).data.AdvancedFeedbacksToDisplay);
					if(!!AdvancedFeedbacksToDisplay[this.feedback_rec.data.taskType]) {  //feedbacks array per task type
						AdvancedFeedbacksToDisplay = AdvancedFeedbacksToDisplay[this.feedback_rec.data.taskType];
					}

					repo.updateProperty(this.feedback_rec.id, 'feedbacksToDisplay', AdvancedFeedbacksToDisplay);

				break;
				default:
					var feedbacksToDisplay = require('cgsUtil').cloneObject(repo.get(this.feedback_rec.parent).data.feedbacksToDisplay);

					if (!!feedbacksToDisplay[this.feedback_rec.data.taskType]) {  //feedbacks array per task type
						feedbacksToDisplay = feedbacksToDisplay[this.feedback_rec.data.taskType];
					}
					repo.updateProperty(this.feedback_rec.id, 'feedbacksToDisplay', feedbacksToDisplay);

				break;
			}
			//after feedback type change we need to delete the saved list, so that next time we will get the default list
			repo.deleteProperty(this.feedback_rec.id, 'predefined_list', true);

			repo.endTransaction();

			if(value !== "local" && !noNavigate) { //Local
				//load feedback editor in order to create feedbacks according to the chosen type
				this.router.load(this.feedback_rec.id);
			} else {
				this.reload();
			}
		},

		reload: function f976() {
			this.stage_view.render();
			this.renderChildren();
			this.refresh();
		},

		reloadOn_attempt: function f977() {
			repo.startTransaction({ appendToPrevious: true });
			repo.updateProperty(this.record.id, 'show_on_attempt', this.show_on_attempt(), false, true);
			if(!this.record.data.on_attempt){
				repo.updateProperty(this.record.id, 'on_attempt', 1, false, true);
			}
			repo.endTransaction();
			this.refresh();
		},

		reloadStage: function() {
			this.stage_view.render();
		},

		getHintAndFeedbackData: function() {
			var hint_obj = repo.getChildrenRecordsByType(this.record.id, 'hint');
			if(!!hint_obj && !!hint_obj.length) {
				if (hint_obj[0].children.length > 0) {
					this.empty_hint = false;
				}
				this.hintId = hint_obj[0].id;
				this.isValidHint = hint_obj[0].data.isValid;
				if(!this.isValidHint){
					this.invalidHintmsg = validate.getInvalidReportString(hint_obj[0].data.invalidMessage);
				}
			}

			var feedback_obj = repo.getChildrenRecordsByType(this.record.id, 'feedback');
			if (!!feedback_obj && !!feedback_obj.length) {
				this.feedback_rec = feedback_obj[0];
				if (feedback_obj[0].children.length > 0) {
					this.empty_feedback = false;
				}
				this.feedbackId = feedback_obj[0].id;
				this.isValidFeedback = feedback_obj[0].data.isValid;
				if(!this.isValidFeedback){
					this.invalidFeedbackmsg = validate.getInvalidReportString(feedback_obj[0].data.invalidMessage);
				}
			}
		}

	}, {type: 'ProgressEditor', stageReadOnlyMode: true});

	return ProgressEditor;

});
