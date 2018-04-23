define(['modules/BaseTaskEditor/BaseTaskEditor', 'repo', 'events', 'lessonModel', 'editMode', './config',
	'./AssetsManagerStageView', './AssetRowView','translate'],
	function(BaseTaskEditor, repo, events, lessonModel, editMode, config, 
		AssetsManagerStageView, AssetRowView ,i18n) {

		var AssetsManagerEditor = BaseTaskEditor.extend({

			initialize: function(configOverrides) {

				if (!this.isNarration) {
					this.setStageViews({
						normal: AssetsManagerStageView
					});
				}

                this._super(/*config*/{
                    menuInitFocusId: config.menuInitFocusId,
                    menuItems: []
                }, configOverrides);

				// Default sort by location
				this.filter = {};
				this.sortBy = this.isNarration ? 'assetId' : 'location';
				this.sortOrder = 'asc';
				this.assets = this.getLessonAssetsData();

				var notDoneAssets = _.filter(this.assets, function(asset) {
					return !asset.status;
				}).length;

				this.obj = {
					total: this.assets.length,
					notDone: notDoneAssets,
					single: notDoneAssets == 1
				};

				if (!this.config.previewMode) {
					this.startStageEditing();
				}

				if (this.assets.length) {
					this.fillAssetsTable();
				}
				else {
					events.fire('setMenuButtonState', 'menu-button-export-assets', 'disable');
				}

				this.registerEvents();
			},
			
			registerEvents : function f51(){
				this.bindEvents({
					'assetsTableToCsv' : {
						'type' 		: 'register', 
						'func' 		: this.tableToCsv , 
						'ctx' 		: this, 
						'unbind'	: 'dispose'
					}
				})
			},
			
			tableToCsv : function f52(){
				if(_.isFunction(this.stage_view.tableToCsv)){
					this.stage_view.tableToCsv(i18n.tran('Assets Report') + ' - ' + repo.get(lessonModel.lessonId).data.title + '.csv');
				}
			},
			startStageEditing: function(){
				this.showStagePreview($('#stage_base'), {bindEvents: true});
			},

			getLessonAssetsData: function() {
				var assets = [],
					self = this,
					lessonId = lessonModel.lessonId,
					records = _.filter(repo.getSubtreeRecursive(lessonId), function(item) { return !!item.data.assetManager; }),
					isReadOnly = editMode.readOnlyMode;

				_.each(records, function(item) {
					var amRecords = require('cgsUtil').cloneObject(item.data.assetManager),
						needUpdate = false;
					_.each(amRecords, function(assetData) {
						if ((!!assetData.assetId || assetData.state === false) && !!assetData.isNarration == !!self.isNarration) {
							if (!assetData.assetId) {
								assetData.assetId = ' ';
								needUpdate = true;
							}
							if (self.isNarration && (!assetData.narrationText || assetData.asIs)) {
								switch(item.type) {
									case 'textViewer':
									case 'cloze_text_viewer':
										assetData.narrationText = require('cgsUtil').getTextViewerText(item.data.title);
										needUpdate = true;
										break;
									case 'inlineNarration':
										var tv = repo.get(item.parent);
										if (tv) {
											assetData.narrationText = require('cgsUtil').getTextViewerText(tv.data.title, item.id);
											needUpdate = true;
										}
										break;
								}
							}
							assets.push({
								recordId			: item.id,
								assetId 			: assetData.assetId,
								notes				: self.getAssetNotes(assetData),
								status 				: assetData.state,
								asIs				: assetData.asIs,
								locale              : require("configModel").getLocaleData(assetData.locale) || (assetData.srcAttr.split('.').length > 1 ? require("configModel").getLocaleData(assetData.srcAttr.split('.')[1]) : ""),
								narrationText		: assetData.narrationText,
								narrationType		: self.isNarration && (item.type == 'inlineNarration' ? 'Per Paragraph' : 'General'),
								srcAttr 			: assetData.srcAttr,
								allowFiles 			: assetData.allowFiles,
								fileMymType 		: assetData.fileMymType,//need both because we use one for display and one for fileUpload
								fileMymTypeDisplay  : assetData.fileMymType == 'cws' ? assetData.fileMymType.toUpperCase() : assetData.fileMymType.capitalize(),
								location 			: self.getAssetLocation(item.id),
								isCWS 				: assetData.fileMymType == 'cws',
								readonly 			: isReadOnly
							});
						}
					});
					if (needUpdate) {
						repo.startTransaction({ ignore: true });
						repo.updateProperty(item.id, 'assetManager', amRecords, false, true);
						repo.endTransaction();
					}
				});

				// Sorting of assets data
				assets = _.chain(assets)
							// filter assets
							.each(function(asset) {
								var filtered = false;
								_.each(self.filter, function(values, name) {
									if (name != 'status') {
										filtered = filtered || (values.indexOf(asset[name]) != -1);
									}
									else {
										var val = asset.status ? 'Done' : 'Not Done';
										filtered = filtered || (values.indexOf(val) != -1);
									}
								});

								asset.filtered = filtered;
							})
							// sort assets
							.sortBy(function(asset) {
								switch(self.sortBy) {
									case 'assetId':
										return asset.assetId;
									case 'fileMymTypeDisplay': 
										return asset.fileMymTypeDisplay;
									case 'status': 
										return asset.status ? 0 : 1;
									case 'asIs':
										return asset.asIs ? 0 : 1;
									case 'location':
									default:
										return asset.location.name;
								}
							})
							.value();

				// Reverse id descending
				if (this.sortOrder == 'desc')
					return _(assets).reverse().value();

				return assets;
			},

			getAssetNotes: function(assetData) {
				var notes = assetData.notes || '';
				return notes.replace(/(^|\s)(http:\/\/\S*)/g, '$1<a href="$2" target="_blank">$2</a>').replace(/\n/g, '<br>');
			},

			// Build asset location name by lo name, sequence name and item type with checking existance
			getAssetLocation: function(id) {
				var name = [],
					sequences = ['sequence', 'separator', 'url_sequence', 'html_sequence', 'assessment_question'],
					linkId = null,
					item = repo.get(id),
					lo = repo.getAncestorRecordByType(item.id, 'lo'),
					types = require('types');

				// Get LO name and link (if exists)
				name.push(lo ? lo.data.title : null);
				linkId = lo ? lo.id : null;

				// The asset container is not sequence or separator
				if (sequences.indexOf(item.type) < 0) {
					_.each(sequences, function(seqName) {
						seq = repo.getAncestorRecordByType(item.id, seqName);
						if (seq) {
							// Get sequence name and link
							name.push(seq.data.title);
							linkId = seq.id;
						}
					});

					var task = _.find(repo.getAncestors(item.id), function(rec) {
						return types[rec.type] && types[rec.type].selectTaskType;
					});

					if (task) {
						name.push(types[task.type] && types[task.type].fullName || item.type);
						linkId = task.id;
					}

					name.push(types[item.type] && types[item.type].fullName || item.type);
				}
				// The asset container is sequence or separator
				else {
					// Get sequence name and link
					name.push(item.data.title);
					linkId = item.id;
				}

				return {
					link: linkId,
					name: _.compact(name).join(' - ')
				};
			},

			fillAssetsTable: function() {
				$('#stage_base').find('#assets-table tbody').empty();

				_.each(this.assets, function(asset) {
					new AssetRowView({
						controller: this,
						obj: asset
					});
				}, this);
			},

			refresh: function() {
				this.assets = this.getLessonAssetsData();
				this.fillAssetsTable();
			}

		}, {type: 'AssetsManagerEditor',
			setScreenLabel: 'AssetsManager Content',
			showTaskSettingsButton: false,
			displayTaskDropdown: false});

		return AssetsManagerEditor;

	});