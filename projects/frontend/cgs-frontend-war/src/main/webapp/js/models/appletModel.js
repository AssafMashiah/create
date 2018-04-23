define(['dialogs', 'events', 'dao', 'restDictionary', 'assets', 'files', 'busyIndicator'],
  function (dialogs, events, dao, restDictionary, assets, files, busy) {

    function AppletModel() {

    }

    AppletModel.prototype = {
      //on course open
      init: function (callback) {
        busy.start();

        this.appletManifest = null;

        this.updateManifest(function () {
          busy.stop();
          if (typeof callback === "function") callback();
        });

      },

      showAppDialog: function (args) {
        busy.start();
        this.args = args;
        this.getAppCatalogList(function (data) {
          busy.stop();
          if (this.args.appletId) {
            var applet = _.find(data, function (app) {
              return app.guid.toLowerCase() == this.args.appletId.toLowerCase()
            }, this);
            if (!applet) {
              if (typeof this.args.failCallback == 'function') {
                this.args.failCallback('Applet with id ' + this.args.appletId + ' doesn\'t exist');
                return;
              } else {
                throw new Error('Applet with id ' + this.args.appletId + ' doesn\'t exist');
              }
            }
            this.appletChosen(this.args.appletId);
          } else {
            this.prepareChooseAppletDialog(data);
          }
        }.bind(this));
      },

      getAppCatalogList: function (callback, getForCourse) {
        var repo = require("repo"),
          lessonFormat;

        if (getForCourse) { // when at Course level get all possible applets
          lessonFormat = null; // for this code branch we want to retrieve all possible applets - no filtering
        } else {
          lessonFormat = 'NATIVE'; // default value
          var lesson = require('lessonModel');
          if (lesson.lessonId) {
            lessonFormat = repo.get(lesson.lessonId) && repo.get(lesson.lessonId).data.format
          }
        }

        //get list from server
        var daoConfig = {
          path: restDictionary.paths.GET_APPLET_LIST,
          pathParams: {
            publisherId: require('userModel').getPublisherId(),
            lessonFormat: lessonFormat
          },
          data: {}
        };

        dao.remote(daoConfig, function (data) {
          if (typeof callback === "function") callback(data);
        }, function (jqXHR) {
          if (!this.dontShowCatalogError) {
            this.showAppletsCatalogErrorDialog();
            this.dontShowCatalogError = true;
          }
          callback(null);
        }.bind(this));
      },

      showAppletsCatalogErrorDialog: function () {
        require('showMessage').clientError.show({
          title: 'applets.catalog.error.dialog.title',
          message: 'applets.catalog.error.dialog.message'
        });
      },

      prepareChooseAppletDialog: function (catalogList) {
        if (catalogList) {
          this.appletList = [];
          var self = this;

          _.each(catalogList, function (item, idx) {
            var app = {};
            app.title = item.name;
            app.id = item.guid;
            app.thumbnail = 'data:image/jpg;base64,' + item.thumbnailData;
            self.appletList.push(app);
          });

          var dialogConfig = {
            title: "Choose Applet",

            content: this.appletList,

            buttons: {
              open: {
                label: 'Open',
                value: null,
                canBeDisabled: true
              },
              cancel: {
                label: 'Cancel',
                value: null
              }
            },
            closeOutside: false
          };

          events.register('appletChosen', this.appletChosen, this);

          var dialog = dialogs.create('addApplet', dialogConfig, 'appletChosen');
        } else { // !catalogList
          logger.error(logger.category.APPLETS, 'Applets catalog list is empty');
          if (typeof this.args.failCallback == 'function') {
            this.args.failCallback('Applets catalog list is empty');
          } else {
            this.showAppletsCatalogErrorDialog();
          }
        }
      },

      appletChosen: function (appletId) {

        if (appletId) {
          //update manifest from server
          busy.start();

          this.updateManifest(function () {

            //check if applet exists in course
            if (!this.isAppletInManifest(appletId)) {
              //add the applet to course
              this.addApplets([appletId], function () {
                busy.stop();
              }.bind(this), false);
            } else {
              this.createNewAppletEditor(appletId);
              busy.stop();
            }

          }.bind(this));

          // Set lesson's dirty flag to true
          require('lessonModel').setDirtyFlag(true);
        } else if (typeof this.args.failCallback == 'function') {
          this.args.failCallback('No applet was chosen');
        }
      },

      updateManifest: function (callback) {

        //get manifest from server, if changed, update applets
        this.getAppletManifestLastModified(function (lastModified) {
          this.getRemoteAppletManifest(lastModified, callback);
        }.bind(this));

      },

      getLocalAppletManifest: function (callback) {

        if (!this.appletManifest) {
          var pid = require("userModel").getPublisherId(),
            cid = require("courseModel").getCourseId(),
            filePath = files.coursePath(pid, cid, "cgsData") + "/appletManifest";

          files.fileExists(filePath, function (exists) {
            if (exists) {
              files.loadObject(filePath, callback);
            } else {
              if (typeof callback === "function") callback(null);
            }
          }.bind(this));
        } else {
          if (typeof callback === "function") callback(this.appletManifest);
        }
      },

      //get applet manifest from server
      // param- current manifest last modified
      // returns- boolean: is manifest changed
      getRemoteAppletManifest: function (timestamp, callback) {

        var pid = require("userModel").getPublisherId(),
          cid = require("courseModel").getCourseId(),

          daoConfig = {
            path: restDictionary.paths.GET_APPLET_MANIFEST,
            pathParams: {
              publisherId: pid,
              courseId: cid,
              timestamp: timestamp
            },
            data: {}
          };
        dao.remote(daoConfig, function (data) {
          this.updateLocalApplets(data, callback);

        }.bind(this), function () {
          //error
          if (typeof callback === "function") callback();
        });
      },

      updateLocalApplets: function (manifest, callback) {
        var self = this;

        if (manifest) {
          var saveAppArray = [];

          if ((manifest.applets && manifest.applets.length === 0) || !this.appletManifest) {
            // The remote or local manifest is empty - save all applets (or empty)
            saveAppArray = require('cgsUtil').cloneObject(manifest.applets) || [];
          } else {
            // get diff applets between server manifest and local manifest
            _.each(manifest.applets, function (appletInManifest) {
              var sharedApp = _.where(self.appletManifest.applets, {
                guid: appletInManifest.guid,
                version: appletInManifest.version
              });

              //app is in server manifent but not in local manifest-
              //we need to save it to local file system
              if (sharedApp.length === 0) {
                saveAppArray.push(require('cgsUtil').cloneObject(appletInManifest));
              }
            }); //end each
          }

          if (!saveAppArray.length) {
            self.saveManifestToLocal(manifest, callback);
            return;
          }

          var appletsToSave = saveAppArray.length,
            percentsPerApplet = 100 / appletsToSave,
            savedApplets = 0;

          // recursive function for downloading all applets needed, one by one
          var saveApplets = function (applets, onAppletSaved) {
            var currApplet = applets.shift();

            busy.setData('((Downloading applets)) (' + (appletsToSave - applets.length) + ' ((of)) ' + appletsToSave + ')', savedApplets * percentsPerApplet);
            // take one applet out of array and download it
            self.saveAppletFiles(currApplet, function () {

              savedApplets++;

              if (saveAppArray && saveAppArray.length) {
                // download next applet
                _.defer(saveApplets.bind(self, applets, onAppletSaved));
              } else {
                busy.setData('((Downloading applets)) (' + appletsToSave + ' ((of)) ' + appletsToSave + ')', 100);
                // exit recursion
                self.saveManifestToLocal(manifest, callback);
              }

            }, function (loaded, total) { // Download progress callback
              busy.setData('', savedApplets * percentsPerApplet + loaded / total * percentsPerApplet / 2);
            }, function (extracted, total) { // Extract progress callback
              busy.setData('', savedApplets * percentsPerApplet + percentsPerApplet / 2 + extracted / total * percentsPerApplet / 2);
            });

          };

          saveApplets(saveAppArray, callback);
        } else {
          if (typeof callback === "function") callback();
        }
      },

      saveAppletFiles: function (applet, callback, downloadProgressCallback, extractProgressCallback) {
        var pid = require("userModel").getPublisherId(),
          cid = require("courseModel").getCourseId(),
          filesToAddCount = applet.resources.hrefs.length,
          appVersion = applet.version,
          dirs = [],
          prefix = 'applets/' + applet.guid + '/' + appVersion;

        //prepare all needed directories for the applet
        _.each(applet.resources.hrefs, function (href) {
          var url = prefix + '/' + href.substr(0, href.lastIndexOf('/'));
          if (dirs.indexOf(url) == -1) {
            dirs.push(url);
          }
        });

        var appletResources = [];

        // prepare applet paths
        _.each(applet.resources.hrefs, function (href) {
          appletResources.push(prefix + '/' + href);
        });

        // download all paths one by one
        // commenting out the applets download part. no need to download it.
        //		assets.downloadAssetsPack(appletResources, callback, downloadProgressCallback, extractProgressCallback);
        callback();
      },

      saveManifestToLocal: function (manifest, callback) {
        // save manifest to local file system
        var pid = require("userModel").getPublisherId(),
          cid = require("courseModel").getCourseId(),
          basePath = files.coursePath(pid, cid, "cgsData");

        files.saveObject(manifest, 'appletManifest', basePath, callback);

        // save manifest to current context
        this.appletManifest = manifest;
      },


      getAppletManifestLastModified: function (callback) {

        this.getLocalAppletManifest(function (object) {
          if (object) {
            this.appletManifest = object;
          }

          var date = this.appletManifest && this.appletManifest.header ? this.appletManifest.header["last-modified"].$date : null;
          if (typeof callback === "function") callback(date);
        }.bind(this));

      },

      isAppletInManifest: function (appletId) {
        var appletsList = this.appletManifest.applets;
        return (_.where(appletsList, {
          guid: appletId
        }).length > 0);
      },

      addApplets: function (appletsIds, callback, dontShowEditor) {
        callback = callback || function () {};

        if (!appletsIds.length) {
          callback();
          return;
        }

        var self = this,
          firstApplet = appletsIds[0],
          courseId = require('courseModel').getCourseId(),
          daoConfig = {
            path: restDictionary.paths.ADD_APPLET,
            pathParams: {
              publisherId: require('userModel').getPublisherId(),
              courseId: courseId
            },
            data: {}
          };

        function addToCourse(appletId) {
          if (appletId) {
            daoConfig.pathParams.appletId = appletId;
            dao.remote(daoConfig, function (applet) {
              addToCourse(appletsIds.shift());
            }, function () {
              logger.error(logger.category.APPLETS, 'Failed to add applet ' + appletId);
              callback('error');
            });
          } else {
            self.updateManifest(function () {
              if (!dontShowEditor) {
                self.createNewAppletEditor(firstApplet);
              }
              callback();
            });
          }
        }

        addToCourse(appletsIds.shift());

      },

      //create new applet editor
      createNewAppletEditor: function (appletId) {

        logger.audit(logger.category.EDITOR, 'Add applet ' + appletId + ' to lesson');

        this.args.appletId = appletId;
        var appletsInManifest = _.where(this.appletManifest.applets, {
          guid: appletId
        });
        if (appletsInManifest.length > 0) {
          var pid = require("userModel").getPublisherId(),
            cid = require("courseModel").getCourseId(),
            appletPath = appletsInManifest[0].resources.baseDir;
          this.args.appletPath = '/' + appletPath;
          this.args.thumbnail = appletsInManifest[0].thumbnail;
        }

        events.fire('createNewItem', this.args);
      },

      updateApplets: function (appletsIds, callback) {
        var courseModel = require("courseModel"),
          pid = require("userModel").getPublisherId(),
          cid = courseModel.getCourseId(),
          daoConfig = {
            path: restDictionary.paths.UPDATE_APPLET,
            pathParams: {
              publisherId: pid,
              courseId: cid,
              jobId: require('repo').genId()
            },
            data: {
              appletIds: appletsIds
            }
          },
          self = this;

        this.stopChecking = false;

        courseModel.saveCourse(courseModel.checkLockAndRelease.bind(courseModel, function () {
          dao.remote(daoConfig, null,

            function f1823(jqXHR) {
              logger.error(logger.category.APPLETS, 'Failed to update applets ' + appletsIds.join(','));
              self.stopChecking = true;

              try {
                var responseJson = JSON.parse(jqXHR.responseText);
                if (responseJson.errorId && responseJson.errorId == '2000') {
                  self.showLockingDialog(responseJson.data);
                }
              } catch (err) {}
              self.updateManifest(callback);

            }
          );

          checkSaveProgress.call(self, callback, daoConfig.pathParams.jobId)

        }));

        function checkSaveProgress(callback, jobId) {

          this.runningJobs = this.runningJobs || {};
          this.runningJobs[jobId] = this.runningJobs[jobId] || {
            counter: 0
          };

          var daoConfig = {
            path: restDictionary.paths.CHECK_JOB_PROGRESS,
            pathParams: {
              jobId: jobId
            }
          };

          dao.remote(daoConfig, function (jobState) {
            if (jobState.status == 'COMPLETED') {

              function endOfLockEvent() {
                callback && callback();
                events.unbind('lock_course_success', this);
                events.unbind('lock_ready', this);
              }

              // Get course calls to update manifest
              require("courseModel").openCourse(cid, function () {
                //register event to lock because we want to stay with the lock after the appplets update
                events.once('lock_course_success', endOfLockEvent);
                events.once('lock_ready', endOfLockEvent);

                //get lock for the course
                events.fire("lock", "course");
              });
            } else {

              if (jobState.status == 'STARTED' && ++this.runningJobs[jobId].counter > 100) {
                if (typeof callback == 'function') callback();
                return;
              }

              var percents = (jobState.componentsProgressInPercent.applet || 0) * 0.3 +
                (jobState.componentsProgressInPercent.appletManifests || 0) * 0.7;

              busy.setData('((Updating applets...))', percents);

              if (!this.stopChecking) {
                setTimeout(checkSaveProgress.bind(this, callback, jobId), 1000);
              }
            }
          }.bind(this));
        }
      },

      showLockingDialog: function (data) {

        require("lockModel").showLockingDialog("Applets - Lessons being edited", data)

      }

    };

    return new AppletModel();

  });
