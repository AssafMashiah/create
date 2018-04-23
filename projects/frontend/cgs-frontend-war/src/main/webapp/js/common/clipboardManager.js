define(['events', 'repo', 'router'], function (events, repo) {

	// Private variables
	var CUT_MODE = 1,
		COPY_MODE = 2;
	
	/*************************/
	/*** Private functions ***/
	/*************************/

	// Bind clipboard events
	function bindEvents() {
		events.register('cut_item', function() { setClipboardItem(CUT_MODE); }, clipboardManager);
		events.register('copy_item', function() { setClipboardItem(COPY_MODE); }, clipboardManager);
		events.register('paste_item', paste, clipboardManager);
		events.register('setCutGUIToLessonRow');
	}

	// Save focused item to clipboard with relevant mode (cut or copy)
	function setClipboardItem(mode) {
        require("router").activeScreen.editor.endEditing();
		clipboardManager.clipboardItem = clipboardManager.focusItem;
		clipboardManager.clipboardMode = mode;
        clipboardManager.clipboardItemParentType = repo.get(repo.get(clipboardManager.focusItem).parent).type;

        // Memory cleaned on each cut/copy, it's only for copy from one lesson to another
		clipboardManager.memory = null;

		// change GUI(class name) for cut item
		setGUIforCutItem();

		events.fire('setMenuButtonState', 'menu-button-paste', clipboardManager.isPasteEnabled() ? 'enable' : 'disable');
	}

	// change GUI(class name) for cut item
	function setGUIforCutItem(){
		
		var tmpFocusItem = repo.get(clipboardManager.clipboardItem),
			eventName = '';

		switch (tmpFocusItem.type) {

			case 'lesson' :// Lessons Table GUI changed for cut row
				eventName = 'setCutGUIToLessonRow';
				break;

			default:
				break;
		}
		if (events.exists(eventName)) {
			events.fire(eventName, tmpFocusItem, clipboardManager.isPasteEnabled() ? 'enable' : 'disable');
		}
	}

	// Call to reorderItems + resetData + renameClone
	function organizeCopy(copyItem, newItem) {
		// New item type
		var type = require('types')[newItem.type];

		if (type && type.clipboard) {
			// Insert the new item next to copied one
			reorderItems(type, copyItem, newItem);

			// Rename the clone
			resetData(type, newItem);

			// Init data values of clone
			renameClone(type, newItem);
		}
	}

	// Reorder items:
	// 1. Set pasted item after copied item if defined in types.js
	// 2. If pasted item is header - set as first child of parent
	function reorderItems(type, copyItem, newItem) {
		var newParent = repo.get(newItem.parent);

        var children = _.filter(newParent.children, function(child) {
            return child != newItem.id;
        });

		if (require('courseModel').isElementPublished(newParent.id)) return;
		
		switch(type.clipboard.insert) {
			case 'first': 
				children.unshift(newItem.id);
				repo.updateProperty(newParent.id, 'children', children, true);
				break;
			case 'next':

                if (!!clipboardManager.SiblingFocusItem)
                {
                    // paste next to focused item
                    children.splice(children.indexOf(clipboardManager.SiblingFocusItem) + 1, 0 , newItem.id);

                }else if (copyItem.id === clipboardManager.focusItem || newItem.data.diffLevel){
                    // paste next to copied item
                    children.splice(children.indexOf(copyItem.id) + 1, 0 , newItem.id);

                }else if (clipboardManager.clipboardItemParentType === repo.get(clipboardManager.targetItem).type || copyItem.parent != newItem.parent){
                    // paste last
                    children.splice(children.length, 0 , newItem.id);

                } else {
                    // paste next to copied item
                    children.splice(children.indexOf(copyItem.id) + 1, 0 , newItem.id);
                }

                repo.updateProperty(newParent.id, 'children', children, true);

				break;

            // if we got here with insert==last then there is nothing to re-order since the item is cloned to the end
            default:
                break;
		}

	}

	// Reset data of new item if needed
	function resetData(type, newItem) {
		
		if (typeof type.clipboard.resetData == 'function') {
			type.clipboard.resetData(newItem);
		}
	}

	// Rename pasted item (add 'copy')
	function renameClone(type, newItem) {
		if (type.clipboard.renameItem && newItem.data && typeof newItem.data.title == 'string') {
			repo.updateProperty(newItem.id, 'title', newItem.data.title + ' - Copy');
		}
	}

    function checkPasteNextToSibling(copyItem, focusItem, types){

        if (!!copyItem && !!focusItem &&
    		!copyItem.data.diffLevel && // it's not differentiation level sequence to copy
    		!focusItem.data.diffLevel && // it's not differentiation level sequence to paste into
			types[copyItem.type].clipboard.canPasteNextToSibling && // can paste next to sibling
			copyItem.type === focusItem.type) // must be of the same type
        {
            clipboardManager.SiblingFocusItem = clipboardManager.focusItem;
            return true;
        }
        else {
            return false;
        }

    }

	// Rerender after paste action
	function refreshScreen(recId) {

		// Fire repo_change for dirty flag
		events.fire('repo_changed');

		var router = require('router');
		if (recId) {
			router.load(recId);
			return;
		}

		var id = router._static_data.id,
			tab = require('courseModel').getCourseId() == id ? 'lessons' : router._static_data.tab,
			activeMenuTab = router.activeScreen && router.activeScreen.components.menu && router.activeScreen.components.menu.menuInitFocusId;

		if (repo.get(id)) {
			router.load(id, tab);
		}
		else if(router.activeScreen.constructor.type == 'TaskScreen') {
			router.activeScreen.editor.renderChildren();
		}
		else {
			router.load(clipboardManager.focusItem);
		}

		router.activeScreen.components.menu.setMenuTab(activeMenuTab);
	}

	// Validate paste action
	function validatePaste() {
		if (require('editMode').readOnlyMode || $('#dialog, #busyIndicator').length)
			return false;


		var copyItem = repo.get(clipboardManager.clipboardItem), newParentItem,
			types = require('types'),
        	focusItem = repo.get(clipboardManager.focusItem);

		// if copied item doesn't exist in repo, check memory for copied data
		if (!copyItem && clipboardManager.memory instanceof Array && clipboardManager.memory.length > 0) {
			if (clipboardManager.memory[0].id == clipboardManager.clipboardItem) {
				copyItem = clipboardManager.memory[0];
			}
		}

        //if (!copyItem) return false;

        // if copied lesson from toc table and in lesson screen disable paste
        if (copyItem && copyItem.type == "lesson" &&
            require("router").activeScreen &&
            require("router").activeScreen.constructor.type == "LessonScreen") {
            return false;
        }

        if ((!repo.get(clipboardManager.clipboardItem) ||
            repo.getAncestorRecordByType(clipboardManager.clipboardItem ,"lesson") &&
            repo.getAncestorRecordByType(clipboardManager.clipboardItem ,"lesson").id != clipboardManager.clipboardItem)  &&
            require("router").activeScreen &&
            require("router").activeScreen.constructor.type == "CourseScreen") {
            return false;
        }

        clipboardManager.SiblingFocusItem = null;

		// Determine new parent:
		if (clipboardManager.clipboardItem != clipboardManager.focusItem)
        {
            // if can paste next to sibling, use focusItemParent, otherwise use focusItem
            newParentItem = checkPasteNextToSibling(copyItem, focusItem, types) ? repo.get(clipboardManager.focusItemParent) : repo.get(clipboardManager.focusItem);
        }
        // If clipboardItem and focusItem are equal the new parent is the old one.
		else if (copyItem)
			newParentItem = repo.get(copyItem.parent);
			
		if (copyItem && newParentItem) {

			var copyType = types[copyItem.type],
				parentType = types[newParentItem.type];

			// Check if focusItem can include the copied item
			if (!copyType || 
				!copyType.clipboard || 
				!parentType || 
				!parentType.clipboard || 
				!parentType.clipboard.childrenTypes || 
				// It's in allowed children list
				parentType.clipboard.childrenTypes.indexOf(copyItem.type) < 0) {
				// Or it's differentiation level sequence
				return (copyItem.type == newParentItem.type && (copyItem.data.diffLevel || newParentItem.data.diffLevel));
			}

			// Don't allow to paste parent inside of it's own descendants
			var focusAncestors = repo.getAncestors(clipboardManager.focusItem);
			if (_.where(focusAncestors, {id: clipboardManager.clipboardItem}).length > 0) {
				return false;
			}

			var lesson = repo.getAncestorRecordByType(newParentItem.id, 'lesson');

			return	(!lesson || !types['lesson'].clipboard.canPasteInto || types['lesson'].clipboard.canPasteInto(copyItem, lesson)) &&
				 	(!copyType.clipboard.canBePasted || copyType.clipboard.canBePasted(copyItem, newParentItem)) &&
					(!parentType.clipboard.canPasteInto || parentType.clipboard.canPasteInto(copyItem, newParentItem));
		}

		return false;
	}

	// Paste item
	function paste() {
		// Paste if valid
		if (validatePaste()) {
			var busy = require('busyIndicator'),
				copyItem = repo.get(clipboardManager.clipboardItem);

			// Copy from another lesson, need to load copied subtree to repo, otherwise clear the memory
			if (!copyItem) {
				repo.set(require('cgsUtil').cloneObject(clipboardManager.memory));
				copyItem = repo.get(clipboardManager.memory[0].id);
				clipboardManager.clipboardMode = COPY_MODE;
			}
			else {
				clipboardManager.memory = null;
			}

			// Differentiation level sequence can only be copied
			var focusItem = repo.get(clipboardManager.focusItem);
			if (copyItem.type == focusItem.type && (copyItem.data.diffLevel || focusItem.data.diffLevel)) {
				clipboardManager.clipboardMode = COPY_MODE;
			}

			var cbItemType = require('types')[copyItem.type];
				loadNewItem = cbItemType && cbItemType.clipboard && cbItemType.clipboard.focusOn;

            clipboardManager.targetItem = copyItem.id != clipboardManager.focusItem ? clipboardManager.focusItem : copyItem.parent;

            // if Paste to Sibling - use focusItemParent
            if (!!clipboardManager.SiblingFocusItem && !!clipboardManager.focusItemParent) {
                clipboardManager.targetItem =  clipboardManager.focusItemParent;
            }

            function continuePaste(callback) {
            	repo.startTransaction();
				switch(clipboardManager.clipboardMode) {
					case CUT_MODE:
						logger.debug(logger.category.CLIPBOARD, copyItem.type + ' cut - paste, id: ' + copyItem.id);

						var prevParent = copyItem.parent;

						// Cut mode: change parent of clipboard item
						repo.moveItem(copyItem.id, clipboardManager.targetItem);

						callback && callback(copyItem.id);
						// Reload tree view or load the whole screen and clear clipboard
						repo.fireChangeEvents(prevParent);
						repo.fireChangeEvents(copyItem.id);
						refreshScreen(loadNewItem ? copyItem.id : null);
						// this.clipboardItem = null;
						checkMenuButtons();
						break;

					case COPY_MODE:
            			busy.start();
            			logger.debug(logger.category.CLIPBOARD, copyItem.type + ' copy - paste, id: ' + copyItem.id);
								
						var lessons = _.chain(repo.getSubtreeRecursive(copyItem.id))
										.where({type: 'lesson'})
										.each(function(lesson) { repo.removeChildren(lesson.id); })
										.pluck('id')
										.value(),
							copiedSubTree = repo.getSubtreeRecursive(copyItem.id);

						// Check if copied type is TOC or lesson - lessons loading required
						if (lessons.length > 0) {
							var newSubTree = repo.cloneSubtree(copyItem.id, clipboardManager.targetItem),
								lessonsData = [],
								lessonModel = require('lessonModel');

							_.each(lessons, function(lessId) {
								var index = copiedSubTree.indexOf(_.where(copiedSubTree, { id: lessId })[0]);
								lessonsData.push({
									oldId: lessId,
									newId: newSubTree[index].id,
									newParent: newSubTree[index].parent,
									type: lessonModel.getLessonType(lessId)
								});
							});

							(function copyLesson(data) {
								busy.setData('((Copying lessons)) (' + (lessons.length - lessonsData.length) + ' ((of)) ' + lessons.length + ')', (lessons.length - lessonsData.length - 1) * 100.0 / lessons.length);
								require('importLessonUtil').start({
									tocId: data.newParent,
									sourceCourseId: require('courseModel').getCourseId(),
									sourceLessonId: data.oldId,
									sourceLessonType: data.type,
									copyPaste: true,
									newName: data.newId == newSubTree[0].id ? newSubTree[0].data.title + ' - Copy' : '',
									completeCallback: function(newLessonId) {

										repo.changeId(data.newId, newLessonId);
										var ls = _.find(newSubTree, function(item) { return item.id == newLessonId; })
										if (ls) {
										repo.updateProperty(ls.id, 'header', lessonModel.lessonHeader[newLessonId]);
										}

										if (lessonsData.length) {
											copyLesson(lessonsData.shift());
										}
										else {
											busy.setData('((Copying lessons)) (' + lessons.length + ' ((of)) ' + lessons.length + ')', 100);
											organizeCopy(copyItem, newSubTree[0]);

											// If copied from another lesson, clean repo from another lesson data
											if (clipboardManager.memory instanceof Array) {
												clipboardManager.memory[0].parent = null;
												repo.remove(clipboardManager.memory[0].id);
											}

											// Reload tree view or load the whole screen and clear clipboard
											repo.fireChangeEvents(newSubTree[0].id);
											refreshScreen(loadNewItem ? newSubTree[0].id : null);
											// self.clipboardItem = null;
											busy.stop();

											repo.update(repo.get(clipboardManager.targetItem));
											 
											checkMenuButtons();

											// Remove lessons data from repo
											_.each(repo.getSubtreeRecursive(require('courseModel').courseId), function(child) {
												if (child.type == 'lesson') {
													repo.removeChildren(child.id);
												}
											});
											require("undo").reset();
											repo.endTransaction();											
										}
									},
									failCallback: function() {
										repo.remove(newSubTree[0].id);
										repo.endTransaction();
										repo.revert();
									}
								});
							})(lessonsData.shift());
							
						}
						// Lessons loaing isn't required
						else {
							var loadId = null,
								newSubTree;
							// Standard copy
							if (!focusItem.data.diffLevel && !copyItem.data.diffLevel || focusItem.type != copyItem.type) {
		                        newSubTree = repo.cloneSubtree(copyItem.id, clipboardManager.targetItem);
								organizeCopy(copyItem, newSubTree[0]);
							}
							// Copy sequence to differentiation level sequence
							else if (focusItem.data.diffLevel) {
								newSubTree = repo.cloneSubtree(copyItem.id, focusItem.parent);
								repo.updateProperty(newSubTree[0].id, 'diffLevel', focusItem.data.diffLevel);
								repo.updateProperty(newSubTree[0].id, 'nosort', true);
								repo.updateProperty(newSubTree[0].id, 'title', focusItem.data.title);
								reorderItems({clipboard: { insert: 'next' }}, focusItem, newSubTree[0]);
								repo.remove(focusItem.id);
								loadId = newSubTree[0].id;
							}
							// Copy differentiation level sequence to sequence
							else {
								newSubTree = repo.cloneSubtree(copyItem.id, focusItem.parent);
								repo.deleteProperty(newSubTree[0].id, 'diffLevel');
								repo.deleteProperty(newSubTree[0].id, 'nosort');
								repo.updateProperty(newSubTree[0].id, 'title', focusItem.data.title);
								reorderItems({clipboard: { insert: 'next' }}, focusItem, newSubTree[0]);
								repo.remove(focusItem.id);
								loadId = newSubTree[0].id;
							}

							// If copied from another lesson, clean repo from another lesson data
							if (clipboardManager.memory instanceof Array) {
								clipboardManager.memory[0].parent = null;
								repo.remove(clipboardManager.memory[0].id);
							}


							if (newSubTree && newSubTree.length) {
								callback && callback(newSubTree[0].id);
							}

							repo.fireChangeEvents(newSubTree[0].id);
							refreshScreen(loadNewItem ? newSubTree[0].id : loadId);
							// this.clipboardItem = null;
							busy.stop();

							checkMenuButtons();
						}
						
						break;
					default:
						logger.error(logger.category.CLIPBOARD, copyItem.type + ' cut-copy error, id: ' + copyItem.id);
						checkMenuButtons();
						break;
				}
            }

            function setTasksScore(newItemId) {
            	var progresses = _.union(repo.getChildrenRecordsByTypeRecursieve(newItemId, 'progress'), repo.getChildrenRecordsByTypeRecursieve(newItemId, 'advancedProgress')),
					quiz = repo.getAncestorRecordByType(newItemId, 'quiz');

				if (quiz) {
					_.each(progresses, function(prog) {
						repo.updateProperty(prog.id, 'score', prog.data.score || 1);
					});
				}

				repo.endTransaction();
			}

            if (copyItem.type === "sequence" && repo.get(clipboardManager.targetItem).type === "quiz") {
            	var hasInvalidTasks = _.any(repo.getSubtreeRecursive(copyItem.id), function(rec) {
            		return ['FreeWriting', 'questionOnly', 'selfCheck', 'narrative', 'pedagogicalStatement'].indexOf(rec.type) > -1;
            	});
        		
        		if (hasInvalidTasks) {
					events.once('onApprovePaste', function (response) {
						if (response === 'ok') {
							continuePaste(function (newItemId) {
								var invalidTasks = _.union(
									repo.getChildrenRecordsByTypeRecursieve(newItemId, 'FreeWriting'),
									repo.getChildrenRecordsByTypeRecursieve(newItemId, 'questionOnly'),
									repo.getChildrenRecordsByTypeRecursieve(newItemId, 'selfCheck'),
									repo.getChildrenRecordsByTypeRecursieve(newItemId, 'narrative'),
									repo.getChildrenRecordsByTypeRecursieve(newItemId, 'pedagogicalStatement')
								); 

								_.each(invalidTasks, function (item) {
									repo.remove(item.id);
								});

								setTasksScore(newItemId);
							});
						}
					});

					require("dialogs").create('simple', {
		                title: "Checking Type Warning",
		                content: {
		                    text: "None-Checkable tasks will be remove from the sequence."
		                },
		                buttons: {
		                    ok:		{ label: 'OK' },
		                    cancel:		{ label: 'Cancel' }
		                }
		            }, 'onApprovePaste')
				} else {
					continuePaste(setTasksScore);
				}
			} else if (repo.get(clipboardManager.targetItem).type === "sequence" && repo.get(repo.get(clipboardManager.targetItem).parent).type === 'quiz') {
				if (~['FreeWriting', 'questionOnly', 'selfCheck', 'narrative', 'pedagogicalStatement'].indexOf(copyItem.type)) {
        			return false;
				} else {
					continuePaste(setTasksScore);
				}
        	} else {
        		continuePaste(repo.endTransaction.bind(repo));
        	}
		}
	}

	function checkMenuButtons() {
		events.fire('setMenuButtonState', 'menu-button-cut', clipboardManager.isCutEnabled() ? 'enable' : 'disable');
		events.fire('setMenuButtonState', 'menu-button-copy', clipboardManager.isCopyEnabled() ? 'enable' : 'disable');
		events.fire('setMenuButtonState', 'menu-button-paste', clipboardManager.isPasteEnabled()  ? 'enable' : 'disable');
	}


	// Constructor
	function ClipboardManager() {
		// Initialize variables and bind events
		this.clear();
		bindEvents();
	}

	
	/************************/
	/*** Public functions ***/
	/************************/

	ClipboardManager.prototype = {

		// Set current focused item in tree view (course, toc, lesson, etc...)
		setFocusItem: function(options) {
			// Release GUI for previus focused item
			if (typeof this.guiSelectionRelease == 'function') this.guiSelectionRelease();

			options = options || {};

			this.focusItem = options.id ? options.id : null;
            this.focusItemParent = this.focusItem ? repo.get(this.focusItem).parent : null;

			this.canCopy = false;
			var item = repo.get(this.focusItem);
			if (item) {
				// Check if item can be copied (according to types.js)
				var type = require('types')[item.type];
				if (type && type.clipboard) {
					// Check if item is in parent it can be pasted into (for textviewer)
					if (type.clipboard.strictParent) {
						var parent = repo.get(item.parent);
						if (parent) {
							var parentType = require('types')[parent.type];
							this.canCopy = 	parentType && 
											parentType.clipboard && 
											parentType.clipboard.childrenTypes && 
											parentType.clipboard.childrenTypes.indexOf(item.type) >= 0 && 
											type.clipboard.canCopy && 
											(typeof type.clipboard.canCopy != 'function' || type.clipboard.canCopy(item));
						}
					}
					else {
						this.canCopy = type.clipboard.canCopy && (typeof type.clipboard.canCopy != 'function' || type.clipboard.canCopy(item));
					}
				}
			}

			this.guiSelectionRelease = options.removeSelection;
			// Enable cut/copy buttons if can copy
			checkMenuButtons();
		},

		// Check if can cut current focused item
		isCutEnabled: function() {
			var focusItem = repo.get(this.focusItem);
			if (!focusItem || (focusItem.type == 'lesson' && require('router').activeScreen.constructor.type == 'LessonScreen'))
				return false;

			// Diff level can be copied only
			if (repo.get(focusItem.parent) && repo.get(focusItem.parent).type == 'differentiatedSequenceParent')
				return false;

			var canCutOnPartial = true;
			if (require('editMode').partialEdit() &&
				['toc', 'lesson'].indexOf(focusItem.type) != -1 &&
				require('courseModel').getPublishedItems().indexOf(focusItem.id) !=-1) {
					canCutOnPartial = false;
				}

			return this.canCopy && !require('editMode').readOnlyMode && canCutOnPartial;
		},

		// Check if can copy current focused item
		isCopyEnabled: function() {
			var focusItem = repo.get(this.focusItem);
			if (!focusItem || (focusItem.type == 'lesson' && require('router').activeScreen.constructor.type == 'LessonScreen'))
				return false;

			return !!this.focusItem && this.canCopy && !require('editMode').readOnlyMode;
		},

		// Check if can paste clipboard item into current focused item
		isPasteEnabled: function() {

			return validatePaste();
		},

		// Save clipboard data to memory
		saveClipboard: function() {
			//save clipboard to memory, only if clipboard item is below lesson level (sequence, task, component)
			if (this.clipboardItem &&
				repo.get(this.clipboardItem) &&
				['toc', 'lesson'].indexOf(repo.get(this.clipboardItem).type) == -1) {
				
				this.memory = repo.getSubtreeRecursive(this.clipboardItem);
				var stringMemory = JSON.stringify(this.memory);

				var ids = _.map(this.memory, function(item) {
					return {
						oldId: item.id,
						newId: repo.genId()
					};
				});

				_.each(ids, function(pair) {
					stringMemory = stringMemory.replace(new RegExp(pair.oldId, 'g'), pair.newId);
				});

				this.memory = JSON.parse(stringMemory);
				this.clipboardItem = this.memory[0].id;
			}
		},

		// Clear clipboard
		clear: function() {
			this.focusItem = null;
	        this.targetItem = null;
	        this.focusItemParent = null;
	        this.SiblingFocusItem = null;
	        this.clipboardItemParentType = null;
			this.clipboardItem = null;
			this.clipboardMode = null;
			this.canCopy = false;
			this.guiSelectionRelease = null;
			this.memory = null;
		}

	};

	var clipboardManager = new ClipboardManager();

	return clipboardManager;
});