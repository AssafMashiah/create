define(['BaseScreen', 'events', 'repo', 'files', 'assets', 'courseModel', 'userModel', 'lessonModel', 'configModel',
		'./CourseScreenView', './config', './constants', 'dialogs', 'cgsUtil', 'busyIndicator', 'importLessonUtil', 'editMode', 'clipboardManager', 'validateUtil', 'Notifications'],
	function f558(BaseScreen, events, repo, files, assets, courseModel, userModel, lessonModel, configModel, CourseScreenView, config,
	              constants, dialogs, cgsUtil, busy, importLessonUtil, editMode, clipboardManager, validateUtil, Notifications) {

		var CourseScreen = BaseScreen.extend({

			initialize: function f559(configOverrides) {
				this._super(config, configOverrides);
				this.initView();
				this.registerEvents();
				this.dontShowFirstScreenDialog = !!this.config.dontShowFirstScreenDialog;

				if (!courseModel.courseId) {
					//on "Landing" - the showFirstScreenDialog is called.
					this.showFirstScreenDialog();
				}

				var lockModel = require('lockModel');

				if (lessonModel.lessonId) {
					var itemType = lessonModel.getLessonType();

					// Save clipboard data to memory
					require('clipboardManager').saveClipboard();

					// Fire release lesson only if locked by this user.
					if (lockModel.getLockingStatus(itemType) == lockModel.config.LOCK_TYPES.LOCKED_SELF) {
						events.fire('release_lock', itemType);
						if(require('PermissionsModel').permissions['edit_course'] !== false) {
							events.fire('lock', 'course');
						}
					}

					// Delete lesson's children from the repo.
					repo.startTransaction({ignore: true});
					lessonModel.remove();
					repo.endTransaction();
				} else if(courseModel.courseId &&
					lockModel.getLockingStatus('course') !== lockModel.config.LOCK_TYPES.LOCKED_SELF) {
						//if course os open and not locked, try to take lock
						cgsUtil.lockActiveCourse();
				}
			},

			initView: function () {
				this.view = new CourseScreenView({controller: this});
			},

			registerEvents: function f560() {

				this.bindEvents({
					'newCourse': {
						'type': 'register',
						'func': function (format) {
							cgsUtil.unsavedCourseNotification(function () {
								cgsUtil.openNewCourseDialog(format);
							});
						},
						'ctx': cgsUtil,
						'unbind': 'dispose'
					},
					'importEpub': {
						'type': 'register',
						'func': function () {
							cgsUtil.unsavedCourseNotification(function () {
								cgsUtil.openImportEpubDialog();
							});
						},
						'ctx': cgsUtil,
						'unbind': 'dispose'
					},
					'course_edition': {
						'type': 'register', 'func': function f562() {
							cgsUtil.unsavedCourseNotification(cgsUtil.showNewEditionDialog);
						},
						'ctx': this, 'unbind': 'dispose'
					},
					'course_open': {
						'type': 'register', 'func': function f563() {
							this.dontShowFirstScreenDialog = false;
							cgsUtil.unsavedCourseNotification(this.showFirstScreenDialog.bind(this, true));
						},
						'ctx': this, 'unbind': 'dispose'
					},
					'course_save': {
						'type': 'register', 'func': this.saveCourse,
						'ctx': this, 'unbind': 'dispose'
					},
					'course_save_as': {
						'type': 'register', 'func': cgsUtil.openCourseSaveAsDialog,
						'ctx': cgsUtil, 'unbind': 'dispose'
					},
					'import_lesson': {
						'type': 'register', 'func': this.importLessonNew,
						'ctx': this, 'unbind': 'dispose'
					},
					'importCourse': {
						'type': 'register', 'func': this.importCourse,
						'ctx': this, 'unbind': 'dispose'
					},
					'export_course': {
						'type': 'register', 'func': this.exportCourse,
						'ctx': this, 'unbind': 'dispose'
					},
					'toc_new': {
						'type': 'register', 'func': this.createTOC,
						'ctx': this, 'unbind': 'dispose'
					},
					'toc_del': {
						'type': 'register', 'func': this.deleteTOC,
						'ctx': this, 'unbind': 'dispose'
					},
					'cgs_new': {
						'type': 'register', 'func': function f616() {
							cgsUtil.unsavedCourseNotification(_.bind(this.createCgsNew, this));
						},
						'ctx': this, 'unbind': 'dispose'
					},
					'load': {
						'type': 'bind', 'func': this.load,
						'ctx': this, 'unbind': 'dispose'
					}
				});
			},
			exportCourse: function f565() {
				require('courseModel').exportCourse();
			},
			importCourse: function f566() {
				require('courseModel').importCourse();
			},
			load: function f567(id) {
				this.components.tree.load(id);
				this.components.navbar.load(id);
			},
			importLesson: function () {
				//TODO: Change this
				var tocId = this.router.activeEditor.record.id,
					self = this;
				function hasLessonFocus() {
					var repo_item = repo.get(clipboardManager.focusItem);

					return !!repo_item && repo_item.type === 'lesson';
				};

				function importLessonStart(lessonId) {
					if (lessonId) {
						var lesson = repo.get(lessonId);
						var type = lesson.data.mode === 'assessment' ? 'assessment' : 'lesson';
					}

					function loadToc() {
						require('router').load(tocId, courseModel.courseId == tocId ? 'lessons' : '');
						events.unbind('lock_course_success', this);
						events.unbind('lock_ready', this);
					}

					importLessonUtil.start({
						tocId: tocId,
						completeCallback: function () {
							courseModel.openCourse(courseModel.courseId, function f568() {
								events.once('lock_course_success', loadToc);
								events.once('lock_ready', loadToc);
								events.fire('lock', 'course');

								if (lessonId) {
									events.fire('release_lock', type, function () {
										// Revert lessonId in lessonModel - We only needed it to acquire lock
										lessonModel.setLessonId(null);
									});
								}
							})
						}
					});
				};

				function getFocusLessonLock(lessonId) {
					if (~[1, 2].indexOf(clipboardManager.clipboardMode)) {
						clipboardManager.clear();

						return importLessonStart();
					}

					// Do we have an import in progress
					var isImportInProgress = false;

					/*
					 Import lesson and overwrite selected lesson
					 @lessonId lesson id to overwrite
					 */
					function importLessonOverwriteSelectedLesson(lessonId) {
						// If there's no import in progress
						if (!isImportInProgress) {
							// Set import in progress
							isImportInProgress = true;
							// Start import dialog and later overwrite currently selected lesson
							importLessonStart(lessonId);
							// Remove overwritten lesson from repo
							repo.removeChildren(lessonId);
						}
					}

					function lockFailed(lockData) {
						events.unbind('lock_lesson_success', lockSuccess, this);
						if (lockData.lockStatus === 'self') {
							importLessonOverwriteSelectedLesson(lessonId);
							return;
						}

						dialogs.create('simple', {
							title: "Lock warning",
							content: {
								text: "Lesson is locked",
								icon: 'warn'
							},
							buttons: {
								'cancel': {label: 'close', value: true}
							}
						});

						// Revert lessonId in lessonModel - We only needed it to acquire lock
						lessonModel.setLessonId(null);
					};

					function lockSuccess() {
						events.unbind('lock_ready', lockFailed, this);
						importLessonOverwriteSelectedLesson(lessonId);
					};

					// Set lessonModel.lessonId to the selected lesson temporarily in order to acquire lock.
					// Later we'll revert it.
					lessonModel.setLessonId(lessonId);
					// Register lock failure handler
					events.once('lock_ready', lockFailed, this);
					// Register lock success handler
					events.once('lock_lesson_success', lockSuccess, this);
					// Notify lock model to acquire lock of the currently selected lesson - It will be overwritten by imported lesson
					events.fire("lock", lessonModel.getLessonType(lessonId), lessonId);

				}

				// If a lesson is selected in the lesson list
				if (hasLessonFocus()) {
					// Import will overwrite the selecte lesson, so acquire lock of the lesson to overwrite
					getFocusLessonLock(clipboardManager.focusItem);
				} else { // !hasLessonFocus()
					// import will add the lesson at the end of the lesson list
					importLessonStart();
				}
			},
			importLessonNew: function() {
                importLessonUtil.openImportModal();
            },

			createNewCourse: function f570() {
				events.fire('close_course', function f571() {

					var newCourse = $.extend(true, {}, constants().new_course);

					newCourse.data.contentLocales = [userModel.account.contentLocales.selected];
					newCourse.data.publisher = userModel.getPublisherName(); // userModel.account.publisherId + '';
					newCourse.data.cgsVersion = configModel.getVersion();
					newCourse.data.author = userModel.getUserName();

					newCourse.data.cid = repo.genId(); //content id

					courseModel.newCourse(newCourse, undefined, function () {
						var activeCourseId = courseModel.getCourseId();
						var onModifiedCallback = function () {
							// this will never happen with a new course
						};
						var onNoModifiedChangesCallback = function () {
							events.fire('lock', 'course');
						};
						courseModel.onModified(activeCourseId, onModifiedCallback.bind(this), onNoModifiedChangesCallback.bind(this));

					}.bind(courseModel));
				});// close current course
			},

			saveCourse: function f572() {
				if (courseModel.getDirtyFlag()) {
					$.when(validateUtil.validate({
							id: repo._courseId,
							type: 'course'
						}))
						.done(function (validationState) {
							if (validationState == validateUtil.ValidationStates.APPROVED) {
								busy.start();

								courseModel.saveCourse(function f573() {
									courseModel.setDirtyFlag(false);
									busy.stop();
								});

							}
						}.bind(this));

				}
			},

			createTOC: function f574() {
				repo.startTransaction();
				var parent = this.editor.config.id,
					child = repo.set({
						type: 'toc',
						parent: parent,
						children: [],
						data: {
							title: require('translate').tran('New TOC ')
						}
					}),
					record = repo.get(parent);

				var children = require('cgsUtil').cloneObject(record.children);
				children.push(child);
				repo.updateProperty(record.id, 'children', children, true);
				repo.endTransaction();

				this.router.load(child);
			},

			deleteTOC: function f575() {
				//check if node is not the root node (the course)
				if (repo.get(this.editor.config.id).type != 'course') {
					cgsUtil.deleteNotification(_.bind(this.deleteItem, this), this.editor.config.id, "TOC");
				}
			},

			showFirstScreenDialog: function showFirstScreenDialog(isOpenModeOnly) {

				if (!!this.dontShowFirstScreenDialog) { //after refresh we don't want to show the first screen
					return;
				}

				var dialogConfig = {
					title: 'create.product.name',
					closeOutside: false,
					isOpenModeOnly: isOpenModeOnly,
					buttons: {
						open: {label: 'Open', value: null, canBeDisabled: true},
						cancel: {label: 'Cancel'}
					}
				};

				events.once("onNewAndOpenCourseResponse", this.onFirstScreenResponse.bind(this));
				dialogs.create('openAndNewCourse', dialogConfig, 'onNewAndOpenCourseResponse');
			},

			onFirstScreenResponse: function f582(returnValue, response) {
				switch (response) {

					case 'cancel' :
					{
						/////////////////////////
						// do nothing
						/////////////////////////
						break;
					}
					case 'open' :
					{
						cgsUtil.onOpenCourseChosen(returnValue);
						break;
					}
					case 'new_course' :
					{
						cgsUtil.openNewCourseDialog();
						break;
					}
					case 'cgs_new' :
					{
						this.importCourse();
						break;
					}
					case 'import_epub' :
					{
						cgsUtil.openImportEpubDialog();
						break;
					}
				}
			}

		}, {type: 'CourseScreen'});

		return CourseScreen;

	});