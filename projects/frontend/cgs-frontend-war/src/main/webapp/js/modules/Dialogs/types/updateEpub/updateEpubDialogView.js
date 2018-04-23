define(['lodash', 'moment', 'events', 'modules/Dialogs/BaseDialogView', 'configModel',
		'text!modules/Dialogs/types/updateEpub/updateEpub.html',
        'text!modules/Dialogs/types/updateEpub/updateProgress.html',
		'text!modules/Dialogs/types/updateEpub/updateCoursesStatus.html',
        'mustache', 'restDictionary', 'translate', 'websocket','cgsUtil'],
	function(_, moment,  events,  BaseDialogView, configModel, template, progressTemplate, updateCoursesStatusTemplate, mustache, restDictionary, translate, websocket, cgsUtil) {

		var dialogView = BaseDialogView.extend({
			tagName : 'div',
			step: 0,
			progressStep: [],
			stepJobName: [],
			stepsInfo: {},
			stepJobPercent: {},
			viewData: {},
			events: {
				'change #updateOnAllCourses': function(e) {
					this.options.config.content.updateOnAllCourses = e.currentTarget.checked;
				},
				'click #submitBtn': function (e) {
					e.preventDefault();
					this.uploadAndUpdate();
				}
			},

			initialize: function(options) {
				this.options = options;
                this.customTemplate = template;
                this.mode = this.options.config.content.mode;
                this.initSteps();
                this.viewData.isUpload = (options.config.content.mode == "uploadAndUpdate") ? true : false;
                this.totalProgress = _.reduce(this.stepJobPercent, function (total , a, b) {
                    return total + a;
                });
				if (this.options.config.content.mode == "uploadAndUpdate") {
                    this.viewData.fileName = options.config.content.selectedFile.name;
                    this.options.config.content.updateOnAllCourses = false;

                    this.progressStep.push(this.stepJobPercent['savingFileToDisk'] / this.totalProgress);
                    this.progressStep.push(
                        this.stepJobPercent['buildEBookStructure']+
                        this.stepJobPercent['generatingPageThumbnails']);
                    this.tocSummary = {};
                } else {
                	this.viewData.fileName = options.config.content.eBookTitle;
                    this.progressStep.push(this.stepJobPercent['eBookStructureValidation']);
                    this.update();
                }
                this.jobId = null;
                this.stepsInfo = {};
                this.socketMessage = this.socketMessage.bind(this);
				this._super(options);
			},

            initSteps: function() {
                if (this.mode == "uploadAndUpdate") {
                    this.stepJobName = ['savingFileToDisk',
                                        'buildEBookStructure',
                                        'calculatingEBookFileHash',
                                        'generatingPageThumbnails',
                                        'eBookStructureValidation',
                                        'savingEBookDataToDb',
                                        'updatingCourses'];
                    this.stepJobPercent = {'savingFileToDisk': 3,
                                           'buildEBookStructure': 10,
                                            'calculatingEBookFileHash': 1,
                                           'generatingPageThumbnails': 15,
                                           'eBookStructureValidation': 1,
                                           'savingEBookDataToDb': 1,
                                           'updatingCourses': 1};
                } else {
                    this.stepJobName = ['eBookStructureValidation', 'updatingCourses', 'calculatingEBookFileHash'];
                    this.stepJobPercent = {'eBookStructureValidation': 4, 'updatingCourses': 7, 'calculatingEBookFileHash': 1};
                }
            },

			uploadAndUpdate: function() {
				var url = configModel.getConfig().basePath +
					  	  mustache.render(restDictionary.paths.EPUB_UPLOAD_NEW_VERSION.path,
									  {'publisherId' : require('userModel').getPublisherId()});
				var content = this.options.config.content;

				this.xhr = new XMLHttpRequest();
				this.xhr.addEventListener("error", this.onXHR.bind(this));
				this.xhr.addEventListener("abort", this.onXHR.bind(this));
				this.xhr.addEventListener("load", this.onXHR.bind(this));
				this.xhr.addEventListener("progress", this.onXHR.bind(this));
				this.xhr.upload.addEventListener("progress", this.onXHR.bind(this));

				var formData = new FormData();
				formData.append("file", content.selectedFile);
				formData.append("existingEBookId", content.selectedEbookId);
				formData.append("courseId", require("courseModel").getCourseId());
				formData.append("updateOnAllCourses", content.updateOnAllCourses);

				this.xhr.open("POST", url);
				this.xhr.send(formData);
			},

            update: function() {
                var url = configModel.getConfig().basePath +
                    mustache.render(restDictionary.paths.EPUB_UPDATE_NEW_VERSION.path,
                        {'publisherId' : require('userModel').getPublisherId()});
                var content = this.options.config.content;

                this.xhr = new XMLHttpRequest();
                this.xhr.addEventListener("error", this.onXHR.bind(this));
                this.xhr.addEventListener("abort", this.onXHR.bind(this));
                this.xhr.addEventListener("load", this.onXHR.bind(this));
                this.xhr.addEventListener("progress", this.onXHR.bind(this));

                var formData = new FormData();
                formData.append("existingEBookId", content.existingEBookId);
                formData.append("courseId", require("courseModel").getCourseId());
                formData.append("newEBookId", content.newEBookId);

                this.xhr.open("POST", url);
                this.xhr.send(formData);
            },

			onXHR: function (e) {
				var status = e.target.status + "";
				if (status.indexOf('4') == 0 || status.indexOf('5') == 0) {
					console.warn('[eBookUpdate][onXHR] -> Error', status, e.target.statusText);
					events.fire('terminateDialog');
					require('showMessage').showAlert(e.target.status, {message:e.target.statusText});
				} else if (e.type == "progress") {
                    if (this.step <= 1) {
                    	if (this.mode == "uploadAndUpdate") {
                    		this.calculateProgress(e.loaded / e.total * this.stepJobPercent['savingFileToDisk'] / this.totalProgress);	
                    	} else {
                    		this.calculateProgress(0);
                    	}
                    }
				} else if (status == "200" && e.type == "load") {
                    this.jobId = e.target.response;
                    this.jobPollId = setInterval(this.getJobProgress.bind(this), 500, this.jobId);
					if (this.step < 2) this.setStep(3);
					this.connectToWebsocket();
				} else if (e.type === "abort"){
					this.disconnect();
					events.fire('terminateDialog');
				}
			},

			connectToWebsocket: function () {
				if (!websocket.isConnected) {
					websocket.connect(function () {
						websocket.subscribe('updateEBook/' + this.jobId, this.socketMessage);
					}.bind(this));
				} else {
					websocket.subscribe('updateEBook/' + this.jobId, this.socketMessage);
				}
			},

			calculateProgress: function (value) {
				if (this.step == 0) this.changeToProgressView();
				this.$("#progress").width(Math.round(value * 100) + "%");
				if (this.step >= 3) {
                    if (this.mode == "uploadAndUpdate") {
                        this.$('#buildEbookStructure').text(this.stepsInfo.buildEBookStructure?  this.stepsInfo.buildEBookStructure + '%' : translate.tran('upload.file.pending'));
                        this.$('#generatingPageThumbnails').text(this.stepsInfo.generatingPageThumbnails?  this.stepsInfo.generatingPageThumbnails + '%' : translate.tran('upload.file.pending'));
                    }
                    this.$('#eBookStructureValidation').text(this.stepsInfo.eBookStructureValidation?  this.stepsInfo.eBookStructureValidation + '%' : translate.tran('upload.file.pending'));
                    this.$('#creatingCourse').text(this.stepsInfo.updatingCourses?  this.stepsInfo.updatingCourses + '%' : translate.tran('upload.file.pending'));
				}
			},

			render: function( $parent ) {
                this._super($parent, this.customTemplate);
			}, 

			changeToProgressView: function() {
				if (this.step > 0) return;
				var progressViewHtml = mustache.render(progressTemplate, {'phase' : 1});
				this.$('#dialogContent').html(progressViewHtml);
				//this.$("#dialogTitle h3").html(translate.tran("dialog.importepub.progress.title"));
				this.$('#success-message').hide();
				if (this.mode == "update") {
					this.$('#generatingPageThumbnailsItem').hide();
					this.$('#buildEbookStructureItem').hide();
				}
				this.nextStep();
				this.$('#button_cancel').on('click',this.cancelConversion.bind(this));
				this.$('.filename').each(function(index, value) {
                    $(value).text(this.viewData.fileName);
                }.bind(this));
			},
			
			nextStep: function() {
				if (this.step >= 5) return;
				this.step++;
				this.renderStep(this.step);
			},

			setStep: function(step) {
				if (this.step === step) return;
				this.step = step;
				this.renderStep(this.step);
			},

			renderStep: function(step) {
				if (this.mode == "uploadAndUpdate") {
					this.$("#progress-info").html(translate.tran("dialog.importepub.progress.info.step" + step + "label"));
                    var showStep = {1: 1, 3: 2, 4: 3 };
					this.$("#progress-step").html(translate.tran("dialog.importepub.progress.info.step").format(showStep[step], 3));
				} else {
					this.$("#progress-info").html(translate.tran("dialog.importepub.progress.info.step3label"));
				}
				switch (step) {
					case 2:
						this.$('#button_cancel').show();
						break;
					case 3:
                        this.$('#button_cancel').show();
						this.$('.stepsinfo').show();
                        if (this.mode == "uploadAndUpdate") {
                            this.$('#buildEbookStructure').text((this.stepsInfo.buildEBookStructure || 0) + '%');
                            this.$('#generatingPageThumbnails').text((this.stepsInfo.generatingPageThumbnails || 0) + '%');
                        }
                        this.$('#eBookStructureValidation').text((this.stepsInfo.eBookStructureValidation || 0) + '%');
                        this.$('#creatingCourse').text((this.stepsInfo.updatingCourses || 0)+ '%');
						break;
					case 5:
                        this.getUpdateCoursesStatus(function (updateCoursesStatusHtml){
                            this.$('.content-row').hide();
                            this.$('.stepsinfo').hide();
                            this.$('#button_cancel').text(translate.tran("Close"));
                            this.$('#success-message').show();
                            if (updateCoursesStatusHtml) {
                                this.$('#updated-courses').html(updateCoursesStatusHtml);
                                this.$('#updated-courses').show();
                            }
                        }.bind(this));
                        break;
					case 1:
					case 4:
						this.$('.tocinfo').hide();
						this.$('.stepsinfo').hide();
				}
			},

			cancelConversion: function() {
				this.$("#progress-info").text(translate.tran('cancel'));
                this.$("#progress-step").text("");
                this.$("#progress").width(0 + "%");
                setTimeout(function(){
                    events.fire('terminateDialog');
                }, 1200);
				if (!this.jobId) {
					this.xhr.abort();
					return;
				} else if (this.step != 5) {
					var daoConfig = {
						path: restDictionary.paths.EBOOK_UPLOAD_CANCEL,
						pathParams: {
							publisherId : require('userModel').getPublisherId(),
							jobId: this.jobId
						}
					};
					require('dao').remote(daoConfig, function (data) {
					}.bind(this), this.onError.bind(this));
				}
				this.disconnect();
			},

			getJobProgress: function(jobId){
				var daoConfig = {
					path: restDictionary.paths.CHECK_JOB_PROGRESS,
					pathParams: {
						jobId: jobId
					}
				};
				require('dao').remote(daoConfig, this.jobProgressResponse.bind(this), this.onError.bind(this));
			},

			socketMessage: function(message){
                clearInterval(this.jobPollId);
                this.jobPollId = null;
                switch (message.code) {
                    case "PROGRESS":
                    case "COMPLETED":
                        this.jobProgressResponse(message.body);
                        break;
                    case "ERROR":
                        this.onError(message.body);
                        break;
                }
			},

			jobProgressResponse: function (data) {
				this.jobData = data;
				if (this.jobPollId && !websocket.isConnected) this.connectToWebsocket();
				if (data.status === "FAILED") {
                    console.warn('[eBookUpdate][JobStatus] -> FAILED', data);
					this.disconnect();
                    this.getUpdateCoursesStatus(function(updateCoursesStatusHtml) {
                        events.fire('terminateDialog');
                        for (var e in data.errors) {
                            var statusText = translate.tran('updateepub.error.' + e);
                            if (updateCoursesStatusHtml) {
                                statusText += "<br />"
                                statusText += updateCoursesStatusHtml;
                            }
                            this.onError({
                                status: translate.tran('updateepub.error.ERROR_TITLE'),
                                statusText: statusText
                            });
                        }
                        cgsUtil.onOpenCourseChosen(require("courseModel").getCourseId());
                        return;
                    }.bind(this));
                    return;
				} else if (data.status == "COMPLETED") {
					this.disconnect();
					this.setStep(5);
                    cgsUtil.onOpenCourseChosen(require("courseModel").getCourseId());
					return;
				}

				var total = 0;
				var inProgress = false;
				for (c in data.componentsProgressInPercent) {
					var stepPercent = this.stepJobPercent[c];
					var value = data.componentsProgressInPercent[c];
					if (value < 100) {
						inProgress = true;
					}
					if (((c == "buildEBookStructure" && this.mode == "uploadAndUpdate") ||
                        (c == "eBookStructureValidation" && this.mode != "uploadAndUpdate")) && this.step < 3) {
						this.setStep(3);
					}
					var stepValue = value / 100 * stepPercent;
					this.stepsInfo[c] = value;
					total += stepValue;
				}
				this.calculateProgress(total / this.totalProgress);
			},

			disconnect: function () { 
                clearInterval(this.jobPollId);
                this.jobPollId = null;
                clearTimeout(this.cancelTimeout);
                websocket.disconnect();
			},

			getUpdateCoursesStatus: function (callback) {
                var updateCoursesStatusHtml = null;
				if (this.jobData && this.jobData.properties
                    && (this.jobData.properties.updatedCourses || this.jobData.properties.failedToUpdateCourses)) {
                    var updatedCoursesFromJob = this.jobData.properties.updatedCourses || [];
                    var failedToUpdateCoursesFromJob = this.jobData.properties.failedToUpdateCourses || [];
                    var daoConfig = {
                        path: restDictionary.paths.GET_PUBLISHER_COURSES_TITLES,
                        pathParams: {
                            publisherId: require("userModel").getPublisherId(),
                            courseIds: ""
                        }
                    };
                    var allCoursesFromJob = updatedCoursesFromJob.concat(failedToUpdateCoursesFromJob);
                    daoConfig.pathParams.courseIds = allCoursesFromJob.join(",");
                    require('dao').remote(daoConfig, function(remoteCourses) {
                        var updatedCourses = _.pluck(_.pick(remoteCourses, function(course){
                            return updatedCoursesFromJob.indexOf(course.courseId) > -1;
                        }), "title");
                        var failedToUpdateCourses = _.pluck(_.pick(remoteCourses, function(course){
                            return failedToUpdateCoursesFromJob.indexOf(course.courseId) > -1;
                        }), "title");
                        updateCoursesStatusHtml = mustache.render(updateCoursesStatusTemplate, {
                            'updatedCourses' : updatedCourses,
                            'failedToUpdateCourses': failedToUpdateCourses
                        });
                        if (_.isFunction(callback)) {
                            callback(updateCoursesStatusHtml);
                        }
                    });
                } else {
                    if (_.isFunction(callback)) {
                        callback(null);
                    }
                }
            },

			onError: function (data) {
				require('showMessage').showAlert(data && data.status, {message:data && data.statusText}, true);
			}

		}, {type: 'updateEpubDialogView'});
		return dialogView;
	});