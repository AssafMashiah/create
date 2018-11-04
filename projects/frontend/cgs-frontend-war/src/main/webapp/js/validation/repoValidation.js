define(['repo', 'mustache', 'dialogs', 'events', 'validation/textViewerUtil'], function(repo, mustache, dialogs, events, textViewerUtil){
	function repoValidation(){

	}
	repoValidation.prototype = {

			validate: function(lessonId){
				var validationObject = {
					isValid :true,
					validationLog : [],
					dataModified: false
				};

				this.makeValidation(lessonId, validationObject);
				if (!validationObject.isValid){
					this.showErrorsDialog(validationObject);
				}
				else if (validationObject.dataModified) {
					//this.showSaveWarning();
				}

				return validationObject;
			},

			//show dialog with all error messages
			showErrorsDialog: function(validationObject){
				errorMessages = '';
				_.each(validationObject.validationLog, function(errorMessage){
					errorMessages += errorMessage + "</br>";
				});
				var dialogConfig = {
					title:'error with lesson validation',
					content:{
						text:errorMessages,
						icon:'warn'
					},
					buttons:{
						'cancel':{ label:'close', value: true }
					}
				};

				events.once('onShowMessage', this.onShowMessage, this);

				var dialog = dialogs.create('simple', dialogConfig, 'onShowMessage');
			},

			// showSaveWarning: function() {
			// 	var dialogConfig = {
			// 		title:'Lesson was modified',
			// 		content:{
			// 			text: 'The lesson was modified, in order to save the changes, please click on "Save" button',
			// 			icon:'warn'
			// 		},
			// 		buttons:{
			// 			'cancel': { label:'close', value: true }
			// 		}
			// 	};

			// 	events.once('onShowMessage', this.onShowMessage, this);

			// 	var dialog = dialogs.create('simple', dialogConfig, 'onShowMessage');
			// },

			onShowMessage: function(response) {
				switch( response ) {
					case 'cancel' : {
						/////////////////////////
						// do nothing
						/////////////////////////
						break ;
					}
				}
			},


			makeValidation : function(id, validationObject){

				var	that = this, thisRepo = repo.get(id);


				// general validation
				this.generalValidation(thisRepo, validationObject);


				// type validation- validate by repo type
				if (typeof this.typeValidation[thisRepo.type] == 'function') {
					this.typeValidation[thisRepo.type](thisRepo, validationObject);
				}

				// validate children -recursive call
				_.each(thisRepo.children, function(childId){
					that.makeValidation(childId, validationObject);
				});

			},

			// check children existance in repo
			generalValidation : function(thisRepo, validateObj){

				_.each(thisRepo.children, function(childId){
					if (!repo.get(childId)){
						//element dont exists in repo
						validateObj.isValid = false;
						validateObj.validationLog.push(mustache.render('parent with id: {{repoPaent}} has child with id: {{childId}} ,that don\'t exists in repo',
							{	repoPaent:thisRepo.id,
								childId: childId
							}));
					}
				});
			},

			getParsedString : function(string, style){
				var defaultStyle = "min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto"

				if(string){
					string = string.replace(/\v/g, '\n').replace(/\t/g,'');
					string = _.map(_.compact(_.invoke(string.split('\n'), 'trim')), function(par) {
						return '<div class=\\"cgs ' + style + '\\" style=\\"'+defaultStyle+'\\" contenteditable=\\"false\\" >' +
								par.replace(new RegExp('"', 'g'), '\\"') + '</div>';
					}).join('');
				}else{
					string = "";
				}
				return string;

			},

			typeValidation: {

				sequence : function(thisRepo, validateObj){

					//validate that all help items used by sequence exists in repo,
					_.each(thisRepo.data.help, function(helpItem){
						if (!repo.get(helpItem.id) || thisRepo.children.indexOf(helpItem.id) == -1){
							//help item dont exists in sequence children array or in repo
							validateObj.isValid = false;
							validateObj.validationLog.push("help item failed validation with id " + helpItem.id);
						}
					});

					// validate all help items in repo are linked to the sequence.
					// if there are items that are not linked, we remove them from repo.
					var helpItemsIndexesToRemove = [];
					_.each(thisRepo.children, function(childId){
						if (repo.get(childId).type === 'help' && _.where(thisRepo.data.help,{id: childId}).length === 0){
							var childIndexToRemove = thisRepo.children.indexOf(childId);
							helpItemsIndexesToRemove.push(childIndexToRemove); //child of type help dont exists in sequence help array
							logger.warn(logger.category.LESSON, "help child "+childId+" in index: "+childIndexToRemove+" is not in sequence help array");
						}
					});

					// if there are indices to remove - go over the thisRepo.children and remove the unused help items
					if (helpItemsIndexesToRemove.length > 0){
						helpItemsIndexesToRemove.reverse().forEach(function(itemIndex){
							thisRepo.children.splice(itemIndex,1);
						});
					}
				},
				fullSizeImage: function (thisRepo, validateObj) {
                    thisRepo.type = 'latex';
                },
				textViewer: function (thisRepo, validateObj) {
					var inlineNarrations = repo.getChildrenRecordsByTypeRecursieve(thisRepo.id, "inlineNarration");
					var locale = repo.get(repo._courseId).data.contentLocales[0];

					if (thisRepo.data.narration && !_.isObject(thisRepo.data.narration)) {
						var narration = {};

						narration[locale] = thisRepo.data.narration;

						thisRepo.data.narration = narration;
					}

					// Handle assetsManager "narration" --> "narration.locale"
                    var newSrcAttr;
                    var am = thisRepo.data.assetManager;
                    var narrationAssetManagerItemIndex = _.findIndex(am, {"srcAttr": "narration"});

                    if (narrationAssetManagerItemIndex > -1) {
                        var narrationAssetManagerItem = am[narrationAssetManagerItemIndex];
                        var newSrcAttr = "{0}.{1}".format(narrationAssetManagerItem.srcAttr, locale);
                        var newNarrationAssetManagerItem = _.find(am, {"srcAttr": newSrcAttr});

                        // If there is a newer narration version, delete the old one. Else correct the old narration item
                        if (newNarrationAssetManagerItem) {
                            am.splice(narrationAssetManagerItemIndex, 1);
                        } else {
                            narrationAssetManagerItem.srcAttr = newSrcAttr;
                            narrationAssetManagerItem.locale = locale;
                        }
                    }

					_.each(inlineNarrations, function (inlineNarrationItem) {
						var assetManager = inlineNarrationItem.data.assetManager;
						var assetData = {};

						if (assetManager && assetManager.length) {
							if (!inlineNarrationItem.data.narrations) {
								_.each(assetManager, function (narrationItem) {
									assetData[locale] = inlineNarrationItem.data.component_src;
									narrationItem.locale = locale;
								})

								inlineNarrationItem.data.narrations = assetData;
							}
						}

						delete inlineNarrationItem.data.component_src;
					});


					var title = thisRepo.data.title;
					title = textViewerUtil.setParagraphsStyle(title, thisRepo.data.styleOverride);
					title = textViewerUtil.setNarrationEditable(title);
					title = textViewerUtil.fixDivStructure(title);
					title = textViewerUtil.addIdToAnswerFieldTypeMathfied(title);

					thisRepo.data.title = title;



					//fix pedagogical title text viewer to be single style mode
					if(	thisRepo.data.mode !== 'singleStyle' &&
						repo.getAncestorRecordByType(thisRepo.id, 'title') &&
						repo.getAncestorRecordByType(thisRepo.id, 'pedagogicalStatement')){

							thisRepo.data.mode =  "singleStyle";
					}
					/// question only instruction to singleStylePlainText
					if( thisRepo.data.mode !== "singleStylePlainText" &&
						(repo.getAncestorRecordByType(thisRepo.id, 'instruction') &&
						repo.getAncestorRecordByType(thisRepo.id, 'questionOnly')) ||
						repo.getAncestorRecordByType(thisRepo.id, 'separator')
						){
							thisRepo.data.mode = "singleStylePlainText";

					}
				},
				advancedProgress: function(thisRepo, validateObj) {
					var cloze = repo.getAncestorRecordByType(thisRepo.id, 'cloze');
					if (cloze) {
						var clozeAnswer = repo.getChildrenRecordsByType(cloze.id, 'cloze_answer')[0];
						var feedbacks = thisRepo.data.availbleProgressTypes;
						if (feedbacks.length == 2) {
							if (clozeAnswer.data.fieldsNum == 'single') {
								feedbacks.push({ 'name': 'Generic and Specific', 'value': 'advanced' });
							}
							else {
								feedbacks.push({ 'name': 'Advanced', 'value': 'advanced' });
							}
							validateObj.dataModified = true;
						}
					}
				},

				matchingAnswer: function (thisRepo, validateObj) {
					thisRepo.data.interaction_type = 'drag_and_drop';
				},
				sortingAnswer: function (thisRepo, validateObj) {
					thisRepo.data.interaction_type = 'drag_and_drop';
				},

				linking: function (thisRepo, validateObj) {
					thisRepo.data.interaction_type = 'linking';
				},

				cloze_text_viewer: function(thisRepo, validateObj) {
					this.textViewer.call(this, thisRepo, validateObj);

					_.each(thisRepo.data.answerFields, function(af) {
						if (af.type == 'mathfield' && !af.completionType) {
							af.completionType = 'A';
							validateObj.dataModified = true;
						}
					});

					var html_content = $("<div></div>").append(thisRepo.data.title);
					var answer_fields = html_content.find('answerfield');

					answer_fields.each(function () {
						var type = $(this).attr('type');

						if (type == 'text') {
							var contents = $(this).contents(),
								hasSpan = false,
								newId = $(this).attr('id'),
								innerText = '';
							if (contents.length == 2 && contents[0].tagName == 'SPAN' && contents[1].tagName == 'DIV') return;

							contents.each(function() {
								if (this.tagName != 'DIV') {
									if (this.nodeType == 1) {
										if (this.tagName == 'SPAN') {
											hasSpan = true;
											newId = newId || $(this).attr('id');
											innerText += this.innerHTML;
										}
										else {
											innerText += this.outerHTML;
										}
									}
									else if (this.nodeType == 3) {
										innerText += $(this).text();
									}
								}
							}).filter(function() {
								return this.nodeType != 1 || this.tagName != 'DIV';
							}).remove();

							var newSpan = $('<span></span>').attr({
								'class': 'answerfieldSpan',
								'id': newId,
								'type': type,
								'contenteditable': true
							});
							newSpan.html(innerText.trim());
							$(this).prepend(newSpan);

							$(this).removeAttr('id');
							$(this).attr('contenteditable', false);
							$(this).css('-webkit-user-select', 'none');
						}
					});

					thisRepo.data.title = html_content.html();

					function setMathfieldMarkup(item) {
	                    //clone the html to check free text inside mathfield tag
	                    var cloneMathfieldDom = item.clone();

	                    //check if the element has a mathfield inside it
	                    if (cloneMathfieldDom.find('.mathField').length > 0) {
	                        //remove the mathfield to find a data written inside the tag
	                        _.each(cloneMathfieldDom.find('.mathField'), function f1295(x) {
	                            $(x).remove();
	                        });
	                        //insert the text inside the mathfield tag
	                        if (cloneMathfieldDom.text().trim() !== "") {
	                            item.replaceWith($('<mathField>').attr({
	                                id: item.attr('id'),
	                                idx: item.attr('idx')
	                            }).after(cloneMathfieldDom.text().trim()));
	                        } else {
	                            item.replaceWith($('<mathField>').attr({
	                                id: item.attr('id'),
	                                idx: item.attr('idx')
	                            }));
	                        }
	                    }
	                }

	                try {
						var tempEl = $("<temp></temp>").append($(thisRepo.data.title));
						var mathfieldTags = tempEl.find('mathfieldtag');

						mathfieldTags.each(function () {
							setMathfieldMarkup($(this));
						});

						thisRepo.data.title = tempEl.html();
	                } catch (error) {
						thisRepo.data.title = '';
	                }
				},

				answerFieldTypeMathfield: function(thisRepo, validateObj) {
					if (!thisRepo.data.completionType) {
						thisRepo.data.completionType = 'A';
						validateObj.dataModified = true;
					}
				},

				sequencing: function (thisRepo) {

					var sequenceAnswer = repo.getChildrenRecordsByType(thisRepo.id, "sequencingAnswer");

					if (sequenceAnswer && sequenceAnswer.length) {
						sequenceAnswer = sequenceAnswer[0];

						if (sequenceAnswer.data.useBank) {
							var _instruction = repo.getChildrenRecordsByType(thisRepo.id, "instruction"),
								_text_viewer =  _instruction && _instruction.length ? repo.getChildrenRecordsByType(_instruction[0].id, 'textViewer') : false;

							if (_text_viewer && _text_viewer.length) {
								_text_viewer = _text_viewer[0];

								if (!_text_viewer.data.title) {
									var configuration = require("./modules/SequencingAnswerEditor/config");

									 _text_viewer.data.title = require("localeModel").getConfig('stringData').repo[configuration.instructions[1]];
								}

							}
						}
					}
				},

				referenceSequence: function(thisRepo, validateObj) {
					var breadcrumbs = _.invoke(thisRepo.data.breadcrumbs.split('>'), 'trim'),
						lessonId = thisRepo.data.referencedLessonId;

					if (!lessonId || !repo.get(lessonId)) return;

					var ancestors = repo.getAncestors(lessonId).reverse();
					ancestors.push(repo.get(lessonId));

					thisRepo.data.breadcrumbs = _.map(breadcrumbs, function(name, ind) {
						if (ind < ancestors.length) {
							return ancestors[ind].data.title;
						}
						return name;
					}).join(' > ');
				},
				header: function(thisRepo, validateObj){

					//need to set the header in the new format
					if(thisRepo.data.headerTitle || thisRepo.data.headerSubTitle || thisRepo.children.length === 0){
						var genericTitleValue = thisRepo.data.headerTitle,
							genericSubTitleValue = thisRepo.data.headerSubTitle;

						delete thisRepo.data.headerTitle;
						delete thisRepo.data.headerSubTitle;

						template = '[{  "id":"{{id1}}",\
										"type": "{{TitleType}}",\
										"parent": "{{parentId}}",\
										"children": ["{{id2}}"],\
										"data": {"title": "title", "disableDelete":true}\
									},\
									{	"id":"{{id2}}",\
										"type": "textViewer",\
										"parent": "{{id1}}",\
										"children": [],\
										"data": {"title": "{{{textViewerValue}}}", "disableDelete":true, "styleOverride": "{{style}}", "mode" : "singleStyleNoInfoBaloon", "availbleNarrationTypes" :[ {"name": "None", "value": ""},{"name":"General", "value": "1"}]}\
									}]';

						logger.debug(logger.category.EDITOR, 'Convert old header (id: ' + thisRepo.id + ') to new format');

						var genericTitleId =  repo.addTemplate({
								template: template,
								style: 'sequenceTitle',
                                parentId: thisRepo.id,
                                TitleType : "genericTitle",
                                textViewerValue : require('repoValidation').getParsedString(genericTitleValue, 'sequenceTitle')
                            });

						var genericSubTitleId= repo.addTemplate({
								template: template,
								style: 'sequenceSubTitle',
                                parentId: thisRepo.id,
                                TitleType : "genericSubTitle",
                                textViewerValue : require('repoValidation').getParsedString(genericSubTitleValue, 'sequenceSubTitle')
                            });

						repo.updateProperty(thisRepo.id, 'showGenericTitle' , !!genericTitleValue);
						repo.updateProperty(thisRepo.id, 'showGenericSubTitle' , !!genericSubTitleValue);
						repo.updateProperty(genericTitleId, 'hide', !genericTitleValue );
						repo.updateProperty(genericSubTitleId, 'hide', !genericSubTitleValue );

					}
					else {
						var tvItems = repo.getChildrenRecordsByTypeRecursieve(thisRepo.id, 'textViewer');

						_.each(tvItems, function(tv) {
							var title = $(tv.data.title);
							if (title.children('div').length) {
								tv.data.title = '';
								title.each(function() {
									tv.data.title += $(this).html();
								});
							}
						});
					}
				},
				separator: function(thisRepo, validateObj){
					//need to set the separator in the new format

					if(thisRepo.data.separatorImage ||
						thisRepo.data.separatorTitle ||
						thisRepo.data.separatorSubTitle ||
						thisRepo.children.length === 0){


						var genericTitleValue = thisRepo.data.separatorTitle,
							separatorTitleNarration = thisRepo.data.separatorTitleNarration,
							genericSubTitleValue = thisRepo.data.separatorSubTitle,
							separatorSubTitleNarration = thisRepo.data.separatorSubTitleNarration,
							imgSrc = thisRepo.data.separatorImage,
							imgWidth = thisRepo.data.imgWidth,
							imgHeight = thisRepo.data.imgHeight,
							imgMinimumReadble = thisRepo.data.minimumReadable * 100;

						logger.debug(logger.category.EDITOR, 'Convert old separator (id: ' + thisRepo.id + ') to new format');

						delete thisRepo.data.separatorTitle;
						delete thisRepo.data.separatorSubTitle;
						delete thisRepo.data.separatorImage;
						delete thisRepo.data.imgWidth;
						delete thisRepo.data.imgHeight;
						delete thisRepo.data.separatorTitleNarration,
						delete thisRepo.data.separatorSubTitleNarration,
						delete thisRepo.data.minimumReadable;


						//assetManager: Array[3] ????
						var imgData = imgSrc ? { "minimumReadable" : imgMinimumReadble,
		                    					"image" : imgSrc,
						                    	'imgHeight': imgHeight,
						                    	'imgWidth' : imgWidth} : {};

						repo.createItem({
				            type: "imageViewer",
		                    parentId: thisRepo.id,
		                    data: _.extend(imgData, {
		                    	"dontInputCaption" : true,
		                    	"dontInputSound": true,
		                    	"hide": !imgData,
		                    	"disableDelete":true,

		                    })
		                });

						template = '[{  "id":"{{id1}}",\
										"type": "{{TitleType}}",\
										"parent": "{{parentId}}",\
										"children": ["{{id2}}"],\
										"data": {"title": "title", "disableDelete":true}\
									},\
									{	"id":"{{id2}}",\
										"type": "textViewer",\
										"parent": "{{id1}}",\
										"children": [],\
										"data": {"title": "{{{textViewerValue}}}", "disableDelete":true, "styleOverride": "{{style}}", "mode" : "singleStylePlainText", "availbleNarrationTypes" :[ {"name": "None", "value": ""},{"name":"General", "value": "1"}]}\
									}]';

						var genericTitleId= repo.addTemplate({
								template: template,
								style: 'separatorTitle',
                                parentId: thisRepo.id,
                                TitleType : "genericTitle",
                                textViewerValue : require('repoValidation').getParsedString(genericTitleValue, 'separatorTitle')
                            });

						var genericSubTitleId= repo.addTemplate({
								template: template,
								style: 'separatorSubTitle',
                                parentId: thisRepo.id,
                                TitleType : "genericSubTitle",
                                textViewerValue : require('repoValidation').getParsedString(genericSubTitleValue, 'separatorSubTitle')
                            });

						repo.updateProperty(thisRepo.id, 'showImage' , !!imgData);
						repo.updateProperty(thisRepo.id, 'showTitle' , !!genericTitleValue);
						repo.updateProperty(thisRepo.id, 'showSubTitle' , !!genericSubTitleValue);
						repo.updateProperty(genericTitleId, 'hide', !genericTitleValue);
						repo.updateProperty(genericSubTitleId, 'hide', !genericSubTitleValue);

						if(separatorTitleNarration){
							var genericTitle = repo.getChildrenRecordsByTypeRecursieve(thisRepo.id , 'genericTitle'),
								genericTitleTextId = genericTitle[0].children[0];

								repo.updateProperty(genericTitleTextId,'generalNarration', true);
								repo.updateProperty(genericTitleTextId,'narration', separatorTitleNarration);
								repo.updateProperty(genericTitleTextId,'narrationType', "1");
								repo.updateProperty(genericTitleTextId, 'showNarrationType', true);
						}
						if(separatorSubTitleNarration){
							var genericSubTitle = repo.getChildrenRecordsByTypeRecursieve(thisRepo.id , 'genericSubTitle'),
								genericSubTitleTextId = genericSubTitle[0].children[0];

								repo.updateProperty(genericSubTitleTextId,'generalNarration', true);
								repo.updateProperty(genericSubTitleTextId,'narration', separatorSubTitleNarration);
								repo.updateProperty(genericSubTitleTextId,'narrationType', "1");
								repo.updateProperty(genericSubTitleTextId, 'showNarrationType', true);

						}

						//set ordered items in correct new location
						if(thisRepo.data.assetManager && thisRepo.data.assetManager.length){
							_.each(thisRepo.data.assetManager, function(orderedAssetData){
								var newAssetParent ;
								switch(orderedAssetData.srcAttr){
									case "separatorImage":
										newAssetParent = repo.getChildrenRecordsByTypeRecursieve(thisRepo.id , 'imageViewer')[0];
										orderedAssetData.srcAttr = "image";
										repo.updateProperty(newAssetParent.id, 'assetManager', [orderedAssetData]);
									break;
									case "separatorTitleNarration":
										newAssetParent = repo.getChildrenRecordsByTypeRecursieve(thisRepo.id , 'genericTitle')[0].children[0];
										orderedAssetData.srcAttr = "narration";
										orderedAssetData.isNarration = true;
										repo.updateProperty(newAssetParent, 'assetManager', [orderedAssetData]);
									break;
									case "separatorSubTitleNarration":
										newAssetParent = repo.getChildrenRecordsByTypeRecursieve(thisRepo.id , 'genericSubTitle')[0].children[0]
										orderedAssetData.srcAttr = "narration";
										orderedAssetData.isNarration = true;
										repo.updateProperty(newAssetParent, 'assetManager', [orderedAssetData]);
									break;
								}
							},this);
							delete thisRepo.data.assetManager;
						}

					}
					else {
						var tvItems = repo.getChildrenRecordsByTypeRecursieve(thisRepo.id, 'textViewer');

						_.each(tvItems, function(tv) {
							var title = $(tv.data.title);
							if (title.children('div').length) {
								tv.data.title = '';
								title.each(function() {
									tv.data.title += $(this).html();
								});
							}
						});
					}
				},
				linking_pair : function(thisRepo, validateObj){
					//ovveride style ovverride of defnition to be noraml
					var linkingPairChildren = repo.getChildrenRecordsByTypeRecursieve(thisRepo.id, 'textViewer');
					_.each(linkingPairChildren, function(child){
						child.data.styleOverride = 'normal';
					});
				},

				// imageViewer: function(thisRepo, validateObj) {
				// 	if (!!thisRepo.data.image &&
				// 		(!thisRepo.data.showSound || !!thisRepo.data.sound)) {
				// 		thisRepo.data.invalidMessage = { valid:true, report:[] };
				// 		thisRepo.data.isValid = true;
				// 	}
				// }
			}

	};
	return new repoValidation();
});