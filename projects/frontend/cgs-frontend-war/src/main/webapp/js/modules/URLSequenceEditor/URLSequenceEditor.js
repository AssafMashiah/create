define(['jquery', 'BaseContentEditor', 'repo', 'events', './config', 'dialogs', 'commentsComponent',
    './URLSequencePropsView', './URLSequenceStageView', 'validate', 'keyboardManager', 'editMode', 'FileUpload', 'files', 'zip_js', 'busyIndicator'],
    function f1394($, BaseContentEditor, repo, events, config, dialogs, commentsComponent, URLSequencePropsView, URLSequenceStageView, validate, keyboardManager, editMode, FileUpload, files, ZipJS, busyIndicator) {

        var URLSequenceEditor = BaseContentEditor.extend({

            initialize: function f1395(configOverrides) {

                this._super(config, configOverrides);

                this.view = new URLSequencePropsView({controller: this});

                this.stage_view = new URLSequenceStageView({controller: this});
                this.stage_view.render();
                this.registerEvents();

                //initialize comments component that allows the user the add comments in the sequence editor
                this.commentsComponent = new commentsComponent({
                    data: this.record.data.comments,
                    parentRecordId: this.record.id,
                    $parent: $(".commentsArea")
                });
            },

            startPropsEditing: function() {
                // prevent super start editing
            },

            registerEvents: function f1396() {
                var changes = {
                        title: this.propagateChanges(this.record, 'title', validate.requiredField, true),
                        url: this.propagateChanges(this.record, 'url')
                    },
                    newItemHandler = {'type': 'register', 'func': function f1397(args) {

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

                this.bindEvents({
                    'menu_lesson_item_delete': {'type': 'register', 'func': function f1398() {
                        events.fire('delete_lesson_item', this.config.id);
                    },
                        'ctx': this, 'unbind': 'dispose'},
                    'new_lesson_item': newItemHandler,
                    'new_differentiated_sequence': { 'type': 'register', 'func': function f1399() {
                        events.fire('createDifferentiatedSequence', this.record.parent, this);
                    }, 'ctx': this, 'unbind': 'dispose'},
                    'new_separator': { 'type': 'register', 'func': function (args) {
                        var itemConfig = _.extend({parentId: this.record.parent}, args);
                        events.fire('createSeparator', itemConfig);
                    }, 'ctx': this, 'unbind': 'dispose'}

                });

                this.model = this.screen.components.props.startEditing(this.record, changes);

                this.model.on('change:url', _.bind(function f1400() {
                    if (this.record.data.url !== '' && /^(http|https)\:\/\/(www)?[\.a-zA-Z-0-9]+(\/.*)?/.test(this.record.data.url)) {
                        this.stage_view.update_iframe(this.record.data.url);
                    } else {
                        this.stage_view.update_iframe("about:blank");
                        require('showMessage').clientError.show({errorId: 'URL_VALIDATION_ERROR1'});
                    }
                }, this));
            },

            dispose: function() {
                this.commentsComponent && this.commentsComponent.dispose();

                this._super();

                delete this.commentsComponent;
            }

        }, {type: 'URLSequenceEditor'});

        return URLSequenceEditor;

    });