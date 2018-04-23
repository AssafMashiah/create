define(['dialogs', 'events', 'dao', 'restDictionary', 'files', 'busyIndicator', 'repo', 'showMessage', 'courseModel', 'cgsUtil'],
  function (dialogs, events, dao, restDictionary, files, busy, repo, showMessage, courseModel, cgsUtil) {

    function ToolboxModel() {
      var manifestCache;

      this.showToolboxDialog = function (args) {
        busy.start();

        this.args = args || {};

        this.getToolboxManifest(function (data) {
          busy.stop();

          var appletsToList = cgsUtil.cloneObject(data);

          if (this.args.excludeAlreadySelected) {
            var courseId = courseModel.getCourseId();
            var course = repo.get(courseId);

            if (course) {
              var courseToolbox = course.data.toolboxWidgets || [];
              var appletsAlreadySelected = courseToolbox.map(function (applet) {
                return applet.guid;
              });

              appletsToList = appletsToList.filter(function (applet) {
                return appletsAlreadySelected.indexOf(applet.guid) === -1;
              });
            }
          }

          this.prepareToolboxDialog(appletsToList);
        }.bind(this));
      };

      this.getToolboxManifest = function (callback) {
        if (manifestCache) {
          return callback(manifestCache);
        }

        //get list from server
        var daoConfig = {
          path: restDictionary.paths.GET_TOOLBOX_MANIFEST,
          data: [],
        };

        dao.remote(daoConfig, function (data) {
          // update manifestCache
          manifestCache = data;

          if (typeof callback === "function") {
            callback(data);
          }
        }, function (jqXHR) {
          if (!this.dontShowCatalogError) {
            this.showAppletsCatalogErrorDialog();
            this.dontShowCatalogError = true;
          }

          if (typeof callback === "function") {
            callback(null);
          }
        }.bind(this));
      };

      this.showAppletsCatalogErrorDialog = function () {
        showMessage.clientError.show({
          title: 'toolbox.manifest.error.dialog.title',
          message: 'toolbox.manifest.error.dialog.message'
        });
      };

      this.prepareToolboxDialog = function (catalogList) {
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

          events.once('toolboxAppletChosen', this.toolboxAppletChosen, this);

          dialogs.create('addApplet', dialogConfig, 'toolboxAppletChosen');
        } else { // !catalogList
          logger.error(logger.category.APPLETS, 'Toolbox catalog list is empty');

          if (typeof this.args.failCallback == 'function') {
            this.args.failCallback('Toolbox catalog list is empty');
          } else {
            this.showAppletsCatalogErrorDialog();
          }
        }
      };

      this.toolboxAppletChosen = function (appletId) {
        if (appletId) {
          var applet;

          busy.start();

          if (Object.prototype.toString.call(manifestCache) === '[object Array]') {
            applet = manifestCache.find(function (widget) {
              return widget.guid === appletId;
            });

            if (applet) {
              // add this applet to the course toolbox

              var courseId = courseModel.getCourseId();
              var course = repo.get(courseId);

              if (course) {
                var courseToolbox = course.data.toolboxWidgets || [];
                var updatedWidgets = cgsUtil.cloneObject(courseToolbox);

                var foundWidget = courseToolbox.find(function (widget) {
                  return widget.guid === applet.guid;
                });

                if (!foundWidget) {
                  updatedWidgets.push({
                    guid: applet.guid,
                    name: applet.name,
                    thumbnailData: applet.thumbnailData,
                    thumbnailMimeType: getMimeTypeFromImageName(applet.thumbnail),
                  });

                  repo.updateProperty(courseId, 'toolboxWidgets', updatedWidgets);
                  courseModel.setDirtyFlag(true);
                  events.fire('courseToolboxUpdated');
                }
              }
            }

            busy.stop();
          }
        } else if (typeof this.args.failCallback == 'function') {
          this.args.failCallback('No applet was chosen');
        }
      };

      this.removeToolboxApplet = function (appletId) {
        var courseId = courseModel.getCourseId();
        var course = repo.get(courseId);

        if (!course) {
          return;
        }

        var courseToolbox = course.data.toolboxWidgets || [];

        var foundWidget = courseToolbox.find(function (widget) {
          return widget.guid === appletId;
        });

        if (foundWidget) {
          var dialogConfig = {
            title: "Delete Toolbox e-Widget",
            content: {
              text: "Are you sure you want to delete the selected e-Widget from the toolbox?",
              icon: 'warn'
            },
            buttons: {
              'yes': {
                label: 'Yes',
                value: true
              },
              'cancel': {
                label: 'Cancel',
                value: false
              }
            }
          };

          events.once('courseToolboxAppletRemove', function (userClickedYes) {
            if (!userClickedYes) {
              return;
            }

            this.continueToolboxAppletRemove(foundWidget.guid);
          }.bind(this), this);

          dialogs.create('simple', dialogConfig, 'courseToolboxAppletRemove');
        }
      };

      this.continueToolboxAppletRemove = function (appletId) {
        if (!appletId) {
          return;
        }

        var courseId = courseModel.getCourseId();
        var course = repo.get(courseId);

        if (!course) {
          return;
        }

        var courseToolbox = course.data.toolboxWidgets || [];

        var updatedWidgets = courseToolbox.filter(function (widget) {
          return widget.guid !== appletId;
        });

        if (updatedWidgets.length !== courseToolbox) {
          // a change to the widget list was made
          repo.updateProperty(courseId, 'toolboxWidgets', updatedWidgets);
          courseModel.setDirtyFlag(true);
          events.fire('courseToolboxUpdated');
        }
      };
    }

    function getMimeTypeFromImageName(name) {
      if (!name) {
        return;
      }

      var mimeType = 'image/';
      var nameSplit = name.split('.');

      if (nameSplit.length > 1) {
        mimeType += nameSplit.pop();
      }

      return mimeType;
    }

    return new ToolboxModel();
  });
