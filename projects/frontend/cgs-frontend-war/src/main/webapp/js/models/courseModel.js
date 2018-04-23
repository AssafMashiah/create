define(['events', 'dao', 'restDictionary', 'userModel', 'repo', 'files', 'recent', 'conversionUtil',
    'assets', 'configModel', 'localeModel', 'dialogs', 'busyIndicator', 'cgsUtil', 'cookie', 'learningPathModel'
  ],
  function f1857(events, dao, restDictionary, userModel, repo, files, recent,
    conversionUtil, assets, configModel, localeModel, dialogs, busy, cgsUtil, cookie, learningPathModel) {

    var CourseModel = (function f1858() {

      ///////////////////////////////////////////////Private Section////////////////////////////////////////////
      //handle repo_changed event
      function repoChanged() {
        this.setDirtyFlag(true);
      }

      //loads course related repo data and download assets and references
      function loadRepoAndDownloadFiles(courseId, courseData, lessonsHeaders) {

        // wrap data
        var dataWrapper = {
          "course": courseData,
          "lessonsData": lessonsHeaders
        };

        // convert
        var repoData = conversionUtil.dataRemoteToRepo(dataWrapper, courseId);

        // load
        repo.loadJSON(repoData, true);
        this.setCourseId(courseId);

        repo._old_manifest = courseData;

        // turn off the DirtyFlag so it will not pop up a save dialog later on if no changes where made
        this.setDirtyFlag(false);

        /* Fix course cover url */
        var obj = repo.get(courseId);
        if (obj.data.coverUrl) {
          repo.updateProperty(obj.id, 'coverUrl', assets.serverPath(obj.data.coverUrl), false, true);
        }

        //  load std pkgs
        // busy.start() ;
        require("standardsModel").loadCustomizationPackages(function () {
          repo.reset();
          // busy.stop() ;
        });

        // Get all course lessons ids.
        var lessonsIdArr = [],
          lessonsArr = [];

        (function getTocItems(toc) {
          lessonsIdArr = _.union(lessonsIdArr, _.pluck(toc.tocItemRefs, 'cid'));
          _.each(toc.tocItems, getTocItems);
        })(courseData.toc);


        //map lessons id array with last-modified date from lessonsHeaders
        var lessonRow, tmpArr;
        lessonsArr = _.map(lessonsIdArr, function (lessonId) {
          tmpArr = _.where(lessonsHeaders, {
            'cid': lessonId
          });
          if (tmpArr.length) {
            lessonRow = tmpArr[0];
            return {
              'lessonId': lessonId,
              'lastModified': lessonRow.header["last-modified"]["$date"]
            }
          }
        });

        var self = this;
        // Download course references
        //	assets.downloadCourseResources(courseData.resources, function f1861() {


        // Download language pack files
        assets.downloadCustomizationPack(self.courseId, function () {
          /* Load course applets manifest */
          require('appletModel').init(function f1862() {
            self.callbackOnEndOfCourseOpening && self.callbackOnEndOfCourseOpening.call(self);
            cgsUtil.loadCustomIconsChanges();
            busy.stop();
          });
          // require('appletModel').init(function f1862() {
          // 	var locales = repo.get(self.courseId).data.contentLocales;
          // 	localeModel.setLocale(locales && locales.length && locales[0], function() {
          // 		self.callbackOnEndOfCourseOpening && self.callbackOnEndOfCourseOpening.call(self);
          // 		busy.stop();
          // 	});
          // });
        });
      }

      function getLocalCourseFile(id, parseLocalFile) {
        var daoConfig = {
          path: restDictionary.paths.GET_COURSE,
          pathParams: _.defaults({
            courseId: id,
            fileSuffix: '/manifest'
          }, this.getBaseConfig())
        };

        // get local file content
        dao.getLocal(daoConfig, function f1863(file) {
          parseLocalFile && parseLocalFile(file);
        });
      }

      function handleLocalFile(localFile, original_callback) {
        // proceed with local
        if (localFile) {
          logger.info(logger.category.COURSE, 'Course ' + localFile.courseId + ' loaded from local cache');
          this.setCourseId(localFile.courseId); //set current course model id
          this.courseHeader = localFile.header; //set course header

          original_callback.apply(this, arguments);
        } else {
          // on null load local
          throw new Error("no remote or local data, not suppose to happen");
        }
      }

      function getCourseData(id, original_callback) {

        // local file content - for later
        var localFile = null,
          self = this;

        function parseLocalFile(file) {
          var lastModified = null;

          if (file && file.header && file.header["last-modified"]) {
            // save for later
            localFile = file;
            lastModified = file.header["last-modified"].$date;
          }

          var daoConfig = {
            path: restDictionary.paths.GET_COURSE,
            pathParams: _.defaults({
              courseId: id
            }, self.getBaseConfig()),
            data: {}
          };

          if (lastModified && lastModified.indexOf("1970") == -1) {
            daoConfig.data['last-modified'] = lastModified;
          }

          dao.remote(daoConfig, function f1864(data) {
            recent.addRecent(id); //add current course to recent list
            if (data) {
              var localPath = daoConfig.pathData.path;
              localPath = localPath.split("?")[0];

              dao.saveLocalFile(userModel.getPublisherId(), id, localPath, data, function f1865() {
                self.courseHeader = data.header; //set course header, update last-modified and publishToProduction
                original_callback(data);
              });
            } else {
              handleLocalFile.call(self, localFile, original_callback);
            }
          }, function f1866() {
            handleLocalFile.call(self, localFile, original_callback);
          });
        }

        // get local course data from file system
        getLocalCourseFile.call(this, id, parseLocalFile);

      }

      function updateDiffLevels(data, callback) {
        require("busyIndicator").start();

        var daoConfig = {
          path: restDictionary.paths.UPDATE_DIFFERENTIATION_LEVELS,
          pathParams: _.defaults({
            courseId: this.getCourseId()
          }, this.getBaseConfig()),
          data: data
        };
        dao.remote(daoConfig, function () {
          callback && callback();

          this.saveCourse(function () {
            this.openCourse(this.getCourseId(), function () {
              require('busyIndicator').stop();
            })
          }.bind(this))
        }.bind(this), function (response) {
          require("busyIndicator").stop();
          require("lockModel").showLockingDialog("Change Differentiation Levels - Lessons being edited", JSON.parse(response.responseText).data);
        });
      }

      function onModified(id, onModifiedCallback, onNoModifiedChangesCallback) {

        // local file content - for later
        var localFile = null,
          self = this;

        function parseLocalFile(file) {
          var lastModified = null;

          if (file && file.header && file.header["last-modified"]) {
            // save for later
            localFile = file;
            lastModified = file.header["last-modified"].$date;
          }

          var daoConfig = {
            path: restDictionary.paths.GET_COURSE,
            pathParams: _.defaults({
              courseId: id
            }, self.getBaseConfig()),
            data: {}
          };

          if (lastModified && lastModified.indexOf("1970") == -1) {
            daoConfig.data['last-modified'] = lastModified;
          }

          dao.remote(daoConfig, function f1864(data) {
            if (data) {
              onModifiedCallback();
            } else {
              onNoModifiedChangesCallback();
            }
          }, function f1866() {
            onNoModifiedChangesCallback();
          });
        }

        // get local course data from file system
        getLocalCourseFile.call(this, id, parseLocalFile);

      }

      ////////////////////////////////////////////get course lessons////////////////////////////////////////
      function getLessonsHeaders(id, courseData, loadRepoAndDownloadFiles) {
        var daoConfig = {
            path: restDictionary.paths.GET_ALL_LESSONS,
            pathParams: _.defaults({
              courseId: id
            }, this.getBaseConfig()),
            data: {}
          },
          self = this;

        dao.remote(daoConfig, _.bind(function f1867(lessonsHeaders) {
          if (lessonsHeaders) {
            //save lessonsHeaders headers to local file system
            var localPath = daoConfig.pathData.path;
            localPath = localPath.split("?")[0];

            dao.saveLocalFile(userModel.getPublisherId(), id, localPath, lessonsHeaders, function f1868() {
              loadRepoAndDownloadFiles.call(self, id, courseData, lessonsHeaders);
            });

            require('lessonModel').lessonsHeaders = lessonsHeaders;

            //TODO: update "lessonheader" with correct values
          } else { //no lessons
            require('lessonModel').lessonsHeaders = null;
            loadRepoAndDownloadFiles.call(self, id, courseData, lessonsHeaders);
          }

          require('lessonModel').lessonHeader = {};
          _.each(require('lessonModel').lessonsHeaders, function (h) {
            require('lessonModel').lessonHeader[h.cid] = h.header
          })
        }, this));

      }

      function getlessonsContents(lessonsArr, callback_on_done) {
        busy.setData('((Download lessons data))', 0);
        (function downloadLesson(lessonRow) {
          if (!lessonRow) {
            callback_on_done();
            return;
          }
          require("lessonModel").download(lessonRow.lessonId, lessonRow.lastModified, function f1869() { // loop callback
            downloadLesson(lessonsArr.shift());
          });
        })(lessonsArr.shift());
      }

      /////////////////////////////////////////private saving functions/////////////////////////////////////////
      //after receiving lock on course saving course data
      function onLockReceivedForSave(callback, lockObj, isSilent) {
        logger.audit(logger.category.COURSE, 'Save course start');
        busy.start();
        busy.setData('Saving course...');
        if (lockObj.lockStatus != "other") {
          learningPathModel.checkForDataIntegrity();
          logger.debug(logger.category.COURSE, 'Check customization pack changes start');
          localeModel.checkLocalCustomizationChanges(function () {
            logger.debug(logger.category.COURSE, 'Check customization pack changes end');

            logger.debug(logger.category.COURSE, 'Upload course references start');
            assets.uploadAssetsReferences(this.courseId, function f1871() {
              logger.debug(logger.category.COURSE, 'Upload course references end');

              logger.debug(logger.category.COURSE, 'Save course data start');
              var courseData = saveCourseData.call(this, function f1870(header) {
                logger.debug(logger.category.COURSE, 'Save course data end');
                var continueCallback = callback;
                this.setCourseHeader(header, function () {
                  busy.stop();
                  repo._old_manifest = courseData;
                  if (_.isFunction(continueCallback)) {
                    continueCallback();
                  }
                  logger.info(logger.category.COURSE, 'Save course end');
                }.bind(this));
              }.bind(this));
            }.bind(this));
          }.bind(this));
        } else { //trying to save course that is locked by other user
          logger.warn(logger.category.COURSE, 'The course is locked by another user and can\'t be saved');
          busy.stop();
          if (!isSilent) {
            this.openCourse(this.getCourseId(), require('showMessage').clientError.show.bind(require('showMessage').clientError, {
              errorId: 2001
            }));
          }
          callback("data lost");
        }

      }

      function saveCourseData(callback) {

        var remoteJson = repo.getRemoteJson(), //get remote json data
          courseData = remoteJson.course,
          courseId = this.getCourseId(),
          self = this;

        //workaround for saving custom icons files on resource
        var oldCustomIconsResources = [];
        repo._old_manifest.resources.forEach(function (item) {
          if (item.type == "customIcon") {
            oldCustomIconsResources.push(item);
          }
        });
        if (oldCustomIconsResources.length) {
          courseData.resources.forEach(function (item, index, object) {
            if (item.type == "customIcon") {
              object.splice(index, 1);
            }
          });
          courseData.resources = courseData.resources.concat(oldCustomIconsResources);
        }

        if (this.courseHeader) {
          courseData.header = this.courseHeader; //update courseData header includes last-modified
        }

        var daoConfig = {
          path: restDictionary.paths.SAVE_COURSE,
          pathParams: _.defaults({
            courseId: courseId,
            fileSuffix: "/manifest"
          }, this.getBaseConfig()),
          data: courseData
        };

        saveLocalCourseFile(daoConfig, function f1872() {
          logger.debug(logger.category.COURSE, 'Saving course manifest to server');
          repo.updateProperty(daoConfig.data.courseId, 'toc', daoConfig.data.toc);
          dao.remote(daoConfig, callback.bind(self), function (error) {
            logger.warn(logger.category.COURSE, {
              message: 'Course save failed',
              error: error && error.responseText || error
            });

            var localPath = restDictionary.getPathData(daoConfig.path, daoConfig.pathParams).path;

            localPath = localPath.split('?')[0] + daoConfig.pathParams.fileSuffix;

            require('files').fileExists(localPath, function (exists) {
              if (exists) {
                require('files').deleteFile(localPath);
              }
            });

            busy.stop(true);

            // error message
            var showMessage = require('showMessage');

            if (error.status != 0) {
              showMessage.serverError.show(error);
            } else {
              var showMessageData;
              var courseSaveFailTitle = 'course.save.fail.title';

              try {
                var responseText = JSON.parse(error.responseText);
                var responseTextData = JSON.parse(responseText.data);

                showMessageData = {
                  title: courseSaveFailTitle,
                  message: "The course is being published.<br><h5>((Course)):</h5>{0}<h5>((Published by user)):</h5>{1}".format(
                    repo.get(responseTextData.courseId).data.title,
                    responseTextData.publishUsername
                  )
                };
              } catch (e) {
                showMessageData = {
                  title: courseSaveFailTitle,
                  message: 'course.save.fail.message'
                };
              }

              showMessage.clientError.show(showMessageData);
            }
          });
        });

        return courseData;
      }

      function saveNewEdition(callback, saveRecentAndLocalFiles) {
        logger.info(logger.category.COURSE, "Creating new edition of course");

        var remoteJson = repo.getRemoteJson(), //get remote json data
          courseData = remoteJson.course,
          courseId = this.getCourseId(),
          self = this;


        if (this.courseHeader) {
          courseData.header = this.courseHeader; //update courseData header includes last-modified
        }

        var daoConfig = {
          path: restDictionary.paths.ADD_COURSE_EDITION,
          pathParams: _.defaults({
            courseId: courseId,
            jobId: repo.genId()
          }, this.getBaseConfig()),
          data: courseData
        };

        this.stopChecking = false;

        if (saveRecentAndLocalFiles) {
          daoConfig.path = restDictionary.paths.SAVE_COURSE;

          saveLocalCourseFile(daoConfig, _.bind(function () {

            daoConfig.path = restDictionary.paths.ADD_COURSE_EDITION;

            dao.remote(daoConfig, null,
              function (response) {
                if (response.status !== 200) {
                  this.stopChecking = true;
                }
              }.bind(this)
            );

            checkSaveProgress.call(this, callback, daoConfig.pathParams.jobId);
          }, this));
        } else {
          dao.remote(daoConfig, null,
            function (response) {
              if (response.status !== 200) {
                this.stopChecking = true;
              }
            }.bind(this)
          );
          checkSaveProgress.call(this, callback, daoConfig.pathParams.jobId);
        }

        return courseData;
      }

      // Clone course - save as
      function cloneCourse(callback, saveRecentAndLocalFiles, newCourseName) {

        logger.info(logger.category.COURSE, "Creating new copy of course");

        var remoteJson = repo.getRemoteJson(), //get remote json data
          courseData = remoteJson.course,
          courseId = this.getCourseId(),
          self = this;

        amplitude.logEvent('Save as – course', {
          "Course ID": courseId,
          "Save-as type": "Different Course",
          "Type": cgsUtil.getAmplitudeValue("format", repo.get(this.courseId).data.format)
        });

        if (this.courseHeader) {
          courseData.header = this.courseHeader; //update courseData header includes last-modified
        }

        var encodedNewName = "";

        try {
          encodedNewName = encodeURIComponent(newCourseName);
        } catch (e) {
          encodedNewName = escape(newCourseName);
        }

        var daoConfig = {
          path: restDictionary.paths.SAVE_AS_COURSE,
          pathParams: _.defaults({
            courseId: courseId,
            newName: encodedNewName,
            jobId: repo.genId()
          }, this.getBaseConfig()),
          data: courseData
        };

        this.stopChecking = false;

        if (saveRecentAndLocalFiles) {
          daoConfig.path = restDictionary.paths.SAVE_COURSE;

          saveLocalCourseFile(daoConfig, _.bind(function () {

            daoConfig.path = restDictionary.paths.SAVE_AS_COURSE;

            dao.remote(daoConfig, null,
              function (response) {
                if (response.status !== 200) {
                  this.stopChecking = true;
                }

                if (response.status === 423) {
                  show_course_locked_dialog();
                }
              }.bind(this)
            );

            checkSaveProgress.call(this, callback, daoConfig.pathParams.jobId);
          }, this));
        } else {
          dao.remote(daoConfig, null,
            function (response) {
              if (response.status !== 200) {
                this.stopChecking = true;
              }

              if (response.status === 423) {
                show_course_locked_dialog();
              }
            }.bind(this)
          );

          checkSaveProgress.call(this, callback, daoConfig.pathParams.jobId);
        }

        return courseData;
      }

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
            if (typeof callback == 'function') callback(jobState.refEntityId);
          } else {

            if (jobState.status == 'FAILED' || (jobState.status == 'STARTED' && ++this.runningJobs[jobId].counter > 100)) {
              show_course_failed_dialog();

              if (jobState.status == 'STARTED') {
                logger.error(logger.category.COURSE, "Save course job not started, jobId " + jobId);
              } else {
                logger.error(logger.category.COURSE, {
                  message: "Save course job failed",
                  jobId: jobId,
                  error: jobState.errors
                });
              }
              return;
            }

            var percents = (jobState.componentsProgressInPercent.course || 0) * 0.05 +
              (jobState.componentsProgressInPercent.files || 0) * 0.55 +
              //(jobState.componentsProgressInPercent.tocItems || 0) * 0.15 +
              (jobState.componentsProgressInPercent.tocItemData || 0) * 0.4;

            busy.setData('((Saving course...))', percents);

            if (!this.stopChecking) {
              setTimeout(checkSaveProgress.bind(this, callback, jobId), 1000);
            }
          }
        }.bind(this));
      }

      function show_course_locked_dialog() {
        require('busyIndicator').stop();
        var dialogConfig = {

          title: "Save as new course",

          content: {
            text: "course.action.fail.lesson.locked"
          },
          buttons: {

            cancel: {
              label: 'Done'
            }
          }
        };
        require('dialogs').create('simple', dialogConfig);
      }

      function show_course_failed_dialog() {
        require('busyIndicator').stop();
        var dialogConfig = {

          title: "The requested action failed",

          content: {
            text: "The requested action failed."
          },
          icon: 'error',
          buttons: {
            cancel: {
              label: 'OK'
            }
          }
        };
        require('dialogs').create('simple', dialogConfig);
      }

      function saveLocalCourseFile(config, callback) {
        // setLocal gets config and callback.
        // this bind, binds the callback, so we don't need to send the callback top down
        logger.debug(logger.category.COURSE, 'Saving course manifest locally');
        dao.setLocal(config, callback);
      }

      function importCourse() {

        var dialogConfig = {

          title: "Import Course",

          content: {
            text: "Please choose file to import:"
          },
          closeOutside: false,
          buttons: {
            upload: {
              label: 'OK',
              canBeDisabled: true
            },
            cancel: {
              label: 'Cancel'
            }
          }
        };

        events.once('importCourseResponse', function (returnValue, response) {
          if (response == "cancel") {
            //open landing page
            var router = require('router');
            //only if no course currently open
            if (router.activeScreen.showFirstScreenDialog && !router._static_data.id) {
              router.activeScreen['showFirstScreenDialog']();
            }
          }
        }, this);

        require('dialogs').create('importCourse', dialogConfig, 'importCourseResponse');
      }

      function exportCourse() {
        logger.info(logger.category.COURSE, 'Export course');

        var exportJobId = repo.genId();
        var _courseId = this.courseId;

        amplitude.logEvent('Save as – course', {
          "Course ID": _courseId,
          "Save-as type": "File",
          "Type": cgsUtil.getAmplitudeValue("format", repo.get(this.courseId).data.format)
        });

        var exportDaoConfig = {
          path: restDictionary.paths.EXPORT_COURSE,
          pathParams: _.defaults({
            courseId: _courseId,
            jobId: exportJobId
          }, this.getBaseConfig())
        };

        var _progress_handling = {
          'COMPLETED': function f1874() {
            logger.info(logger.category.COURSE, 'Course export ended');

            this.download(this.properties.exportedCourseFileName);

            busy.stop();
          },
          'STARTED': function f1875() {
            this.keep_progress();
          },
          'IN_PROGRESS': function f1876() {
            this.keep_progress();
          },
          'FAILED': function f1877() {
            logger.error(logger.category.COURSE, {
              message: 'Course export failed',
              error: this.errors
            });
            busy.stop();
            show_course_locked_dialog();
          }
        }

        function onSaveCourseHandler() {
          busy.start();

          logger.info(logger.category.COURSE, 'Course export started after save and lock release');

          dao.remote(exportDaoConfig, onExportProgress.bind(this, exportJobId), $.noop);
        }

        function onExportProgress(jobId) {
          var jobProgressRestAPI = {
            path: restDictionary.paths.CHECK_JOB_PROGRESS,
            pathParams: {
              jobId: jobId
            }
          };

          dao.remote(jobProgressRestAPI, function f1878(_export_progress) {
            var lastKey = Object.keys(_export_progress.componentsProgressInPercent)[Object.keys(_export_progress.componentsProgressInPercent).length - 1];
            switch (lastKey) {
            case 'exporting database and resources':
              require('busyIndicator').setData('((' + lastKey + '))', _export_progress.componentsProgressInPercent[lastKey]);
              break;
            case 'zip resource files':
              require('busyIndicator').setData('((' + lastKey + '))', _export_progress.componentsProgressInPercent[lastKey]);
              break;
            }

            if (_export_progress.status !== "COMPLETED") {
              _export_progress.keep_progress = function f1879() {
                setTimeout(onExportProgress.bind(this, jobId), 1000);
              }
            } else {
              //get lock for the course
              events.fire("lock", "course");
              _export_progress.download = function f1880(courseFilePath) {
                var _download_course_rest_api = {
                  path: restDictionary.paths.DOWNLOAD_EXPORTED_COURSE,
                  pathParams: {
                    courseId: _courseId,
                    coursePath: encodeURIComponent(courseFilePath)
                  }
                };

                var _path_info = dao.getRestApiValidConfig(_download_course_rest_api),
                  _download_link = require('configModel').configuration.basePath + _path_info.pathData.path;
                var _decode_link = unescape(_download_link),
                  _link_element = $("<a></a>").attr({
                    href: _download_link,
                    download: _decode_link.substr(_decode_link.lastIndexOf("/") + 1),
                    target: "_blank"
                  }).appendTo('body');

                _link_element.get(0).click();
                _link_element.remove();
              }
            }

            if (_progress_handling[_export_progress.status]) {
              _progress_handling[_export_progress.status].call(_export_progress);
            }
          }.bind(this));
        }

        cgsUtil.unsavedCourseNotification(this.checkLockAndRelease.bind(this, onSaveCourseHandler));
      }

      function openNewlyCreatedCourse(courseData) {

        var self = this;
        self.callbackOnEndOfCourseOpening = function () {
          require('router').load(courseId);
          require('clipboardManager').clear();
          require("undo").reset();

          busy.stop();
        };

        var publisherId = userModel.getPublisherId();
        var courseId = courseData.courseId;
        var localPath = "/publishers/" + publisherId + "/courses/" + courseId;

        amplitude.logEvent('Create new course', {
          "Course ID": courseId,
          "Content Language": courseData.contentLocales[0],
          Type: cgsUtil.getAmplitudeValue("format", courseData.format)
        });

        dao.saveLocalFile(publisherId, courseId, localPath, courseData, function f1865() {
          self.courseHeader = courseData.header;
          recent.addRecent(courseId); //add current course to recent list


          self.activeSettingsTab = null;
          files.updateCourseLastOpened(courseId, publisherId, function () {
            files.fileSystemCleanup({
              maxAllowedPercentage: configModel.configuration.maxUtilizationPercentageOfClientDisc,
              desiredPercentage: configModel.configuration.designatedUtilizationPercentageOfClientDisc,
              exceptions: [courseId],
              progressCallback: function (percentage) {
                busy.setData('((cleanup.busy.message))', percentage);
              },
              callback: function () {
                busy.setData('((course.open.progress.download_resource))');
                loadRepoAndDownloadFiles.call(self, courseId, courseData, null);
                events.fire("get_locking_object", 'course');
              }
            });

          });
        });
      }

      function createNewCourse(courseName, contentLocale) {
        busy.start();
        var self = this;
        var publisherId = userModel.getPublisherId();

        var encodedNewName = "";
        try {
          encodedNewName = encodeURIComponent(courseName);
        } catch (e) {
          encodedNewName = escape(courseName);
        }

        var daoConfig = {
          path: restDictionary.paths.NEW_COURSE,
          pathParams: {
            'publisherId': publisherId,
            'courseTitle': encodedNewName,
            'contentLocale': contentLocale
          }
        };

        dao.remote(daoConfig, function (data) {
          if (data) {
            events.fire('close_course', openNewlyCreatedCourse.bind(self, data));
          }
        });
      }

      //////////////////////////////////////////Public section//////////////////////////////////////////////////

      return {
        init: function () {
          this.courseId = null;
          this.courseHeader = null;
          this.dirtyFlag = false;
          this.next_index = 0;
          this.bindEvents();
        },
        createNewCourse: function (args) {
          createNewCourse.call(this, args.courseName, args.contentLocales);
        },

        exportCourse: exportCourse,

        importCourse: importCourse,
        //returns course last modified date
        getLastModified: function f1881() {
          return (this.courseHeader && this.courseHeader['last-modified'] && this.courseHeader['last-modified'].$date) || null;
        },

        setCourseHeader: function (header, callback) {
          var record = repo.get(this.courseId),
            courseId = this.courseId,
            self = this;
          // Update the "last-modified" header.
          if (record && record.data) {
            repo.startTransaction({
              ignore: true
            });
            repo.updateProperty(record.id, 'header', header, false, true);
            repo.endTransaction();
          }

          this.courseHeader = header;

          //update local file
          getLocalCourseFile.call(this, courseId, function (file) {
            if (file && file.header) {
              file.header = header;
            }

            var daoConfig = {
              path: restDictionary.paths.SAVE_COURSE,
              pathParams: _.defaults({
                courseId: courseId,
                fileSuffix: "/manifest"
              }, self.getBaseConfig()),
              data: file
            };

            dao.setLocal(daoConfig, function () {
              if (_.isFunction(callback)) {
                callback();
              }
            });
          });
        },

        //returns course publishedToProduction - date published to production, in this case user can't add/delete objects
        isPublishedToProduction: function () {
          return !!(this.courseHeader && this.courseHeader['publishedToProduction']) || false;
        },

        isEditioned: function () {
          return !!(this.courseHeader && this.courseHeader['editioned']) || false;
        },

        // Get course differentiation levels
        getDifferentiationLevels: function () {
          var course = repo.get(this.courseId)
          if (course) {
            return course.data.diffLevels;
          }

          return [];
        },

        //bind course model events
        bindEvents: function f1882() {
          this.unbindEvents();
          events.register('close_course', this.checkLockAndRelease, this);
          events.register("released_course_success");

          events.bind('repo_changed', repoChanged, this);
        },

        //unbind course model events
        unbindEvents: function f1883() {
          events.unbind('repo_changed', repoChanged, this);
          events.unbind('close_course', this.checkLockAndRelease, this);
        },

        //returns course model config
        getBaseConfig: function f1884() {
          return {
            publisherId: userModel.getPublisherId()
          };
        },

        //returns current course id
        getCourseId: function f1885() {
          if (!this.courseId || typeof this.courseId == "undefined") {
            throw new Error("Course id not exist");
          }

          return this.courseId;
        },

        //set current course id
        setCourseId: function f1886(id) {
          this.courseId = id;
          if (id) {
            $.cookie('courseId', this.courseId);
          } else {
            $.removeCookie('courseId');
          }
          this.next_index = 0;
        },

        //sets course model dirty flag
        setDirtyFlag: function f1887(flag) {
          this.dirtyFlag = (!!require('editMode').readOnlyMode ? false : flag); //in readOnly mode don't set flag as dirty
          // Disable or enable save menu button by dirty flag
          events.fire('setMenuButtonState', 'menu-button-save-course', this.dirtyFlag ? 'enable' : 'disable');
        },

        //gets course model dirty flag
        getDirtyFlag: function f1888() {
          return this.dirtyFlag;
        },

        remove: function () {
          this.setCourseId(null);
          repo.startTransaction({
            ignore: true
          });
          require('lessonModel').remove();
          repo.clear();
          repo.endTransaction();
        },

        checkMaxDepth: function () {
          var selectedNode = $(".nav.node-tree .node-collapse.active .node-index").text(),
            currentLevel,
            course = repo.get(repo._courseId),
            maxDepth = 0;

          if (course) {
            maxDepth = course.data.maxDepth;
          }

          if (selectedNode === "") {
            currentLevel = 0;
          } else {
            var tmpArray = selectedNode.split(".");
            currentLevel = tmpArray.length;
          }

          return (currentLevel >= maxDepth);
        },

        ////////////////////////////////////////new course/////////////////////////////////////////////////////
        /*
         * @param newCourseRecord {JSON}
         *      repo record
         */
        newCourse: function f1889(newCourseRecord, disableViewRefresh, optionalCallback) {

          busy.start();

          // clear old data
          repo.clear(); //removes all repo data
          repo._old_manifest = null; // reset date before conversion to use in assets.js
          require('clipboardManager').clear();
          this.courseHeader = null;
          this.activeSettingsTab = null;
          this.setDirtyFlag(false);

          var recordId = repo.set(newCourseRecord), //Add entry for new course in repo
            courseData = null;

          recent.addRecent(recordId); //add new course to recent list
          this.setCourseId(recordId); //set current course id

          function callback(header) {

            this.setCourseHeader(header);

            this.bindEvents(); //bind course model events

            require('editMode').partialEdit(false);

            repo._old_manifest = courseData;

            require('appletModel').init(function f1890() { // Load course applets manifest

              // refresh view
              if (!disableViewRefresh) {
                require('router').load(recordId);
              }

              events.fire('lock', 'course', true); // get locking for course

              //to refresh the view
              events.fire("get_locking_object", 'course');

              repo.reset();

              busy.stop();

              if (typeof optionalCallback == "function")(optionalCallback());
            });
          }

          logger.info(logger.category.COURSE, 'New course created');

          var locales = newCourseRecord.data.contentLocales;
          // Load locale files and auto-save course
          localeModel.setLocale(locales && locales.length && locales[0], true, function () {
            files.updateCourseLastOpened(recordId, userModel.getPublisherId(), function () {
              files.fileSystemCleanup({
                maxAllowedPercentage: configModel.configuration.maxUtilizationPercentageOfClientDisc,
                desiredPercentage: configModel.configuration.designatedUtilizationPercentageOfClientDisc,
                exceptions: [recordId],
                progressCallback: function (percentage) {
                  busy.setData('((cleanup.busy.message))', percentage);
                },
                callback: assets.uploadAssetsReferences.bind(assets, this.courseId, saveCourseData.bind(this, callback))
              });
            }.bind(this));
          }.bind(this));

        },
        ///////////////////////////////////////////////////////////////////////////////////////////////////////

        newEdition: function f1891() {
          busy.start();

          logger.audit(logger.category.COURSE, 'Create new edition of the course');

          saveNewEdition.call(this, callback.bind(this), true);

          function callback(newCourseId) {
            //load current course
            this.openCourse(newCourseId, function f1892() {
              require('router').load(newCourseId);
              busy.stop();
            });
          }

        },

        getCourseLocale: function () {
          return repo.get(repo._courseId).data.contentLocales[0];
        },

        getEBooksIds: function () {
          var courseRepo = repo.get(repo._courseId);
          if (courseRepo && courseRepo.data && courseRepo.data.eBooksIds) {
            return $.map(courseRepo.data.eBooksIds, function (el) {
              return el
            });
          } else {
            return [];
          }
        },

        // Course save as
        saveAs: function (newCourseName) {
          busy.start();

          logger.audit(logger.category.COURSE, 'Save the course as "' + newCourseName + '"');

          this.checkLockAndRelease(cloneCourse.bind(this, cloneCallback.bind(this), true, newCourseName));

          function cloneCallback(newCourseId) {
            this.openCourse(newCourseId, function f1893() {
              (function () {
                busy.setData(require('translate').tran('customization.pack.is.loading.message'));
                var intervalId = setInterval(function () {
                  if (!window.customizationPackLoading) {
                    clearInterval(intervalId);
                    require('router').load(newCourseId);
                    busy.stop();
                  }
                }, 500);
              })();
            });
          }
        },

        ////////////////////////////////////////open course////////////////////////////////////////////////////
        openCourse: function f1894(courseId, callback, dontCloseCourse) {

          logger.info(logger.category.COURSE, 'Opening course ' + courseId);

          this.callbackOnEndOfCourseOpening = callback;

          function onCourseClose(courseId) {
            busy.start();

            require('clipboardManager').clear();
            this.activeSettingsTab = null;

            // perform local file system cleanup if needed
            files.updateCourseLastOpened(courseId, userModel.getPublisherId(), function () {
              files.fileSystemCleanup({
                maxAllowedPercentage: configModel.configuration.maxUtilizationPercentageOfClientDisc,
                desiredPercentage: configModel.configuration.designatedUtilizationPercentageOfClientDisc,
                exceptions: [courseId],
                progressCallback: function (percentage) {
                  busy.setData('((cleanup.busy.message))', percentage);
                },
                callback: function () {

                  var continueCallback = function (lockObj) {
                    events.fire("get_locking_object", 'course');
                    events.unbind('lock_ready', continueCallback, this);
                    events.unbind('lock_course_success', continueCallback, this);
                  };

                  // get course lock, course data and lessons data
                  getCourseData.call(this, courseId, function f1895(courseData) {
                    this.setCourseId(courseId);
                    require('editMode').partialEdit(this.isPublishedToProduction());

                    if (require('PermissionsModel').permissions['edit_course'] === false) {
                      continueCallback();
                    } else {
                      events.register('lock_ready', continueCallback, this);
                      events.register('lock_course_success', continueCallback, this);

                      events.fire("lock", "course");
                    }

                    getLessonsHeaders.call(this, courseId, courseData, loadRepoAndDownloadFiles);
                  }.bind(this));
                }.bind(this)
              });
            }.bind(this));
          }

          if (dontCloseCourse) {
            onCourseClose.call(this, courseId);
          } else {
            events.fire('close_course', onCourseClose.bind(this, courseId));
          }
        },

        ////////////////////////////////////////save course////////////////////////////////////////////////////
        //locks course and afterwards saving it
        saveCourse: function _saveCourse(callback, isSilent) {
          //if user can't edit a course return
          if (require('PermissionsModel').permissions['edit_course'] === false) {
            callback();
          } else {
            var continueCallback = function (lockObj) {
              events.unbind('lock_ready', continueCallback, this);
              events.unbind('lock_course_success', continueCallback, this);
              onLockReceivedForSave.call(this, callback, lockObj, isSilent);
            };
            events.register('lock_ready', continueCallback, this);
            events.register('lock_course_success', continueCallback, this);
            events.fire("lock", "course");
          }
        },

        //show unsaved dialog to the user, and in case of "want to save" response - releases course if it's needed and than saving it
        saveAndRelease: function f1898(callback) {
          cgsUtil.unsavedCourseNotification(this.checkLockAndRelease.bind(this, callback));
        },

        ////////////////////////////////////////releasing course///////////////////////////////////////////////
        releaseCourse: function f1899(lockStatus, callback) {
          if (lockStatus == "self") {
            events.once("released_course_success", function f1900() {
              callback && callback();
            }, this);
            events.fire("release_lock", 'course');
          } else {
            callback && callback();
          }
        },

        getPublishedItems: function f1901() {
          return this.courseHeader.tocIdsPublishedToProduction || [];
        },

        getMultiNarrationLocales: function () {
          return _.toArray(_.filter(require("configModel").getMultiNarrationsLocales(), function (item) {
            return repo.get(repo._courseId).data.multiNarrationLocales && ~repo.get(repo._courseId).data.multiNarrationLocales.indexOf(item.locale);
          }));
        },

        checkLockAndRelease: function f1902(callback) {
          if (!this.courseId) { //no current course - just perform callback
            callback && callback();
            return;
          }

          events.once("lock_ready", function f1903(lockStatus) {
            this.releaseCourse(lockStatus.lockStatus, callback); //after receiving lock object, release the course
          }, this);

          events.fire("get_locking_object", 'course'); //get locking object for course
        },

        isElementPublished: function f1904(id) {
          var _items = this.getPublishedItems();

          return !!(_.isArray(_items) && ~_items.indexOf(id)) || (id == this.courseId && this.isPublishedToProduction());
        },

        onModified: onModified,

        updateDiffLevels: updateDiffLevels,
        //add eBook id to course repo
        addEbook: function (eBookId) {
          var courseEbooks = this.getEBooksIds();
          var hasChange = false;
          if (courseEbooks.indexOf(eBookId) == -1) {
            courseEbooks.push(eBookId);
            hasChange = true;
          }
          if (hasChange) {
            repo.updateProperty(this.courseId, 'eBooksIds', courseEbooks, false, true);
            this.dirtyFlag = true;
          }
        },

        updateEbooks: function () {
          var currentEbooks = this.getEBooksIds();
          var courseEbooks = [];
          var courseLessons = repo.getChildrenByTypeRecursive(this.courseId, "lesson");
          if (courseLessons.length) {
            courseLessons.forEach(function (lesson) {
              if (lesson.type == "lesson") {
                var eBooksIds = lesson.data.eBooksIds;
                if (eBooksIds) {
                  $.each(eBooksIds, function (key, eBookId) {
                    if (courseEbooks.indexOf(eBookId) == -1) {
                      courseEbooks.push(eBookId);
                    }
                  });
                }
              }
            });
          }
          if (!_.isEqual(currentEbooks.sort(), courseEbooks.sort())) {
            repo.updateProperty(this.courseId, 'eBooksIds', courseEbooks, false, true);
            this.dirtyFlag = true;
          }
        },

        revertEbooks: function () {
          this.eBooksIds = repo._old_manifest.eBooksIds;
          repo.updateProperty(this.getCourseId(), 'eBooksIds', this.eBooksIds, false, true);
          this.dirtyFlag = true;
        },

        getAssessments: function (record) {
          if (!record) {
            record = repo.get(this.getCourseId());
          }
          var result = [];
          var children = record.children || [];
          for (var i = 0; i < children.length; i++) {
            var child = repo.get(children[i]);
            result = result.concat(this.getAssessments(child));
          }
          if (record.type == "lesson" && record.data.mode == "assessment") {
            result.push(record.id);
          }
          return result;
        }
      }

    })();

    CourseModel.init();

    return CourseModel;

  });
