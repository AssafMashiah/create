define(['lodash', 'translate', 'dao', 'restDictionary', 'repo', 'busyIndicator', 'cgsUtil', 'userModel', 'courseModel', 'lessonModel', 'appletModel', 'clipboardManager'],
    function (_, translate, dao, restDictionary, repo, busy, cgsUtil, userModel, courseModel, lessonModel, appletModel, clipboardManager) {

        var importLessonUtil = (function () {

            var self;

            // ------------- Private methods -------------

            // Get list of all courses and lessons
            function getLessonsList(callback) {

            	var daoConfig = {
            		path: restDictionary.paths.GET_PUBLISHER_COURSES_TITLES,
                    pathParams: {
                        publisherId: userModel.getPublisherId(),
                        notEmpty: true
                    }
            	};

                busy.start();

            	dao.remote(daoConfig, function(receivedJson) {
                    var receivedJsonSorted = _.sortBy(receivedJson, function(o) {
                        return o.title;
                    });
	                cgsUtil.importLessonDialog(receivedJsonSorted, callback);
                    busy.stop();
            	});

            }

            // Get list of all courses and open modal
            function getLessonsListAndOpenModal(callback) {

                var daoConfig = {
                    path: restDictionary.paths.GET_PUBLISHER_COURSES_TITLES,
                    pathParams: {
                        publisherId: userModel.getPublisherId(),
                        notEmpty: true
                    }
                };
                var lockModel = require("lockModel");
                var indexOfFocusItem = getFocusedLessonIndex();

                busy.start();

                dao.remote(daoConfig, function(receivedJson) {
                    var receivedJsonSorted = _.sortBy(receivedJson, function(o) {
                        return o.title;
                    });
                    if (lockModel.getLockingStatus('COURSE') == lockModel.config.LOCK_TYPES.LOCKED_SELF) {
                        courseModel.saveAndRelease(function() {
                            cgsUtil.importLessonDialog({allCourses: receivedJsonSorted,
                                                        indexOfFocusItem: indexOfFocusItem },
                                                        callback);
                        }.bind(this), this);
                    }
                    else {
                        cgsUtil.importLessonDialog(receivedJsonSorted, callback);
                    }

                    busy.stop();
                }.bind(this));

            }

            function getFocusedLessonIndex() {
                var cm = require("clipboardManager");
                var index = cm.focusItem && require("repo").get(cm.focusItem) && require("repo").get(cm.focusItem).index;
                return index ? index - 1 : null;
            }

            // Start import operation
            function tryImportLesson(data) {
                if (!data) {
                    finalize();
                    return;
                }

                busy.start();

                self.courseId = data.courseId;
                self.lessonId = data.lessonId;
                self.lessonType = data.lessonType;

                logger.audit(logger.category.COURSE, 'Trying to import ' + self.lessonType + ' ' + self.lessonId + ' from course ' + self.courseId + ' to toc ' + self.tocId);

                loadCourse(function () {
                    // Load lesson JSON
                    loadLesson(function () {

                        // Run validations functions
                        validateImport(function () {

                            // Check validation result

                            // Validation errors - stop the import action
                            if (self.errors.length) {
                                showImportError();
                            }
                            // Passed validation
                            else {
                                // There are alerts to show to user
                                if (self.importAlerts.length) {
                                    busy.stop();
                                    cgsUtil.importAlertsDialog(self.importAlerts, diffLevelsCheck, finalize);
                                }
                                else {
                                    diffLevelsCheck();
                                }
                            }

                        });

                    });
                });
            }

            //load course data for import differntional levels
            function loadCourse(callback) {
                var imported_course_config = {
                        path: restDictionary.paths.GET_COURSE,
                        pathParams: {
                            courseId: self.courseId,
                            publisherId: userModel.getPublisherId()
                        },
                        data: {}
                    },
                    local_course_config = {
                        path: restDictionary.paths.GET_COURSE,
                        pathParams: {
                            courseId: courseModel.courseId,
                            publisherId: userModel.getPublisherId(),
                            fileSuffix: '/manifest'
                        }
                    };

                dao.remote(imported_course_config, function (importedCourseJson) {
                    self.importedCourseJSON = importedCourseJson;

                    dao.getLocal(local_course_config, function (localCourseJson) {
                        self.courseJSON = localCourseJson;

                        callback();
                    });
                });
            }

            // Load lesson data for import
            function loadLesson(callback) {
                if(self.lessonType != "assessment") self.lessonType = "lesson";
                var daoConfig = {
                    path: restDictionary.paths.GET_TOC_ITEM,
                    pathParams: {
                        publisherId: userModel.getPublisherId(),
                        courseId: self.courseId,
                        lessonId: self.lessonId,
                        itemType: self.lessonType
                    },
                    data: {}
                };

                dao.remote(daoConfig, function (lessonJson) {
                    self.lessonJSON = lessonJson;
                    callback();
                });
            }

            // Validate lesson for import
            function validateImport(callback) {

                // If lesson JSON doesn't exist - error
                if (!self.lessonJSON) {
                    self.errors.push({
                        message: translate.tran('Can\'t load requested lesson.')
                    });
                    return;
                }

                if (!self.copyPaste) {
                    validateReferenceSequence();
                }
                validateLearningObject();
                validateDiffLevels();
                validateStandarts();
				// Applets validation should be last - it's async
                validateApplets(callback);
            }

            function validateReferenceSequence () {
                if (self.lessonJSON.learningObjects && self.lessonJSON.learningObjects.length) {
                    var hasReferences = false;

                    _.each(self.lessonJSON.learningObjects, function (learningObjectItem) {
                        _.each(learningObjectItem.sequences, function (sequenceItem) {
                            if (sequenceItem.sequenceRef) {
                                hasReferences = true;
                            }
                        });
                    });


                    if (hasReferences) {
                        self.errors.push({
                            message: translate.tran("Can't import lesson with reference to sequence")
                        })
                    }
                }
            }

            function validateLearningObject() {
                if (self.lessonType !== 'assessment' && self.courseJSON.includeLo !== self.importedCourseJSON.includeLo) {
                    self.errors.push({
                        message: translate.tran('import_lesson.lo_not_the_same.msg_label')
                    })
                }
            }

            // Validate differentiation levels of both courses
            function validateDiffLevels() {
                var localDiffLevels = self.courseJSON &&
                                        self.courseJSON.differentiation &&
                                        JSON.stringify(self.courseJSON.differentiation) || null;

                var remoteDiffLevels = self.importedCourseJSON &&
                                        self.importedCourseJSON.differentiation &&
                                        JSON.stringify(self.importedCourseJSON.differentiation) || null;


                if (localDiffLevels !== remoteDiffLevels) {
                    self.localDiffLevels = JSON.parse(localDiffLevels);
                    self.remoteDiffLevels = JSON.parse(remoteDiffLevels);
                    self.diffLevelsConflict = !!remoteDiffLevels;
                }
                else {
                    self.diffLevelsConflict = false;
                }

            }

            // Validate standards of both courses
            function validateStandarts() {
                var customizationPackages = repo.get(courseModel.courseId).data.standartsPackages;

                _.each(self.lessonJSON.standardPackages, function (lessonPackage) {
                    var customizationPackage = _.find(customizationPackages, function (cp) {
                        return cp.name == lessonPackage.name && cp.subjectArea == lessonPackage.subjectArea;
                    });

                    // Package not found in current course - remove from lesson on import
                    if (!customizationPackage) {
                        self.standardsToRemove.push(lessonPackage.stdPackageId);
                        self.importAlerts.push('Standards package ' + lessonPackage.name + '(' + lessonPackage.subjectArea + ') version ' + lessonPackage.version + ' will be removed from imported lesson');
                    }
                    // Package exists in current course - check version
                    else if (customizationPackage.version != lessonPackage.version) {
                        self.errors.push({
                            message: translate.tran('Standards packages versions not match.')
                        });
                    }
                });
            }

            // Validate applets of both courses
            function validateApplets(callback) {
                var lessonApplets = [],
                    courseApplets = appletModel.appletManifest.applets;

                // Get remote applets catalog
                appletModel.getAppCatalogList(function (catalogApplets) {

                    // Get imported lesson applets
                    _.each(self.lessonJSON.resources, function (res) {
                        if (res.type == 'lib' && res.baseDir && res.baseDir.indexOf('applets/') >= 0) {
                            var chunks = res.baseDir.split('/');
                            lessonApplets.push({
                                guid: chunks[chunks.indexOf('applets') + 1],
                                version: chunks[chunks.indexOf('applets') + 2]
                            });
                        }
                    });

                    lessonApplets = _.unique(lessonApplets, function(la) { return la.guid + la.version; });

                    // Compare lesson applets with course and catalog
                    _.each(lessonApplets, function (lessonApplet) {
                        var courseApplet = _.find(courseApplets, function (ca) {
                            return ca.guid.toLowerCase() == lessonApplet.guid.toLowerCase();
                        });
                        var catalogApplet = _.find(catalogApplets, function (ca) {
                            return ca.guid.toLowerCase() == lessonApplet.guid.toLowerCase();
                        });

                        if (courseApplet) {
                            // Same applet is exist in course - check version
                            if (courseApplet.version.toLowerCase() != lessonApplet.version.toLowerCase()) {
                                if (!catalogApplet) {
                                    self.errors.push({
                                        message: translate.tran('Applet doesn\'t exist in catalog.')
                                    });
                                }
                                else if (courseApplet.version.toLowerCase() == catalogApplet.version.toLowerCase()) {
                                    self.appletsToUpdate.push(courseApplet.guid);
                                }
                                else if (lessonApplet.version.toLowerCase() == catalogApplet.version.toLowerCase()) {
                                    self.errors.push({
                                        message: translate.tran('Update applet')+ ' ' + catalogApplet.name + ' ' + translate.tran('to latest version')
                                    });
                                }
                                else {
                                    var cVer = parseFloat(courseApplet.version),
                                        lVer = parseFloat(lessonApplet.version);

                                    if (courseApplet.toString().split('.').length > 2 || lessonApplet.toString().split('.').length > 2 || lVer > cVer) {
                                        self.errors.push({
                                            message: translate.tran('Update applet')+ ' ' + catalogApplet.name + ' ' + translate.tran('to latest version')
                                        });
                                    }
                                    else {
                                        self.appletsToUpdate.push(courseApplet.guid);
                                    }
                                }
                            }
                        }
                        else if (catalogApplet) {
                        // Check the latest version in catalog
                            self.appletsToAdd.push(lessonApplet.guid);
                            // If GCR version is not the same we need to update applet version into the lesson
                            if (catalogApplet.version.toLowerCase() != lessonApplet.version.toLowerCase()) {
                                self.appletsToUpdate.push(lessonApplet.guid);
                            }
                        }
                        else {
                            self.errors.push({
                                message: translate.tran('Applet doesn\'t exist in catalog.')
                            });
                        }
                    });

                    // End of applets validation
                    if (typeof callback == 'function')
                        callback();

                });

            }

            function diffLevelsCheck() {
                if (!self.diffLevelsConflict) {
                    self.levelsMap = null;
                    continueImport();
                    return;
                }

                busy.stop();
                cgsUtil.importLevelsDialog(self.localDiffLevels, self.remoteDiffLevels, function(result) {
                    if (!_.isArray(result)) {
                        finalize();
                    }
                    else {
                        self.levelsMap = result;
                        continueImport();
                    }
                });
            }

            function continueImport() {
                busy.start();

                prepareImport(function (success, message) {

                    if (success) {
                        getSequences(function () {

                            prepareDataForSave();

                            if (!self.copyPaste) {
                                // Find toc in course local (only if imported from another course)
                                findToc(function (toc) {

                                    if (!toc) {
                                        self.errors.push({
                                            message: translate.tran('Failed to find toc for lesson import')
                                        })
                                        showImportError();
                                        return;
                                    }

                                    //check if we override exist lesson
                                    if (!self.override_id) {
                                    // Add new lesson id to current course
                                        if (_.isArray(toc.tocItemRefs)) {
                                            toc.tocItemRefs.push({
                                                cid: self.newLessonId,
                                                type: self.lessonType
                                            });
                                        }
                                        else {
                                            toc.tocItemRefs = [
                                                {
                                                    cid: self.newLessonId,
                                                    type: self.lessonType
                                                }
                                            ];
                                        }
                                    }

                                    saveLesson(function () {
                                        finalize(true);
                                    });
                                });
                            }
                            else {
                                // If it's copy paste action the current course manifest doesn't change till save action
                                saveLesson(function () {
                                    finalize(true);
                                });
                            }
                        });
                    }
                    else {
                        var failedMessage = translate.tran('Failed prepare the course to lesson import');
                        if(message){
                            failedMessage +="</br>" + translate.tran(message);
                        }
                        self.errors.push({
                            message: failedMessage
                        });

                        showImportError();
                    }
                });
            }

            // Perform additional actions (remove standards, upload applets)
            function prepareImport(callback) {
                removeStandards();
                uploadApplets(function (success) {
                    if (success)
                        saveAssets(callback);
                    else if (typeof callback == 'function')
                        callback(success);
                });
            }

            function removeStandards() {
                _.each(self.standardsToRemove, function (std) {

                    // Remove lessons standards packages
                    self.lessonJSON.standardPackages = _.reject(self.lessonJSON.standardPackages, function(lessonStdPkg) {
                        return lessonStdPkg.stdPackageId == std;
                    });

                    // Remove lessons standards
                    self.lessonJSON.standards = _.reject(self.lessonJSON.standards, function(lessonStd) {
                        return lessonStd.stdPackageId == std;
                    });

                    // Remove standards from lesson
                    _.each(self.lessonJSON.learningObjects, function (lo) {
                        _.each(lo.sequences, function (seq) {
                            // Remove sequences standards
                            seq.standards = _.reject(seq.standards, function(seqStd) {
                                return seqStd.stdPackageId == std;
                            });

                            _.each(seq.tasks, function (task) {
                                // Remove tasks standards
                                task.standards = _.reject(task.standards, function(taskStd) {
                                    return taskStd.stdPackageId == std;
                                });
                            });
                        });
                    });

                    // Remove standards from assessment
                    _.each(self.lessonJSON.sequences, function (seq) {
                        // Remove sequences standards
                        seq.standards = _.reject(seq.standards, function(seqStd) {
                            return seqStd.stdPackageId == std;
                        });

                        _.each(seq.tasks, function (task) {
                            // Remove tasks standards
                            task.standards = _.reject(task.standards, function(taskStd) {
                                return taskStd.stdPackageId == std;
                            });
                        });
                    });
                });
            }

            function uploadApplets(callback) {
                appletModel.addApplets(self.appletsToAdd, function(error) {
                    if (typeof callback == 'function') callback(!error);
                }, true);
            }

            function saveAssets(callback) {
                var saveAssetsJSON = {
                    sourceCourseId: self.courseId,
                    pathsList: []
                };

                _.each(self.lessonJSON.resources, function (resource) {
                    if (resource.type == 'attachment' || (resource.type == 'media' )) {
                        saveAssetsJSON.pathsList.push(resource.href);
                    }
                });

                var daoConfig = {
                    path: restDictionary.paths.COPY_SPECIFIC_ASSETS,
                    pathParams: {
                        publisherId: userModel.getPublisherId(),
                        courseId: courseModel.courseId
                    },
                    data: saveAssetsJSON
                };

                dao.remote(daoConfig, function (response) {
                    if (typeof callback == 'function') callback(!response);
                }, function () {
                    if (typeof callback == 'function') callback(false, "importLesson.fail.copyAssets");
                });
            }

            function getSequences(callback) {
                var daoConfig = {
                    path: restDictionary.paths.GET_SEQUENCES,
                    pathParams: {
                        publisherId: userModel.getPublisherId(),
                        courseId: self.courseId,
                        lessonId: self.lessonId,
                        itemType: self.lessonType
                    },
                    data: lessonModel.getSequencesIds(self.lessonJSON)
                };

                // Get lesson sequences
                dao.remote(daoConfig, function (response) {
                    self.sequencesJSON = response;
                    if (typeof callback == 'function') callback();
                });

            }

            function getFocusLesson() {
                var focusItem = clipboardManager.focusItem && repo.get(clipboardManager.focusItem);

                return focusItem && focusItem.type === 'lesson' ? clipboardManager.focusItem : false;
            };

            function prepareDataForSave() {
                self.override_id = clipboardManager.clipboardMode !== 2 && getFocusLesson();

                self.newLessonId = self.override_id || repo.genId();

                if (!self.override_id) {
                   self.lessonJSON.header['last-modified'] = { "$date": "1970-01-01" };
                } else {
                    var lessonsHeaders = _.map(require("lessonModel").lessonHeader, function (item, lessonId) {
                        return  { 'cid': lessonId, 'header': item };
                    });
                    var focusLessonHeader = _.find(lessonsHeaders, { cid: self.override_id});

                    if (focusLessonHeader) {
                        self.lessonJSON.header['last-modified'] = focusLessonHeader.header['last-modified'];
                    }
                }

                if (self.newName) {
                    self.lessonJSON.title = self.newName;
                }

                // differentiated sequences manipulations
                if (self.diffLevelsConflict && self.levelsMap) {

                    _.each(self.lessonJSON.learningObjects, function(lo) {
                        _.each(lo.sequences, function(defSequence, ind) {
                            // change differentiated sequence by regular sequence
                            if (defSequence.type == 'differentiatedSequenceParent') {
                                // Sequences to delete
                                var deleteSequences = _.chain(defSequence.levels)
                                                        .filter(function (lvl) {
                                                            return !_.some(self.levelsMap, { oldId: lvl.levelId });
                                                        })
                                                        .map(function(lvl) {
                                                            return lvl.sequence.cid;
                                                        })
                                                        .value();

                                if (self.levelsMap[0].newId == 'default') {
                                    var seq = _.find(defSequence.levels, { levelId: self.levelsMap[0].oldId }).sequence;

                                    seq.title = defSequence.title;
                                    lo.sequences[ind] = seq;

                                    // Open sequence blob and change title and parent
                                    var seqJson = _.find(self.sequencesJSON, { seqId: seq.cid });
                                    var blob = JSON.parse(seqJson.content);
                                    blob[seq.cid].data.title = seq.title;
                                    delete blob[seq.cid].data.diffLevel;
                                    blob[seq.cid].parent = self.courseJSON.includeLo ? lo.cid : self.lessonJSON.cid;
                                    seqJson.content = JSON.stringify(blob);
                                }
                                else {
                                    var newLevels = [];

                                    _.each(self.courseJSON.differentiation.levels, function(level) {
                                        var pair = _.find(self.levelsMap, { newId: level.id });
                                        if (pair.oldId != 'none') {
                                            var seq = _.find(defSequence.levels, { levelId: pair.oldId }).sequence;

                                            seq.title = level.name;

                                            // Open sequence blob and change title
                                            var seqJson = _.find(self.sequencesJSON, { seqId: seq.cid });
                                            var blob = JSON.parse(seqJson.content);
                                            blob[seq.cid].data.title = seq.title;
                                            blob[seq.cid].data.diffLevel = {
                                                "acronym": level.acronym,
                                                "id": level.id,
                                                "isDefault": level.id == self.courseJSON.differentiation.defaultLevelId,
                                                "name": level.name
                                            };
                                            seqJson.content = JSON.stringify(blob);

                                            newLevels.push({
                                                levelId: level.id,
                                                sequence: seq
                                            });
                                        }
                                        else {
                                            var seqId = repo.genId(),
                                                maxResource = _.max(_.map(self.lessonJSON.resources, function(res) { return parseInt(res.resId.replace('resource_', '')); })),
                                                seqRes = 'resource_' + (++maxResource);

                                            self.lessonJSON.resources.push({
                                                'type': 'sequence',
                                                'href': 'sequences/' + seqId,
                                                'resId': seqRes
                                            });

                                            newLevels.push({
                                                levelId: level.id,
                                                sequence: {
                                                  "cid": seqId,
                                                  "mimeType": "DL",
                                                  "tasks": [],
                                                  "contentRef": seqRes,
                                                  "resourceRefId": [
                                                    seqRes
                                                  ],
                                                  "standards": [],
                                                  "title": level.name,
                                                  "type": "sequence"
                                                }
                                            });

                                            var content = {};
                                            content[seqId] = {
                                                "id": seqId,
                                                "type": "sequence",
                                                "parent": defSequence.cid,
                                                "children": [],
                                                "is_modified": false,
                                                "data": {
                                                    "diffLevel": {
                                                        "acronym": level.acronym,
                                                        "id": level.id,
                                                        "isDefault": level.id == self.courseJSON.differentiation.defaultLevelId,
                                                        "name": level.name
                                                    },
                                                    "title": level.name,
                                                    "type": "simple",
                                                    "exposure": "one_by_one",
                                                    "sharedBefore": false,
                                                    "isValid": false,
                                                    "invalidMessage": {
                                                        "valid": false,
                                                        "report": [{
                                                            "editorId": seqId,
                                                            "editorType": "sequence",
                                                            "editorGroup": "sequence",
                                                            "msg": "There must be at least one task in the sequence"
                                                        }],
                                                        "upperComponentMessage": [{
                                                            "editorId": seqId,
                                                            "editorType": "sequence",
                                                            "editorGroup": "sequence",
                                                            "msg": "There must be at least one task in the sequence"
                                                        }]
                                                    }
                                                }
                                            };

                                            self.sequencesJSON.push({
                                                content: JSON.stringify(content),
                                                courseId: courseModel.courseId,
                                                lessonCId: self.newLessonId,
                                                seqId: seqId
                                            });

                                        }
                                    });

                                    defSequence.levels = newLevels;
                                }

                                _.each(deleteSequences, function(sid) {
                                    self.sequencesJSON = _.reject(self.sequencesJSON, { seqId: sid });

                                    self.lessonJSON.resources = _.reject(self.lessonJSON.resources, function(res) {
                                        return res.href && res.href == ('sequences/' + sid);
                                    });
                                });
                            }
                        });
                    });
                }

                // applets manipulations
                _.each(self.appletsToUpdate, function(appGuid) {
                    var courseApplet = _.find(appletModel.appletManifest.applets, function(app) {
                        return app.guid.toLowerCase() == appGuid.toLowerCase();
                    });
                    var resource = _.find(self.lessonJSON.resources, function(res) {
                        return res.type == 'lib' &&
                                res.baseDir &&
                                res.baseDir.indexOf('applets/') >= 0 &&
                                res.baseDir.toLowerCase().indexOf(appGuid.toLowerCase()) > 0;
                    });

                    if (resource && courseApplet) {
                        var chunks = resource.baseDir.split('/'),
                            prevVersion = chunks[chunks.indexOf('applets') + 2];

                        resource.baseDir = courseApplet.resources.baseDir;
                        resource.hrefs = require('cgsUtil').cloneObject(courseApplet.resources.hrefs);

                        _.each(self.sequencesJSON, function(seq) {
                            seq.content = seq.content
                                    .replace(new RegExp(appGuid + '/' + prevVersion, "g"), appGuid + '/' + courseApplet.version)
                                    .replace(new RegExp(appGuid + '&#x2F;' + prevVersion, "g"), appGuid + '&#x2F;' + courseApplet.version);
                        });
                    }
                });

                var seqIds = [];

                // Delete unnecessary sequence data and generate new ids
                _.each(self.sequencesJSON, function (seq) {
                    delete seq.id;
                    delete seq.lastModified;
                    seq.courseId = courseModel.courseId;
                    seqIds.push({
                        oldId: seq.seqId,
                        newId: repo.genId()
                    });
                });

                // Replace old ids with new ids
                var lessJSONstr = JSON.stringify(self.lessonJSON).replace(new RegExp(self.lessonId, 'g'), self.newLessonId);
                var seqJSONstr = JSON.stringify(self.sequencesJSON).replace(new RegExp(self.lessonId, 'g'), self.newLessonId);

                _.each(seqIds, function (pair) {
                    lessJSONstr = lessJSONstr.replace(new RegExp(pair.oldId, 'g'), pair.newId);
                    seqJSONstr = seqJSONstr.replace(new RegExp(pair.oldId, 'g'), pair.newId);
                });

                self.lessonJSON = JSON.parse(lessJSONstr);
                self.sequencesJSON = JSON.parse(seqJSONstr);
            }

            function findToc(callback) {
                var daoConfig = {
                    path: restDictionary.paths.GET_COURSE,
                    pathParams: {
                        courseId: courseModel.courseId,
                        publisherId: userModel.getPublisherId(),
                        fileSuffix: '/manifest'
                    }
                };

                // get local file content
                dao.getLocal(daoConfig, function (file) {
                    self.courseJSON = file;
                    if (self.courseJSON.courseId == self.tocId) {
                        callback(self.courseJSON.toc);
                    }
                    else {
                        callback(next(self.courseJSON.toc));
                    }
                });

                function next(toc) {
                    if (toc.cid == self.tocId)
                        return toc;

                    var retVal = null;
                    _.each(toc.tocItems, function (innerToc) {
                        retVal = retVal || next(innerToc);
                    });
                    return retVal;
                }
            }

            function saveLesson(callback) {
                var contentConfig = {
                        path: restDictionary.paths.SAVE_TOC_ITEM_CONTENTS,
                        pathParams: {
                            lessonId: self.newLessonId,
                            itemType: self.lessonType,
                            courseId: courseModel.courseId,
                            publisherId: userModel.getPublisherId()
                        },
                        data: {
                            courseId: courseModel.courseId,
                            publisherId: userModel.getPublisherId(),
                            tocItemCid: self.newLessonId,
                            tocItemJson: JSON.stringify(self.lessonJSON),
                            sequences: self.sequencesJSON,
                        }
                    },
                    courseConfig = {
                        path: restDictionary.paths.SAVE_COURSE,
                        pathParams: {
                            courseId: courseModel.courseId,
                            publisherId: userModel.getPublisherId(),
                            fileSuffix: "/manifest"
                        },
                        data: self.courseJSON
                    };
                updateEbooksOnCourse();
                // Save remote lesson data
                dao.remote(contentConfig, function (header) {
                    require('lessonModel').lessonHeader[self.newLessonId] = header;
                    if (!self.copyPaste) {
                        // Save remote course data
                        dao.remote(courseConfig, function (courseHeader) {
                            // Set new course header in repo
                            var course = repo.get(courseModel.courseId);
                            if (course && course.data) {
                                repo.updateProperty(course.id, 'header', courseHeader, false, true);
                            }

                            // Save new course header
                            courseModel.courseHeader = courseHeader;

                            if (self.courseJSON && self.courseJSON.header) {
                                self.courseJSON.header = courseHeader;
                            }

                            dao.setLocal(courseConfig, callback);

                        });
                    }
                    else if (typeof callback == 'function') {
                        callback();
                    }
                });

            }

            function showImportError() {
                cgsUtil.importErrorDialog(self.errors);
                finalize();
            }

            function updateEbooksOnCourse() {
                // Add extra ebooks ids on course if lesson has
                var courseEbookIds = [];
                var lessonEbookIds = [];
                if (self.courseJSON && self.courseJSON.eBooksIds) {
                    courseEbookIds = $.map(self.courseJSON.eBooksIds, function(el) { return el });
                }
                if (self.lessonJSON && self.lessonJSON.eBooksIds) {
                    lessonEbookIds = $.map(self.lessonJSON.eBooksIds, function(el) { return el });
                }
                var diffEbooks = _.difference(lessonEbookIds, courseEbookIds);
                if (diffEbooks.length) {
                    if (typeof self.courseJSON.eBooksIds == "undefined") self.courseJSON.eBooksIds = [];
                    self.courseJSON.eBooksIds = self.courseJSON.eBooksIds.concat(diffEbooks);
                }
            }

            // Finalize import action
            function finalize(success) {
                if (success) {
                    logger.info(logger.category.COURSE, 'Lesson was imported successfully');
                }
                else {
                    logger.info(logger.category.COURSE, { message: 'Lesson import aborted', errorData: self.errors });
                }

                busy.stop(true);
                self.courseId = self.lessonId = self.lessonJSON = null;
                self.errors = [];
                self.importAlerts = [];
                self.standardsToRemove = [];
                self.appletsToAdd = [];
                self.appletsToUpdate = [];
                self.diffLevelsConflict = false;
                self.levelsMap = null;
                self.isImportinProgress = false;

                if (success) {
                    if (typeof self.completeCallback == 'function') self.completeCallback(self.newLessonId);
                }
                else {
                    if (typeof self.failCallback == 'function') self.failCallback();
                }
            }



            // ------------- Public methods -------------

            return {
                // @param tocId - tocId to insert the lesson into
                // @param sourceCourseId - optional
                // @param sourceLessonId - optional
                // @param sourceLessonType - optional
                // @param copyPaste - optional
                // @param newName - optional
                // @param completeCallback - callback after operation complition
                // @param failCallback - fail callback of the operation
                openImportModal: getLessonsListAndOpenModal,
                start: function (config) {

                    if (this.isImportinProgress) {
                        logger.warn(logger.category.COURSE, 'Calling import lesson during another import in progress');
                        return;
                    }

                    this.tocId = config.tocId;
                    this.courseId = this.lessonId = this.lessonJSON = null;
                    this.errors = [];
                    this.importAlerts = [];
                    this.standardsToRemove = [];
                    this.appletsToAdd = [];
                    this.appletsToUpdate = [];
                    this.diffLevelsConflict = false;
                    this.levelsMap = null;
                    this.copyPaste = config.copyPaste;
                    this.newName = config.newName;
                    this.completeCallback = config.completeCallback;
                    this.failCallback = config.failCallback;
                    this.isImportinProgress = true;

                    self = this;

                    if (config.sourceCourseId && config.sourceLessonId && config.sourceLessonType) {
                        tryImportLesson({
                            courseId: config.sourceCourseId,
                            lessonId: config.sourceLessonId,
                            lessonType: config.sourceLessonType
                        });
                    }
                    else {
                        if(courseModel.dirtyFlag){

                            courseModel.saveCourse(function (failed) {
                                if (!failed) {
                                    courseModel.setDirtyFlag(false);
                                    getLessonsList(tryImportLesson);
                                }
                                else {
                                    self.errors.push({
                                        message: translate.tran('Failed to save the course before import')
                                    });
                                    showImportError();
                                }
                            });
                        }else{
                            getLessonsList(tryImportLesson);
                        }
                    }
                }
            };
        })();

        return importLessonUtil;
    });