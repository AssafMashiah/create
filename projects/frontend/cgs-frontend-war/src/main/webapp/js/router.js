define(['backbone_super', 'lodash', 'load', 'types', 'events', 'repo', 'userModel', 'courseModel', 'editMode', 'cgsModel'],
function(Backbone, _,load, types, events, repo, userModel, courseModel, editMode, cgsModel) {

	var Router = Backbone.Router.extend({
		activeScreen: {/* nothing */},
		activeEditor: {/* nothing */},
		selectedEditor: {/* nothing */},

		routes: {
			'': 'default',
			'load/:id': 'load',
			'load/:id/:tab': 'load',
			'load/:id/:tab/:page': 'load'
		},

		initialize: function() {

			window.name = "CGS" ;

		},
		start: function (onStartLoad, onEndLoad) {

			if (onStartLoad && _.isFunction(onStartLoad)) {
				onStartLoad();
			}

			var self = this;

			// register initCGS event
			events.register('initCGS', function initCGS(){
				require('configModel').checkChromeVersion(function() {
					self.setLocalStorageAllocation(function() {
						Backbone.history.start();
						$(document).trigger('router.progress.dom_ready');
					});
				});
			});
			events.register('setSelectedEditor', this.setSelectedEditor, this);
			events.register('removeSelectedEditor', this.removeSelectedEditor, this);


            this.set_cookies();
		},
		setLocalStorageAllocation: function (callback) {
			var files = require('files');
			files.allocate(callback);
		},
		setTab: function setTab(tab, page /* optional */) {
			var idsForPath = [courseModel.courseId, tab];
			if (page != undefined){
				idsForPath.push(page);
			}
			logger.audit(logger.category.GENERAL, 'Router load: ' + idsForPath.join('/') + ' (course)');
			this.navigate('load/' + idsForPath.join('/'));
			this._static_data.courseTab = this._static_data.tab = tab;
			this._static_data.page = page;
		},

		"default": function defaultRoute() {
			logger.audit(logger.category.GENERAL, 'Router load: default route loaded (no id)');

			if(this._static_data.id) {
				this.reload();
			} else {
				this.removeSelectedEditor();

				// dispose active screen and editor (browser 'back' button bug) for preventing double events binding
				if (!!this.activeEditor) {
					if (typeof this.activeEditor.dispose === 'function') this.activeEditor.dispose();
				}

				if (!!this.activeScreen) {
					if (typeof this.activeScreen.dispose === 'function') this.activeScreen.dispose();
				}

				this.loadModule('CourseScreen', null, true);
			}
		},

		set_url_route: function () {
			var url = _.compact([this._static_data.id, this._static_data.tab, this._static_data.page]).join('/');

			if (url) {
				this.navigate('load/' + url);
			}
			else {
				this.navigate('');
			}
		},
		cookies: {},
		set_cookies: function () {
			this.cookies.cid = $.cookie('courseId');
			this.cookies.lid = $.cookie('lessonId');
		},
		set_unique_cookie: function (cookie, value) {
			$.cookie(cookie, value);
		},
		open_course_handler: function () {  //load course repo data
			var context = this;

			this.set_unique_cookie('courseId', context.cookies.cid);

			if(context.cookies.lid) { //lesson is not empty
				//Add cookie for lesson id and load lesson if not empty.
				context.set_unique_cookie('lessonId', context.cookies.lid);  //set lessonId cookie

				events.fire('close_course', function(){
					events.once('end_load_of_sequences', function() { //bind end_load_of_sequences event
						//after sequences ends to load, all lesson data inside the repo and we can load active object
						context.load(context._static_data.id, context._static_data.tab);
					});

					require("lessonModel").open(context.cookies.lid);        //load lesson data in repo
				});

			} else {  //load course or toc object
				context.load(context._static_data.id, context._static_data.tab, context._static_data.page);
			}

		},
		open_screen_by_cookies: function () {
			// Can't load objects if the repo is empty.
			if (repo.isEmpty() && !repo.busy()) {
				if (this.cookies.cid) { //after refresh we got course or lesson saved in cookies
					this.loadModule('CourseScreen', {'dontShowFirstScreenDialog' : true}, true);
					courseModel.openCourse(this.cookies.cid, function() {
						var openItem = repo.get(this._static_data.id),
							loadLesson = !openItem || ['course', 'toc'].indexOf(openItem.type) == -1;
						if(this.cookies.lid && repo.get(this.cookies.lid) && loadLesson) { //lesson is not empty - load lesson screen
							this.activeScreen && typeof this.activeScreen.dispose == 'function' && this.activeScreen.dispose();
							this.loadModule('LessonScreen', {'id' : this.cookies.lid}, true);
							$(document).trigger("router.progress.dom_ready");
						} else { //load course screen
							//Add option for silent start (without showFirstScreenDialog).
							this.cookies.lid = null;
						}

						this.open_course_handler.call(this);

					}.bind(this));
				}
				else {
					this.navigate('', {trigger: true});
				}

				return true;
			} else {
				return false;
			}
		},
		getActiveCourseTab: function () {
			return this._static_data.tab;
		},

		// returns the page indicating the specific location inside a specific tab
		getActiveCoursePage : function(){
			return this._static_data.page;
		},

		get_object_type_record: function (record) {
			if (!record) return false;

			var map = {
				'assets': types['assetsManager'],
				'narrations': types['narrationsManager'],
				'tts': types['ttsManager'],
				'comments': types['commentsReport'],
				'styleEditor' : {isCourse : true, type : types['styleEditor']}
			};

			if (map[this._static_data.tab]) {

				if(map[this._static_data.tab].isCourse){
					return map[this._static_data.tab].type;
				}else{
					this.loadLessonModel(this._static_data.id, this._static_data.tab);
					return map[this._static_data.tab];
				}
			} else {
				switch (record.type) {
					case 'sequence':
						if (record.data.type === "separator") return types[record.data.type];
						else return types[record.type];
					break;
					default:
						return types[record.type];
					break;
				}
			}
		},
		loadLessonModel: function () {
			var lessonModel = require("lessonModel");

			// Future design (for opening asset manager from course screen)
			if (!lessonModel.lessonId) { // Lesson not loaded
				return lessonModel.open(this._static_data.id, _.bind(function() { // Open lesson and reload the route
					this.load(this._static_data.id, this._static_data.tab);
				}, this), true);
			}
		},
		load_screen: function () {
			var activeScreen = this.activeScreen;
			
			if (this.activeScreen.constructor.type !== this._static_data.objectTypeRec['screen'] || 
                // al task screen rerender all the screen
				this.activeScreen.constructor.type === "TaskScreen") {

				// Reset readOnly flag on screen change
				if ((['CourseScreen', 'TocScreen'].indexOf(this.activeScreen.constructor.type) > -1 && this._static_data.objectTypeRec['screen'] == 'LessonScreen') ||
					(['CourseScreen', 'TocScreen'].indexOf(this._static_data.objectTypeRec['screen']) > -1 && this.activeScreen.constructor.type == 'LessonScreen')) {
					editMode.readOnlyMode = true;
				}
				
				if (typeof this.activeScreen.dispose === 'function') this.activeScreen.dispose();
				
				this.activeScreen = this.loadModule(this._static_data.objectTypeRec['screen'], {id: this._static_data.id}, true);
				$(document).trigger("router.progress.dom_ready");

            } else {
            	$(document).trigger("router.progress.complete");
            }

		},
        getConfigByEditor: function (callback) {
           var config = require('modules/' + this._static_data.objectTypeRec.editor + "/config");

           callback(config);
        },
		load_editor: function () {

			if(this.activeEditor) {
				if (typeof this.activeEditor.dispose === 'function') this.activeEditor.dispose();
			}
			// update current editor of router and screen
            var options = null;

            this.activeEditor = this.loadModule(this._static_data.objectTypeRec.editor, 
            					{'screen': this.activeScreen, id: this._static_data.id}, 
            					false, this._static_data.objectTypeRec.prefix || null, this._static_data.objectTypeRec.loadOptions);

            if (this.activeEditor && this.activeEditor.record && this.activeScreen && this.activeScreen.constructor.type != 'TaskScreen') {
				require('clipboardManager').setFocusItem({id: this.activeEditor.record.id});
            }

            this.activeScreen.editor = this.activeEditor;

            events.fire('load', this._static_data.id);
		},
		_static_data: {},
		load: function(id, tab /* optional */, page /* optional */) {
			var record = repo.get(id),
				recType = record && record.type,
				recTitle = record && record.data && (record.data.title || '').substr(0, 50);
			logger.audit(logger.category.GENERAL, 'Router load: ' + _.compact(_.toArray(arguments)).join('/') + ' (' + recType + ' - ' + recTitle + ')');

			this.removeSelectedEditor();

			$(document).unbind("router.progress.complete");

			this._static_data.id = id;
			this._static_data.tab = tab;
			this._static_data.page = page;

			this.set_url_route();

			if (this.open_screen_by_cookies()) return true;
			

			this.activeRecord = record;


			if(record) {
                this._static_data.activeType = record.type; //through an exception if record not exists
				//separator spacial case
				this._static_data.objectTypeRec = this.get_object_type_record(record);
			} else if (repo.get(require('lessonModel').lessonId)) {
				this.load(require('lessonModel').lessonId);
				return;
			} else {
				return;
			}

			$(document).bind("router.progress.complete",_.bind(this.load_editor, this));

			this.load_screen();
		},

		reload: function() {
			this.load(this._static_data.id, this._static_data.tab, this._static_data.page);
		},

		/* 
			pathPrefix is for loading sub-folder modules inside the modules root 
			example:
				modules/ConvertEditors/*

			the prefix is define inside the types.js file
		*/
		loadModule: function(modName, config, setActive, pathPrefix, options) {

			config = _.extend(config || {}, {router: this});


			var mod = new (load(modName, pathPrefix, options))(config);
			
			if (setActive) {
				this.activeScreen = mod;
			}

			return mod;
		},

		setSelectedEditor: function(editor) {
			if (!!this.selectedEditor && typeof this.selectedEditor.removeSelected === 'function')
				this.selectedEditor.removeSelected();
			this.selectedEditor = editor;

			// Set focus item for clipboard
			if (editor && editor.record && editor.record.id != this.activeEditor.record.id) {
				require('clipboardManager').setFocusItem({id: editor.record.id});
			}

			if (editor && editor.pluginClassManagerInstance && editor.record && typeof editor.pluginClassManagerInstance.invoke == 'function') {
				editor.pluginClassManagerInstance.invoke(editor.record.id, 'onSelected');
			}
		},

		removeSelectedEditor: function() {
			if (!!this.selectedEditor && typeof this.selectedEditor.removeSelected === 'function')
				this.selectedEditor.removeSelected();
			this.selectedEditor = null;
		},

		startEditingActiveEditor: function() {
			this.activeEditor.startEditing && this.activeEditor.startEditing();
		}


	});

	/* global events */
	events.register('load');


	return new Router();

});
