define(['lodash', 'jquery', 'BaseView', 'events','repo', 'text!modules/MenuComponent/templates/MenuComponentView.html',
	    'mustache', './constants', 'editMode', 'keyboardManager', 'userModel', 'courseModel', 'lessonModel', 'configModel',
		'publishModel', 'clipboardManager', 'lockModel', 'translate'],
function(_, $, BaseView, events,repo, template, Mustache, constants, editMode, keyboardManager, userModel, courseModel, lessonModel,
         configModel, publishModel, clipboardManager, lockModel, i18n) {

	var MenuComponentView = BaseView.extend({

		el: '#menu_base',
		
		courseReferencesMenuItem: {},

		initialize: function(controller) {
			this.shortcuts = [];
			this.userName = userModel.getUserName();
			this.publisherName = userModel.getPublisherName();
			this.accountMode = userModel.getAccountMode();
			this.showTrial = (this.accountMode === 'TRIAL')
			this.resizeCallback = this.onWindowResize.bind(this);
			this._super(controller);
			this.templates = this.controller.constants.templates;
			this.controller.bindEvents(
				{
					'setMenuButtonState' : {
							'type'	: 'register', 
							'func'	: this.setButton, 
							'ctx'	: this
					},
					'closeSubMenu': {
						'type': 'register',
						'func': this.closeSubMenu,
						'ctx': this
					},
					'end_load_of_menu': {
						'type': 'register',
						'unbind': 'never'
					},
					'openSubMenu': {
						'type': 'register'
					}
				}
			);
		},
		closeSubMenu: function () {
			$(".btn-group").removeClass('open');
			$("ul.scroll-opened").removeClass('scroll-opened');
		},

		menuRightInitialize:function f919() {
			// if case active editor not exsist return from function
			var router = require('router');
			// if (!router._static_data.activeType) {
			// 	return;
			// }

			var types = require('types'),
				// get typeRow from types configuration
				typesRow = types[router._static_data.activeType],
				tmpBttn;

			_.each(constants.menuRight, function f920(item, index) {
				// if exsist event and in config showpreview == true and menu item can be disabled
				if (!!item.event && (!item.canBeDisabled || (item.canBeDisabled && typesRow && typesRow.showpreview))) {
					this.enableMenuItem(item.id);

					tmpBttn = $("#" + item.id);
					tmpBttn.unbind('click');
					tmpBttn.click(function f921() {
						logger.audit(logger.category.GENERAL, 'User clicked on ' + item.id + ' button (event name ' + item.event + ')');
						events.fire(item.event);
					});

				} else {
					this.disableMenuItem(item.id);
				}
			}, this);
		},

		remove: function() {
			$("#menu_base").empty();
			$("#sub_menu_base").empty();
			this._super();
		},

		render: function() {
			this._super(template);

			this.startResizing = false;
			
			$(window).resize(this.resizeCallback);
		},

		onWindowResize: function f922(event) {
			event.preventDefault();
			event.stopPropagation();
			clearTimeout(this.timeoutId);
			if(!this.startResizing) {
				this.timeoutId = setTimeout(this.doneResizing.bind(this), 1);
			}

			return false;
		},

		doneResizing: function() {
			this.startResizing = true;
			this.controller.setItems(this.controller.extendedConfig, true, this.controller.menuInitFocusId);
			this.startResizing = false;
		},

		getMenuViewPortWidth: function() {
			return document.getElementsByClassName('screen-header')[0].scrollWidth;
		},
		removeMenusByFeatureFlags: function (menuItem) {
			//remove sub-menus according by feature flags
			menuItem.subMenuItems = _.reject(menuItem.subMenuItems, function (item) {
				//remove sub-menus according by feature flags
				item.subMenuItems = _.reject(item.subMenuItems, function (subItem) {
					//remove dropdown-menus according by feature flags
					subItem.dropDownItems = _.reject(subItem.dropDownItems, function (dropItem) {
						return dropItem.showFlag && !userModel.account[dropItem.showFlag];
					});

					return subItem.showFlag && !userModel.account[subItem.showFlag];
				});

				return item.showFlag && !userModel.account[item.showFlag];
			});
		},
		setItems: function(config, menuInitFocusId) {
			// save configuration
			this.menuItemsCfg = config;

			// clear menu
			this.undelegateEvents();
			this.setElement(document.getElementById('menu_base'));
			this.$el.children('#menu_left_panel').remove();

			this.menuItems= [];

			// create and append base menu (up menu)
			var left_panel = $('<div id="menu_left_panel"></div>');

			_.each(config, function f923(menuItem, index) {

				//remove menu according by feature flags
				if(menuItem.showFlag && !userModel.account[menuItem.showFlag]) {
					return;
				}

				this.removeMenusByFeatureFlags(menuItem);

				if(!!menuItem.notImplemented) {
					menuItem.disabled = true;
					menuItem.tooltip = menuItem.label + ' – ' + i18n.tran('Coming soon') + '…';
				}

				this.menuItems.push(menuItem);
				//set up the first level menu display

				$(Mustache.render(this.templates[menuItem.type], menuItem))
					.bind('click.menu', _.bind(function f924() {
						if (!menuItem.notImplemented && !menuItem.disabled) {
							logger.audit(logger.category.GENERAL, 'User clicked on ' + menuItem.id + ' button (event name ' + menuItem.event + ')');
							if (!!menuItem.event) {
								events.fire_with_lock(200, menuItem.event);
                            }

							if(menuItem.event !== "backToPreviousScreen") { //prevent menu rebuild on back from lesson to course
								if (this.controller.menuInitFocusId && this.controller.menuInitFocusId === menuItem.id) {
									return;
								}

								this.controller.menuInitFocusId = menuItem.id;
								this.openSubMenu(menuItem);

								this.doneResizing();
							}
						}

						events.fire('init-cgs-hints');
					},this))
					.appendTo(left_panel);

				this.bindShortcuts(menuItem);
			}, this);

			this.$el.append(left_panel);

			//open sub menu items for active menu item
			this.openSubMenu( this.getItemById(config, menuInitFocusId) );

			this.menuRightInitialize();

			events.fire('end_load_of_menu');
         
            events.fire ( 'init-cgs-hints' );
            events.fire( 'cgs-hints-align' );
		},

		bindShortcuts: function(menuItem) {
			if (menuItem.shortcut) {
				this.shortcuts.push(menuItem.shortcut);

				keyboardManager.addShortCut({
					shortcut: menuItem.shortcut,
					buttonId: menuItem.id
				});
			}

			_.each(menuItem.subMenuItems, this.bindShortcuts, this);
			_.each(menuItem.dropDownItems, this.bindShortcuts, this);
		},

		getItemById: function(config, id){
			if (!id)
				return config[0];

			return (_.where(config, {'id': id})[0]);
		},

		setButton: function(buttonId, action, params){
		
			var menuItem = function findButton(items, id) {
				var ret = _.find(items, { id: id });

				if (!ret && items && items.length) {
					for (var i = 0; i < items.length; i++) {
						ret = ret || findButton(items[i].subMenuItems, id);
					}
				} 

				return ret;
			}(this.menuItems, buttonId);

			if(menuItem){
				var $menuItem = $("#"+menuItem.id);
				switch(action){
					case 'select':
						$menuItem.addClass('selected');
					break;

					case 'unselect':
						$menuItem.removeClass('selected');
					break;

					case 'disable':
						$menuItem.attr('disabled', true)
                            .addClass("disabled")
                            .find("a")
                            .addClass("disabled")
                            .attr('disabled', true);

                        if ($menuItem.length) {
                            if ($menuItem.parent().hasClass('split')) {
	                            $menuItem.parent().addClass("disabled");
                                $('#'+ menuItem.id).parent().find(".split_caret").addClass("disabled");
                            }
                        }

                        if ($menuItem.next().hasClass('dropdown-menu')) {
                        	$("#" + menuItem.id).removeAttr('data-toggle');
                        }  

						if (params && params.unbindFunction) {
							if (params.functionToUnbind) {
								events.unbind(menuItem.event, params.functionToUnbind);
							} else {
								events.unbind(menuItem.event);
							}
						}
					break;

					case 'enable':
						$menuItem.attr('disabled', false)
                            .removeClass("disabled")
                            .find("a")
                            .removeClass("disabled")
                            .attr('disabled', false);

                        if ($menuItem.length) {
                            if ($menuItem.parent().hasClass('split')) {
	                            $menuItem.parent().removeClass("disabled");
                                $('#'+ menuItem.id).parent().find(".split_caret").removeClass("disabled");
                            }
                        }

                        if ($menuItem.next().hasClass('dropdown-menu')) {
                        	$("#" + menuItem.id).attr('data-toggle', "dropdown");
                        }  

						var eventsConf = {};
						eventsConf[menuItem.event] = {};

						if (params && params.bindFunction) {
							eventsConf[menuItem.event] = {'type':'bind', 'func': params.functionToBind , 'ctx':this, 'unbind':'dispose'};
							this.controller.bindEvents(eventsConf);
								// events.bind(menuItem.event, params.functionToBind);
						} else if (params && params.registerFunction) {
							eventsConf[menuItem.event] = {'type':'register', 'func': params.functionToBind , 'ctx':this, 'unbind':'dispose'};
							this.controller.bindEvents(eventsConf);
								// events.register(menuItem.event, params.functionToBind);
							}
					break;

					case 'changeLabel':
						if(params&& params.label){
							$("#"+menuItem.id +" label").text(params.label).attr('title',params.label);
						}
						break;
					case 'setValue':
						var el = $menuItem;
						if (!el.find('span').length) {
							el.addClass('btn-link-title');
							el.html('<span class="btn-span-title"></span>');
						}
						el.find('span').text(params.value);
						el.attr('title', params.value);
						break;
				}

			}
		},

		clearSubMenu: function(){
			$('#sub_menu_base').html('');
		},

		showActiveTab: function(menuItem){
			this.$('.btn').removeClass(constants.activeTabClass);
			this.$('#' + menuItem.id).addClass(constants.activeTabClass);
		},

		checkTVNarrationType: function() {
			return (this.controller.screen.activeContentEditor.record.data.narrationType != "2"); //Narration type per paragraph
		},
		
		handleMenuItem:function f925(rec) {

            var mode = lessonModel.isLessonModeAssessment() ? "lessonModeAssessment" : "lessonModeNormal";
			if (!!rec.notImplemented) {
				rec.tooltip = rec.label + ' – ' + i18n.tran('Coming soon') +'…';
			} else {
				rec.tooltip = rec.label;
			}

			var courseIncludeLoLevel = (repo.get(courseModel.courseId)) ? repo.get(courseModel.courseId).data.includeLo : false;
			var recDisabled = ((!!editMode.readOnlyMode && !!rec.canBeDisabled) || !!rec.notImplemented  || rec.default_display == 'disabled');
			rec.disabled = (rec.event == "references_course") ?
				(this.controller.getCourseReferencesCount() === 0) : recDisabled;

			if (rec.event == "references_course") {
				this.courseReferencesMenuItem = rec;
			}

			if (rec.event == "toc_new") {
				rec.disabled = rec.disabled || require("courseModel").checkMaxDepth();
			}

			// Disable toc delete button if not in toc editor
			if (rec.event == 'toc_del') {
				rec.disabled = rec.disabled || this.controller.router.activeEditor.constructor.type != 'TocEditor';
			}

			// Disable save course button if dirty flag is false
			if (rec.event == 'course_save') {
				rec.disabled = rec.disabled || !courseModel.getDirtyFlag();
			}

			// Disable comments button on lessons, lo's and 'diff sequences parent' and pages
			if (rec.event == 'addComment') {
				rec.disabled = rec.disabled || ['lesson', 'quiz', 'lo', 'differentiatedSequenceParent', 'page']
						.indexOf(this.controller.router.activeRecord.type) !== -1;
			}

			if (~['menu-button-from-file', 'menu-button-new-url', 'menu-button-new-differentiated', 'menu-button-new-separator', 'menu-button-reference-sequence'].indexOf(rec.id)) {
				rec.disabled = rec.disabled || ~['QuizEditor'].indexOf(this.controller.router.activeEditor.constructor.type) ||
					(this.controller.router.activeEditor.constructor.type === "SequenceEditor" &&
					repo.get(this.controller.router.activeEditor.record.parent) &&
					repo.get(this.controller.router.activeEditor.record.parent).type === 'quiz');
			}

			// Disable save lesson button if dirty flag is false
			if (rec.event == 'lesson_save') {
				rec.disabled = rec.disabled || !lessonModel.getDirtyFlag();
			}

			if (rec.id == 'menu-button-new-lo'){
				rec.disabled = rec.disabled || !courseIncludeLoLevel;
			}

			if (rec.id === 'menu-button-new-quiz') {
				rec.disabled = rec.disabled || !courseIncludeLoLevel || ~['LoEditor', 'QuizEditor','SequenceEditor', 'DifferentiatedSequenceEditor', 'SeparatorEditor'].indexOf(this.controller.router.activeEditor.constructor.type) || !!repo.getChildrenByTypeRecursive(this.controller.router.activeEditor.record.id, 'quiz').length;
			}

			// Disable sequence group insert button if in lesson editor and lo level is included in the course
			if (rec.id == 'menu-button-new-sequence_group' || rec.isSequencePlugin) {
				if (courseIncludeLoLevel) {
					rec.disabled = rec.disabled || this.controller.router.activeEditor.constructor.type == 'LessonEditor'
						|| !!this.controller.router.activeEditor.differentiatedSequenceStage;
				} else {
					rec.disabled = rec.disabled || !!this.controller.router.activeEditor.differentiatedSequenceStage;
				}
			}
			//enable insert tasks, compare and convert menu only for sequence editor
			if (['sequence-insert-menu', 'menu-button-compare', 'convert-group',
					'menu-button-new-header', 'menu-button-new-questionOnly', 'menu-button-new-MC',
					'menu-button-new-freeWriting', 'menu-button-new-shortAnswer', 'menu-button-new-applet-task',
					'menu-button-new-cloze', 'menu-button-new-matching', 'menu-button-new-sorting',
					'menu-button-new-sequencing'].indexOf(rec.id) >= 0) {
				rec.disabled = rec.disabled || (['sequence', 'page'].indexOf(this.controller.router.activeEditor.elementType) < 0);
			}

			//enable insert interations, overlays menu only for page editor
			if (['menu-button-new-image', 'menu-button-new-audio-player', 'menu-button-new-video',
					'menu-button-new-link', 'menu-button-new-t2k', 'menu-button-new-applet'].indexOf(rec.id) >= 0) {
				rec.disabled = rec.disabled ||
				(['LessonEditor', 'LoEditor'].indexOf(this.controller.router.activeEditor.constructor.type) > -1);
			}

			//allow adding page under lo / or under lesson(in a course without lo)
			if (["menu-button-new-blank-page", "menu-button-upload-page"].indexOf(rec.id) > -1) {
				if (courseIncludeLoLevel) {
					rec.disabled = rec.disabled || this.controller.router.activeEditor.constructor.type == 'LessonEditor';
				}
			}

			// Disable separator insert button if in lesson editor and lo level is included in the course
			if (rec.id == 'menu-button-new-separator') {
				if (courseIncludeLoLevel) {
                    //disable new separator button if the current editor is lesson Editor or lesson is in assessment mode
					rec.disabled = rec.disabled || this.controller.router.activeEditor.constructor.type == 'LessonEditor'
                        || mode == 'lessonModeAssessment' || this.controller.router.activeEditor.differentiatedSequenceStage ||

                        (this.controller.router.activeEditor.constructor.type === "SequenceEditor" && repo.get(this.controller.router.activeEditor.record.parent).type === 'quiz');
				}
				else {
                    //disable new separator button if the lesson is in assessment mode
					rec.disabled = rec.disabled ||  mode == 'lessonModeAssessment' || this.controller.router.activeEditor.differentiatedSequenceStage;
				}
			}

            if (rec.id == 'menu-button-new-sequence') {
                if (courseIncludeLoLevel) {
                    //disable new sequence button if the current editor is lesson Editor and lesson is not in assessment mode
                    rec.disabled = rec.disabled || (this.controller.router.activeEditor.constructor.type == 'LessonEditor' &&
                        mode != 'lessonModeAssessment')|| this.controller.router.activeEditor.differentiatedSequenceStage ;
                }
            }

			if (rec.event == 'menu_lesson_item_delete') {
				switch (this.controller.router.activeEditor.constructor.type) {
					// Disable delete button if in lesson editor
					case 'LessonEditor':
						rec.disabled = true;
						break;
					// Disable delete button if its differentiation level sequence
					case 'SequenceEditor':
						rec.disabled = rec.disabled || !!this.controller.router.activeEditor.record.data.diffLevel;
						break;
				}
			}

			if (rec.event == 'menu_page_item_delete' && this.controller.router.activeEditor.constructor.type == 'LessonEditor') {
				rec.disabled = true;
			}

			if (rec.event == 'new_differentiated_sequence') {
				var levels = courseModel.getDifferentiationLevels();
				rec.disabled = rec.disabled || !levels || !levels.length;
			}
			if (rec.event == 'reference-sequence') {
				var parent = repo.get(this.controller.router.activeEditor && this.controller.router.activeEditor.record && this.controller.router.activeEditor.record.parent);
				rec.disabled = !userModel.account.enableHiddenLessons ||
					(this.controller.router.activeEditor.constructor.type === "SequenceEditor" &&
					parent && parent.type === 'quiz') ||
					~['QuizEditor'].indexOf(this.controller.router.activeEditor.constructor.type);
			}

			// Update compare button state according to current mode
			if (rec.event == 'compare_items') {
				rec.disabled = rec.disabled || this.controller.router.activeEditor.compareDisabled;
			}

			if (rec.event == 'tts_report' && courseModel.courseId) {
				var locale = repo.get(courseModel.getCourseId()).data.contentLocales[0];
				rec.disabled = rec.disabled || !require('ttsModel').isTtsServiceEnabledByLocale(locale);
			}

			//Disable insert narration if Text Viewer narration type is not "Per Paragraph"
			if (rec.event == "insertNarration") {
				rec.disabled = this.checkTVNarrationType();
			}

			// Disable publish button if course locked by someoneElse
			if (rec.event == 'course_publish') {
				rec.disabled = rec.disabled || !publishModel.isPublishEnabled();
			}

			if (rec.event == 'cut_item') {
				rec.disabled = rec.disabled || !clipboardManager.isCutEnabled();
			}

			if (rec.event == 'copy_item') {
				rec.disabled = rec.disabled || !clipboardManager.isCopyEnabled();
			}

			if (rec.event == 'paste_item') {
				rec.disabled = rec.disabled || !clipboardManager.isPasteEnabled();
			}
	
			if (rec.event == "handle_reconvert_event" || rec.event == "revert_sequence") {
				var activeEditor = this.controller.router.activeEditor;

				if (activeEditor && activeEditor.record && activeEditor.record.type === "sequence" && !activeEditor.record.data.isPdfConverted) {
					rec.disabled = true;
				} else {
					rec.disabled = !!editMode.readOnlyMode;
				}
			}

			if (rec.event == "pdf_convert_sequence" || rec.event == "html_sequence_del") {
				var activeEditor = this.controller.router.activeEditor;

				if (activeEditor && activeEditor.record && 
					(activeEditor.record.type === "sequence" && !activeEditor.record.data.isPdfConverted ||
					activeEditor.record.type == "html_sequence" && rec.event == "pdf_convert_sequence" && activeEditor.record.children.length)) {
					rec.disabled = true;
				} else {
					rec.disabled = !!editMode.readOnlyMode;
				}
			}

			if (rec.event == 'lesson_comments') {
				rec.disabled = rec.disabled || !lessonModel.hasComments();
			}

			if (rec.event == 'undo_action') {
				rec.disabled = rec.disabled || !require('undo').canUndo();
			}

			if (rec.event == 'redo_action') {
				rec.disabled = rec.disabled || !require('undo').canRedo();
			}

			if(rec.event === 'pdf_new') {
				rec.disabled = rec.disabled || !!editMode.readOnlyMode || !userModel.account.enablePdf2t2k;
			}

			if(rec.event === 'menu_overlay_delete') {
				var activeEditor = this.controller.router.activeEditor;
				if(activeEditor && activeEditor.constructor && activeEditor.constructor.type) {
					//if active editor is overlay or page with overlay selected enable delete
					if(activeEditor.constructor.type.startsWith("Overlay") ||
						activeEditor.selectedOverlayId != null) {
						rec.disabled = false;
					}
				}
			}

			if (window.customizationPackLoading) {
				events.fire('disable_menu_item', 'menu-button-export-as-course');
				events.fire('disable_menu_item', 'menu-button-new');
			}

			//disable the button if thenumber of pages in the lesson exeeded the maximum number allowed (defined in the super admin)
			if(rec.event == "create_blank_page"){
				if(!require("cgsUtil").canAddPagesToLesson(lessonModel.lessonId ,1)){
					rec.disabled = true;
					rec.tooltip = require("translate").tran("ebook.maximum.page.number.reached").format(require("userModel").account.elementsLimit.maxEBookPages);
				}else{
					rec.tooltip = require("translate").tran("ebook.lesson.menu.newPage.blank");

				}
			}

            this.handleEditMode(rec);
            this.handlePermissions();
		},
		
		handlePermissions: function f926() {
			events.fire("checkPermissions", "menu", this);
		},
		
		handleEditMode: function(rec) {
			var record = this.controller.router.activeEditor && this.controller.router.activeEditor.record;
			if (~['toc_new', 'toc_del'].indexOf(rec.event) && record && record.type === "course") {
				return;
			}

			// if (rec.event == 'toc_del') {
			// 	rec.disabled = rec.disabled || (this.partialEdit() && record && record.children.length > 0);
			// }

			//Edition button becomes enabled when the course is locked, published to production but not editioned
			if (['course_edition'].indexOf(rec.event) > -1) {
				rec.disabled =
					(lockModel.getLockingStatus("COURSE") != lockModel.config.LOCK_TYPES.LOCKED_SELF) ||
					(!courseModel.isPublishedToProduction() || courseModel.isEditioned());
			}
		},

		setExtraClass: function(subMenuItem){

			if(!subMenuItem.subMenuItems && subMenuItem.subMenuItems.length){ return;}

			var targetBttn;

			_.each(subMenuItem.subMenuItems, function(value, key){

				if(value.args && _.isObject(value.args[1])){
					targetBttn = $( '#'+ value.id);
					targetBttn.addClass(value.args[1].extraClass);
				}
			}, this);
		},

		//applying additional events to the menu/group or other parts of the
		setExtraEvent: function(subMenuItem){ 

			if (subMenuItem.args && subMenuItem.args.extraEvent) {

				var openScroll = function f927(json, key) {

						var scrollEl = $('#' + json.args.extraEvent[key].openScrollIdPrefix + json.id );

						scrollEl.attr({"class":json.args.extraEvent[key].class});
						// hides the scrolling by clicking on any place other than himself
						$(document).click(_.bind(function f928(event) {
							if (!$(event.target).parents("#" + json.id).length) {
								scrollEl.removeClass(json.args.extraEvent[key].class);
							}
						}, this));
					},
					helpers = {
						"effectsOpenScroll":openScroll,
						"stylesOpenScroll": openScroll
					},
					targetObj;

				_.each(subMenuItem.args.extraEvent, function(value, key){
					targetObj = $( '#'+ subMenuItem.id + ' ' + key);
					//handle mouse clicks
					targetObj.unbind('click');  //prevent multiple binding

					targetObj.click(_.bind(function f929(value) {
						if (!!targetObj.attr('disabled')) { return false; }
						helpers[value.event] && helpers[value.event].call(this, subMenuItem, key);
					}, this, value));

				}, this);
			}
		},

		openSubMenu : function(menuItem) {
			if(!!!menuItem) {
				return;
			}

			this.clearSubMenu();
			this.showActiveTab(menuItem);
			var repoItems = {};
			_.each(menuItem.subMenuItems, function(subMenuItem,index){
				this.menuItems.push(subMenuItem);
				repoItems.tab = subMenuItem.dropDownItems || subMenuItem.subMenuItems;
				repoItems.label = subMenuItem.label;
				repoItems.id = subMenuItem.id;

				_.each(repoItems.tab, function(rec, i){
					this.menuItems.push(rec);
					this.handleMenuItem(rec);

					rec.dropDownArr = []; rec.numOfDropDowns = 0;
					rec.dropDownArrLevel2 = []; rec.numOfDropDownsLevel2 = 0;
					if (rec.dropDownItems && rec.dropDownItems.length) {
						_.each(rec.dropDownItems, function f930(dropdownMenuItem, i) {
							rec.dropDownArrLevel2 = [];
							rec.dropDownArr.push(dropdownMenuItem);
							this.handleMenuItem(dropdownMenuItem);
							this.menuItems.push(dropdownMenuItem);

							if(dropdownMenuItem.dropDownItems) {
								dropdownMenuItem.dropDownArrLevel2 = dropdownMenuItem.dropDownItems;
								dropdownMenuItem.numOfDropDownsLevel2 = dropdownMenuItem.dropDownArrLevel2;
                                _.each(dropdownMenuItem.dropDownItems, _.bind (function f931(dropdownMenuItem2, i) {
                                    this.handleMenuItem(dropdownMenuItem2);
                                },this));
							}

						}, this);

						rec.numOfDropDowns = rec.dropDownArr.length;
					}

				}, this);

				$(Mustache.render(this.templates[subMenuItem.type], repoItems)).appendTo($('#sub_menu_base'));
				this.setEventToItems(repoItems.tab);

				// apply additional events to the menu / group or other parts of the
				this.setExtraEvent(subMenuItem);
				// apply additional class to the menu / group or other parts of the
				this.setExtraClass(subMenuItem);

				var dropDownArr = $.map(_.pluck(subMenuItem.subMenuItems, 'dropDownArr'), function(n){  //get all dropdowns
					return n;
				});

				if(dropDownArr.length) {
					this.setEventToItems(dropDownArr);	//set events to dropdowns items
					_.each(dropDownArr,function(element,index) {
						if(!!element.dropDownItems) {
							this.setEventToItems(element.dropDownItems);
						}
					},this);
				}

			}, this);

			events.fire('openSubMenu');
		},

		setEventToItems:function f932(Items) {

			$(Items).each(function f933(index, item) {

				if (!!item.event) {

					// handle 'dontStealFocus'
					if (item.dontStealFocus) {
						$("#" + item.id).mousedown(function f934(e) {
							e.stopPropagation();
							return false;
						});
					}

					//handle mouse clicks
					$("#" + item.id).unbind('click');  //prevent multiple binding

					$("#" + item.id).on("click",_.bind(function f935(e) {
                        var $el = $("#" + this.id);
                        //for sub sub menus
						if (this.stopPropagation || ( (this.dropDownItems) && (this.dropDownItems.length) )) {
							e.stopPropagation();
						}
                        if ($el.attr('disabled')) {//&& !$(e.target[id='menu-button-insert-af']).length > 0
                            return false;
                        }
                        logger.audit(logger.category.GENERAL, 'User clicked on ' + this.id + ' button (event name ' + this.event + ')');
                        if (this.withoutLock) {
                        	events.fire(this.event, $.extend({'id':this.id},this.args));
                        }
                        else {
                        	events.fire_with_lock(300, this.event, $.extend({'id':this.id},this.args));
                        }

                    }, item));
					
				}
			}.bind(this));
		},

        disableMenuItem : function(menuItemsIds) {
        	
        	if(_.isEmpty(menuItemsIds)) {
                return ;
            }
            
            if (!_.isArray(menuItemsIds)) {
                menuItemsIds = [menuItemsIds];
            }

	        var $menuItem;
            _.each(menuItemsIds ,function f936(itemId){
	            $menuItem = $('#'+ itemId);
	            $menuItem.addClass('disabled').attr('disabled', '');

				if ($menuItem.length) {
                	if ($menuItem.parent().hasClass('split')) {
		                $menuItem.parent().addClass("disabled");
		                $menuItem.parent().find(".split_caret").addClass("disabled");
					}
				}
			});
		},

		enableMenuItem : function(menuItemsId) {
			if(_.isEmpty(menuItemsId)) {
                return ;
            }
            if (!_.isArray(menuItemsId)) {
                menuItemsId = [menuItemsId];
            }

			var $menuItem;
            _.map(menuItemsId,function f937(itemId){
	            $menuItem = $('#'+ itemId);
	            $menuItem.removeClass('disabled').removeAttr('disabled');

                if ($menuItem.length) {
                	if ($menuItem.parent().hasClass('split')) {
		                $menuItem.parent().removeClass("disabled");
		                $menuItem.parent().find(".split_caret").removeClass("disabled");
					}
				}
            });
		},

		enableCourseReferences : function() {
			this.courseReferencesMenuItem.disabled = false;
			this.enableMenuItem(this.courseReferencesMenuItem.id);
			$('#'+ this.courseReferencesMenuItem.id).attr('data-toggle','dropdown');
		},

		dispose: function(){
			_.each(this.shortcuts, keyboardManager.removeShortcut.bind(keyboardManager));

			$(window).unbind('resize', this.resizeCallback);
			this.undelegateEvents();

			this._super();

			delete this.shortcuts;
		}

	}, {type: 'MenuComponentView'});

	return MenuComponentView;

});