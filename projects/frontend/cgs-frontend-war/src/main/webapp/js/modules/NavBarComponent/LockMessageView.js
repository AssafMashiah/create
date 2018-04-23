define(['lodash','jquery', 'BaseView', 'events', 'repo', 'text!modules/NavBarComponent/templates/LockMessageView.html',
	'cgsUtil', 'editMode' ,'lockModel','types', 'courseModel'],
function(_,$, BaseView, events, repo, template, cgsUtil, editMode, lockModel, types, courseModel) {

	var SystemUsernames = {
		CLEANUP: "System.t2k.cleanup",
		PUBLISH: "System.t2k.publish",
		APPLETS: "System.t2k.applets",
		PACK: 	 "System.t2k.pack"		
	};

	var LockMessageView = BaseView.extend({

		className: 'lockingMessage ',
		tagName: 'div',

		initialize: function(options) {
			var _type;
			// this.dispose(); // clear previous events
			this.obj = this.options.obj;
			this.$parent = $('#lock_message_bar');
			if (this.isCourse()) {
				this.obj.isCourse = true;
			} else {
				this.obj.isCourse = false;
			}
			this.registerEvents();

			if (this.obj.isCourse) {
				_type = 'course';
			} else {
				if (['assessment', 'lesson'].indexOf(this.obj.type) !== -1) {
					_type = require('lessonModel').getLessonType(this.obj.id)
				} else {
					_type = require('lessonModel').getLessonType(repo.getAncestorRecordByType(this.obj.id, 'lesson').id);
				}
			}

			if((_type === 'course') || (this.obj.type !== _type)) {
				events.fire('get_locking_object', _type);
			}

		},

		registerEvents: function() {
			events.register('lock_ready', this.lock_ready, this);
			events.register('lock_course_success', this.onLockCourseSuccess, this);
			events.register('lock_lesson_success', this.onLockLessonSuccess, this);
		},

		dispose: function(){
			this.unbindEvents();
			events.fire( "dispose-cgs-hints" );
			this._super();
		},
		unbindEvents: function(){
			events.unbind('lock_ready', this.lock_ready, this);
			events.unbind('lock_course_success', this.onLockCourseSuccess, this);
			events.unbind('lock_lesson_success', this.onLockLessonSuccess, this);

		},

		render: function(showContainer) {

			this._super(template);
			this.$parent.html(this.el);
			
			events.fire("checkPermissions", "navigation_bar", this);
			events.fire( "init-cgs-hints" );

			this.showContainer(!this.notPermitted && showContainer);

		},

		disableEditBar: function f950(v) {
			this.notPermitted = !v;
			this.showContainer(v);
		},

		bindClickOnLock: function() {
			$("#button_lock").click(_.bind(function(event) {
				if (this.isCourse()){
					// If course content changed, re-open it before lock
					cgsUtil.lockActiveCourse();
				} else {
					var lessonType = require('lessonModel').getLessonType(this.obj.type == 'lesson' ? this.obj.id : null);
					cgsUtil.lockActiveLesson(lessonType);
				}
				//update lock aquire date only after user clicks on 'enable editing' button
				require('lockModel').updateAquireDate = true;
				this.$el.parent().addClass('waiting');

			},this));
		},

		lock_ready: function(lockingObject){
			this.removeWateClass();

			if(this.isCourse() && (lockingObject.entityType && ['LESSON', 'ASSESSMENT'].indexOf(lockingObject.entityType.toUpperCase()) !== -1 )){
				return; //locking of lesson in courseScreen is handled by LessonTable component.
			}
			
			switch(lockingObject.lockStatus){

				case (lockModel.config.LOCK_TYPES.UNLOCKED):

					if(!editMode.readOnlyMode){
						events.fire('readonly_mode', true);
					}
					
					this.obj.ReadOnly = false;
					
					this.render(true);

					this.bindClickOnLock();

				break;

				case (lockModel.config.LOCK_TYPES.LOCKED_OTHER):
					
					if(!editMode.readOnlyMode){
						events.fire('readonly_mode', true);
					}

					this.obj.ReadOnly = true;
					this.obj.userName = lockingObject.lockingUser;
					this.obj.aquireDate = lockingObject.aquireDate;

					// Turn on publish in progress message
					this.obj.publishInProgress = (lockingObject.lockingUser == SystemUsernames.PUBLISH);

					this.render(true);

					this.bindClickOnLock();

				break;

				case (lockModel.config.LOCK_TYPES.LOCKED_SELF):
					if(!this.isCourse()){
						this.onLockLessonSuccess();
					}else{
						this.onLockCourseSuccess();
					}

				break;
			}

		},

		showContainer: function(toShow){
			$("#navbar_base_wrapper #lock_message_bar")[toShow ? 'slideDown' : 'slideUp'](400, function(){
				events.fire( "init-cgs-hints" );
				events.fire('adjust_screen_height');
			});
		},

		removeWateClass: function () {
			this.$el.parent().delay(500).queue(function () {
				$(this).removeClass('waiting').dequeue();
			});
		},

		onLockCourseSuccess: function(){
			this.removeWateClass();
			if(editMode.readOnlyMode){
				events.fire('readonly_mode', false);
			}
			this.showContainer(false);
		},

		onLockLessonSuccess: function(){
			this.removeWateClass();
			if(this.isCourse()){
				return; //locking of lesson in courseScreen is handled by LessonTable component.
			}

			if(editMode.readOnlyMode){
				events.fire('readonly_mode', false);
			}
			this.showContainer(false);
		},

		isCourse: function(){
			var router = require("router");
            var courseLockScreens = [
                types["course"].screen,
                types["toc"].screen
            ];
			return ~courseLockScreens.indexOf(router.activeScreen.constructor.type);
		}

	}, {type: 'LockMessageView'});

	return LockMessageView;

});
