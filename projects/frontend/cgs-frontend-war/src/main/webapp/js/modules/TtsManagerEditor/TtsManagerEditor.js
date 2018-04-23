define(['modules/BaseTaskEditor/BaseTaskEditor', 'repo', 'events', 'lessonModel', 'editMode', './config',
	'./TtsManagerStageView', './TtsRowView','translate'],
	function(BaseTaskEditor, repo, events, lessonModel, editMode, config, 
		TtsManagerStageView, TtsRowView ,i18n) {

		var courseLocale;

		var typesConfig = {
			'textViewer': {
				getRowData: function(id, controller) {

					var record = repo.get(id),
						obj = { template: '' },
						filtered = false;

					if (!record || !record.data.showNarrationType || record.data.stageReadOnlyMode) return;

					// If it's instruction text viewer and instruction is hidden, don't show in tts report
					var instr = repo.getAncestorRecordByType(record.id,"instruction");
					if (instr && !instr.data.show) return;

					// Check if text viewer is not empty
					var validationResult = require('validate').validatePreviewRecursion(record.id);
					if (!validationResult.valid) return;

					obj.id = record.id;
					obj.type = record.type;
					obj.isSelected = controller.selected.indexOf(record.id) > -1;

					var narrations = require('cgsUtil').setTextViewerNarration({
						id: record.id,
						type: record.data.narrationType
					});

					obj.narrationTypes = _.map(require('cgsUtil').cloneObject(record.data.availbleNarrationTypes), function(type) {
						type.selected = (record.data.narrationType == type.value) || (!record.data.narrationType && !type.value);
						return type;
					});

					if (!obj.narrationTypes.length) {
						obj.narrationTypes = [{
								name: 'None',
								value: '',
								selected: !record.data.narrationType || record.data.narrationType == '0'
							},{
								name: 'General',
								value: '1',
								selected: record.data.narrationType == '1'
							}];
						if (!repo.getAncestorRecordByType(record.id,"instruction") ||
	                        !repo.getAncestorRecordByType(record.id,"questionOnly") ) {
	                        obj.narrationTypes.push({
								name: 'Per paragraph',
								value: '2',
								selected: record.data.narrationType == '2'
							});
	                    }
					}

					switch (record.data.narrationType) {
						case '':
						case '0':
							obj.narration = null;
							obj.totalRows = 1;
							obj.totalFiles = 0;
							obj.isDone = false;
							break;
						case '1':
							var attrName = ['narration', courseLocale].join('.');
							obj.narration = _.find(narrations[0].assetManager, function(am) { return am.srcAttr == attrName && (!am.locale || am.locale == courseLocale) });
							var originalNarration = require('cgsUtil').getTextViewerText(record.data.title);
							if (!obj.narration) {
								obj.narration = {
									srcAttr: attrName,
									assetId: null,
									state: false,
									asIs: true,
									locale: courseLocale,
									narrationText: originalNarration,
									originalNarration: originalNarration,
									isTTS: true,
									allowFiles: [
										'audio/mp3'
									],
									fileMymType: 'audio',
									isNarration: true
								}
								if (!record.data.assetManager) {
									repo.updateProperty(record.id, 'assetManager', [require('cgsUtil').cloneObject(obj.narration)]);
								}
								else {
									repo.updatePropertyList(record.id, 'assetManager', require('cgsUtil').cloneObject(obj.narration));
								}
								obj.narration.recordId = record.id;
								obj.isDone = false;
							}
							else {
								obj.narration = require('cgsUtil').cloneObject(obj.narration);
								if (obj.narration.state && obj.narration.origin != 'tts' || obj.narration.assetId) return;

								obj.narration.asIs = _.isUndefined(obj.narration.asIs) ? true : obj.narration.asIs;
								obj.narration.narrationText = obj.narration.asIs ? originalNarration : obj.narration.narrationText;
								obj.narration.originalNarration = originalNarration;
								obj.narration.recordId = record.id;
								obj.isDone = !!obj.narration.state;
							}
							obj.totalRows = obj.totalFiles = 1;

							break;
						case '2':
							obj.narration = null;
							obj.additionalNarrations = [];
							_.each(narrations, function(narration) {
								var asset = _.find(narration.assetManager, function(am) { return am.srcAttr == 'narrations' && (!am.locale || am.locale == courseLocale) }),
									originalNarration = require('cgsUtil').getTextViewerText(narration.text),
									inlineNarration = repo.get(narration.id);

								if (!asset) {
									asset = {
										srcAttr: 'narrations',
										assetId: null,
										state: false,
										asIs: true,
										locale: courseLocale,
										narrationText: originalNarration,
										originalNarration: originalNarration,
										isTTS: true,
										allowFiles: [
											'audio/mp3'
										],
										fileMymType: 'audio',
										isNarration: true
									}

									if (!inlineNarration.data.assetManager) {
										repo.updateProperty(inlineNarration.id, 'assetManager', [require('cgsUtil').cloneObject(asset)]);
									}
									else {
										repo.updatePropertyList(inlineNarration.id, 'assetManager', require('cgsUtil').cloneObject(asset));
									}
									asset.recordId = inlineNarration.id;
								}
								else {
									asset.narrationText = asset.asIs ? originalNarration : asset.narrationText;
									asset.originalNarration = originalNarration;
									asset.recordId = inlineNarration.id;
								}

								if (asset) {
									if (!obj.narration) {
										obj.narration = asset;
									}
									else {
										obj.additionalNarrations.push(asset);
									}
								}
							});
							obj.totalRows = obj.totalFiles = obj.additionalNarrations.length + (obj.narration ? 1 : 0);

							var isNotTTS = _.any(_.union([obj.narration], obj.additionalNarrations), function(narr) {
								return narr && (narr.state && narr.origin != 'tts' || narr.assetId);
							});
							if (isNotTTS) return;

							obj.isDone = _.any(_.union([obj.narration], obj.additionalNarrations), function(narr) {
								return narr && narr.state;
							});

							break;
					}

					_.each(controller.filter, function(values, name) {
						if (name != 'status') {
							filtered = filtered || (values.indexOf(obj[name]) != -1);
						}
						else {
							var val = obj.status ? 'Done' : 'Not Done';
							filtered = filtered || (values.indexOf(val) != -1);
						}
					});

					obj.filtered = filtered;
					obj.readonly = editMode.readOnlyMode;

					obj.events = [{
						selector: '.select-row',
						eventName: 'change',
						handler: function(e) {
							this.controller.selected = this.controller.selected || [];
							if ($(e.target).is(':checked')) {
								this.controller.selected.push(this.obj.id);
								var narrType = _.find(obj.narrationTypes, function(nt) { return nt.selected });
								if (narrType && !narrType.value) {
									this.$('.narration-type').val('1').change();
								}
							}
							else {
								this.controller.selected = _.without(this.controller.selected, this.obj.id);
							}
							this.controller.setNarrateButtonState();
							this.refresh();
							this.controller.checkSelectAllState();
							this.controller.stage_view.updateNumberOfSelectedRows()
						}
					}, {
						selector: '.narration-type',
						eventName: 'change',
						handler: function(e) {
							var record = repo.get(this.obj.id);
							
							if (record) {
								repo.updateProperty(record.id, 'narrationType', $(e.target).val());
								if (record.data.narrationType == '1') {
									var attrName = ['narration', courseLocale].join('.'),
										assets = require('cgsUtil').cloneObject(record.data.assetManager),
										asset = _.find(assets, function(am) { return am.srcAttr == attrName && (!am.locale || am.locale == courseLocale) });
									if (asset && asset.state) {
										asset.state = false;
										repo.updateProperty(record.id, 'assetManager', assets);
									}
								}
							}

							this.refresh();
						}
					}, {
						selector: '.as-is-check',
						eventName: 'change',
						handler: function(e) {
							var textElement = this.$('.narration-text[recordId="' + $(e.target).attr('recordId') + '"][srcAttr="' + $(e.target).attr('srcAttr') + '"]');
				            if ($(e.target).is(':checked')) {
				            	if (this.obj.narration.srcAttr == $(e.target).attr('srcAttr') &&
				            		this.obj.narration.recordId == $(e.target).attr('recordId')) {
				            		textElement.val(this.obj.narration.originalNarration);
				            	}
				            	else {
				            		var narration = _.find(this.obj.additionalNarrations, function(narr) {
				            			return narr.srcAttr == $(e.target).attr('srcAttr') && narr.recordId == $(e.target).attr('recordId');
				            		});
				            		if (narration) {
				            			textElement.val(narration.originalNarration);
				            		}
				            	}
				            }
			            	var record = repo.get($(e.target).attr('recordId'));
			            	if (record) {
			            		var assets = require('cgsUtil').cloneObject(record.data.assetManager),
			            			asset = _.find(assets, function(am) { return am.srcAttr == $(e.target).attr('srcAttr') && (!am.locale || am.locale == courseLocale); });
			            		if (asset) {
			            			asset.asIs = $(e.target).is(':checked');
			            			asset.narrationText = $(e.target).is(':checked') ? textElement.val() : asset.narrationText;
			            			repo.updateProperty(record.id, 'assetManager', assets);
			            			this.refresh();
			            		}
			            	}
						}
					}, {
						selector: '.narration-text',
						eventName: 'change',
						handler: function(e) {
							var record = repo.get($(e.target).attr('recordId'));
			            	if (record) {
			            		var assets = require('cgsUtil').cloneObject(record.data.assetManager),
			            			asset = _.find(assets, function(am) { return am.srcAttr == $(e.target).attr('srcAttr') && (!am.locale || am.locale == courseLocale); });
			            		if (asset) {
			            			asset.narrationText = $(e.target).val();
			            			repo.updateProperty(record.id, 'assetManager', assets);
			            		}
			            		this.refresh();
			            	}
						}
					}, {
						selector: '.revert-narration',
						eventName: 'click',
						handler: function() {
							var record = repo.get(this.obj.id);

							function uploadPlaceholder(callback) {
								var pid = require("userModel").getPublisherId(),
									cid = require("courseModel").getCourseId(),
									ph = 'media/placeholder.mp3',
									filename = ph.substr(ph.lastIndexOf('/') + 1);

								require('files').downloadFile({
									url: ph,
									publisherId: pid,
									courseId: cid,
									filename: filename,
									dirname: 'media',
									callback: function() {
										if (typeof callback == 'function') {
											callback('/' + ph);
										}
									}
								});
							}

							if (record) {
								uploadPlaceholder(function(path) {
									if (record.data.narrationType == '1') {
										repo.updateProperty(record.id, 'narration', path);
										var attrName = ['narration', courseLocale].join('.'),
											assets = require('cgsUtil').cloneObject(record.data.assetManager),
											asset = _.find(assets, function(am) { return am.srcAttr == attrName && (!am.locale || am.locale == courseLocale) });
										if (asset) {
											asset.state = false;
											delete asset.origin;
											repo.updateProperty(record.id, 'assetManager', assets);
										}
									}
									else if (record.data.narrationType == '2') {
										_.each(repo.getChildrenRecordsByType(record.id, 'inlineNarration'), function(inline) {
											repo.updateProperty(inline.id, 'narrations', inline.data.narrations || {});
											repo.updatePropertyObject(inline.id, 'narrations', courseLocale, path);
											var assets = require('cgsUtil').cloneObject(record.data.assetManager),
												asset = _.find(assets, function(am) { return am.srcAttr == 'narrations' && (!am.locale || am.locale == courseLocale) });
											if (asset) {
												asset.state = false;
												delete asset.origin;
												repo.updateProperty(record.id, 'assetManager', assets);
											}
										});
									}
									this.refresh();
								}.bind(this));
							}
							else {
								this.refresh();
							}
						}
					}];

					return obj;
				}
			},
			'cloze_text_viewer': {
				getRowData: function(id, controller) {
					return typesConfig.textViewer.getRowData(id, controller);
				}
			}
		}

		var TtsManagerEditor = BaseTaskEditor.extend({

			typesConfig: typesConfig,
			perPage: 25,

			initialize: function(configOverrides) {

				courseLocale = repo.get(require('courseModel').getCourseId()).data.contentLocales[0];

				this.setStageViews({
					normal: TtsManagerStageView
				});

				this._super({
					menuInitFocusId: config.menuInitFocusId,
					menuItems: []
				}, configOverrides);

				// Default sort by location
				this.filter = {};
				this.selected = [];
				this.sortBy = 'assetId';
				this.sortOrder = 'asc';
				this.page = Math.max(1, parseInt(this.router._static_data.page, 10) || 1);

				this.narrations = this.getLessonNarrations();

				if (!this.config.previewMode) {
					this.startStageEditing();
				}

				if (this.narrations.length) {
					this.fillNarrationsTable();
				}

				this.registerEvents();
			},
			
			registerEvents : function f1391() { },
			
			startStageEditing: function(){
				this.showStagePreview($('#stage_base'), {bindEvents: true});
			},

			getLessonNarrations: function() {
				var narrations = [],
					records = repo.getSubtreeRecursive(lessonModel.getLessonId());

				_.each(records, function(record) {
					if (typesConfig[record.type] && typeof typesConfig[record.type].getRowData == 'function') {
						var obj = typesConfig[record.type].getRowData(record.id, this);

						if (obj) {
							narrations.push(obj);
						}
					}
				}, this);

				this.totalPages = Math.floor(narrations.length / this.perPage) + !!(narrations.length % this.perPage);
				var pageNarrations = _.first(_.rest(narrations, (this.page - 1) * this.perPage), this.perPage);

				return pageNarrations;
			},

			fillNarrationsTable: function() {
				this.stage_view.$('#narrations-table tbody').remove();

				this.views = [];

				_.each(this.narrations, function(narration) {
					require('busyIndicator').start();
					_.defer(function() {
						this.views.push(new TtsRowView({
							controller: this,
							parentEl: '#narrations-table',
							obj: narration
						}));
					}.bind(this));
				}, this);

				this.setNarrateButtonState();
			},

			removeView: function(view) {
				this.views = _.filter(this.views, function(v) { return v != view; });
			},

			setNarrateButtonState: function() {
				var totalFiles = 0;
				_.each(this.narrations, function(narr) {
					if (!narr.filtered && !narr.isDone && narr.isSelected && narr.totalFiles)
						totalFiles += narr.totalFiles;
				});
				this.screen.view.$('#btn_Narrate').attr('disabled', !totalFiles);
			},

			updateObjectData: function(obj) {
				var newObj = this.typesConfig[obj.type].getRowData(obj.id, this),
					index = this.narrations.indexOf(obj);

				if (index > -1) {
					if (newObj) {
						this.narrations.splice(index, 1, newObj);
					}
					else {
						this.narrations.splice(index, 1);
					}
				}
				else if (newObj) {
					this.narrations.push(newObj);
				}

				return newObj;
			},

			narrateSelectedRows: function() {
				require('busyIndicator').start();

				var toNarrate = [],
					self = this,
					total,
					proceed = {};

				_.each(this.narrations, function(narration) {
					if (narration.isSelected && !narration.filtered) {
						if (narration.narration && narration.narration.narrationText.trim()) {
							toNarrate.push(_.extend(require('cgsUtil').cloneObject(narration.narration), { rowId: narration.id }));
						}
						_.each(narration.additionalNarrations, function(an) {
							if (an.narrationText.trim()) {
								toNarrate.push(_.extend(require('cgsUtil').cloneObject(an), { rowId: narration.id }));
							}
						});
					}
				});

				total = toNarrate.length;

				(function sendText(narrationData) {
					if (narrationData) {
						require('busyIndicator').setData('((Fetching media files)) (' + (total - toNarrate.length) + ' ((of)) ' + total + ')', (total - toNarrate.length - 1) / total * 100);
						require('ttsModel').go(courseLocale, narrationData.narrationText, function(url) {
							var record = repo.get(narrationData.recordId);
							if (record) {
								var attrName = narrationData.srcAttr.indexOf('.') > -1 ? narrationData.srcAttr.split('.')[0] : narrationData.srcAttr;
								var narrObj = _.isObject(record.data[attrName]) ? record.data[attrName] : {};
								narrObj[courseLocale] = url;
								repo.updateProperty(record.id, 'has_multinarration', true);
								repo.updateProperty(record.id, 'multiNarrations', record.data.multiNarrations || {});
								repo.updateProperty(record.id, attrName, narrObj);
								var assets = require('cgsUtil').cloneObject(record.data.assetManager);
								var asset = _.find(assets, function(am) { return am.srcAttr == narrationData.srcAttr && (!am.locale || am.locale == courseLocale) });
								if (asset) {
									asset.state = true;
									asset.origin = 'tts';
									repo.updateProperty(record.id, 'assetManager', assets);
								}
							}
							if (_.isUndefined(proceed[narrationData.rowId])) {
								proceed[narrationData.rowId] = true;
							}
							sendText(toNarrate.shift());
                            self.selected.splice(self.selected.indexOf(narrationData.rowId),1);                            
							self.checkSelectAllState();
                            self.setNarrateButtonState();
                            
						}, function() {
							proceed[narrationData.rowId] = false;
							sendText(toNarrate.shift());
						});
					}
					else {
						require('busyIndicator').stop();
						
						_.each(proceed, function(v, k) {
							var narrView =  _.find(self.views, function(view) { return view.obj.id == k; });
							if (narrView) {
								narrView.setTtsState(v);
							}
						});
					}
				})(toNarrate.shift());
                
			},

			selectAll: function(val) {
				this.fromCode = true;
				_.each(this.views, function(view) {
					if (view.obj.isSelected != val) {
						view.$('.select-row').attr('checked', val).change();
					}
				});
				this.fromCode = false;
			},

			checkSelectAllState: function() {
				if (!this.fromCode) {
					this.stage_view.setSelectAll(this.isSelectAll());
				}
			},

			isSelectAll: function() {
				return !!this.selected.length && this.selected.length >= _.filter(this.narrations, function(narr) { return !narr.filtered }).length;
			},
            
            isReadOnlyMode: function() {
                return editMode.readOnlyMode;
            },

			prevPage: function() {
				if (this.page > 1) {
					return "#load/" + this.router._static_data.id + '/' + this.router._static_data.tab + '/' + (this.page - 1);
				}
			},

			nextPage: function() {
				if (this.page < this.totalPages) {
					return "#load/" + this.router._static_data.id + '/' + this.router._static_data.tab + '/' + (this.page + 1);
				}
			},

			getPages: function() {
				return _.map(_.range(1, this.totalPages + 1), function(val) {
					return {
						value: val,
						selected: val == this.page
					}
				}, this);
			},

			refresh: function() {
				this.narrations = this.getLessonNarrations();
				this.fillNarrationsTable();
			},

			beforeClose: function() {
				if (require('cgsUtil').lastURL && require('cgsUtil').lastURL.id) {
					this.router.load(require('cgsUtil').lastURL.id, require('cgsUtil').lastURL.tab);
				}
				else {
					this.router.load(this.router._static_data.id);
				}
			}

		}, {type: 'TtsManagerEditor',
			setScreenLabel: 'TtsManager Content',
			showTaskSettingsButton: false,
			displayTaskDropdown: false});

		return TtsManagerEditor;

	});