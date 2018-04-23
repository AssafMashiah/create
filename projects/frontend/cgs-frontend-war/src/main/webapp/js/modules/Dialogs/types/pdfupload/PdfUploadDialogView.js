define(['lodash', 'jquery', 'repo','translate', 'BaseView', 'mustache', 'events', 'files', 'FileUpload', 'assets', 'modules/Dialogs/BaseDialogView', 'text!modules/Dialogs/types/pdfupload/PdfUploadDialog.html', 'thumbnailCreator'],
    function f666(_, $, repo,i18n, BaseView, Mustache, events, files, FileUpload, assets, BaseDialogView, template, thumbnailCreator) {

        /* Fix for Turkish */
        function fixUnicode(text) {

            while (text.indexOf('‹') != -1)
                text = text.replace('‹', 'İ')

            while (text.indexOf('›') != -1)
                text = text.replace('›', 'ı')

            while (text.indexOf('¤') != -1)
                text = text.replace('¤', 'ğ')

            while (text.indexOf('ð') != -1)
                text = text.replace('ð', 'ğ')

            while (text.indexOf('ý') != -1)
                text = text.replace('ý', 'ı')

            return text
        }

        function closeDialog() {
            this.processIframeRef && this.processIframeRef.remove();
            events.fire("terminateDialog");
        }

        window.updateMessage = function f667(message, refreshDialog) {
            $("#message").html(message);

            if (refreshDialog) {
                $("#ranges").attr('disabled', false);
                $("#pdf_upload_btn").attr('disabled', false);
                $("#pdf_upload_btn").next().val(null);
            }
        };



        var PdfUploadView = BaseDialogView.extend({

            tagName: 'div',
            className: 'css-dialog',
            filePath: "",
            totalPages: null,
            pagesToRender: null,
            tempSequences: [],

            initialize: function f670(options) {
                this.options = options;
                this.customTemplate = template;
                this._super(options);
                if (!this.options.config.isCourseExists) {
                    this.bindMyEvents();
                }
                this.tempSequences = [];
            },

            events: {
                'click button#convert_upload': 'upload_file',
                'change select#courses_language': 'unable_convert_button',
                'click .show_pdf': 'show_pdf'
            },

            createProxy: function f671(name, args, context) {
                //save context & arguments of method
                window[name] = { args: args, context: context };
            },

            saveLesson: function f672() {
                var router = require('router'),
                    lModel = require('lessonModel');

                lModel.setDirtyFlag(true);
                lModel.saveActiveLesson(function f673() {
                    closeDialog();
                });
                if (!this.options.config.isCourseExists) {
                    events.unbind('lock_lesson_success');
                }
            },

            bindMyEvents: function f674() {
                events.register('lock_lesson_success', this.saveLesson, this);
            },

            getPageRange: function f675() {
                var ranges = $("#ranges");

                if (_.isEmpty(ranges.val())) {
                    return [];
                }
                var get_splitted = String.prototype.split.call(ranges.val(), ",");

                var pages = _.map(get_splitted, function f676() {
                    var n = parseInt(arguments[0]);

                    if (/[0-9]+/.test(n)) {
                        return parseInt(n);
                    }
                });

                var ranges_numbers = _.filter(_.map(get_splitted, function f677() {
                    var n = arguments[0];

                    if (/[0-9]+\-[0-9]+/.test(n)) {
                        return n;
                    }
                }), function f678() {
                    return arguments[0] !== undefined;
                });

                _.each(ranges_numbers, function f679(item) {
                    var numbers = String.prototype.split.call(item, "-"),
                        from,
                        to;

                    if (numbers.length === 2) {
                        from = parseInt(numbers[0]);
                        to = parseInt(numbers[1]);
                        if (from <= to) {
                            for (var i = from; i <= to; ++i) {
                                pages.push(i);
                            }
                        }
                    }
                });

                return  _.uniq(pages).sort(function f680(x, y) {
                    return x > y ? 1 : y > x ? -1 : 0;
                });
            },

            /**
             * use for save the id of the sequences while the PDF is save in repo
             * if we cancel the upload so we itreate through this object and remove it from repo
             * @param $parent
             */
            render: function f681($parent) {
                if (!this.options.config.isCourseExists) {
                    this.is_course_pdf = true;
                    this.locales = require('userModel').account.contentLocales.options;
                }
                this._super($parent, this.customTemplate);

                var self = this;
                //bind the event for the cancel upload button
                $("#cancel_upload").one('click', _.bind(function f682() {
                    //remove the iframe from the DOM
                    $("#processPdf").remove();
                    //free the memory from the window object
                    delete window.frames['processPdf'];

                    //if we upload pdf to new course
                    if (!this.options.config.isCourseExists) {
                        if (this._old_course_id) {
                            require("courseModel").openCourse(this._old_course_id, _.bind(function f683() {
                                require('router').load(this._old_course_id);
                            }, this));
                        }

                        //restart the CGS and return to the FirstScreen Dialog

                        //set the dirty flag to false
                        require("lessonModel").setDirtyFlag(false);
                        require("courseModel").setDirtyFlag(false);
                    } else {
                        //if we on exists course, search for the LO Object (Contain all the sequences)
                        var parent_ref = _.find(require("repo")._data, function f684(rec) {
                            return rec.type === "lo"
                        });

                        //itreate through the sequences and remove it from repo
                        _.each(this.tempSequences, function f685(item) {
                            require('repo').remove(item);
                        });

                    }

                    //close the dialog
                    events.fire('terminateDialog');
                }, this));

                if (!this.options.config.isCourseExists) {
                    this._create_new_course();
                }
                //init the upload button event
                new FileUpload({
                    activator: '#pdf_upload_btn',
                    options: _.extend({
                        ignoreSizeLimit: true,
	                    is_ref: true,
	                    uploadFileLocalyOnly: true,
	                    uploadFileToServer: true,
                        keepName: true
                    }, FileUpload.params.pdf),
                    callback: _.bind(function f686(result, filename, fileEntry, enableAssetManager, isLocalUpload ) {
                        //on upload set the button to be disabled
                        $("#pdf_upload_btn").attr('disabled', true);

                        //check if the extension of the file is pdf
                        if (!result.match(/\.pdf$/i)) {
                            //return the button to be enabled
                            $("#pdf_upload_btn").attr('disabled', false);
                            alert("Can't open this file: not a PDF document.");
                            return;
                        }

                        //set up the neccessry data for pdf page conversions
                        this.set_scope_info(result, isLocalUpload);

                        // enable show button (display the pdf)
                        $(".display-pdf-file-name").html(i18n._("<a href='" + this.serverPath + "' target='_blank'><button class='btn'>((Show))</button></a>"));

                        //enable or diable the convert button
                        this.unable_convert_button();

                    }, this)
                });
            },

            set_reference: function f687(response) {
                if (!response) return;

                var fileName = response.split("/").pop(),
                    ref = {
                        fileName: fileName,
                        path: (response),
                        fileType: require('cgsUtil').getFileMediaType(fileName)
                    };

                repo.updatePropertyList(this.cid, "references", ref);
            },

            unable_convert_button: function f688() {
                if (!$(".display-pdf-file-name").html()) {
                    $("#convert_upload").addClass("disabled");
                    return false;
                }
                if ($("#courses_language").length && $("#courses_language").val() == 'null') {
                    $("#convert_upload").addClass("disabled");
                    return false;
                }
                $("#convert_upload").removeClass("disabled");
            },

            show_pdf: function f689(e) {
                var link = $(e.target).data('')
            },

            load_object_handle: function f690(result) {
                //check processing iframe is exists
                if (window && window.frames && window.frames['processPdf']) {
                    //set reference to the iframe
                    this.processIframeRef = window.frames['processPdf'];
                    this._pdf_initialize_deferred = new $.Deferred();

                    this.page_ranges = this.getPageRange();

                    if (this.page_ranges.length === 0) {
                        this.page_ranges = false;
                    }

                    //start process through the iframe
                    (this.processIframeRef.initialize || this.processIframeRef.contentWindow.initialize)(result, 'pdf_render', this.process_file.bind(this), this.page_ranges, this._pdf_initialize_deferred);

                    $.when(this._pdf_initialize_deferred).done(function f691(promisedPages, pagesCount, pdfDocument) {
                        if (!this._cache_promised_pages) {
                            this._cache_promised_pages = promisedPages;
                        }
                        repo.startTransaction();
                        (this.processIframeRef.process || this.processIframeRef.contentWindow.process).call(this, this._cache_promised_pages, 'pdf_render', this.process_file.bind(this), this.page_ranges, pagesCount);
                    }.bind(this));

                    $("#ranges").attr('disabled', true);
                }
            },

            upload_file: function f693(event) {
                if ($(event.target).hasClass("disabled")) {
                    return;
                }

                $("#convert_upload").addClass("disabled");

                //load the pdf file as blob
                files.loadObject(this.path, 'blob_hack', this.load_object_handle.bind(this));
            },

            process_blob: function f694(image, onProcessDone) {
                //set the repo to busy, doesn't fire change events!
                this.repo.busy(true);


                //create the html sequence
                var sid = this.repo.set({
                    type: "html_sequence",
                    parent: this.get_parent().id,
                    children: [],
                    data: {
                        title: require('translate').tran("Page ") + (this.totalPages - this.pagesToRender),
                        image: files.removeCoursePath(this.pid, this.cid, image.filePath),
                        html: fixUnicode(this.html),
                        isThumbnailUpdated: false
                    },
                    is_modified: true
                });
                var newChildren = require('cgsUtil').cloneObject(this.get_parent().children);
                newChildren.push(sid);
                this.repo.updateProperty(this.get_parent().id, 'children', newChildren, true);
                //if the course exists we push the sequence if to tempSequences
                if (this.options.config.isCourseExists && _.isArray(this.tempSequences)) {
                    this.tempSequences.push(sid);
                }
                if (this.redirect_id === undefined) {
                    this.redirect_id = sid;
                }
                //resize the pdf image and generating thumbnail and set the sequence to be updated
                thumbnailCreator.createPdfThumb(this.repo.get(sid), {
                    //require width - computed relative to the real image width
                    required_width: 200,
                    //require height - computed relative to the real image height
                    required_height: 100
                }, function ( response ) {
                    this.thumbnail_finish_upload.call(this, response);

                    if (onProcessDone) {
                        onProcessDone();
                    }
                }.bind(this));
            },

            thumbnail_finish_upload: function f695(response) {
                this.repo.updateProperty(response.seqId, 'isThumbnailUpdated', true);
                this.repo.updateProperty(response.seqId, 'thumbnail', response.resized_image);
                //if we done uploading all the sequences to repo
                if (this.pagesToRender === 0) {
                    this.on_process_done();
                }
            },

            process_file: function f696(canvas, html, remaining, continueCallback) {
                //pages remain div
                this.html = html;

                if (!this.pages_remain) {
                    this.pages_remain = $("#pdf_remaining");
                }

                //progress bar
                this.loading = $("#pdf_loading");
                //if we on first initialize set the total pages and the remain pages to render
                if (this.totalPages === null) {
                    this.totalPages = remaining;
                    this.pagesToRender = this.totalPages - 1;
                }
                else {
                    //decrease the pages to render in 1 every itreation
                    this.pagesToRender -= 1;
                }
                //set some pretty text to show while rendering
                this.pages_remain.html(i18n._('((Pages remaining:)) ' + this.pagesToRender + " ((of)) \"" + this.fileName + "\""))

                //set the progress bar width each render
                this.loading.width((this.totalPages - this.pagesToRender) / this.totalPages * 100 + "%");

                //convert the canvas to blob
                canvas.toBlob(_.bind(function f697(blob) {
                    //save the blob
                    assets.uploadImageBlob(blob, function (image) {
                        this.process_blob(image, continueCallback);
                    }.bind(this));
                }, this));
            },

            /**
             * set up the necessary data for pdf page conversions
             * @param result
             */
            set_scope_info: function f698(result, isLocalUpload) {
                //dependencies
                this.repo = require('repo');
                this.lessonModel = require('lessonModel');
                this.router = require('router');
                this.courseModel = require('courseModel');

                this.fileName = result.split("/").pop();

                //'model' data
                this.pid = require('userModel').getPublisherId();
                this.cid = require('courseModel').getCourseId();
                if (!this.options.config.isCourseExists) {
                    this.repo.updateProperty(this.cid, 'title', this.fileName.replace(".pdf", ""));
                }

                //the course path where we save the files
                
                /* in a local upload the file is saved under cgdData, 
                    but in a server upload the file is saved under cgsdata (lowercase)
                    in order to keep the paths correct we had to make the difference between the paths 
                    */
                if(isLocalUpload){ 
                    this.path = files.coursePath(this.pid, this.cid, result);
                }else{
                    this.upload_result = result;
                    this.serverPath = assets.serverPath(result);
                }
            },

            /**
             * returns the direct parent of the pdf if does not exist then it creates the parent
             *
             */
            get_parent: function f699() {


                if (this.parent !== undefined) {
                    return this.parent;
                }
                var course = this.repo.get(this.cid);
                if (this.options.config.isCourseExists) {

                    var lesson = this.repo.get(this.lessonModel.getLessonId());
                    if (course.data.includeLo) {
                        //we are in the lesson editor and need to create Lo object
                        if (this.router.activeEditor.record.id === lesson.id) {
                            var new_child_id = this.repo.createItem({parentId: lesson.id, type: 'lo', data: {}});
                            this.parent = this.repo.get(new_child_id);
                        }
                        else {
                            var record = this.router.activeEditor.record;
                            while (['lo','quiz'].indexOf(record.type) == -1) {
                                record = this.repo.get(record.parent);
                            }
                            this.parent = this.repo.get(record.id);
                        }
                    }
                    else {
                        this.parent = lesson;
                    }
                }
                else {
                    this.parent = this.repo.get(this.current_parent_id);
                }
                return this.parent;
             },

            _create_new_course: function f700() {
                var parentCourse = {
                    'type': 'course',
                    'parent': null,
                    'children': [],
                    'data': {
                        'title': require('translate').tran('New Course'),
                        'maxDepth': '3',
                        'references': [],
                        'author': '',
                        'cgsVersion': '0.1.23',
                        'publisher': '1',
                        'version': '1.0.0',
                        'includeLo': true
                    }
                };

                //set course information
                parentCourse.data.publisher = require("userModel").getPublisherName();
                parentCourse.data.cgsVersion = require("configModel").getVersion();
                parentCourse.data.author = require("userModel").getUserName();
                parentCourse.data.cid = repo.genId(); //content id

                //create new course in the server
                events.register("lock_course_success"); // FIXME

                try {
                    this._old_course_id = require("courseModel").getCourseId();
                } catch (e) {
                    this._old_course_id = null;
                }

                require("courseModel").newCourse(parentCourse, true, _.bind(function f701() {
                    //get the course record from repo
                    var course = repo.get(require("courseModel").getCourseId());

                    this.current_parent_id = course.id;

                    var lesson = repo.set({
                        'type': 'lesson',
                        'parent': course.id,
                        'children': [],
                        'data': {
                            'title': require('translate').tran('Lesson'),
                            'resources': [],
                            'header': {
                                "last-modified": {
                                    "$date": "1970-01-01"
                                }
                            }
                        },
                        'isCourse': false,
                        'ReadOnly': false
                    });

                    var newChildren = require('cgsUtil').cloneObject(course.children);
                    newChildren.push(lesson);
                    repo.updateProperty(course.id, 'children', newChildren, true);
                    lesson = repo.get(lesson);

                    if (parentCourse.data.includeLo) {
                        var lo = repo.set({
                            "type": "lo",
                            "parent": lesson.id,
                            "children": [],
                            "data": {
                                "pedagogicalLoType": "reconnect",
                                "title": require('translate').tran("LO")
                            }
                        });

                        this.current_parent_id = lo;

                        var newLessonChildren = require('cgsUtil').cloneObject(lesson.children);
                        newLessonChildren.push(lo);
                        repo.updateProperty(lesson.id, 'children', newLessonChildren, true);
                    }

                }, this));
            },

            /**
             * function to execute when the pdf process is finished
             */
            on_process_done: function f702() {
                //remove the iframe from the DOM
                this.set_reference(this.upload_result);

                $("#processPdf").remove();

                repo.endTransaction();

                //check if the course exists
                if (this.options.config.isCourseExists) {
                    //terminate the dialog
                    events.fire('terminateDialog');

                    this.lessonModel.setDirtyFlag(true);
                    this.tempSequences = [];
                    this.router.load(this.redirect_id);
                }
                else {

                    //reopen the lesson table component
                    this.router.loadModule('LessonsTableComponent', {});
                    var course = this.repo.get(this.cid);
                    repo.updateProperty(course.id, 'contentLocales', [$("#courses_language").val()], false, true);
                    require('localeModel').setLocale($("#courses_language").val(), true, function() {
                        //save the course
                        this.courseModel.saveCourse(_.bind(function f703() {
                            //this.lesson =
                            var lesson_id = this.get_parent().parent;
                            this.lessonModel.setLessonId(lesson_id);
                            repo.reset();
                            //save the lesson
                            if (!this.options.config.isCourseExists) {
                                this.lessonModel.saveLesson(lesson_id,
                                    function f704() {
                                        this.lessonModel.open(lesson_id, function f705() {
                                            //set lock on the lesson
                                            events.fire('lock', this.lessonModel.getLessonType(lesson_id));
                                            events.fire('terminateDialog');
                                            this.router.load(this.redirect_id);
                                        }.bind(this));
                                    }.bind(this), false);
                            }
                        }, this));
                    }.bind(this));
                }
            }

        }, {type: 'PdfUploadView'});

        return PdfUploadView;

    });