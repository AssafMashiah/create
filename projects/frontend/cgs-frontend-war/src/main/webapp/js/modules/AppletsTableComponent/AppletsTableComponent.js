define(['lodash', 'BaseController', 'repo', 'appletModel', 'files',
	    './AppletsTableComponentView', './AppletsTableRowView', './config', 'assets', 'editMode', 'busyIndicator'],
function(_, BaseController, repo, appletModel, files,
         AppletsTableComponentView, TableRowView, config, assets, editMode, busy) {

	var AppletsTableComponent = BaseController.extend({

		subViews: {},

		initialize: function(configOverrides) {
			this.subViews = {};//TEMP workaround because subview weren't cleared.

			this._super(config, configOverrides);
			this.view = new AppletsTableComponentView({controller: this});

			this.registerEvents();

			this.refreshTable();
		},

		refreshTable: function() {
			if (appletModel.appletManifest && appletModel.appletManifest.applets && appletModel.appletManifest.applets.length) {
				appletModel.getAppCatalogList(this.checkForUpdates.bind(this), true);
			}
			else {
				this.load([]);
				var courseEditorView = require('router').activeEditor.view;
				if(courseEditorView && typeof courseEditorView.setAppletsUpdateCount === 'function') {
					courseEditorView.setAppletsUpdateCount(0);
				}
			}
		},

		checkForUpdates: function(catalog) {
			var updates = 0,
				loadAppletsArr = [];

			if (appletModel.appletManifest) {
				var allApplets = require('cgsUtil').cloneObject(appletModel.appletManifest.applets),
					self = this;

				function getAppletData (applet) {
					if (applet) {
						var catApplet = _.where(catalog, {guid: applet.guid}),
							hasUpdate = false,
							appName = '',
							myApplet = {
								id: applet.guid,
								thumbnail: assets.serverPath(applet.thumbnail),
								version: applet.version,
								isDisabled: editMode.readOnlyMode
							};

						if(catApplet.length != 0) {
							if (catApplet[0].version != applet.version) {
								hasUpdate = true;
								updates++;
							}
							loadAppletsArr.push(_.extend(myApplet, { name: catApplet[0].name, updateAvailable: hasUpdate }));
							getAppletData(allApplets.shift());
						}
						else {
							var manifest = _.find(applet.resources.hrefs, function(href) { return href.indexOf('manifest.json') > -1 });
							if (manifest) {
								var filePath = files.coursePath(undefined, undefined, [applet.resources.baseDir, manifest].join('/'));

								files.fileExists(filePath, function(file) {
									if (file) {
										files.loadObject(filePath, function(man) {
											loadAppletsArr.push(_.extend(myApplet, { name: man.name, updateAvailable: false }));
											getAppletData(allApplets.shift());
										});
									}
									else {
										loadAppletsArr.push(_.extend(myApplet, { name: 'unknown', updateAvailable: false }));
										getAppletData(allApplets.shift());
									}
								})
							}
							else {
								loadAppletsArr.push(_.extend(myApplet, { name: 'unknown', updateAvailable: false }));
								getAppletData(allApplets.shift());
							}
						}
					}
					else {
						self.load(loadAppletsArr);

						if (updates > 1 && self.view) {
							self.view.showUpdateAll();
						}

						var courseEditorView = require('router').activeEditor.view;
						if(courseEditorView && typeof courseEditorView.setAppletsUpdateCount === 'function') {
							courseEditorView.setAppletsUpdateCount(updates);
						}
					}
				}

				getAppletData(allApplets.shift());

			}
		},

		registerEvents: function() {

		},

		dispose: function f35() {
			_.invoke(this.subViews, 'dispose');

			this._super();

			delete this.subViews;
		},

		load: function f36(applets) {
			if (!this.view) return;

			var pid = require("userModel").getPublisherId(),
				cid = require("courseModel").getCourseId();

			this.view.clearApplets();

			_.invoke(this.subViews, 'dispose');
			this.subViews = {};

			_.chain(applets)
 			.sortBy(function(applet) { return applet.name; })
			.each(function f37(applet) {

				this.subViews[applet.id] = new TableRowView({
					controller: this,
					obj: applet
				});

			}, this);
		},

		updateApplet: function(appletId) {
			logger.audit(logger.category.COURSE, 'Update applet ' + appletId);

			busy.start();

			var ids = [appletId];
			appletModel.updateApplets(ids, function() {
				this.refreshTable();
				busy.stop();
			}.bind(this));
		},

		updateAll: function() {
			logger.audit(logger.category.COURSE, 'Update all applets');

			busy.start();

			var self = this,
				appletsIds = _.chain(this.subViews)
							.map(function(row) { return row.obj; })
							.where({updateAvailable: true})
							.map(function(applet) { return applet.id; })
							.value();

			appletModel.updateApplets(appletsIds, function() {
				this.refreshTable();
				busy.stop();
			}.bind(this));
		}

	}, {type: 'AppletsTableComponent'});

	return AppletsTableComponent;

});
