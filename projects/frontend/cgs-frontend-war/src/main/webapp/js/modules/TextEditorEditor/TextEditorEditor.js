define(['BaseContentEditor', 'repo', 'events', './config', './constants', './TextEditorEditorPropsView',
		'./TextEditorEditorStageView', './TextEditorEditorSmallStageView', 'editMode'],
function(BaseContentEditor, repo, events, config, Constants, TextEditorEditorPropsView, TextEditorEditorStageView, TextEditorEditorSmallStageView, editMode) {

	var TextEditorEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: TextEditorEditorSmallStageView,
				normal: TextEditorEditorStageView
			});

			this._super(config, configOverrides);

            var parent = repo.getAncestorRecordByType(this.record.id, 'ShortAnswer');
            this.showToolbarCheckbox = !parent;
        
			if (!this.config.previewMode) {
				this.startPropsEditing();
				this.startStageEditing();
			}
		},

		startPropsEditing: function(){
            this._super();
			this.view = new TextEditorEditorPropsView({controller: this});

            if(!editMode.readOnlyMode)
                this.resetProps();
            else
                this.registerEvents();
		},

        registerEvents: function() {
            var changes = {
                answer_size:        this.propagateChanges(this.record, 'answer_size', true),
                MaxChars:           this.propagateChanges(this.record, 'MaxChars', true),
                ShowToolbar:        this.propagateChanges(this.record, 'ShowToolbar', true),
                MathFieldKeyboard:  this.propagateChanges(this.record, 'MathFieldKeyboard', true),
                textEditor:         this.propagateChanges(this.record, 'textEditor', true)
            };

            this.model = this.screen.components.props.startEditing(this.record, changes);

            this.model.on('change:answer_size', this.onAnswerSizeChange, this);
            this.model.on('change:ShowToolbar', this.resetProps, this);
            this.model.on('change:MaxChars', this.onMaxCharsChange, this);
        },

        onAnswerSizeChange: function f1119() {
            repo.startTransaction({ appendToPrevious: true });
            repo.updateProperty(this.config.id, 'MaxChars', Constants.editor[this.record.data.answer_size].MaxChars);
            repo.updateProperty(this.config.id, 'ShowToolbar', Constants.editor[this.record.data.answer_size].ShowToolbar);
            repo.updateProperty(this.config.id, 'disabledMaxChars', Constants.editor[this.record.data.answer_size].disabledMaxChars)
            repo.updateProperty(this.config.id, 'disabledShowToolbar', Constants.editor[this.record.data.answer_size].disabledShowToolbar)
            repo.endTransaction();
            //render the changed size of the text editor
            this.stage_view.render();

            //reset the props view
            this.resetProps();
        },

        onMaxCharsChange: function() {
            if (!parseInt(this.record.data.MaxChars) || this.record.data.MaxChars < 1 || this.record.data.MaxChars > Constants.editor[this.record.data.answer_size].MaxChars) {
                repo.startTransaction({ appendToPrevious: true });
                this.model.set('MaxChars', Constants.editor[this.record.data.answer_size].MaxChars);
                repo.endTransaction();
            }
        },

        maximumChars: function() {
            return Constants.editor[this.record.data.answer_size].MaxChars;
        },

        resetProps: function f1120() {
           this.view.render();
           events.fire('setActiveEditor', this);
           this.registerEvents();
        }


	}, {type: 'TextEditorEditor',
        defaultRepoData: function() {
            return {
                "ignore_defaults": true,
                "title":"short Answer text editor",
                "disableDelete":true,
                "answer_size":"Word",
                "MaxChars": 15,
                "disabledMaxChars": true,
                "disabledShowToolbar": true,
                "displayFieldSize":true,
                "ShowToolbar": false,
                "MathFieldKeyboard": false,
                "allowedSizes": [ { "value": "Letter", "text": "Letter" },
                    { "value": "Word", "text": "Word" },
                    { "value": "Line", "text": "Line" }
                ]
            }
        }
    });

	return TextEditorEditor;

});
