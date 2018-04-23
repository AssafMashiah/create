define(['modules/ProgressEditor/ProgressEditor', 'repo', 'events', 'dialogs', './config',
	'./AdvancedProgressEditorView', './AdvancedProgressStageView', './AdvancedProgressSmallStageView',
	'mustache','translate'],
function(ProgressEditor, repo, events, dialogs, config, AdvancedProgressEditorView, AdvancedProgressStageView, 
	AdvancedProgressSmallStageView, Mustache, i18n) {

	var AdvancedProgressEditor = ProgressEditor.extend({

		initialize: function(configOverrides) {
			
			this.setStageViews({
				small: AdvancedProgressSmallStageView,
				normal: AdvancedProgressStageView
			});
			
			this._super(configOverrides, true);
		},

		startPropsEditing: function(cfg) {
			this._super(cfg, AdvancedProgressEditorView);
		},

		registerEvents: function() {
			//init the feedback types drop down (before the register events)
			this.view.initProgressTypes();
			
			var changes = {
				checking_enabled:this.propagateChanges(this.record, 'checking_enabled', true),
				num_of_attempts:this.propagateChanges(this.record, 'num_of_attempts', true),
				show_hint:this.propagateChanges(this.record, 'show_hint', true),
				hint_timing:this.propagateChanges(this.record, 'hint_timing', true),
				on_attempt:this.propagateChanges(this.record, 'on_attempt', true),
				feedback_type:this.propagateChanges(this.record, 'feedback_type', true),
				score:this.propagateChanges(this.record, 'score', true)
			};
			this.model = this.screen.components.props.startEditing(this.record, changes, $(".advancedProgress_editor"));

			if (!!this.feedback_rec.type) {
				var feedback_changes = {
					show_partly_correct:this.propagateChanges(this.feedback_rec, 'show_partly_correct', true)
				};
				var feedback_model = this.screen.components.props.startEditing(this.feedback_rec, feedback_changes, $(".feedback-editor-wrapper"));
			}

			this.model.on('change:checking_enabled', this.onCheckingEnableChange, this);
			this.model.on('change:show_hint', this.showHint, this);
			this.model.on('change:hint_timing', this.reloadOn_attempt, this);
			this.model.on('change:feedback_type', function(child, val) { this.changeType(val); }, this);
			this.model.on('change:num_of_attempts', this.changeNumOfAttempts, this);
			this.model.on('change:score', this.updateTaskScore, this);
		},
		
		onCheckingEnableChange: function(item, value) {
			if (this.dontTrigger) return;

			var commitChange = function () {
				this.reload();
				if (events.exists('checking_enabled_Changed')) {
					repo.startTransaction({ appendToPrevious: true });
					events.fire('checking_enabled_Changed', value);
					repo.endTransaction();
				}
			}.bind(this);

			var cloze = repo.getAncestorRecordByType(this.record.id, 'cloze');
			if (cloze) {
				var dialogConfig = {
                    title: "Are You Sure?",
                    content: {
                        text: "task.advanced_progress.props.checking_enabled_change.msg_text", //Text
                        icon: 'warn'
                    },
                    buttons: {
                        ok: { label: 'OK' },
                        cancel: { label: 'Cancel' }
                    }
                };
                events.once('openDialogChangeCheckingEnabled', function(response) {
                    if (response == 'ok') {
                    	commitChange();
                    }
                    else {
                    	this.dontTrigger = true;
                    	repo.revert();
                    	repo.startTransaction({ ignore: true });
                    	this.model.set('checking_enabled', !value);
                    	repo.endTransaction();
                    	this.dontTrigger = false;
                    }
                }, this);
                dialogs.create('simple', dialogConfig, 'openDialogChangeCheckingEnabled', this).show();
			}
			else {
				commitChange();
			}
		}

	}, {type: 'AdvancedProgressEditor', stageReadOnlyMode: true});

	return AdvancedProgressEditor;
});