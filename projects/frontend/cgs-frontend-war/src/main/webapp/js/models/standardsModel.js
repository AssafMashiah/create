define(["jquery", "lodash", 'dialogs', 'events' , 'dao', 'repo', 'restDictionary', 'assets', 'files', 'busyIndicator', 'userModel', 'translate', 'learningPathModel'],
    function f2028($, _, dialogs, events, dao, repo, restDictionary, assets, files, busy, userModel, i18n, learningPathModel) {

        function standardsModel() {
        }

        function _onPrepareDeleteSuccessful(data, packageParams, callback) {
            busy.stop();
            var deletePackageFunc = function f2029() {
                logger.info(logger.category.STANDARDS, { message: 'Remove standard package', packageData: packageParams });
                var daoConfig = {
                    path: restDictionary.paths.DELETE_STANDARDS_PACKAGE,
                    pathParams: packageParams,
                    data: {}
                };
                busy.start();
                busy.setData('Deleting standards...');
                dao.remote(daoConfig, function f2030(data) {
                    if (typeof callback === "function") callback(true);
                }, function f2031(response) {
                    logger.error(logger.category.STANDARDS, { message: 'Delete standards package failed', packageData: packageParams, errorData: response });
                    if (typeof callback === "function") callback(false);
                });
            };
            var cancelDeleteFunc = function f2032() {
                logger.audit(logger.category.STANDARDS, { message: 'Cancel removing standard package', packageData: packageParams });
                var daoConfig = {
                    path: restDictionary.paths.CANCEL_DELETE_STANDARDS_PACKAGE,
                    pathParams: packageParams,
                    data: {}
                };

                dao.remote(daoConfig, function f2033(data) {
                    if (typeof callback === "function") callback(false);
                }, function f2034(response) {
                    logger.error(logger.category.STANDARDS, { message: 'Cancel standards package deletion failed', packageData: packageParams, errorData: response });
                    if (typeof callback === "function") callback(false);
                });
            };
            _showChangesDialog(data, deletePackageFunc, cancelDeleteFunc,
                i18n.tran("course.standards.packages.delete.dialog.title"), "Delete", callback);
        }

        /**
         * lock course success, show user predicted changes and ask confirmation
         * @param  {[type]} changesData   [description]
         * @param  {[type]} packageParams [description]
         * @return {[type]}               [description]
         */
        function _onPrepareUpdateSuccessfull(changesData, packageParams) {

            //callback after user selection
            var updatePackageFunction = function f2035() {
                    logger.info(logger.category.STANDARDS, { message: 'Update standard package', packageData: packageParams });

                    busy.start();

                    var daoConfig = {
                        path: restDictionary.paths.UPGRADE_STANDARDS_PACKAGE,
                        pathParams: packageParams,
                        data: {}
                    };
                    //call server with approve update action
                    dao.remote(daoConfig, function f2036() {
                        _updateStandardSuccess();
                    }, function f2037(response) {
                        logger.error(logger.category.STANDARDS, { message: 'Standards package update failed', packageData: packageParams, errorData: response });
                        busy.stop();
                        events.fire('lock', 'course');
                    });
                },
                cancelUpdateFunction = function f2038() {
                    logger.audit(logger.category.STANDARDS, { message: 'Cancel updating standard package', packageData: packageParams });

                    busy.start();

                    var daoConfig = {
                        path: restDictionary.paths.CANCEL_UPGRADE_STANDARDS_PACKAGE,
                        pathParams: {   publisherId: require("userModel").getPublisherId(),
                            courseId: require("courseModel").getCourseId(),
                            packageName: encodeURIComponent(changesData.packageName),
                            subjectArea: changesData.subjectArea,
                            version: changesData.oldVersion
                        },
                        data: {}
                    };
                    //call server with cancel update action
                    dao.remote(daoConfig, function f2039() {
                        _cancelUpdateStandardSuccess();
                        events.fire('lock', 'course');
                    }, function f2040(response) {
                        logger.error(logger.category.STANDARDS, { message: 'Standards package update cancel failed', packageData: packageParams, errorData: response });
                        busy.stop();
                        events.fire('lock', 'course');
                    });
                };


            busy.stop();
            var changes = {
                updated: changesData.changes.updated ? changesData.changes.updated : [],
                deleted: changesData.changes.deleted ? changesData.changes.deleted : []
            };

            //open changes dialog, let's the user agree or cancel the update
            _showChangesDialog(changes, updatePackageFunction,
                cancelUpdateFunction, i18n.tran('course.standards.packages.update.dialog.title'), "Update");
        }

        function _updateStandardSuccess() {
            busy.stop();
            _deleteLessonsManifests(_reloadCourse);
        }

        function _reloadCourse() {
            var courseModel = require("courseModel"),
                courseId = courseModel.getCourseId();

	        function lock_course_success() {
		        busy.stop();
		        require('router').load(courseId, require("router")._static_data.courseTab);
		        events.unbind('lock_course_success', this);
		        events.unbind('lock_ready', this);
	        }

            courseModel.openCourse(courseId, function f2041() {
                events.once('lock_course_success', lock_course_success);
	            events.once('lock_ready', lock_course_success);

                //get lock for the course
                events.fire("lock", "course");
            });
        }

        function _deleteLessonsManifests(callback) {
            var lessonsIds = _.pluck(repo.getChildrenByTypeRecursive(require("courseModel").getCourseId(), 'lesson'), 'id'),
                filePath = files.coursePath(undefined, undefined, "tocItems");

            (function deleteLessonFile(lessonId) {
                if (lessonId) {
                    var filename = filePath + '/' + lessonId + '.json';
                    files.fileExists(filename, function(exists) {
                        if (exists) {
                            files.deleteFile(filename, deleteLessonFile.bind(this, lessonsIds.shift()));
                        }
                        else {
                            deleteLessonFile(lessonsIds.shift());
                        }
                    });
                }
                else if (typeof callback == 'function') {
                    callback();
                }
            })(lessonsIds.shift());
        }

        function _cancelUpdateStandardSuccess() {

            busy.stop();
            //need to refresh course?
        }

        function _showChangesDialog(data, applyFunc, cancelFunc, title, applyButton, callback) {
            var dialogConfig = {
                title: title,
                subTitle: "The following tags will be affected:",
                changes: data,
                closeOutside: false,
                buttons: {
                    yes: { label: applyButton },
                    cancel: { label: 'cancel' }
                }
            };

            events.once('onResponse', function f2043(response) {
                if (response === "yes") {
                    applyFunc();
                    return;
                }
                if (response === "cancel") {
                    cancelFunc();
                    return;
                }
                if (typeof callback === "function") callback(false);


            }, this);

            dialogs.create('changesTree', dialogConfig, 'onResponse');
        }

        function _onPrepareDeleteOrUpdateFailed(response) {
            try {
                var responseJson = JSON.parse(response.responseText);
                if (responseJson.errorId && responseJson.errorId == '2000') {
                    logger.warn(logger.category.STANDARDS, { message: 'Package delete/update preparation failed - locked lessons', errorData: responseJson });
                    require("lockModel").showLockingDialog("Standards - Lessons being edited", responseJson.data)
                }
                else if (responseJson.errorId && responseJson.errorId == '1000') {
                    require("showMessage").clientError.show(responseJson);
                }
                else throw new Error;
            } catch (err) {
                logger.error(logger.category.STANDARDS, { message: 'Package delete/update preparation failed - unknown reason', errorData: response.responseText });
            }
        }

        function _deletePackageFile(packageId, callback) {
            files.deleteFile(files.coursePath() + '/standards/' + packageId + ".json", function f2044() {
            //events.fire("repo_changed");
                callback && callback();
            });
        }


        _.extend(standardsModel.prototype, {

            init: function f2045(callback) {
            },

            showStandardTreeDialog: function f2046(repoId, callback) {
                var dialogConfig = {

                    title: "Select Standards",

                    buttons: {
                        save: { label: 'OK' },
                        cancel: { label: 'Cancel' }
                    },
                    repoContextId: repoId
                };

                events.once('onStandardsSelection', function f2047(response) {
                    if (response === "cancel") {
                        response = null;
                    }
                    callback(response);


                }, this);

                var dialog = require('dialogs').create('standardsTree', dialogConfig, 'onStandardsSelection');
            },

            groupStandardsByPackage: function f2048(json) {
                return _.groupBy(json, function f2049(standard) {
                    return standard.name + " - " + standard.subjectArea;
                });
            },

            getStandardsPackages: function f2050(callback) {

                //get list from server
                var daoConfig = {
                    path: restDictionary.paths.GET_STANDARDS_PACKAGES,
                    data: {}
                };

                dao.remote(daoConfig, function f2051(data) {
                    if (typeof callback === "function") callback(data);
                });
            },

            packageChosen: function f2052(package, callback) {
                //callback will update the view and call busy.stop
                if (package) {
                    this.getRemoteStandardsPackage(package, callback);
                }else{
                    busy.stop();
                }
            },

            loadCustomizationPackages: function f2053(callback) {
                //callback will call busy.stop()

                var cid = require("courseModel").getCourseId();

                if (!repo.get(cid).data["standartsPackages"]) {
                    repo.updateProperty(cid, "standartsPackages", {});
                }
                var pkgs = repo.get(cid).data["standartsPackages"];
                var totalPKGs = pkgs.constructor.keys(pkgs).length;
                var loadedCount = 0;

                var onPKGLoaded = function f2054() {
                    loadedCount++;
                    if (totalPKGs == loadedCount) {
                        callback();
                    }
                };

                if (totalPKGs) {
                    _.each(pkgs, _.bind(function f2055(pkg) {
                        this.loadPackage(pkg, onPKGLoaded);
                    }, this));
                } else {
                    callback();
                }
            },

            loadPackage: function f2056(pkg, callback) {
                //callback will count the loaded packages and at the end will call busy.stop()

                this.getLocalStandardsPackage(pkg, _.bind(function f2057(result) {
                    if (!result) {
                        this.getRemoteStandardsPackage(pkg, callback);
                    } else {
                        this.savePackageToCourseRepo(result);
                        callback();
                    }
                }, this));
            },

            getLocalStandardsPackage: function f2058(pkg, callback) {
                var packagePath = files.coursePath() + '/standards/' + this.getPackageFilename(pkg);
                files.fileExists(packagePath, function f2059(exists) {
                    if (exists) {
                        files.loadObject(packagePath, callback);
                    }
                    else {
                        if (typeof callback === "function") callback(null);
                    }
                });
            },

            getRemoteStandardsPackage: function f2060(package, callback) {
                var daoConfig = {
                    path: restDictionary.paths.GET_STANDARDS,
                    pathParams: {
                        packageName : encodeURIComponent(package.name),
                        subjectArea : package.subjectArea,
                        version     : package.version
                    },
                    data: {}
                };

                dao.remote(daoConfig, _.bind(function f2061(data) {
                    if (data) {
                        logger.audit(logger.category.STANDARDS, { message: 'Add standards package to course', package: package });
                        this.createStandardsFile(package, data, callback);
                    } else {
                        logger.warn(logger.category.STANDARDS, ['Package', package.name, package.subjectArea, package.version, 'does not exist'].join(' '));
                    }
                }, this), function f2062() {
                    logger.error(logger.category.STANDARDS, { message: 'Failed to retrieve package standards', packageData: package });
                });
            },

            getStandardId: function f2063(standard) {
                return  standard.name + "_" + standard.subjectArea + "_" + standard.pedagogicalId;
            },

            getPackageFilename: function f2064(package) {
                return package.name + "_" + package.subjectArea + "_" + package.version + ".json";
            },

            createStandardsFile: function f2065(package, data, callback) {
                var standardsDir = files.coursePath() + '/standards';
                files.saveObject(
                    data,
                    this.getPackageFilename(package),
                    standardsDir,
                    this.savePackageToCourseRepo(data, callback),
                    true);

                return standardsDir[0];
            },

            getPackageId: function f2066(package) {
                return (package.name + "_" + package.subjectArea + "_" + package.version);
            },

            savePackageToCourseRepo: function f2067(packageWithStandards, callback) {

                var cid = require("courseModel").getCourseId(),
                    rec = repo.get(cid);
                if (!rec.data.standartsPackages) {
                    repo.updateProperty(rec, 'standartsPackages', {}, false, true);
                }

                //check duplication
                var packID = this.getPackageId(packageWithStandards);


                // if (!repo.get(cid).data["standartsPackages"][packID]) {
                repo.updatePropertyObject(cid, "standartsPackages", packID, packageWithStandards, true);
                // }


                callback && callback.call();//after loadig all the packages callback will call busy.stop()
                events.fire("repo_changed");
            },

            removePackage: function f2068(package) {
                logger.info(logger.category.STANDARDS, { message: 'Preparing to remove standard package', packageData: package });

                var packageId = this.getPackageId(package),
                    courseId = require("courseModel").getCourseId(),
                    packageParams;

                packageParams = {publisherId: userModel.getPublisherId(), courseId: courseId,
                    packageName: encodeURIComponent(package.name) , subjectArea: package.subjectArea };


                var daoConfig = {
                    path: restDictionary.paths.PREPARE_DELETE_STANDARDS_PACKAGE,
                    pathParams: packageParams,
                    data: {}
                };


                dao.remote(daoConfig, function f2069(data) {
                    _onPrepareDeleteSuccessful(data.changes, packageParams, function f2070(result) {
                        switch (result) {
                            case false:
                                events.fire('lock', 'course');
                                break;
                            case true:
                                _deletePackageFile(packageId, function() {
                                    _deleteLessonsManifests(_reloadCourse);
                                });
                                break;
                        }
                    });
                }, function f2071(response) {
                    _onPrepareDeleteOrUpdateFailed(response);
                });
            },

            deleteStandard: function f2072(standards, standard) {
                standards = require('cgsUtil').cloneObject(standards);
                var index = this.containsStandard(standards, standard);
                if (index != -1) {
                    standards.splice(index, 1);
                }
                return standards;
            },

            /**
             * call server, prepare to update standard package
             * @param  {[type]} package [description]
             * @return {[type]}         [description]
             */
            prepareUpdatePackage: function f2073(package) {
                logger.info(logger.category.STANDARDS, { message: 'Preparing to update standard package', packageData: package });

                var daoParams = {   publisherId: require("userModel").getPublisherId(),
                        courseId: require("courseModel").getCourseId(),
                        packageName:  encodeURIComponent(package.name),
                        subjectArea: package.subjectArea,
                        version: package.nextVersion
                    },

                    daoConfig = {
                        path: restDictionary.paths.PREPARE_UPGRADE_STANDARDS_PACKAGE,
                        pathParams: daoParams,
                        data: {}
                    };


                //prepare to update, try to get lock to all lessons
                dao.remote(daoConfig,
                    // success func, open dialog with changes
                    function f2074(changes) {
                        _onPrepareUpdateSuccessfull(changes, daoParams);
                    },
                    // fail to get lock, show locking dialog
                    function f2075(response) {
                        _onPrepareDeleteOrUpdateFailed(response);
                        busy.stop();
                    });
            },

            updateStandardList: function f2076(repoId, standard, action, forced) {
                var args = arguments;
                var self = this;
                var p = new Promise(function (resolve, reject) {
                        var record = repo.get(repoId);
                        function cont() {
                                repo.updateProperty(record.id, 'selectedStandards', record.data.selectedStandards || [], false, true);
                                switch (action) {
                                    case "add":
                                        repo.updatePropertyList(record.id, 'selectedStandards', standard, true);
                                        break;
                                    case "delete":
                                        repo.updateProperty(record.id, 'selectedStandards', self.deleteStandard(record.data.selectedStandards, standard), false, true);
                                        break;
                                }
                                resolve(args);
                                events.fire("repo_changed");
                        }
                        if (action == "delete" && !forced) {
                            learningPathModel.deleteStandard(repoId, standard).then(function () {
                                 cont();
                            }).catch(function () {
                                 reject(args);
                            })
                        } else {
                           cont();     
                        }
                });
                return p;
            },

            setStandards: function f2077(repoId, standards) {
                repo.updateProperty(repoId, "selectedStandards", standards);
                events.fire("repo_changed");
            },

            getSelectedStandards: function f2078(repoId) {
                var repoObj = repo.get(repoId);
                return repoObj.data.selectedStandards || [];
            },

            getStandards: function f2079(repoId) {

                //get recommend from parent with standards until there is no parent with standards and not course or toc
                // get chosen from self
                var repoObj = repo.get(repoId),
                    objectStandards = [],
                    parentsStandards = [],
                    repoParentObj,
                    excludeStandardsForTypes = ['course', 'toc'],
                    excludeStandards;

                objectStandards = repoObj.data.selectedStandards;
                repoParentObj = repo.get(repoObj.parent);
                while (repoParentObj) {
                    excludeStandards = ~excludeStandardsForTypes.indexOf(repoParentObj.type);
                    if (repoParentObj.data.selectedStandards && !excludeStandards) {
                        _.each(repoParentObj.data.selectedStandards, _.bind(function f2080(value, key) {
                            if (this.containsStandard(parentsStandards, value) == -1) {
                                parentsStandards.push(value);
                            }
                        }, this));
                    }
                    repoParentObj = repo.get(repoParentObj.parent);
                }
 
                var packages = repoObj.data.standartsPackages;
                if (!packages) {
                   packages = repo.get(require("courseModel").getCourseId()).data.standartsPackages;
                }
                this.addExtraFieldsOnStandard(objectStandards, packages);
                this.addExtraFieldsOnStandard(parentsStandards, packages); 

                
                return {chosen: objectStandards, recommended: parentsStandards};
            },

            addExtraFieldsOnStandard: function(standardsList, standardsPackagesList) {
                if (!standardsPackagesList || !standardsList || !_.isArray(standardsList)) return;
                for (var i = 0; i < standardsList.length; i++) {
                    var std = standardsList[i];
                    var standardKey = std.name + "_" + std.subjectArea + "_" + std.version;
                    if (standardsPackagesList[standardKey] && standardsPackagesList[standardKey].standards 
                        && standardsPackagesList[standardKey].standards.children) {
                        var standardsFromPackage = standardsPackagesList[standardKey].standards.children;
                        var standardItem = this.findStandardRecursive(std.pedagogicalId, standardsFromPackage);
                        if (standardItem) {
                           std.standardName = standardItem.name;     
                        }
                    }
                }
            },

            findStandardRecursive: function(id, items) {
              var i = 0, found;
              for (; i < items.length; i++) {
                if (items[i].pedagogicalId === id) {
                  return items[i];
                } else if (_.isArray(items[i].children)) {
                  found = this.findStandardRecursive(id, items[i].children);
                  if (found) return found;
                }
              }
            },

            isEqualStandards: function f2081(standard1, standard2) {
                return (standard1.name == standard2.name) &&
                    (standard1.subjectArea == standard2.subjectArea ) &&
                    //(standard1.version == standard2.version ) &&
                    (standard1.pedagogicalId == standard2.pedagogicalId);
            },

            isEqualPackages: function f2082(package1, package2) {
                return (package1.name == package2.name) &&
                    (package1.subjectArea == package2.subjectArea )
            },

            containsPackage: function f2083(packages, package) {
                var resultIndex = -1;
                if (packages) {
                    $.each(packages, _.bind(function f2084(index, result) {
                        if (this.isEqualPackages(result, package)) {
                            resultIndex = index;
                            return false;
                        }
                    }, this));
                }
                return resultIndex;
            },

            containsStandard: function f2085(standards, standard) {
                var resultIndex = -1;
                $.each(standards, _.bind(function f2086(index, result) {
                    if (this.isEqualStandards(result, standard)) {
                        resultIndex = index;
                        return false;
                    }
                }, this));

                return resultIndex;
            },

            cleanupSelectedStandards: function( records ) {

            	// delete all "selectedStandards" property from repo records
            	// used to send sequence blob with this data
            	_.each( records, function( record ) {

            		if( record && record.data && record.data.selectedStandards ) {

            			delete record.data.selectedStandards ;

            		}

            	} ) ;
            },

            getMergedPackages: function( jsonA, jsonB ) {

            	// map to mark used pkgs
            	var mergedMap = {} ;

            	// array to return at the end
            	var merged = [] ;

            	// function will save new pkgs to merged array
            	var mergePackagesToCollection = function( pkgs ) {
            		_.each( pkgs,_.bind(function( pkg ) {
            			var pkgKey = pkg.name + "_" + pkg.subjectArea ;
            			var existingPKG = mergedMap[ pkgKey ] ;
            			if( !existingPKG ) {
            				pkg.stdPackageId = pkg.stdPackageId || this.getPackageId(pkg);//("std_pck_" + ( ++pkgCounter ));
            				merged.push( pkg ) ;
            				mergedMap[ pkgKey ] = true ;
            			}
            		},this) ) ;
            	} ;

            	// collect pkgs from jsonA
            	mergePackagesToCollection( $.extend( true, [], jsonA.standardPackages ) ) ;
            	// collect pkgs from jsonB
            	mergePackagesToCollection( $.extend( true, [], jsonB.standardPackages ) ) ;

            	return merged ;
            }

        });


        return new standardsModel();

    });