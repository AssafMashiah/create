define(['BaseContentEditor', './config', './DifferentiatedSequencePropsView', './DifferentiatedSequenceStageView', 'events', 'repo', 'validate'],
    function f736(BaseContentEditor, config, DifferentiatedSequencePropsView, DifferentiatedSequenceStageView, events, repo, validate) {

        var DifferentiatedSequenceEditor = BaseContentEditor.extend({

            initialize: function f737(configOverrides) {

                this._super(config, configOverrides);

                this.view = new DifferentiatedSequencePropsView({controller: this});
                this.stage_view = new DifferentiatedSequenceStageView({controller: this});

                this.registerEvents();

                //this.showStagePreview($('#stage_base'), {bindTaskEvents: true, bindEvents: false, stagePreviewMode: 'small'});

                this.view.setInputMode();
            },

            startPropsEditing: function() {
                // prevent super start editing
            },

            registerEvents: function f738() {

                var changes = {
                        title: this.propagateChanges(this.record, 'title', validate.requiredField, true),
                    },
                    newItemHandler = {'type': 'register', 'func': function f739(args) {
                        
                        //set parent of new created item to be the parent of current element 
                        var parentId = this.record.parent;

                        //in case we want to create a "Lo" item , his parent needs to bee the lesson element
                        if (args.type == "lo") {
                            var lessonParentRecord = repo.getAncestorRecordByType(this.record.id, "lesson");
                            parentId = lessonParentRecord.id;
                        }
                        var itemConfig = _.extend({parentId: parentId}, args);

                        events.fire('createLessonItem', itemConfig);
                    }, 'ctx': this, 'unbind': 'dispose'};

                this.bindEvents(
                    {
                        'menu_lesson_item_delete': {'type': 'register', 'func': function f740() {
                            events.fire('delete_lesson_item', this.config.id);
                        }, 'ctx': this, 'unbind': 'dispose'},
                        'new_lesson_item': newItemHandler,
                        'new_differentiated_sequence': { 'type': 'register', 'func': function f741() {
                            events.fire('createDifferentiatedSequence', this.record.parent, this);
                        }, 'ctx': this, 'unbind': 'dispose'},
                        'new_separator': { 'type': 'register', 'func': function (args) {
                            var itemConfig = _.extend({parentId: this.record.parent}, args);
                            events.fire('createSeparator', itemConfig);
                        }, 'ctx': this, 'unbind': 'dispose'}
                    });

                this.model = this.screen.components.props.startEditing(this.record, changes);

                this.model.on('change:title', function f742() {
                    if (!this.record.data.title) {
                        repo.startTransaction({ appendToPrevious: true });
                        repo.updateProperty(this.record.id, 'title', ' ');
                        repo.endTransaction();
                        events.fire('load', this.record.id);
                    }
                    this.stage_view.render.call(this.stage_view);
                }, this);

            }

        }, {type: 'DifferentiatedSequenceEditor'});

        return DifferentiatedSequenceEditor;

    });