define(['lodash', 'jquery', 'BaseView', 'mustache', 'events', 'FileUpload', 'restDictionary', 'modules/Dialogs/BaseDialogView',
    'text!modules/Dialogs/types/importCourse/importCourseDialog.html'],
    function f622(_, $, BaseView, Mustache, events, FileUpload, restDictionary, BaseDialogView, template) {

        var importLessonDialogView = BaseDialogView.extend({

            tagName: 'div',
            className: 'css-dialog',
            events: {
                "change #course-file": 'appendFile'
            },

            initialize: function f623(options) {
                this.customTemplate = template;
                this._super(options);
            },

            render: function f624($parent) {
                this._super($parent, this.customTemplate);
            },

            appendFile: function f625(e) {
                this.formData = new FormData();
                this.formData.append('file', e.target.files[0]);
                this.$('#upload').attr('disabled', false).removeClass('disabled');


            },

            loadCourse: function f626(courseId) {
                this.controller.onDialogTerminated('open');

                require('router').load(courseId);
            },

            import: function f627(validationId) {
                logger.info(logger.category.COURSE, 'Course import started');

                var jobId = require('repo').genId();
                var importCourseApi = {
                    path: restDictionary.paths.IMPORT_COURSE,
                    pathParams: {
                        jobId: jobId,
                        validationId: validationId,
                        publisherId: require('userModel').account.accountId
                    }
                };
                var courseModel = require("courseModel");

                require('busyIndicator').start();

                var _job_state_change = function f628(jobId) {
                    var jobProgressRestAPI = {
                        path: restDictionary.paths.CHECK_JOB_PROGRESS,
                        pathParams: {
                            jobId: jobId
                        }
                    };

                    require('dao').remote(jobProgressRestAPI, function f629(_job_progress) {
                        var lastKey = Object.keys(_job_progress.componentsProgressInPercent)[Object.keys(_job_progress.componentsProgressInPercent).length - 1];
                        if (lastKey != undefined) {
                            require('busyIndicator').setData('((' + lastKey + '))', _job_progress.componentsProgressInPercent[lastKey]);
                        }

                        if (_job_progress.status === "FAILED") {
                            logger.error(logger.category.COURSE, { message: 'Failed to import course', error: _job_progress.errors });
                            require('busyIndicator').stop();
                            //TODO: Show Error
                        } else if (~["IN_PROGRESS", "STARTED"].indexOf(_job_progress.status)) {
                            setTimeout(_job_state_change.bind(this, jobId), 1000);
                        } else {
                            if (_job_progress.status === "COMPLETED") {
                                logger.info(logger.category.COURSE, 'Course import ended');
                                
                                amplitude.logEvent('Import existing course', {
                                    "Course ID" : _job_progress.properties.courseId
                                });
                                
                                require('busyIndicator').stop();
                                if (courseModel.courseId) {
                                   courseModel.saveAndRelease(function f630() {
                                      courseModel.openCourse(_job_progress.properties.courseId, function f631() {
                                            this.loadCourse(_job_progress.properties.courseId)
                                       }.bind(this));
                                    }.bind(this));
                                } else {
                                    courseModel.openCourse(_job_progress.properties.courseId, function f632() {
                                        this.loadCourse(_job_progress.properties.courseId)
                                    }.bind(this));
                                }
                            }
                        }
                    }.bind(this))
                };

                require('dao').remote(importCourseApi, function f633(response) {
                    _job_state_change.call(this, jobId);
                }.bind(this));
            },

            check_validation: function f634(jobId) {
                var jobProgressRestAPI = {
                    path: restDictionary.paths.CHECK_JOB_PROGRESS,
                    pathParams: {
                        jobId: jobId
                    }
                };

                
                require('dao').remote(jobProgressRestAPI, function f635(_job_progress) {
                    var lastKey = Object.keys(_job_progress.componentsProgressInPercent)[Object.keys(_job_progress.componentsProgressInPercent).length - 1];
                    switch(lastKey) {
                        case 'unzip resources files':
                            require('busyIndicator').setData('((course.open.progress.extract_resource))', _job_progress.componentsProgressInPercent[lastKey]);
                            break;
                        case 'validate':
                            require('busyIndicator').setData('((Validate))', _job_progress.componentsProgressInPercent[lastKey]);
                            break;
                    }

                    if (~["IN_PROGRESS", "STARTED"].indexOf(_job_progress.status)) {
                        setTimeout(this.check_validation.bind(this, jobId), 1000);
                    } 
                    else if (~["COMPLETED", "FAILED"].indexOf(_job_progress.status)) {
                        require('busyIndicator').stop();
                        if (_job_progress.properties.passValidation === true) {
                            this.import(jobId);
                        } else {
                            var errors = _.keys(_job_progress.errors),
                                self = this;

                            if (errors.length == 1 && errors[0] == 'NOT_EQUAL_VERSIONS') {
                                logger.info(logger.category.COURSE, 'Trying to import course from another version of CGS');

                                var dialogConfig = {
                                    title: "import.cgs.file.version.not.match.title",
                                    content: {
                                        text: "import.cgs.file.version.not.match.body",
                                        icon: 'warn'
                                    },
                                    buttons: {
                                        ok: { label: 'OK' },
                                        cancel: { label: 'Cancel' },
                                    }

                                };

                                events.once('onCGSVersionsResponse', function(response) {
                                    if (response == 'ok') {
                                        self.import(jobId);
                                    }
                                });

                                require('dialogs').create('simple', dialogConfig, 'onCGSVersionsResponse');
                            }
                            else {
                                logger.warn(logger.category.COURSE, { message: 'Validation of imported course failed ', error: _job_progress.errors });
                                var dialogConfig = {
                                    title: "Course validation failed",
                                    content: {
                                        text: "This course can't be imported for the next reasons:<br>" + errors.join('<br>'),
                                        icon: 'warn'
                                    },
                                    buttons: {
                                        ok: { label: 'Close' }
                                    }

                                };
                                require('dialogs').create('simple', dialogConfig);
                            }
                        }
                    }
                }.bind(this));

            },

            sendFile: function f636() {
                var validationPath = {
                    path: restDictionary.paths.VALIDATE_BEFORE_IMPORT,
                    pathParams: {
                        publisherId: require('userModel').account.accountId,
                        jobId: require('repo').genId()
                    }
                };

                this.url = require('configModel').configuration.basePath + restDictionary.getPathData(validationPath.path, validationPath.pathParams).path;

                var req = new XMLHttpRequest();

                req.onload = function f637() {
                    logger.info(logger.category.COURSE, 'Starting import course validation');
                    this.check_validation(validationPath.pathParams.jobId);
                }.bind(this);
                req.upload.onprogress = function(e){
                    require('busyIndicator').setData('((Uploading file))', (e.loaded / e.total) * 100);
                };

                req.open("POST", this.url);
                req.send(this.formData);
            },

            beforeTermination: function f638(e) {
                if ($(e.target).attr("id") === "cancel") return true;

                require('busyIndicator').start();
                this.sendFile();
            }
        }, {type: 'importLessonDialogView'});

        return importLessonDialogView;

    });