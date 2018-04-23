define(['lockModel', 'BaseView', 'events', 'repo','courseModel' , 'lessonModel', 'dialogs',
    'text!modules/LessonsTableComponent/templates/TableRowView.html',
	'editMode', 'clipboardManager', './config', 'learningPathModel', 'translate'],
    function f843(lockModel, BaseView, events, repo, courseModel, lessonModel , dialogs, template,
              editMode, clipboardManager, config, learningPathModel, i18n) {

        var TableRowView = BaseView.extend({

            className: 'row-item',
            tagName: 'div',
            parentEl: '#lessons_list',
            removeElement: true,

            initialize: function f844(options) {

                this.template = template;
                this.obj = this.options.obj;
                this.is_sortable = true;
                this.is_published = !options._is_sortable;

                this._super(options);

                this.controller.editableLesson(null);
            },
            setEvents: function f845() {
                this.$el.delegate('.view_lesson', 'click', this.openLesson.bind(this));
                this.$el.delegate('.delete_lesson', 'click', this.onDeleteClicked.bind(this));
            },

            disableDeleteLesson: function f846() {
                this.$(".delete_lesson").addClass('disabled');
                this.$el.undelegate('.delete_lesson', 'click');
            },

            render: function f850(rerender) {
                this._super(this.template);

                this.el.setAttribute('id', this.obj.id);
				var type = "lesson";
				if (this.obj.data.mode == "assessment") {
					type = "assessment";
				} else if (this.obj.data.format == "EBOOK") {
					type = "ebook";
				} 
                this.$el.addClass(type);
                this.$el.addClass('is_sortable');
                if (this.is_published) {
                    this.$el.addClass('published');
                }
                this.$el.addClass(this.obj.data.isHidden ? 'hiddenLesson' : '');

	            //on re-render don't bind events and do element appending to parent
	            if(!rerender) {
		            // Set as focus item of clipboard
		            this.$el.click(_.bind(function f851() {
                        this.$el.parent().children().removeClass('focused');
			            this.$el.addClass('focused');

                        if (this.template != this.templateEditable) {
    			            clipboardManager.setFocusItem({
    				            id: this.obj.id,
    				            removeSelection: _.bind(function f852() {
    					            this.$el.removeClass('focused');
    				            }, this)
    			            });
    			            console.log('focus lesson');
                        }
		            }, this));

		            $(this.parentEl).append(this.el);

                    this.setEvents();
                }

                events.fire('checkPermissions', 'lesson_table_row_component', this);
            },

            disableButtons: function(disable) {
                this.$('.delete_lesson').attr('disabled', !!disable || editMode.readOnlyMode || courseModel.isElementPublished(this.obj.id) );
            },

            deleteLesson: function f857() {
                this.controller.setLessonId(this.obj.id);
                logger.audit(logger.category.COURSE, ['Delete ', lessonModel.getLessonType(this.obj.id), this.obj.id].join(' '));
                //learningPathModel.removeLesson(this.obj.id);
                this.controller.deleteLesson(this.obj.id);

                events.fire("init-cgs-hints");
            },

            openLesson: function f858() {
                this.controller.openLesson(this.obj.id, this.obj.parent);
            },

            onDeleteClicked: function f860(e) {
                this.displayDeleteDialog();
            },

            checkLockForDelete: function f861() {
                logger.debug(logger.category.COURSE, 'Trying to delete ' + lessonModel.getLessonType(this.obj.id) + ' ' + this.obj.id + ', checking lock');
                this.controller.setLessonId(this.obj.id);
                events.register('lock_ready', this.onLockStatusForDelete, this);
                events.fire('get_locking_object', lessonModel.getLessonType(this.obj.id));
            },

            onLockStatusForDelete: function f862(lockObject) {
                if (lockObject.lockStatus == lockModel.config.LOCK_TYPES.UNLOCKED) {
                    this.deleteLesson();
                } else if (lockObject.lockStatus == lockModel.config.LOCK_TYPES.LOCKED_SELF) {
                    events.fire("release_lock", lessonModel.getLessonType(this.obj.id), function() {
                        this.deleteLesson();
                    }.bind(this));
                } else {
                    logger.debug(logger.category.COURSE, 'Lesson can\'t be deleted - locked');
                    this.displayLockMessage(lockObject);
                }

                events.unbind('lock_ready', this.onLockStatusForDelete);

            },
            displayLockMessage: function f865(lockObject) {
                console.log("lesson Id: " + lockObject.entityId + " already locked by " + lockObject.lockingUser);

                var dialogConfig = {

                    title: "Cannot Edit Lesson",

                    content: {
                        text: "Sorry, the lesson is being edited by:< " + lockObject.lockingUser + " >",
                        icon: 'warn'
                    },

                    buttons: {
                        ok: { label: 'OK' }
                    }
                };

                var dialog = dialogs.create('simple', dialogConfig);
            },

            displayDeleteDialog: function f866(continueCallback) {
            	var inLearningPath = learningPathModel.includesLesson(this.obj.id);
            	var warningText = inLearningPath? i18n.tran('warning.learningpath.deletelesson') : 'Are you sure you want to delete this lesson?'
                var dialogConfig = {

                    title: "Delete Lesson",

                    content: {
                        text: warningText,
                        icon: 'warn'
                    },

                    buttons: {
                        "delete": { label: 'Delete' },
                        "cancel": { label: 'Cancel' }
                    }

                };

                events.once('onDeleteResponse', this.onDeleteResponse, this);

                var dialog = dialogs.create('simple', dialogConfig, 'onDeleteResponse');
            },

            onDeleteResponse: function f868(response) {

                amplitude.logEvent('Delete Conformation', {
                    "User decision": response,
                    Object : repo.get(this.obj.id).data.mode == "assessment" ? "Assessment" : "Lesson"
                });

                switch (response) {

                    case 'cancel' :

                        break;

                    case 'delete' :
                        lockModel.runWhenServerReady.call(this, this.checkLockForDelete.bind(this));

                        break;
                }
            },

            dispose: function() {

                this._super();
            }

        }, {type: 'TableRowView'});

        return TableRowView;

    });