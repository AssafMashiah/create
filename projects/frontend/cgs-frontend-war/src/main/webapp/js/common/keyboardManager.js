define(['jquery', 'lodash', 'events','focusManager', 'keyboard', 'clipboardManager', 'repo','cgsUtil'], 
	function ($, _, events, focusManager, keyboard, clipboardManager, repo,cgsUtil) {

	function KeyboardManager(){
		this.keyToEventMap = {};
		this.ctrlKeyDown=false;
		this.init();
	}

	KeyboardManager.prototype ={

		init: function() {

			$(document).keyup(_.bind(function(event){

				var keyPressed = event.keyCode;

				// ctrl key up
				if(keyPressed == 17){
					event.stopPropagation();
					this.ctrlKeyDown = false;
				}

			},this));

			$(document).keydown(_.bind(function(event){
				// ctrl key down
				if(event.keyCode == 17){
					this.ctrlKeyDown = true;
				}

			}, this));

			/**
			 * logs repo record as dl data
			 * @return {[type]} [description]
			 */
            keyboard.on("alt + c",function(){
               
                events.fire('setActiveEditorEndEditing');
                var router = require('router'),
                    editor_id = router.activeEditor.elementId
                record = router.activeEditor.record;
                while(['sequence', 'separator', 'html_sequence', 'url_sequence', 'pluginContent'].indexOf(record.type) == -1 && (record = repo.get(record.parent)));
                var data = {};
                repo.filterDataById(data, record.id);
                var livePageElements = _.filter(record.children, function(childId) {
					return repo.get(childId).type.indexOf('livePage') == 0;
				});
                var result;

                if (record.type == 'html_sequence' && livePageElements.length) {
                	result = require('repo2livePage').convert(data, record.id).json_data;
                }
                else if (record.type == 'pluginContent') {
                	var pluginClassManager = require("pluginModel").getPluginByPath(record.data.path);
                	result = pluginClassManager.invokeDataToPlayerConversion(data);
                }
                else {
                	result = require('json2xml').convert(data, editor_id);
                }
               
                console.log(result);
            });

            // Log active record
            keyboard.on('alt + r',function () {
            	var record = require('router').activeScreen.editor.record;
            	console.log(record);
            });

            // Set lesson and all sequences as dirty (thumbnails will be generated)
			keyboard.on('ctrl + alt + m', function () {
				logger.audit(logger.category.GENERAL, 'User used shortcut for adding dirty flags to lesson and sequences');
				
				require("lessonModel").setDirtyFlag(true);

				var sequence_array = _.union(repo.getChildrenByTypeRecursive(require("lessonModel").lessonId, 'sequence'),
											repo.getChildrenByTypeRecursive(require("lessonModel").lessonId, 'html_sequence'),
											repo.getChildrenByTypeRecursive(require("lessonModel").lessonId, 'separator'),
											repo.getChildrenByTypeRecursive(require("lessonModel").lessonId, 'url_sequence'),
											repo.getChildrenByTypeRecursive(require("lessonModel").lessonId, 'pluginContent'));
				
				if (sequence_array && _.isArray(sequence_array) && sequence_array.length) {
					_.each(sequence_array, function (item) {
						repo.startTransaction({ ignore: true });
						repo.updateProperty(item.id, 'is_modified', true, true);
						repo.endTransaction();
					});
				}
			});

			// Set lesson and all sequences as dirty (thumbnails will NOT be generated)
			keyboard.on('ctrl + alt + z', function () {

				function saveLesson(lessonId, callback) {
					require("lessonModel").setDirtyFlag(true);

					var sequence_array = _.union(repo.getChildrenByTypeRecursive(lessonId, 'sequence'),
												repo.getChildrenByTypeRecursive(lessonId, 'html_sequence'),
												repo.getChildrenByTypeRecursive(lessonId, 'separator'),
												repo.getChildrenByTypeRecursive(lessonId, 'url_sequence'),
												repo.getChildrenByTypeRecursive(lessonId, 'pluginContent'));
					
					if (sequence_array && _.isArray(sequence_array) && sequence_array.length) {
						_.each(sequence_array, function (item) {
							item.is_modified = true;
						});
					}
					if (typeof callback == 'function') callback();
				}

				events.once('onPasswordEnter', function(response) {
					if (response == 'yes') {
						var busy = require("busyIndicator"),
							router = require('router');

						repo.startTransaction({ ignore: true });
						if (router && router.activeScreen && ['CourseScreen', 'TocScreen'].indexOf(router.activeScreen.constructor.type) > -1) {
							busy.start();
							require("cgsUtil").saveAllLessons(saveLesson, function(unsavedLessons) {
								repo.endTransaction();
								busy.stop();
								if (unsavedLessons instanceof Array && unsavedLessons.length > 0) {
									require('dialogs').create('simple', {
										title : 'Locked lessons',
										content : {
											text: 'Failed to save next lessons (locked): <br>' + _.map(unsavedLessons, function(lesson) { return lesson.lessonId + ' - locked by ' + lesson.username }).join('<br>')
										},
										buttons : {
											'cancel' : { label : "Ok" }
										}
									});
								}
							});
						}
						else {
							saveLesson(require('lessonModel').lessonId, repo.endTransaction.bind(repo));
						}
					}
				});

				require('dialogs').create('password', {
					title : 'Re-convert lessons',
					content : {},
					buttons : {
						'yes': { label : "Ok", canBeDisabled: true },
						'cancel' : { label : "Cancel" }
					},
					password: 'saveAll'
				}, 'onPasswordEnter');

			});

			keyboard.on('ctrl + alt + 1', function() {

				function updateLesson(lessonId, callback) {
					require("lessonModel").setDirtyFlag(true);
					require('busyIndicator').start();
					require('busyIndicator').setData('Converting MathML');

					var sequences = [];

					function updateMathML(mathArray) {
						mathml = mathArray.shift();
						if (mathml) {
							var seq = repo.getAncestorRecordByType(mathml.id, 'sequence');
							if (seq && sequences.indexOf(seq) == -1) {
								sequences.push(seq);
							}

							require('files').downloadFile({
			                    url: '/WIRISeditor/render?centerBaseline=false&mml={0}'.format(encodeURIComponent(mathml.data.markup)),
			                    filename: null,
			                    dirname: 'media',
			                    fileExtension: 'png',
			                    callback: function(image) {
			                    	var src = require('files').removeCoursePath(undefined, undefined, image.fullPath);
			                    	mathml.data.component_src = src;
			                    	
			                    	var img = new Image;
			                    	img.src = require('assets').serverPath(src);
			                    	img.onload = function(e) {
			                    		mathml.data.naturalWidth = e.target.naturalWidth;
			                    		mathml.data.naturalHeight = e.target.naturalHeight;
			                    		updateMathML(mathArray);
			                    	}
			                    	img.onerror = function() {
			                    		updateMathML(mathArray);
			                    	}
			                    },
			                    failCallback: updateMathML.bind(this, mathArray)
			                });
						}
						else {
							_.each(sequences, function(seq) {
								var validateJson = require('validate').isEditorContentValid(seq.id, true),
				                    data = {},
				                    itemValidation = !!_.filter(seq.children,function (child) {
				                        return ['header', 'sharedContent', 'help'].indexOf(repo.get(child).type) == -1;
				                    }).length;

								repo.filterDataById(data, seq.id);


								if (itemValidation) {
									var _converted_xml = require('json2xml').getXML(data, seq.id);
			                        if (_converted_xml.hasError) {
			                            seq.convertedData = null;
			                        } else {
			                            seq.convertedData = _converted_xml.xml_data;
			                        }
			                    }
			                    else {
			                    	if (seq.convertedData) {
				                        seq.convertedData = null;
				                    }
			                    }
							});

							require('busyIndicator').stop();
							if (typeof callback == 'function') callback();
						}
					}

					updateMathML(repo.getChildrenByTypeRecursive(lessonId, 'MathML'));
				}

				events.once('onPasswordEnter', function(response) {
					if (response == 'yes') {
						var busy = require("busyIndicator"),
							router = require('router');

						busy.start();
						repo.startTransaction({ ignore: true });
						if (router && router.activeScreen && ['CourseScreen', 'TocScreen'].indexOf(router.activeScreen.constructor.type) > -1) {
							require("cgsUtil").saveAllLessons(updateLesson, function(unsavedLessons) {
								repo.endTransaction();
								busy.stop();
								if (unsavedLessons instanceof Array && unsavedLessons.length > 0) {
									require('dialogs').create('simple', {
										title : 'Locked lessons',
										content : {
											text: 'Failed to save next lessons (locked): <br>' + _.map(unsavedLessons, function(lesson) { return lesson.lessonId + ' - locked by ' + lesson.username }).join('<br>')
										},
										buttons : {
											'cancel' : { label : "Ok" }
										}
									});
								}
							});
						}
						else {
							updateLesson(require('lessonModel').lessonId, function() {
								repo.endTransaction();
								busy.stop();
								router.reload();
							});
						}
					}
				});

				require('dialogs').create('password', {
					title : 'MathML Fix',
					content : {},
					buttons : {
						'yes': { label : "Ok", canBeDisabled: true },
						'cancel' : { label : "Cancel" }
					},
					password: 'saveAll'
				}, 'onPasswordEnter');

			});

			keyboard.on('ctrl + shift + m', function () {
				require("busyIndicator").start();
				
				require("cgsUtil").saveAllLessons(function (id, callback) {
					var sequences = require("repo").getChildrenRecordsByTypeRecursieve(id, "sequence");

					_.each(sequences, function (item) {
						if (item.convertedData) {
							var converted_xml_dom = $("<div />").append(item.convertedData);

							converted_xml_dom.find("textviewer").removeAttr('style');
							converted_xml_dom.find("textviewer span.cgs").removeClass("cgs");
							
							item.convertedData = converted_xml_dom.html();
							item.is_modified = false;
						}
					});

					if (typeof callback == 'function') callback();

				}, function () {
					require("busyIndicator").stop();
				});
			});

			// Set dimensions to inline images (to repair the bug in production with 'undefined' dimensions)
			keyboard.on('ctrl + alt + i', function () {
				if (require("lessonModel").lessonId) {
					var icons = repo.getChildrenRecordsByTypeRecursieve(require("lessonModel").lessonId, 'inlineImage');
					_.each(icons, function (icon) {
						var modified = false;
						if (icon.data.component_src.indexOf('ca0c39eb3c3a4d7652e5d2e197ee852e68b90395') >= 0) {
							repo.updateProperty(icon.id, 'naturalWidth', '20', false, true);
							repo.updateProperty(icon.id, 'naturalHeight', '20', false, true);
							modified = true;
						}
						else if (icon.data.component_src.indexOf('8ef10519192b0f6927dfab8e11be8321e7c556c7') >= 0 || icon.data.component_src.indexOf('f4c2bb5a18b7385f8a02cadfd9945101cc68c1f1') >= 0) {
							repo.updateProperty(icon.id, 'naturalWidth', '23', false, true);
							repo.updateProperty(icon.id, 'naturalHeight', '20', false, true);
							modified = true;
						}

						if (modified) {
							var sequence = repo.getAncestorRecordByType(icon.id, 'sequence');
							sequence && repo.updateProperty(sequence.id, 'is_modified', true, true);
						}
					});
				}
			});

			// Set number of attempts to 0 for noncheckable tasks
			keyboard.on('ctrl + alt + o', function() {
				var uncheckableTypes = [
					'questionOnly',
					'FreeWriting',
					'narrative',
					'pedagogicalStatement',
					'selfCheck'
				];

				_.chain(repo._data)
					.where({ type: 'progress' })
					.each(function(item) {
						var parent = repo.get(item.parent);
						if (uncheckableTypes.indexOf(parent.type) != -1 && item.data.num_of_attempts != '0') {
							repo.updateProperty(item.id, 'num_of_attempts', '0');
						}
					});
			});

			keyboard.on('alt + v',function (){
				var screenActiveEditorId = require('router').activeScreen.editor.config.id;
				var result = require('validate').isEditorContentValid(screenActiveEditorId);
				if(!result.valid ){
					require('dialogs').create('simple',{
						title : "Validation Failed - Results:",
						content : {
							text : JSON.stringify(result)
						},
						buttons : {
							'cancel' : {label : "done",value : true}
						}
					}).show();
				}else{
					require('dialogs').create('simple',{
						title : "Validation Pass successfully :",
						content : {
							text : 'active Editor id :' + screenActiveEditorId + "<br> " + JSON.stringify(result.report)
						},
						buttons : {
							'cancel' : {label : "done",value : true}
						}
					}).show();
				}
			});
		},

		on: function(keys, callback) {
			return keyboard.on(keys, callback);
		},

		addShortCut: function (config) {

			if (!config.shortcut || !config.shortcut.keys) return;

			if (this.keyToEventMap[config.shortcut.keys]) {
				this.keyToEventMap[config.shortcut.keys].clear();
				this.keyToEventMap[config.shortcut.keys] = null;
			}

			this.keyToEventMap[config.shortcut.keys] = keyboard.on(config.shortcut.keys, function (e) {
				if (config.shortcut.disableOnInput && (['INPUT', 'TEXTAREA'].indexOf(e.target.tagName) != -1 || $(e.target).parents().add($(e.target)).filter('[contenteditable="true"]').length)) {
					return;
				}

				var _dialogs = require("dialogs");
				if (_dialogs.currentOpenDialog) return;

				else {
					if (config.buttonId && (!config.shortcut.focus || config.shortcut.focus == focusManager.getFocusedElement())) {
						e.preventDefault();
						var menu = require('router').activeScreen.components.menu,
							button = (function findItem(items) {
								var found = _.map(items, function(item) {
									if (item.id == config.buttonId) {
										return item;
									}

									return findItem(item.subMenuItems) || findItem(item.dropDownItems);
								});

								return _.compact(found).length && _.compact(found)[0];
							})(menu.extendedConfig);

						if (button) {
							button = require('cgsUtil').cloneObject(button);
							menu.view.handleMenuItem(button);
							if (!button.disabled) {
								logger.audit(logger.category.GENERAL, 'User used shortcut for ' + button.id + ' button (event name ' + button.event + ')');
								require('events').fire_with_lock(300, button.event, button.args);
							}
						}
					}
				}

			});
		},

		removeShortcut: function (shortcut) {
			if (this.keyToEventMap[shortcut.keys]) {
				this.keyToEventMap[shortcut.keys].clear();
				this.keyToEventMap[shortcut.keys] = null;
			}
		},

		isCtrlPressed: function () {
			return this.ctrlKeyDown;
		}
	};

	return new KeyboardManager();
});