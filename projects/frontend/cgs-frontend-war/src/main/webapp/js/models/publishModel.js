define(['lodash', 'events', 'lockModel', 'courseModel', 'restDictionary', 'busyIndicator', 'dao', 'dialogs', 'repo', 'cgsUtil'
	],
	function (_, events, lockModel, courseModel, restDictionary, busy, dao, dialogs, repo, cgsUtil) {

		var publishedCourses = {};
		var publishedLessons = {};

		function PublishModel() {

			this.publishEnabled = false;

			this.registerEvents();
		}

		var targetMapping = {
			"courseToCatalog": "COURSE_TO_CATALOG",
			"courseToFile": "COURSE_TO_FILE",
			"lessonToCatalog": "LESSON_TO_CATALOG",
			"lessonToFile": "LESSON_TO_FILE",
			"courseShareLink": "COURSE_TO_URL",
			"lessonShareLink": "LESSON_TO_URL"
		};

		PublishModel.prototype = {

			registerEvents: function () {

				events.register('initCGS', function () {
					this.publisherId = require('userModel').getPublisherId();
				}.bind(this));

				function _handleLock(lockObject) {
					this.publishEnabled = (lockObject.lockStatus != 'other') &&
						(require('PermissionsModel').permissions['publish_course']);
					events.fire((!this.publishEnabled) ? 'disable_menu_item' : 'enable_menu_item', 'menu-button-publish-course');
				}

				events.register('lock_ready', _.bind(_handleLock, this));
				events.register('lock_course_success', _.bind(_handleLock, this));

				events.register('course_publish', this.verifyPublish, this);
				events.register('publishLesson', this.verifyLessonPublish, this);
				events.register('cancelPublish', this.cancelPublish, this);
				events.register('downloadPublishPackage', this.downloadPublishPackage, this);
			},

			isPublishEnabled: function () {
				return this.publishEnabled;
			},
			verifyLessonPublish: function verifyLessonPublish() {
				//check for modifications
				if(require("lessonModel").getDirtyFlag()){
					require("cgsUtil").openSaveLessonDialog(this.publishLesson.bind(this),true);
				}else{
					this.publishLesson();
				}
			},

			publishLesson: function publishLesson (response){
				//if modified - > open dialog -> callback
				this.publishScreen = "lesson";
				var dialogConfig = {
					publishType: this.publishScreen,
					title: "Publish",
					buttons: {
						next: {label: 'LanguageUtil.strings.progressbar.next'},
						cancel: {label: 'Cancel'}
					},
					closeOutside: false
				};

				//if there is no publish methods the dialog will display a message to the user,
				//in this case we will only want to allow one close button to the dialog, without a "next" button
				var publishSettings = require('userModel').getAccount().publishSettings;

				var hasNoPublishMethods = !publishSettings.lessons.enablePublishToCatalog && !publishSettings.lessons.enablePublishToFile && !publishSettings.lessons.enablePublishToUrl;

				if (hasNoPublishMethods) {
					dialogConfig.buttons = {
						cancel: {label: "Close"}
					};
				}

				events.register('getPublishTarget', this.onPublishLessonModeReceived.bind(this));

				dialogs.create('prePublish', dialogConfig, 'getPublishTarget');

			},
			onPublishLessonModeReceived: function onPublishLessonModeReceived(response) {
				if (response && response != 'cancel') {
					this.getScormTree({
						target: targetMapping[response.target],
						selectedLessons: [require('lessonModel').lessonId],
						excludedLessons: [],
						includeAncestorsStandards: true
					});
				}
			},

			/**
			 * [verifyPublish]
			 * start process of verify&preparing the package.
			 */
			verifyPublish: function () {
				this.publishScreen = "course";
				this.courseId = courseModel.getCourseId();

				if (lockModel.getLockingStatus('COURSE') == lockModel.config.LOCK_TYPES.LOCKED_SELF) {
					courseModel.saveAndRelease(_.bind(this.showPublishModeSelectionDialog, this));
				}
				else {
					this.showPublishModeSelectionDialog();
				}
			},

			showPublishModeSelectionDialog: function (publishType) {
				var dialogConfig = {
					courseId: this.courseId,
					publishType: publishType,
					title: "Publish",
					buttons: {
						next: {label: 'LanguageUtil.strings.progressbar.next'},
						cancel: {label: 'Cancel'}
					},
					closeOutside: false
				};

				//display publish dialog in demo mode
				if (require("userModel").account.enableDemoPublishView) {
					dialogConfig.target = "";

					events.once('distributeTree', this.getDistributeType.bind(this));
					dialogs.create('distributeTree', dialogConfig, 'distributeTree');

				} else { // regular publish
					//if there is no publish methods the dialog will display a message to the user,
					//in this case we will only want to allow one close button to the dialog, without a "next" button
					var publishSettings = require('userModel').getAccount().publishSettings;

					var hasNoPublishMethods = !publishSettings.courses.enablePublishToCatalog && !publishSettings.courses.enablePublishToFile && !publishSettings.lessons.enablePublishToCatalog && !publishSettings.lessons.enablePublishToFile;

					if (hasNoPublishMethods) {
						dialogConfig.buttons = {
							cancel: {label: "Close"}
						};
					}

					events.register('getPublishTarget', this.onPublishModeRecieved.bind(this));

					dialogs.create('prePublish', dialogConfig, 'getPublishTarget');
				}
			},
			getDistributeType: function (response) {

				if (response !== "cancel") {

					var dialogConfig = {
						title: "Distribute",
						buttons: {
							publish: {label: "Publish"},
							cancel: {label: "Cancel"}
						},
						closeOutside: false
					};
					events.once('onDistributeTypeSelected', this.demoPublishDialogResponse.bind(this));
					dialogs.create('distribute', dialogConfig, "onDistributeTypeSelected");
				}
			},

			onPublishModeRecieved: function (response) {
				if (response && response != 'cancel') {
					this.jobId = require('repo').genId();
					var target = targetMapping[response.target];

					switch (target) {
						case "COURSE_TO_CATALOG":
						case "COURSE_TO_FILE":
						case "COURSE_TO_URL":
							this.showReleaseNotesPublishDialog(target);
							break;
						case "LESSON_TO_CATALOG":
						case "LESSON_TO_FILE":
						case "LESSON_TO_URL":
							var dialogConfig = {
								courseId: this.courseId,
								title: "Publish",
								target: target,
								buttons: {
									publishCourse: {
										label: 'LanguageUtil.strings.progressbar.next',
										canBeDisabled: true
									},
									cancel: {label: 'Cancel'}
								},
								closeOutside: false
							};

							events.register('publishScorm', this.getScormTree.bind(this));

							dialogs.create('publishScorm', dialogConfig, 'publishScorm');
							break;
					}
				}
			},

			getScormTree: function (response) {
				if (response && response != 'cancel') {
					busy.start();
					var params = {
							publisherId: this.publisherId
						},

						data = {
							courseId: repo._courseId,
							description: "no description provided",
							publishMode: "pre-production",
							releaseNote: "no releaseNote provided",
							target: response.target,
							format: repo.get(repo._courseId).data.format,
							excludeList: response.excludedLessons,
							selectedList: response.selectedLessons,
							includeAncestorsStandards: response.includeAncestorsStandards
						},

						daoConfig = {
							path: restDictionary.paths.START_PUBLISH,
							pathParams: params,
							data: data
						};

					amplitude.logEvent('Publish', {
						"Course ID": data.courseId,
						"Lesson ID": data.selectedList[0],
						"Object": cgsUtil.getAmplitudeValue("publishObject", data.target),
						"Published from" : this.publishScreen + " page",
						"Publish type" : cgsUtil.getAmplitudeValue("publishTarget",data.target),
						"Course type" : cgsUtil.getAmplitudeValue("format",data.format)
					});
	
					dao.remote(daoConfig, this.showPackageStatusDialog.bind(this), this.onError.bind(this));
				}
			},

			showReleaseNotesPublishDialog: function (target) {
				this.target = target;
				//this.excludedLessons = response.excludeList;
				var courseRepo = repo.get(this.courseId);
                var samplesList = [];
				if (require("userModel").account.enableSampleCourse) {
                    samplesList = courseRepo.data.sample;
                }
                _.extend(this, {
                    samplesList: samplesList || []
                });
                this.isSample = (this.samplesList && this.samplesList.length) ? true : false;

				var dialogConfig = {
					courseId: this.courseId,
					title: "Publish",
					target: target,
					overview: courseRepo.data.overview,
					isSample: this.isSample,
					buttons: {
						publishStart: {label: 'Publish', canBeDisabled: true},
						cancel: {label: 'Cancel'}
					},
					closeOutside: false,
					disableSampleCourse: this.hasPlacementAssessment()
				};

				events.register('publish', this.publishDialogResponse, this);
				dialogs.create('publish', dialogConfig, 'publish');
			},

			publishDialogResponse: function (response) {
				var target = targetMapping[response.target];
				if (response == 'cancel') {
					logger.debug(logger.category.PUBLISH, 'User cancelled publish');
				} else {
					_.extend(this, {
						overview: response.overview,
						releaseNotes: response.releaseNotes,
						publishMode: response.publishMode,
						isSample: response.isSample,
					});
					if (this.isSample) {
                        this.showSelectSampleContentDialog(target);
					} else {
						this.checkLockedLessons();
					}
					
				}
			},
			
			showSelectSampleContentDialog: function (target) {
				var dialogConfig = {
					courseId: this.courseId,
					title: "Publish",
					target: target,
					overview: repo.get(this.courseId).data.overview,
                    samplesList: this.samplesList,
					buttons: {
						publishStart: {label: 'Publish'},
						cancel: {label: 'Cancel'}
					},
					closeOutside: false
				};

				events.register('sampleContent', this.selectSampleContentDialogResponse, this);
				dialogs.create('sampleContent', dialogConfig, 'sampleContent');
			},

			selectSampleContentDialogResponse: function(response) {
                if (response == 'cancel') {
					logger.debug(logger.category.PUBLISH, 'User cancelled publish');
				} else {
					this.samplesList = response.samplesList;
					this.checkLockedLessons();
				}
            },

			demoPublishDialogResponse: function (response) {
				if (response == 'cancel') {
					logger.debug(logger.category.PUBLISH, 'User cancelled publish');
				} else {
					_.extend(this, {
						overview: response.overview,
						releaseNotes: response.releaseNotes,
						publishMode: response.publishMode,
						target: response.target
					});

					this.checkLockedLessons();
				}
			},

			checkLockedLessons: function () {
				var daoConfig = {
					path: restDictionary.paths.GET_LOCKS,
					pathParams: {
						publisherId: this.publisherId,
						courseId: this.courseId
					}
				};

				logger.debug(logger.category.PUBLISH, 'Checking locked lessons');
				dao.remote(daoConfig, function (locks) {
					logger.debug(logger.category.PUBLISH, {message: 'Locked lessons checked', locks: locks});
					if (_.isArray(locks) && locks.length) {
						this.showWarningDialog(locks);
					} else { // !response.isLocked
						this.startPublish();
					}
				}.bind(this));
			},

			showWarningDialog: function (locks) {

				var dialogConfig = {
					courseId: this.courseId,
					title: "Publish",
					data: {
						locks: locks
					},
					buttons: {
						proceed: {label: 'Yes'},
						cancel: {label: 'Cancel'}
					},
					closeOutside: false
				};

				events.register('getPublishWarnings', function (returnValue, response) {
					if (response == 'proceed') {
						this.startPublish();
					}
				}.bind(this));

				dialogs.create('publishWarning', dialogConfig, 'getPublishWarnings');

			},

			cancelPublish: function (packageId) {
				if (!packageId) {
					return;
				}

				var daoConfig = {
					path: restDictionary.paths.CANCEL_PACKAGE,
					pathParams: {
						publisherId: this.publisherId,
						packageId: packageId
					}
				};

				logger.audit(logger.category.PUBLISH, 'Canceling course publish');

				dao.remote(daoConfig, function () {
					logger.info(logger.category.PUBLISH, 'Course publish canceled');
				}.bind(this));

				// get course again to avoid sync error after publish cancel
				// require('cgsUtil').onOpenCourseChosen(this.courseId);
			},

			startPublish: function () {
				busy.start();
				logger.debug(logger.category.PUBLISH, 'Publish start');
                if (!this.isSample) {
                   this.samplesList = [];
                }
				// send the parameters as a "form" format
				var params = {
					publisherId: this.publisherId
				};

				var data = {
					courseId: this.courseId,
					description: this.overview,
					publishMode: this.publishMode,
					releaseNote: this.releaseNotes,
					target: this.target,
					format: repo.get(this.courseId).data.format,
					excludeList: [],
					selectedList: [],
					sample: this.samplesList
				};

				amplitude.logEvent('Publish', {
					"Course ID": data.courseId,
					"Object": cgsUtil.getAmplitudeValue("publishObject", data.target),
					"Published from" : this.publishScreen + " page",
					"Publish type" : cgsUtil.getAmplitudeValue("publishTarget",data.target),
					"Course type" : cgsUtil.getAmplitudeValue("format", data.format)
				});

				var daoConfig = {
					path: restDictionary.paths.START_PUBLISH,
					pathParams: params,
					data: data
				};

				dao.remote(daoConfig, this.showPackageStatusDialog.bind(this),this.onError.bind(this));
			},

			showPackageStatusDialog: function (response) {

				// Refresh the lock bar- for lesson/course screen
				events.fire("get_locking_object", this.publishScreen);
				busy.stop();
				events.fire('publishStarted', response);
			},

			getPackagePhase: function () {
				// returns the publish phase
				return this.packageStatus;
			},

			getPackagePercentStatus: function () {
				return this.componentsProgressInPercent;
			},

			getConversionResults: function () {
				return this.conversionResults;
			},

			getErrors: function () {
				return this.errors;
			},

			downloadPublishPackage: function (packageId) {
				var daoConfig = {
					path: restDictionary.paths.DOWNLOAD_PUBLISH_PACKAGE,
					pathParams: {
						publisherId: this.publisherId,
						packageId: encodeURIComponent(packageId)
					}
				};

				var restApiValidConfig = dao.getRestApiValidConfig(daoConfig);
				var downloadLink = require('configModel').configuration.basePath + restApiValidConfig.pathData.path;
				var decodedDownloadLink = unescape(downloadLink);

				var downloadLink = $("<a></a>").attr({
					href: decodedDownloadLink,
					download: '',
					target: "_blank"
				}).appendTo('body');

				downloadLink.get(0).click();
				downloadLink.remove();
			},
			onError: function(response){
				if(response.status == 406){
					var dialogConfig = {
						title: "error."+this.publishScreen+".publish.course.locked.title",
						content: {
							text: "error."+this.publishScreen+".publish.course.locked.content"
						},
						buttons: {
							ok: {label: 'Ok'}
						}
					};
					dialogs.create('simple', dialogConfig);
				}else{
					require('showMessage').serverError.show(response);
				}

			},

			/**
			 *
			 * @param courseId
			 * @returns {*|Promise}
			 */
			getCoursePublishedUrl: function(courseId) {
				return new Promise(function(resolve, reject) {
					if (publishedCourses[courseId]) {
						resolve(publishedCourses[courseId]);
					} else {
						var daoConfig = {
							path:restDictionary.paths.GET_COURSE_TINYURL,
							pathParams: {
								publisherId: AuthenticationData.user.relatesTo.id,
								courseId: courseId
							}
						};
						dao.remote(daoConfig, function(response) {
							if (response.tinyKey) {
								publishedCourses[courseId] = response;
								resolve(publishedCourses[courseId]);
							} else {
								reject(response);
							}
						}, function(response) {
							reject(response);
						});
					}
				});
			},

			/**
			 *
			 * @param lessonId
			 * @param courseId
			 * @returns {*|Promise}
			 */
			getLessonPublishedUrl: function(courseId, lessonId) {
				return new Promise(function(resolve, reject) {
					if (publishedLessons[lessonId]) {
						resolve(publishedLessons[lessonId]);
					} else {
						var daoConfig = {
							path:restDictionary.paths.GET_LESSON_TINYURL,
							pathParams: {
								publisherId: AuthenticationData.user.relatesTo.id,
								courseId: courseId,
								lessonId: lessonId
							}
						};
						dao.remote(daoConfig, function(response) {
							if (response.tinyKey) {
								publishedLessons[lessonId] = response;
								resolve(publishedLessons[lessonId]);
							} else {
								reject(response)
							}
						}, function(response) {
							reject(response);
						});
					}
				});
			},

			hasPlacementAssessment: function() {
                var hasPlacement = false;
                var repo = require("repo");
                var cm = require("courseModel");
                var cr = repo.get(cm.courseId);
                if (cr.data && cr.data.toc && cr.data.toc.tocItemRefs) {
                    cr.data.toc.tocItemRefs.forEach(function(tocItem) {
                        if (tocItem.type == "assessment") {
                            var tocItemRepo = repo.get(tocItem.cid);
                            if (tocItemRepo.data && tocItemRepo.data.placement) {
                                hasPlacement = true;
                            }
                        }
                    });
                }
                return hasPlacement;
            }
		};

		return new PublishModel();

	});

