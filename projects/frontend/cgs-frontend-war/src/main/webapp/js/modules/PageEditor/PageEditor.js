define(['BaseContentEditor', './config', './PagePropsView', './PageStageView', 'ebookPlayer', 'assets', 'dialogs', 'types',
		'lessonModel', 'editMode', 'repo', 'repo_controllers', 'events', 'teacherGuideComponentView', 'StandardsList',
		'standardsModel', 'restDictionary', 'clipboardManager', 'VirtualPageManager', './EmbeddedHotspotLimiter', 'preview',
		'commentsComponent','cgsUtil'],
	function (BaseContentEditor, config, PagePropsView, PageStageView, ebookPlayer, assets, dialogs, types,
	          lessonModel, editMode, repo, repo_controllers, events, teacherGuideComponentView, StandardsList,
	          standardsModel, restDictionary, clipboardManager, VirtualPageManager, EmbeddedHotspotLimiter, preview, commentsComponent, cgsUtil) {
		'use strict';
		var _self = '';
		var PageEditor = BaseContentEditor.extend({

			initialize: function (configOverrides) {
				this._super(config, configOverrides);
				_self = this;

				this.currentT2kHotspotEmbedded = this.getT2kEmbeddedCount();

				this.t2kHotSpotEmbeddedLimit = require('userModel').account.elementsLimit.maxEmbeddedInteractionsOnPage;

				this.getEbookName(function() {
					this.view = new PagePropsView({controller: this});
					this.stage_view = new PageStageView({controller: this});
					this.createPlayer();

					this.startPropsEditing();
					this.pageController = require("repo_controllers").get(this.record.id);

					EmbeddedHotspotLimiter.render(this.currentT2kHotspotEmbedded, this.t2kHotSpotEmbeddedLimit);

				}.bind(this));

				//initialize comments component that allows the user the add comments in the sequence editor
				this.commentsComponent = new commentsComponent({
					data: this.record.data.comments,
					parentRecordId: this.record.id,
					$parent: $(".commentsArea")
				});

				/*update the overlay element titles at page initialization, because that a overlay sequence
				can change its task type from the task screen, and then the data seved on the titles is not updated
				*/
				this.updateOvelayElementsTitleByIndex();

				require('publishModel').getLessonPublishedUrl(repo._courseId, lessonModel.getLessonId())
					.then(function() {
						events.fire('enable_menu_item', 'menu-button-share-a-link-lesson');
					}, function() {
						events.fire('disable_menu_item', 'menu-button-share-a-link-lesson');
					});
			},

			getT2kEmbeddedCount: function() {
				var t2khotSpots = repo.getChildrenByTypeRecursive(this.record.id, 'OVERLAY_DL_SEQUENCE');
				var counter = 0;
				t2khotSpots.forEach(function(item) {
					if (item.data.displayType == 'EMBEDDED') {
						counter++;
					}
				});
				return counter;
			},



			//get the ebook name async, in case we dont have the ebook in the lesson,
			//it might happen when pasting a page from a different lesson
			getEbookName: function (callback) {
				var lessonId = require('lessonModel').lessonId,
				 	//lessonElem = repo.get(lessonId),
				 	//lessonEbooks = lessonElem.data.eBooks,
					ebookId = this.record.data.eBookId,
					ebookRepo = repo.get(ebookId);
				// if no ebookId or it's an empty string, assume it's a virtual ebook.
				if (!ebookId || ebookId.length === 0) {
					this.ebookName = 'virtual';
					callback();
					return;
				}
				if (ebookRepo) {
					this.ebookName = ebookRepo.data.originalFileName;
					callback();
				} else {
					var self = this;
					var daoConfig = {
		                path: restDictionary.paths.GET_EBOOK_CONVERTED_PAGES,
		                pathParams: {
		                    publisherId : require('userModel').getPublisherId(),
		                    ebookId: ebookId
		                }
		            };
					require('dao').remote(daoConfig, function (response) {
						require("lessonModel").addLessonEbook(ebookId, response.originalFileName);
						//save eBook to repo
						repo.startTransaction();
						repo.set({
							type: "ebook",
							id: response.eBookId,
							parentId: "",
							data: {
								conversionLibrary: response.conversionLibrary,
								originalFileName: response.originalFileName
							},
							children: []
						});
						repo.endTransaction();
						self.ebookName = response.originalFileName;
						callback();
					}, function () {
						callback();
					});
				}
			},

			registerEvents: function () {
				this.bindEvents(
					{
						'new_lesson_item': {
							'type': 'register', 'func': function (args) {
								var parent = this.config.id;
								//add lo under lesson
								if (args.type === "lo") {
									parent = repo.getAncestorRecordByType(this.config.id, "lesson").id;
								}
								var itemConfig = _.extend({parentId: parent}, args);

								events.fire('createLessonItem', itemConfig);

							}, 'ctx': this, 'unbind': 'dispose'
						},
						'menu_page_item_delete': {
							'type': 'register',
							'func': function () {
								if(this.selectedOverlayId) {
									this.removeOverlayElement();
								} else {
									this.deleteItemAndUpdateEbooks(this.config.id);
								}
							},
							'ctx': this,
							'unbind': 'dispose'
						},
						'add_overlay': {
							'type': 'register',
							'func': this.openAddOverlayDialog,
							'ctx': this,
							'unbind': 'dispose'
						},
						'menu_overlay_delete': {
							'type': 'register',
							'func': this.removeOverlayElement,
							'ctx': this,
							'unbind': 'dispose'
						},
						'updateOverlayElement':{
							'type':'register',
							'func': this.updateOverlayElement,
							'ctx': this,
							'unbind':'dispose'
						},
						'new_t2k_interaction':{
							'type':'register',
							'func': this.addT2kHotspot,
							'ctx': this,
							'unbind':'dispose'
						}
					});
				var changes = {
					title: this.propagateChanges(this.record, 'title', true),
					teacherGuide: this.propagateChanges(this.record, 'teacherGuide', true)
				};

				this.model = this.screen.components.props.startEditing(this.record, changes);
			},

			host:  {
				api : function _api(data) {
					var apiMap = {
						'overlayElementUpdated': function (data) {
							console.log('overlayElementUpdated');
							require('router').activeEditor.overlayElementUpdated(data);
						},
						'overlayElementSelected': function (data) {
							console.log('overlayElementSelected');
							require('router').activeEditor.overlayElementSelected(data.overlay_element.id);
						},
						'overlayElementDeselected' : function(data) {
							require('router').activeEditor.overlayElementDeselected(data);
						},
						'playerOnKeypressed': function (data) {
							console.log('playerOnKeypressed');
							if (!editMode.readOnlyMode && data.event && data.event.keyCode === 46) {
								require('router').activeEditor.removeOverlayElement(data);
							}
						},
						'pageChanged': function () {
							console.log('pageChanged');
						},
						'saveState': function (data) {
							require('router').activeEditor.saveState(data);
						},
						'embedDlSequence': function (data) {
							console.log('embedDlSequence');
							require('router').activeEditor.embedDlSequence(data);
						},
						'pageRendered': function(data) {
							_self.currentPageStyleData = data.body;
							var html = _self.currentPageStyleData.width + " X " + _self.currentPageStyleData.height + " (W/H)";
							_self.currentPageStyleString = html;
							$("#ebook-page-props-size").html(html);
							_self.updateOverlayElementPosition(data.body);
						}
					};

					if (apiMap[data.action]) {
						apiMap[data.action].call(this, data.data);
					}
				}
			},

			createPlayer: function () {
				this.player = new ebookPlayer(this.host, this.stage_view.$('#dynamic-book-player-holder'));

				var self = this;
				var publisher = require('userModel').getAccount().accountId;
				var hackPath = 'cms/publishers/' + publisher;
				if (self.record.data.virtualData && !_.isEmpty(self.record.data.virtualData)) {
					var virtualPageManager = new VirtualPageManager();
					self.record.data.href = virtualPageManager.getVirtualPage(self.record.data.virtualData, self.record.data.href);
				}

				var ebookData = {
					//book_type: enums.BOOK_TYPE.ePub3,	//Book type from dbp.BOOK_TYPE enum. mandatory.
					book_title: this.ebookName,		//Book title - optional.
					/*
					 Table of contents is an array of json objects that represent a book page.
					 Each index of the array is the page number.
					 */
					pages: [{
						cid: self.record.id,
						href: self.record.data.href.startsWith('blob') ? self.record.data.href : hackPath + '/' + self.record.data.href,
						//thumbnail_url: 'http://localhost:8000/host-example/book/thumbnails/1.jpg',
						//full_text: 'This is the full text content of page number 1',
						title: self.record.data.title,
						overlayElements: self.createOverlaysData(),
						is_absolute_path: self.record.data.virtualData ? true : false
					}]
				};


				function disableNavigation() {
					self.player && self.player.api({
						action: 'disableNavigation',
						data: {},
						success: $.noop,
						error: $.noop
					});
				}

				function playEbook() {
					self.player && self.player.api({
						action: "play",
						data: {
							saveState: false,
							viewMode: 'NORMAL',
							sessionId: '',
							id: lessonModel.getLessonId(),
							data: ebookData,
							isReadOnly: editMode.readOnlyMode
						},
						success: function () {
							disableNavigation();
						},
						error: $.noop
					});
				}

				this.player.api({
					action: "init",
					data: {
						basePaths: {
							player: window.location.origin.toString() + '/cgs/client/player/scp/players/db/'+ window.scpConfig.dbVersion +'/player/index.html',
							assetsPath: assets.serverPath('/').replace(/^\/(?!\/)|\/$/g, ''),
							assetsBasePath: ''
						},
						viewMode: 'NORMAL',
						//TODO: hard coded.
						playerFormat: 'EDITOR',
						//TODO: check with Eyal (ebook)
						type: 'EBOOK',
						stageMode: 'SINGLE_PAGE',
						userInfo: {role: 'TEACHER'},
						saveState: false,
						useExternalMediaPlayer: false,
						disableInternalLinks: true,
						scale: 1,
						// All this other data in not in the document
						complay: true,
						locale: 'en_US',
						apiVersion: '1.0',
						loId: 'inst_s',
						isLoggingEnabled: true
					},
					success: playEbook.bind(this),
					error: $.noop
				});
			},

			openAddOverlayDialog: function (args) {

				var dialogConfig = {
					title: "ebook.addOverlay.dialog.title." + args.type,
					buttons: {
						cancel: {label: 'cancel'}
					},
					closeOutside: false,
					overlayType: args.type,
					showAddingType: args.show
				};

				events.once('onOverlayAdded', this.saveOverlayToRepo.bind(this));

				dialogs.create('addOverlay', dialogConfig, 'onOverlayAdded');
			},

			saveOverlayToRepo: function (response) {
				if (response && response.overlayType) {
					var overlayType = "OVERLAY_" + (response.type || response.overlayType);
					var nextOrder = repo.getMaxChildOrder(this.record.id, overlayType) + 1;
					var template = {
						"type": overlayType,
						"parentId": this.record.id,
						"children": [],
						"data": {
							"overlayType": response.overlayType,
							"overlayOrder": nextOrder,
							"overlaySrc": response.path,
							"displayType": (response.displayType || "EMBEDDED"),
							"embeddedUrl": response.embeddedUrl,
							"width": response.size && response.size.width,
							"height": response.size && response.size.height,
							"positionX": 0,
							"positionY": 0,
							"teacherGuide": null,
							"selectedStandards": []
						}
					};
					_self.pageController.selectedOverlayId = this.createNewItem(template);

					amplitude.logEvent('Add ' + require("cgsUtil").getAmplitudeValue("overlayType", response.overlayType), {
		                "Course ID" : repo._courseId,
						"Lesson ID" :require("lessonModel").getLessonId(),
		                "Type" : require("cgsUtil").getAmplitudeValue("format", "EBOOK")
					});
					this.overlayElementSelected(_self.pageController.selectedOverlayId);
				}
			},

			renderNewItem: function (elemId) {
				var record = repo.get(elemId);
				var self = this;

				this.player.api({
					action: 'addOverlayElement',
					pageId: record.parent,
					data: {
						id: record.id,
						presentation: {
							type: record.data.displayType,
							position: {
								"x": record.data.positionX,
								"y": record.data.positionY
							},
							size: {'width': record.data.width, 'height': record.data.height}
						},
						content: {
							type: record.data.overlayType,
							data: {
								resource: self.getResourceHref(record)
							}
						}
					},
					success: function (msg) {
						//update the overlay element with the parameters from the player- in case the size of the overlay changed due to "fit to page" functionality
						self.overlayElementUpdated(msg);
						console.log('addOverlayElement success', msg);
					},
					error: function (msg) {
						console.log('addOverlayElement error', msg);
					}
				});
			},

			updateOverlayElement: function (record) {
				var self = this;

				this.player.api({
					action: 'updateOverlayElement',
					pageId: record.parent,
					id: record.id,
					data: {
						presentation: {
							type: record.data.displayType,
							size: {
								'width': record.data.width,
								'height': record.data.height
							}
						},
						content: {
							type: record.data.overlayType,
							data: {
								resource: self.getResourceHref(record)
							}
						}
					},
					success: function (msg) {
						console.log('updateOverlayElement success', msg);
					},
					error: function (msg) {
						console.log('updateOverlayElement error', msg);
					}
				});
			},

			createOverlaysData: function () {
				var overlays_arr = [], record, overlay_data;

				this.record.children.forEach(_.bind(function _loop(child) {
					record = repo.get(child);
					if (record) {
						overlay_data = this.createOverlayElementData(record);
						overlays_arr.push(overlay_data);
					}
				}, this));

				return overlays_arr;
			},

			getResourceHref: function (record) {
				var href = record.data.sequenceResource
					|| ((record.data.embeddedUrl && record.data.embeddedUrl.length) ? record.data.embeddedUrl : false)
					|| record.data.overlaySrc;

				if(href && href.length) {
					href = href.replace(/^\/|\/$/g, '');
				}

				return href;
			},

			createOverlayElementData: function (record) {
				var href = this.getResourceHref(record);

				return {
					cid: record.id,
					presentation: {
						type: record.data.displayType,
						position: {
							x: record.data.positionX,
							y: record.data.positionY
						},
						size: {
							width: record.data.width,
							height: record.data.height
						}
					},
					content: {
						type: record.data.overlayType,
						data: {
							href: href
						}
					}
				};
			},

			refreshOverlayAfterUpdate: function (elementId) {
				var overlayEditor = repo_controllers.get(elementId);
				if(overlayEditor) {
					overlayEditor.refresh();
					overlayEditor.startEditing();
				}
			},

			initDLPlayerAfterUpdate: function (elementId, overlay_repo_data, new_overlay_repo, new_overlay_repo_data,
			                                   oldWidth, oldHeight, oldDisplayType, oldChildOrder) {
				if (overlay_repo_data.overlayType === "DL_SEQUENCE") {
					var sequenceId = overlay_repo_data.sequenceId || new_overlay_repo.children[0];
					var playerData = preview.players && preview.players[sequenceId];

					//when dl sequence overlay resized - re-render dl player
					if (oldWidth !== new_overlay_repo_data.width || oldHeight !== new_overlay_repo_data.height) {
						if (playerData && playerData.player) {
							playerData.player.players.dl.lastInitData.width = new_overlay_repo_data.width;
							playerData.player.players.dl.lastInitData.height = new_overlay_repo_data.height;

							var playConfig = {
								data: overlay_repo_data.convertedData || playerData.data[sequenceId].convertedData,
								id: sequenceId,
								state: null,
								width: new_overlay_repo_data.width,
								height: new_overlay_repo_data.height,
								firstTaskNumber: repo.childOrderByType(elementId)
							};

							preview.playSequence(playerData.player, playConfig);
						}
					}

					//when dl sequence displayType changed
					if ((oldDisplayType !== new_overlay_repo_data.displayType)) {
						//overlay icon terminate DL player
						if (new_overlay_repo_data.displayType === "ICON") {
							preview.terminatePlayer(sequenceId, $.noop);
						} else {
							//	overlay embedded init DL player
							this.embedDlSequence({
								hotspotId: elementId,
								selector: ".overlay_element[data-element-id='" + elementId + "'] .dl_sequence_container",
								sequenceCid: sequenceId
							});
						}
					}

					//when overlay order is changed call setTaskNumbering API
					var newChildOrder = repo.childOrderByType(elementId),
						firstTaskNumber, tasks, taskNumbering;
					if (oldChildOrder !== newChildOrder) {
						var  _loop_tasks = function(task, index) {
							taskNumbering.push(
								{"taskCid": task.id, "taskNumber": firstTaskNumber + index}
							);
						};

						//change task numbering of all DL players that page contains
						for (sequenceId in preview.players) {
							if (preview.players.hasOwnProperty(sequenceId)) {
								playerData = preview.players[sequenceId];
								firstTaskNumber = repo.childOrderByType(repo.getParent(sequenceId).id);
								tasks = repo.getChildren(sequenceId); taskNumbering = [];
								_.each(tasks, _loop_tasks);
								preview.setTaskNumbering(playerData.player, taskNumbering, $.noop);
							}
						}
					}
				}
			},

			overlayElementUpdated: function (data) {
				var overlay_element = data.overlay_element,
					elementId = overlay_element.id,
					overlay_repo_data = repo.get(elementId).data,
					oldDisplayType = overlay_repo_data.displayType,
					oldChildOrder = repo.childOrderByType(elementId),
					oldWidth = overlay_repo_data.width,
					oldHeight = overlay_repo_data.height;

				repo.updateProperty(elementId, 'displayType',
					(overlay_element.presentation.display_type === 1) ? "EMBEDDED" : "ICON");

				this.currentT2kHotspotEmbedded = this.getT2kEmbeddedCount();
				EmbeddedHotspotLimiter.render(this.currentT2kHotspotEmbedded, this.t2kHotSpotEmbeddedLimit);

					if (overlay_element.presentation.size) {
					repo.updateProperty(elementId, 'width', overlay_element.presentation.size.width);
					repo.updateProperty(elementId, 'height', overlay_element.presentation.size.height);
				}

				repo.updateProperty(elementId, 'positionX', overlay_element.presentation.position.x);
				repo.updateProperty(elementId, 'positionY', overlay_element.presentation.position.y);
				_self.updateOverlayOrder();

				var new_overlay_repo = repo.get(elementId);
				var new_overlay_repo_data = new_overlay_repo.data;

				this.initDLPlayerAfterUpdate(elementId, overlay_repo_data, new_overlay_repo, new_overlay_repo_data,
					oldWidth, oldHeight, oldDisplayType, oldChildOrder);

				this.refreshOverlayAfterUpdate(elementId);
			},

			updateOverlayElementPosition: function (pageData) {
                var page = repo.get(this.record.id);
                var self = this;
                for (var i = 0 ; i < page.children.length; i++) {
                    var overlayElement = repo.get(page.children[i]);
                    if (overlayElement.type == "OVERLAY_DL_SEQUENCE") {
                    	updateOverlay(overlayElement);
                    }
                }

				function updateOverlay(overlay_element) {
					var elementId = overlay_element.id,
						overlay_repo_data = repo.get(elementId).data,
						oldDisplayType = overlay_repo_data.displayType,
						oldChildOrder = repo.childOrderByType(elementId),
						oldWidth = overlay_repo_data.width,
						oldHeight = overlay_repo_data.height,
						changeX = false,
						changeY = false,
						pageHeight = pageData.height,
						pageWidth = pageData.width,
						overlayX = overlay_repo_data.positionX,
						overlayY = overlay_repo_data.positionY,
						overlayWidth = overlay_repo_data.width,
						overlayHeight = overlay_repo_data.height;

					if (overlayX != 0 && overlayX + overlayWidth > pageWidth) {
						var differenceX = overlayX + overlayWidth - pageWidth;
						var newOverlayX = Math.max(overlayX - differenceX - 22, 0);
						changeX = true;
					}
					if (overlayY != 0 && overlayY + overlayHeight > pageHeight) {
						var differenceY = overlayY + overlayHeight - pageHeight;
						var newOverlayY = Math.max(overlayY - differenceY - 27, 0);
						changeY = true;
					}

					if (changeX || changeY) {
						repo.startTransaction();
						if (changeX) {
							repo.updateProperty(elementId, 'positionX', newOverlayX);
						} else {
							newOverlayX = overlayX;
						}
						if (changeY) {
							repo.updateProperty(elementId, 'positionY', newOverlayY);
						} else {
							newOverlayY = overlayY;
						}
						var $overlayElement = $(self.pageController.player.player.innerPlayer.$iframe[0].contentDocument);
						var overlayElement = $overlayElement.find("[data-element-id='" + elementId + "']");
						if (overlayElement) {
							overlayElement.css("top", newOverlayY + "px");
							overlayElement.css("left", newOverlayX + "px");
						}
						self.updateOverlayOrder();
						var new_overlay_repo = repo.get(elementId);
						var new_overlay_repo_data = new_overlay_repo.data;
						self.initDLPlayerAfterUpdate(elementId, overlay_repo_data, new_overlay_repo, new_overlay_repo_data,
							oldWidth, oldHeight, oldDisplayType, oldChildOrder);
						self.refreshOverlayAfterUpdate(elementId);
						repo.endTransaction();
					}
				}
			},

			overlayElementSelected: function (overlayElementId) {
				var elemId = overlayElementId;
				var record = repo.get(elemId),
					elementType = record.type,
					elementEditorType = types[elementType].editor,
					elementConfig = {
						"id": record.id,
						"bindEvents": true,
						"children": record.children,
						"screen": this.config.screen,
						"previewMode": true
					};

				// load overlay editor, so we can edit its props
				var overlayEditor = require('router').loadModule(
					elementEditorType, elementConfig, false, types[elementType].prefix || null, types[elementType].loadOptions);
				if(overlayEditor.startEditing) {overlayEditor.startEditing();}

				events.fire('setMenuButtonState', 'menu-button-delete-overlay',
					editMode.readOnlyMode ? 'disable' : 'enable');

				//set clipboard focus on overlay element
				clipboardManager.setFocusItem({
					id: record.id
				});

				//save referance to the overlay element in focus.
				//get the context from the repocontrollers because that the current "this" is not the most recent, (it was binded to "this " in the begining of the page initialization
				var page = repo.getAncestorRecordByType(elemId, "page");
				if (page) {
					var pageId = page.id;
					var pageController = require("repo_controllers").get(pageId);
					if (pageController) {
						pageController.selectedOverlayId = elemId;
					}
				}
			},

			overlayElementDeselected: function (data) {
				//if this is selected overlay - deselect it
				if(data.overlay_element.id !== this.selectedOverlayId) {
					return;
				}
				var page_editor = require('repo_controllers').get(data.overlay_element.page_id);
				page_editor.startEditing();
				require('publishModel').getLessonPublishedUrl(repo._courseId, lessonModel.getLessonId())
					.then(function() {
						events.fire('enable_menu_item', 'menu-button-share-a-link-lesson');
					}, function() {
						events.fire('disable_menu_item', 'menu-button-share-a-link-lesson');
					});

				page_editor.selectedOverlayId = null;

				events.fire('setMenuButtonState', 'menu-button-delete-overlay', 'disable');

				//set clipboard focus back to page
				clipboardManager.setFocusItem({
					id: data.overlay_element.page_id
				});
			},

			removeOverlayElement: function () {
				var activeOverlayElement = repo.get(this.selectedOverlayId);
				var pageId = this.record.id;
				var _self = this;

				if (!activeOverlayElement || activeOverlayElement.type === 'page') {
					return;
				}

				this.player.api({
					action: 'removeOverlayElement',
					pageId: activeOverlayElement.parent,
					data: activeOverlayElement.id,
					success: function (msg) {

						console.log('removeOverlayElement success', msg);
						repo.remove(activeOverlayElement.id);
						var page_editor = require('repo_controllers').get(pageId);
						page_editor.selectedOverlayId = null;
						page_editor.startEditing();
						events.fire('setMenuButtonState', 'menu-button-delete-overlay', 'disable');

						_self.currentT2kHotspotEmbedded = _self.getT2kEmbeddedCount();
						EmbeddedHotspotLimiter.render(_self.currentT2kHotspotEmbedded, _self.t2kHotSpotEmbeddedLimit);
						_self.updateOverlayOrder();

						preview.terminatePlayer(activeOverlayElement.data.sequenceId, function () {
							//set clipboard focus back to page
							clipboardManager.setFocusItem({
								id: pageId
							});
						});
					},
					error: function (msg) {
						console.log('removeOverlayElement error', msg);
					}
				});
			},

			startPropsEditing: function () {
				this.view.initTemplate(); //default tab
				this.view.render();

				this.view.setInputMode();
				if (this.model) {
					this.model.off();
				}


				this.registerEvents();

				this.teacherGuideComponent = new teacherGuideComponentView({
					el: '.teacherGuide-placeholder',
					data: this.model.get('teacherGuide'),
					title: 'teacherGuide',
					column_name: 'teacherGuide',
					update_model_callback: _.bind(function f995(data) {
						this.model.set('teacherGuide', data);
					}, this)
				});

				if (this.enableStandards) {
					this.standardsList = new StandardsList({
						itemId: '#standards_list',
						repoId: this.record.id,
						getStandardsFunc: function f997() {
							return standardsModel.getStandards(this.record.id);
						}.bind(this)
					});
				}
			},

			saveState: function (data) {
				console.log(data);
			},

			addT2kHotspot: function(args) {
				var self = this;
				if (window.customizationPackLoading) {
					require('busyIndicator').start();
					require('busyIndicator').setData(require('translate').tran("customization.pack.is.loading.message"));
					(function() {
						var intervalId = setInterval(function() {
							if (!window.customizationPackLoading) {
								clearInterval(intervalId);
								require('busyIndicator').stop();
								self.addT2kHotspotWait.call(self, args);
							}
						}, 500);
					})();
				} else {
					this.addT2kHotspotWait.call(self, args);
				}
			},

			addT2kHotspotWait: function (args) {

				if (args && args.taskTemplatePath) {



					repo.startTransaction();

					var overlayType = "OVERLAY_DL_SEQUENCE";
					var nextOrder = repo.getMaxChildOrder(this.record.id, overlayType) + 1;
					var overlaySequenceTemplate = {
						"type": overlayType,
						"parentId": this.config.id,
						"children": [],
						"data": {
							"overlayType": 'DL_SEQUENCE',
							"overlayOrder": nextOrder,
							"sequenceResource": '',
							"displayType": "ICON",
							"width": 0,
							"height": 0,
							"positionX": 0,
							"positionY": 0,
							"teacherGuide": null,
							"selectedStandards": []
						}
					};


					var overlayId = this.createNewItem.call(this, overlaySequenceTemplate);

					var sequenceTemplate = {
						type: 'sequence',
						parentId: overlayId,
						children: [],
						data: {
							exposure: "all_exposed",
							type: "simple"
						}
					};

					var overlaySequenceId = this.createNewItem.call(this, sequenceTemplate, true);

					repo.updateProperty(overlayId, 'sequenceResource', 'sequences/' + overlaySequenceId, false, true);

					var taskEditor = require(args.taskTemplatePath);
					var taskTemplate;
					if (taskEditor.template) {
						taskTemplate = taskEditor.template;
					} else if (taskEditor.templates) {
						taskTemplate = taskEditor.templates[args.type];
					}

					var taskConfig = {
						"parentId": overlaySequenceId,
						"template": taskTemplate
					};

					var taskId = repo.addTemplate(taskConfig);
					//add property "displayInOverlayScreen" in order for the task to be opened in a "popup" screen
					repo.updateProperty(taskId, "displayInOverlayScreen", true);

					this.updateOverlayOrder();
					repo.endTransaction();

					require("router").load(taskId);
				}
			},

			/*update the overlay elements order in the children array of the page, the sorting order is: position y -> position x */
			updateOverlayOrder: function () {

				var sortedChildren = (repo.getChildren(this.record.id)).sort(function (a, b) {

					if (a.data.positionY > b.data.positionY) {
						return 1;
					}
					if (a.data.positionY < b.data.positionY) {
						return -1;
					}
					if (a.data.positionY === b.data.positionY) {
						if (a.data.positionX === b.data.positionX) {
							return 0;
						}
						if (a.data.positionX > b.data.positionX) {
							return 1;

						}
						if (a.data.positionX < b.data.positionX) {
							return -1;
						}
					}
				});

				repo.updateProperty(this.record.id, 'children', _.pluck(sortedChildren, 'id'), true, true);

				this.updateOvelayElementsTitleByIndex();
			},

			embedDlSequence: function (data) {
				//	hotspotId: "4b6b1088-53ce-4d3a-b976-b69ec0f1c93a"
				//	selector: ".overlay_element[data-element-id="4b6b1088-53ce-4d3a-b976-b69ec0f1c93a"] .dl_sequence_container"
				//	sequenceCid: "44979f94-3f3a-4a42-85b9-27011af94669"
				this.isDLPlayer = true;
				var cgsModel = require('cgsModel');

				var seqId = data.sequenceCid || repo.get(data.hotspotId).children[0],
					_response = cgsModel.convertRepoData({'seqId': seqId, "type": "sequence"}),
					hotspot_data = repo.get(data.hotspotId).data,
					hotspot_order = repo.childOrderByType(data.hotspotId),
					selectedLocale = require("courseModel").getCourseLocale();

				var playerElm = this.player && this.player.parent.children()[0];
				if(playerElm && playerElm.contentDocument) {
					preview.playDl({
						parent: playerElm.contentDocument.querySelector(data.selector),
						width: (hotspot_data.width || 1024),
						height: (hotspot_data.height || 768),
						data: _response.data,
						seqId: seqId,
						localeNarrations: [selectedLocale],
						playerConfig: {"isEbook": true, "isEmbeddedInContent": true, "firstTaskNumber": hotspot_order}
					});
				}
				playerElm = null;
			},

			updateOvelayElementsTitleByIndex : function(){
				var currentMapping = {};
				var page = repo.get(this.record.id);
				repo.startTransaction();
				for (var i = 0 ; i < page.children.length; i++) {
					var overlayElement = repo.get(page.children[i]);
					var title;
					var currentMappingKey = overlayElement.type;

					switch(overlayElement.type){
						case 'OVERLAY_EXTERNAL_URL' :
							title = overlayElement.data.overlaySrc;
						break;

						case 'OVERLAY_DL_SEQUENCE':
							var sequence = repo.get(overlayElement.children[0]);
							var task = repo.get(sequence.children[0]);
							currentMappingKey = overlayElement.type +"."+ task.type;

							/*there is not break here, because that the overlay sequence and the overlay element
							share the same functionality*/
						default:
							currentMapping[currentMappingKey] = currentMapping[currentMappingKey] ? currentMapping[currentMappingKey] +1 : 1;
							title = require("translate").tran("overlay.title." +currentMappingKey).format(currentMapping[currentMappingKey]);

					}
					repo.updateProperty(overlayElement.id, "title", title, null, true);
				}
				repo.endTransaction();
			},

			dispose: function _disposePageEditor() {
				if(this.teacherGuideComponent) {this.teacherGuideComponent.dispose();}
				if(this.standardsList) {this.standardsList.dispose();}

				// dispose of comment component
				this.commentsComponent && this.commentsComponent.dispose();
				delete this.commentsComponent;

				var fncSuper = _.bind(this._super, this);

				function onDlPlayerTerimaned() {
					this.player && this.player.api({
						action: 'terminate',
						success: $.noop,
						error: $.noop
					});

					this.endEditing();
					this.unbindEvents('dispose');
					fncSuper();
				}

				preview.terminatePlayers(_.bind(onDlPlayerTerimaned, this));
			}

		}, {type: 'PageEditor'});

		return PageEditor;

	});
