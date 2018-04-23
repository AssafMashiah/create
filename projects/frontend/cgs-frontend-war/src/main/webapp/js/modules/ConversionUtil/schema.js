define(["configModel"], function f212(configModel) {

    function generateUniqueId(typeUuid) {
        var uuid = "", i, random;

        switch (typeUuid) {
            case 12:
                for (i = 0; i < 12; i++) {
                    random = Math.random() * 16 | 0;
                    uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
                }
                break;
            default: // full
                for (i = 0; i < 32; i++) {
                    random = Math.random() * 16 | 0;

                    if (i == 8 || i == 12 || i == 16 || i == 20) {
                        uuid += '-'
                    }
                    uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
                }
                break;
        }

        return uuid;
    };

    function _resource_path_process(resPath, isNeeded) {

        if (!resPath) {
            return;
        }

        var PS = '/', // path separator char
            chars = resPath.split("");

        if (isNeeded) {
            if (chars[0] !== PS) {
                chars.splice(0, 0, PS);
            }
        } else {
            if (chars[0] === PS) {
                chars.splice(0, 1); // delete "/"
            }
        }
        return chars.join("");
    }

    var Resources_Manager = function f213() {

    };

    var Schema = {
        //mapping schema names: on the left- server name, on the right- repo name.
        _aliases_schema_name: {
            sequenceRef: "referenceSequence"
        },
        _resources_locales: {
            "textViewer": ["narration:key", "multiNarrations:key"],
            "cloze_text_viewer": ["narration:key", "multiNarrations:key"]
        },
        _resources_global: {
            "soundButton": ["sound"],
            "audioPlayer": ["audio"],
            "videoPlayer": ["video"],
            "textViewer": ["narration:*", "multiNarrations:*"],
            "cloze_text_viewer": ["narration:*", "multiNarrations:*"],
            "latex": ["component_src"],
            "MathML": ["component_src"],
            "inlineImage": ["component_src"],
            "inlineSound": ["component_src"],
            "inlineNarration": ["narrations:*"],
            "imageViewer": ["image", "sound", "captionNarration"],
            "applet": ["files:path"],

            "livePageTextViewerWrapper": ["iconPath", "livePageThumbnail"],
            "livePageImageViewer": ["iconPath", "livePageThumbnail", "image", "sound", "captionNarration"],
            "livePageSoundButton": ["iconPath", "livePageThumbnail", "sound"],
            "livePageAudioPlayer": ["iconPath", "livePageThumbnail", "audio"],
            "livePageVideoPlayer": ["iconPath", "livePageThumbnail", "video"],
            "livePageAppletWrapper": ["iconPath", "livePageThumbnail"],
            "livePageMultimedia": ["iconPath", "livePageThumbnail"],
            "livePageQuestionOnly": ["iconPath", "livePageThumbnail"],
            "livePageAppletTask": ["iconPath", "livePageThumbnail"],

            "OVERLAY_IMAGE" : ["overlaySrc"],
            "OVERLAY_AUDIO" : ["overlaySrc"],
            "OVERLAY_VIDEO" : ["overlaySrc"],
            "OVERLAY_EXTERNAL_URL": ['overlaySrc'],
            "OVERLAY_DL_SEQUENCE": ['sequenceResource'],
            "page": ['virtualData.background-image'],

            "pluginExternal" : ["assets:*"]
        },
        _repo_helpers: {
            get_recommended_criteria: function (_server_schema, _repo_schema, course) {
                return this.useForDifferentialRecommendation && this.recommendationCriteria.differentialPerLessonCritirias;
            },
            getRedoQuizEnabled: function (_server_schema, _repo_schema, course) {
                return !!this.redoQuiz;
            },
            get_redo_quiz_title: function (_server_schema, _repo_schema, course) {
                return this.redoQuiz && this.redoQuiz.title;
            },
            differentiation_get_sequences: function f214(_server_schema, _repo_schema, course) {
                return this.levels && this.levels.length && _.map(this.levels, function f215(item) {

                    _repo_schema[item.sequence.cid] = {
                        id: item.sequence.cid,
                        parent: this.cid,
                        children: [],
                        type: "sequence",
                        data: {
                            standards: item.sequence.standards,
                            tasks: item.sequence.tasks,
                            teacherGuide: Schema._repo_helpers.get_teacher_guid_repo.call(item.sequence, _server_schema, _repo_schema)
                        }
                    };

                    _.each(item.sequence.tasks, function f216(taskItem) {
                        _repo_schema[taskItem.cid] = {
                            id: taskItem.cid,
                            parent: item.sequence.cid,
                            children: [],
                            type: taskItem.type,
                            data: {
                                standards: item.sequence.standards
                            }
                        }
                    });

                    return item.sequence.cid;
                }, this) || [];
            },
            course_get_diff_levels: function f217() {
                if (!this.differentiation || !this.differentiation.levels || !this.differentiation.levels.length) return null;

                var _diffLevels = [];

                _.each(this.differentiation.levels, function f218(item) {
                    _diffLevels.push({
                        id: item.id,
                        name: item.name,
                        acronym: item.acronym,
                        isDefault: item.id == this.differentiation.defaultLevelId
                    });
                }, this);

                return _diffLevels;
            },
            get_custom_metadata_fields: function f219(){
                if (!this.customFields || !this.customFields.length) return null;

                var _customMetadataFields = [],
                getValueByType = function(item){
                    switch(item.type){
                        case 'text':
                            return {
                                "value" : item.maxLength,
                                "courseValue": item.value
                            };
                        case 'integer':
                            return {
                                "value_from": item.minValue,
                                "value_to": item.maxValue,
                                "courseValue": item.value
                            };
                        case 'freeText':
                            return {
                                "value" : item.maxLines,
                                "maxLength": item.maxLength,
                                "courseValue": item.value
                            };
                        case 'tags':
                            return {
                                "value": item.separator,
                                "courseValue": item.tags
                            };
                        case 'date':
                            return {
                                "value": item.format,
                                "courseValue": item.timestamp
                            };

                        case 'time':
                            return {
                                "value_format": item.format,
                                "value_includeSeconds": item.includeSeconds,
                                "courseValue": item.timestamp
                            };

                        case 'list':
                            return {
                                "courseValue": item.selectedValue,
                                "value": item.values
                            };

                        case 'boolean':
                            return {
                                "courseValue": item.value || false
                            };
                        case 'multiselect':
                        case 'multiselect_large':
                            return {
                                "courseValue" : item.selectedValue || [],
                                "value" : item.values
                            };
                        default:
                            return { "courseValue": item.value};
                    }

                };

                _.each(this.customFields, function f220(item) {
                    _customMetadataFields.push(_.extend({
                        id: item.cid,
                        type: item.type,
                        name : item.name
                    }, getValueByType(item)));
                }, this);

                return _customMetadataFields;

            },
            course_get_references: function f221() {
                var _reference_obj = [];

                if (this.resources && this.resources.length) {
                    _.each(this.resources, function f222(item) {
                        if (item.type === "planning") {
                            var fileName = item.href.substr(item.href.lastIndexOf('/') + 1),
                                fileType = require('cgsUtil').getFileMediaType(fileName);

                            _reference_obj.push({
                                "fileName": fileName,
                                "path": _resource_path_process(item.href, true),
                                "fileType": fileType
                            })
                        }
                    });
                }

                return _reference_obj;
            },
            course_get_language_pack: function() {
                if (this.customizationPack) {
                    var lpRes = _.find(this.resources, function(res) { return res.resId == this.customizationPack.resourceId }, this);
                    if (lpRes) {
                        return {
                            name: this.customizationPack.name,
                            version: this.customizationPack.version,
                            language: this.customizationPack.language,
                            date: this.customizationPack.date,
                            author: this.customizationPack.author,
                            baseDir: lpRes.baseDir,
                            files: lpRes.hrefs,
                            structureVersion: this.customizationPack.structureVersion,
                            customIconsPacks: this.customizationPack.customIconsPacks
                        }
                    }
                }
            },
            course_get_toc_items: function f223(_server_schema, _repo_schema) {
                var _set_toc_to_repo = function f224(_toc_item) {
                    if (_toc_item) {
                        _repo_schema[_toc_item.cid] = {
                            id: _toc_item.cid,
                            parent: this.courseId || this.cid,
                            children: _.compact(_.union(_.map(_toc_item.tocItemRefs, function f225(item) {
                                return item.cid
                            }), _.map(_toc_item.tocItems, function f226(item) {
                                return item.cid;
                            }))),
                            data: {
                                title: _toc_item.title,
                                overview: _toc_item.overview,
                                keywords: _toc_item.keywords,
                                hideOverview: _toc_item.hideOverview,
                                hideTitle: _toc_item.hideTitle,
                                image: _toc_item.image,
                                imageResourceRef: _toc_item.imageResourceRef,
                                selectedStandards: Schema._repo_helpers.get_standards_repo.call(_toc_item, _server_schema, _repo_schema)
                    },
                            type: "toc"
                        }

                        if (_toc_item.tocItems) {
                            _.each(_toc_item.tocItems, function f227(item) {
                                _set_toc_to_repo.call(_toc_item, item);
                            });
                        }
                    }
                };

                if (this.toc) {
                    _.each(this.toc.tocItems, _set_toc_to_repo, this);
                }

                return this.toc;
            },
            course_get_standards_packages: function f228(_server_schema, _repo_schema) {
                var _standard_processing = {};

                if (this.standardPackages && _.size(this.standardPackages)) {
                    _.each(this.standardPackages, function f229(item, index) {
                        _standard_processing[item.name + '_' + item.subjectArea + '_' + item.version] = {
                            name: item.name,
                            subjectArea: item.subjectArea,
                            version: item.version
                        }
                    }, this);
                }

                return _standard_processing;
            },
            convert_iso_period_into_minutes: function f230(value) {
                if (_.isEmpty(value)) {
                    return "";
                }
                var minutes = 0;
                if (!!value) {
                    var regEx = /^(-|)?P([0-9]+Y|)?([0-9]+M|)?([0-9]+D|)?T?([0-9]+H|)?([0-9]+M|)?([0-9]+S|)?$/,
                        match_array = value.match(regEx);

                    if (match_array && match_array.length > 6) {
                        minutes = match_array[6];
                        if (!!minutes) {
                            minutes = minutes.replace(/((?!([0-9]|-)).)/, ''); // Strip all but digits and -
                        }
                    }
                }

                return minutes;
            },
            get_standards_repo: function f231(_server_schema, _repo_schema) {
                var stds_packages = _server_schema.course ? _server_schema.course.standardPackages : _server_schema.standardPackages;

                return Schema._helper_global._get_standards_repo(this.standards, stds_packages);
            },
            get_teacher_guid_repo: function f232(_server_schema, _repo_schema) {
                if (!this.teacherGuide) return null;

                var tmpGuide = $('<div>').html(window[this.teacherGuide.mimeType == 'text/html-template' ? 'unescape' : 'atob'](this.teacherGuide.data)),
                    imglist = tmpGuide.find('img'),
                    tmpFiles = [];

                var self = this;

                for (var i = 0; i < imglist.length; i++) {
                    var resourse = _.find(_server_schema.resources, function(res) { return $(imglist[i]).attr('relative_path') == res.resId });
                    if (resourse) {
                        $(imglist[i]).attr('tg_res_src', require("assets").serverPath(resourse.href, require("repo")._courseId));
                        $(imglist[i]).attr('relative_path', resourse.href);
                    }
                }
                for (var i = 0; i < this.teacherGuide.attachments.length; i++) {
                    var resourse = _.find(_server_schema.resources, function(res) { return self.teacherGuide.attachments[i].resourceId == res.resId });
                    if (resourse) {
                        tmpFiles.push({
                            "name": self.teacherGuide.attachments[i].displayName,
                            "path": resourse.href
                        });
                    }
                }

                return {
                    html: tmpGuide.html(),
                    files: tmpFiles
                };
            },
            get_overlay_resource: function(_server_schema, _repo_schema) {

                function getResourceForRepo(resId, contentType, element) {
                    var href = false;
                    switch (contentType) {
                        case 'AUDIO_URL':case 'VIDEO_URL':case 'VIDEO_YOUTUBE':case 'IMAGE_URL':case 'EXTERNAL_URL':
                            href = element.content.data.resourceHref;
                            break;
                        case 'AUDIO_FILE':case 'VIDEO_FILE':case 'IMAGE_FILE':
                            _server_schema.resources.forEach(function(resource) {
                                if (resource.resId == resId) {
                                    href =  '/' + resource.href;
                                }
                            });
                            break;
                        case 'DL_SEQUENCE':
                            _server_schema.resources.forEach(function(resource) {
                                if (resource.resId == resId) {
                                    href = resource.href;
                                }
                            });
                            break;
                        default:
                            break;
                    }
                    return href;
                }

                var overlayMapTypes = {
                    AUDIO_FILE: 'OVERLAY_AUDIO',
                    AUDIO_URL: 'OVERLAY_AUDIO',
                    VIDEO_FILE: 'OVERLAY_VIDEO',
                    VIDEO_URL: 'OVERLAY_VIDEO',
                    VIDEO_YOUTUBE: 'OVERLAY_VIDEO',
                    IMAGE_FILE: 'OVERLAY_IMAGE',
                    IMAGE_URL: 'OVERLAY_IMAGE',
                    EXTERNAL_URL: 'OVERLAY_EXTERNAL_URL',
                    DL_SEQUENCE: 'OVERLAY_DL_SEQUENCE'
                };

                return _.map(this.overlayElements, function (element) {
                    var overlayElement = {
                        id: element.cid,
                        parent: this.cid,
                        type: overlayMapTypes[element.content.type],
                        children: [],
                        data: {
                            displayType: element.presentation.type,
                            embeddedUrl: undefined,
                            positionY: element.presentation.position.y,
                            positionX: element.presentation.position.x,
                            title: element.content.data.title || element.content.data.caption,
                            width: element.presentation.size.width,
                            height: element.presentation.size.height,
                            overlayType: element.content.type,
                            overlayOrder: element.overlayOrder,
                            overlaySrc: getResourceForRepo(element.content.data.resourceRefId || element.content.data.contentRef, element.content.type, element)
                        }
                    };
                    // if the element has sequnece inside we ned to get the sequence out and it's tasks.
                    if (element.content.type == 'DL_SEQUENCE') {
                        overlayElement.children = [];
                        overlayElement.data.sequenceResource = overlayElement.data.overlaySrc;
                        overlayElement.data.sequenceId = element.content.data.cid;

                        // create a sequence in the repo so it can be downloaded via lessonModel downloadSequence method!
                        _repo_schema[element.content.data.cid] = {
                            id: element.content.data.cid,
                            parent: element.cid,
                            children: [],
                            type: "sequence",
                            data: element.content.data.sequenceData
                        };
                        _repo_schema[element.content.data.cid].data.tasks = element.content.data.tasks;
                    }
                    // get the teacher guide back from the server to the overlay element.
                    if (element.teacherGuide) {
                        overlayElement.data.teacherGuide = Schema._repo_helpers.get_teacher_guid_repo.call(element ,_server_schema, _repo_schema);
                    }
                    // get the standards back from the server to the overlay element.

                    if (element.standardPackages && element.standardPackages.length > 0) {
                        overlayElement.data.selectedStandards = Schema._repo_helpers.get_standards_repo.call(element, _server_schema, _repo_schema);
                    }
                    _repo_schema[element.cid] = overlayElement;

                    return element.id;
                }, this) || [];
            },
            get_virtual_data: function(_server_schema, _repo_schema) {
                if (this.virtualData) {
                    _server_schema.resources.forEach(function(resource) {
                        if (this.virtualData['background-image'] == resource.resId) {
                            this.virtualData['background-image'] = resource.href;
                        }
                    }.bind(this));
                    return this.virtualData;
                }
                return undefined;
            }
        },
        _clean_unpermitted_resources_and_standards: function f233(_repo_data) {
            _.each(this.lessonsData, function f234(item) {
                var lesson_resources = item.resources || [];
                var std_packages = item.standardPackages || [];

                var loopItem = item.sequences ? 'sequences' : 'pages';
                _.each(item[loopItem], function f235(seqItem) {
                    lesson_resources = _.union(lesson_resources, seqItem.resources);
                    delete seqItem.resources;

                    std_packages = _.union(std_packages, seqItem.standardPackages);
                    delete seqItem.standardPackages;

                    _.each(seqItem.tasks, function(taskItem) {
                        std_packages = _.union(std_packages, taskItem.standardPackages);
                        delete taskItem.standardPackages;
                    });
                });

                _.each(item.learningObjects, function f236(learningItem) {
                    var objectToScan;
                    if(learningItem.type === 'loItem'){
                        objectToScan = learningItem.item.sequences || learningItem.item.pages;
                    }else{
                        objectToScan = learningItem.sequences || learningItem.pages;
                    }
                    _.each(objectToScan, function f237(seqItem) {
                        if (seqItem.levels) {
                            _.each(seqItem.levels, function f238(seqLevel) {
                                lesson_resources = _.union(lesson_resources, seqLevel.sequence.resources);
                                delete seqLevel.sequence.resources;

                                std_packages = _.union(std_packages, seqLevel.sequence.standardPackages);
                                delete seqLevel.sequence.standardPackages;

                                _.each(seqLevel.sequence.tasks, function(taskItem) {
                                    std_packages = _.union(std_packages, taskItem.standardPackages);
                                    delete taskItem.standardPackages;
                                });
                            });
                        } else {
                            lesson_resources = _.union(lesson_resources, seqItem.resources);
                            delete seqItem.resources;

                            std_packages = _.union(std_packages, seqItem.standardPackages);
                            delete seqItem.standardPackages;

                            _.each(seqItem.tasks, function(taskItem) {
                                std_packages = _.union(std_packages, taskItem.standardPackages);
                                delete taskItem.standardPackages;
                            });
                        }
                        // if the object has overlay-elements we want to find the sequence inside and move it's resources to the lesson
                        if (seqItem.overlayElements && seqItem.overlayElements.length > 0) {
                            seqItem.overlayElements.forEach(function(overlayElement) {
                                if (overlayElement.resources && overlayElement.resources.length > 0) {
                                    lesson_resources = _.union(lesson_resources, overlayElement.resources);
                                    delete overlayElement.resources;
                                }
                                if (overlayElement.standardPackages && overlayElement.standardPackages.length > 0) {
                                    std_packages = _.union(std_packages, overlayElement.standardPackages);
                                    delete overlayElement.standardPackages;
                                }
                                if (overlayElement.content.data.tasks && overlayElement.content.data.tasks.length > 0) {
                                    _.each(overlayElement.content.data.tasks, function(taskItem) {
                                        std_packages = _.union(std_packages, taskItem.standardPackages);
                                        delete taskItem.standardPackages;
                                    });
                                }
                            });
                        }
                    });
                });

                item.resources = _.chain(lesson_resources)
                                    .compact()
                                    .unique(function(lr) { return lr.resId })
                                    .value();
                item.standardPackages = _.chain(std_packages)
                                        .compact()
                                        .unique(function(sp) { return sp.stdPackageId })
                                        .value();
            });
        },
        _set_order: function f239(_repo_data) {
            //find the element under lo-> in ebook course its pages, otherwise, it's sequences
            if (_.size(this['pages']) || _.size(this['sequences'])) {
                _.each(this.lessonsData, function f240(item) {
                    var loChildType =  item.format == "EBOOK" ? "pages" : "sequences" ;
                    if (item.type === "assessment") {
                        item[loChildType] = _.chain(this[loChildType])
                            .filter(function f241(_seq_item) {
                                return _repo_data[_seq_item.cid].parent === item.cid;
                            })
                            .sortBy(function f242(_seq_item) {
                                return _repo_data[item.cid].children.indexOf(_seq_item.cid);
                            })
                            .value();
                    } else if (!this.course.includeLo) {
                        item.learningObjects[0][loChildType] = _.chain(this[loChildType])
                            .filter(function f243(_seq_item) {
                                return _repo_data[_seq_item.cid].parent === item.cid;
                            })
                            .sortBy(function f244(_seq_item) {
                                return _repo_data[item.cid].children.indexOf(_seq_item.cid);
                            })
                            .value();
                    }

                }, this);
            }
        },
        _toServerBefore: function f245(_repo_data) {
            var counter = 1;
            Schema.stdPackages = {};
             _.each(_.find(_repo_data,function f246(item) {
                return item.type == 'course'
            }).data.standartsPackages, function f247(pack, key) {
                 Schema.stdPackages[key] = key; // 'std_pck_' + (counter++);
            });
            _.each(_repo_data, function f248(item) {
                if (item.type == 'lesson' && item.data.mode == 'assessment') {
                    item.type = 'assessment';

                    // Order assessments sequences (overview --> content --> ending)
                    var overview = _.find(item.children, function f249(child) {
                            return _repo_data[child] && _repo_data[child].data.sq_type === 'overview';
                        }),
                        ending = _.find(item.children, function f250(child) {
                            return _repo_data[child] && _repo_data[child].data.sq_type === 'ending';
                        }),
                        rest = _.filter(item.children, function f251(child) {
                            return child !== overview && child !== ending;
                        });

                    item.children = _.compact(_.union([overview], rest, [ending]));
                }
            });
        },
        _toServerAfter: function f252(_repo_data) {
            Schema._set_order.call(this, _repo_data);
            Schema._clean_unpermitted_resources_and_standards.call(this, _repo_data);

            _.each(this.lessonsData, function f253(tocItem) {
                if (tocItem.type == 'assessment') {
                    _.each(tocItem.sequences, function f254(seq) {
                        seq.type = 'assessmentSequence';
                    });
                }
            });

            _.each(this.lessonsData, function (item) {
                var learningObjects = item.learningObjects;

                if (learningObjects && learningObjects.length) {
                    var quizs = _.filter(learningObjects, function (lo) {
                        return lo.type === "loItem";
                    });

                    _.each(quizs, function (quiz, k) {
                        delete quiz.sequences;

                        _.each(quiz.item.sequences, function (sequence) {
                            sequence.type = 'assessmentSequence';
                        });

                        quizs[k] = _.compact(quiz);
                    });
                }
            });

            var plugins = _.filter(this.sequences, function (item) {
                return item.type === "pluginContent";
            });

            _.each(plugins, function (item) {
                item.type = "sequence";

                delete item.isPlugin;
                delete item.path;
            });


            delete this.course.applets;
        },
        _resources_set_repo: function f255() {
            if (this.resources) {
                _.each(this.resources, function f256(_resource_item) {
                    _.each(this, function f257(_data_item, _data_key) {
                        if (_.isString(_data_item) && _data_item.indexOf("resource_") !== -1) {
                            if (_resource_item.resId === _data_item) {
                                this[_data_key] = _resource_item.href;
                            }
                        } else if (_.isObject(_data_item) && _data_item.length) {
                            Schema._resources_set_repo.call(_data_item)
                        }
                    }, this);
                }, this);

                return this;
            } else {
                if (_.size(this)) {
                    _.each(this, function f258(item, itemKey) {
                        if (_.isObject(item)) {
                            this[itemKey] = Schema._resources_set_repo.call(item);
                        }
                    }, this);
                }
            }

            return this;
        },
        toc_resources_set_repo: function (resources, toc) {
            if (!resources || !toc) return;
            var tocItems = toc.tocItems || [];
            tocItems.forEach(function (tocItem) {
                resources.forEach(function (resource) {
                   if (resource.resId === tocItem.imageResourceRef) {
                       tocItem.image = resource.href;
                   }
                });
                Schema.toc_resources_set_repo(resources, tocItem);
            });
        },
        _set_quiz_type: function () {
            if (!this.learningObjects || !this.learningObjects.length) return;

            _.each(this.learningObjects, function (quizItem) {
                if (quizItem.type === 'loItem' && quizItem.pedagogicalLoType === 'quiz') {
                    quizItem.type = 'quiz';

                    delete quizItem.item.type;

                    _.each(quizItem.item, function (v, k) {
                        quizItem[k] = v;
                    })

                    delete quizItem.item;
                }
            });
        },

        _set_lessons_ref: function f259() {
            var cache = [];
            var _get_lesson_ref = function f260(_root_toc) {

                if (_root_toc.tocItemRefs && _root_toc.tocItemRefs.length) {
                    cache = _.union(cache, _root_toc.tocItemRefs);
                }

                _.each(_root_toc.tocItems, function f261(_toc_item) {
                    _get_lesson_ref(_toc_item);
                });
            };

            if (!this.course || !this.lessonsData) return;

            _get_lesson_ref(this.course.toc);

            var _lessonsRef = _.pluck(cache, 'cid');
            var lessonsData = [];


            _.each(_lessonsRef, function f262(item) {
                _.each(this.lessonsData, function f263(lesson) {
                    if (lesson.cid === item) {
                        lessonsData.push(lesson);
                    }
                });
            }, this);

            this.lessonsData = lessonsData;
        },

        _set_sequences_type: function f264() {
            if (this.lessonsData) {
                _.each(this.lessonsData, function f265(lesson) {
                    _.each(lesson.sequences, function f266(seq) {
                        if (seq.type == 'assessmentSequence') {
                            seq.type = 'sequence';
                        }
                    });
                });
            }
            else {
                _.each(this.sequences, function f267(seq) {
                    if (seq.type == 'assessmentSequence') {
                        seq.type = 'sequence';
                    }
                });
            }

            if (this.learningObjects && this.learningObjects.length) {
                _.each(this.learningObjects, function (loItem) {
                    if (loItem && loItem.sequences && loItem.sequences.length) {
                        _.each(loItem.sequences, function (sequence) {
                            if (sequence.type === 'assessmentSequence') {
                                sequence.type = 'sequence';
                            }
                        });
                    } else if (loItem && loItem.item && loItem.item.sequences && loItem.item.sequences.length) {
                        loItem.sequences = loItem.item.sequences;

                        _.each(loItem.sequences, function (sequence) {
                            if (sequence.type === 'assessmentSequence') {
                                sequence.type = 'sequence';
                            }
                        });
                    }
                });
            }
        },
        _toRepoBefore: function f268() {
            Schema._set_lessons_ref.call(this);
            Schema._resources_set_repo.call(this);
            if (this.course) {
                Schema.toc_resources_set_repo(this.course.resources, this.course.toc);
            }
            Schema._set_sequences_type.call(this);
            Schema._set_quiz_type.call(this);
        },

        _toRepoAfter: function f269(_repo_data) {
            var self = _.defaults(this, _repo_data || {});
            var course = _.find(self, function f270(item) {
                return item.type === "course";
            });

            _.each(self, function f271(item) {
                if (item.type == 'assessment')
                    item.type = 'lesson';
            });

            _.chain(self)
                .filter(function f272(item) {
                    return ["sequence", "html_sequence"].indexOf(item.type) > -1;
                })
                .each(function f273(item) {
                    var lesson = (function findLessonParent(child) {
                        if (self[child.parent]) {
                            if (self[child.parent].type == 'lesson')
                                return self[child.parent];
                            else
                                return findLessonParent(self[child.parent]);
                        }
                        else
                            return null;
                    })(item);

                    item.data.selectedStandards = Schema._helper_global._get_standards_repo(item.data.standards, lesson.data.standardPackages);
                    delete item.data.standards;

                    _.each(item.data.tasks, function f274(task_item) {

                        if (self[task_item.cid]) {
                            self[task_item.cid].data.selectedStandards = Schema._helper_global._get_standards_repo(task_item.standards, lesson.data.standardPackages);
                        } else {
                            self[task_item.cid] = {
                                id: task_item.cid,
                                type: task_item.type,
                                parent: item.id,
                                children: self[task_item.cid] && self[task_item.cid].children || [],
                                data: {
                                    selectedStandards: Schema._helper_global._get_standards_repo(task_item.standards, lesson.data.standardPackages) || []
                                }
                            };
                        }

                        item.children.push(task_item.cid);
                    });

                    delete item.data.tasks;
                }, this);

            if (!course || !course.data.includeLo) {
                _.each(this, function f275(item) {
                    if (item.type === "lo") {
                        this[item.parent].children = _(this[item.parent].children)
                                                    .chain()
                                                    .filter(function f276(child) {
                                                        return child != item.id;
                                                    })
                                                    .union(item.children)
                                                    .value();
                        _.each(item.children, function f277(child, key) {
                            if (this[child]) {
                                this[child].parent = this[item.parent].id
                            } else {
                                item.children = item.children.splice(key, 1);
                            }
                        }, this);

                        delete this[item.id];
                    }
                }, this);
            }
        },
        _helper_global: {
            convertMinutesToISOPeriod: function f278() {
                return !_.isEmpty(this.data.typicalLearningTime) ? 'PT0H' + this.data.typicalLearningTime + 'M0S' : "";
            },
            _find_existing_resource: function(resources_array, resource) {
                return _.find(resources_array, function(res) {
                    return _.isEqual(_.omit(res, 'resId'), _.omit(resource, 'resId'));
                });
            },
            getCourseLocales: function (_repo_data, _server_json_struct, globalScope, cache) {
                return globalScope.course.contentLocales;
            },
            _get_resources: function f279(_repo_data, _server_json_struct, globalScope, cache) {

                if (['course', 'lesson', 'assessment'].indexOf(this.type) !== -1) {
                    Schema.resources = [];
                }

                var _resources_array = [],
                    _resource_index = Schema._helper_global._get_resources_size(globalScope).length;


                var addSequenceResource = function f280() {
                    _server_json_struct.contentRef = addToResourcesArray({
                        type: 'sequence',
                        href: "sequences/" + this.id
                    });
                };

                var addToResourcesArray = function f281(data, _process_path) {
                    if (_process_path && data.href) {
                        data.href = _resource_path_process(data.href, false);
                    }

                    var existingRes = Schema._helper_global._find_existing_resource(Schema.resources, data);
                    if (existingRes) {
                        _resources_array.push(existingRes);
                        return existingRes.resId;
                    }

                    data.resId = "resource_" + (++_resource_index);
                    _resources_array.push(data);
                    Schema.resources.push(data);

                    return data.resId;
                };

                var addAppletTypeResource = function f282(child) {
                    var appletItem = _.find(globalScope.course.applets, function f283(appletItem) {
                        return appletItem.guid === child.data.appletId;
                    });

                    if (appletItem && appletItem.resources) {
                        addToResourcesArray({
                            baseDir: appletItem.resources.baseDir,
                            hrefs: appletItem.resources.hrefs,
                            type: "lib"
                        });
                    }
                };

                var _add_single_resource = function f284(resource_index, child, _repo_data) {
                    if (Schema._resources_global && Schema._resources_global[child.type]) {

                        var _resources_locales = _.mapValues(Schema._resources_locales[child.type], function (item) {
                            var split_str = item.split(":");

                            return { root: split_str[0], locale: split_str[1] }
                        });

                        var _properties = Schema._resources_global[child.type];

                        if (child.type === "applet") {
                            addAppletTypeResource(child);
                        }

                        _.each(_properties, function f285(item, itemKey) {
                            if (/.*\:.*/.test(item)) {
                                var _config = item.split(":"),
                                    _file = _config[1],
                                    _collection = _config[0];

                                var _has_locale = _.find(_resources_locales, function (resource_locale) {
                                    return resource_locale.root = _collection;
                                });


                                _.each(child.data[_collection], function f286(subItem, subItemKey) {
                                    if (_.isObject(subItem) && _.isArray(subItem.hrefs)) {
                                        _.each(subItem.hrefs, function(href) {
                                            addToResourcesArray({
                                                href: _resource_path_process(subItem[_file] + '/' + href, false),
                                                type: "media"
                                            });
                                        });
                                    }
                                    else {
                                        var resource_data = {
                                            type: 'media'
                                        };

                                        if (_file === "*") {
                                            if (subItem) {
                                                resource_data.href = _resource_path_process(subItem, false);

                                                if (_has_locale) {
                                                    if (_has_locale.locale === 'key') {
                                                        resource_data.locale = subItemKey
                                                    }
                                                }

                                                addToResourcesArray(resource_data);
                                            }
                                        } else {
                                            resource_data.href = _resource_path_process(subItem[_file], false);

                                            if (_has_locale) {
                                                if (_has_locale.locale === 'key') {
                                                    resource_data.locale = subItemKey
                                                }
                                            }
                                            addToResourcesArray(resource_data);
                                        }
                                    }
                                });
                            }
                            else {
                                // special treatment for virtualData.background-image
                                if (/.*\..*/.test(item)) {
                                    var properties = item.split('.');
                                    var hrefKey = properties[1];
                                    var dataObject = properties[0];
                                    if (child.data[dataObject] && child.data[dataObject][hrefKey]) {
                                        addToResourcesArray({
                                            href: _resource_path_process(child.data[dataObject][hrefKey], false),
                                            type: "media"
                                        });
                                    }
                                }

                                if (child.data[item]) {
                                    addToResourcesArray({
                                        href: _resource_path_process(child.data[item], false),
                                        type: "media"
                                    });
                                }
                            }
                        });
                    }

                    if (child.children.length) {
                        _.each(child.children, function f287(subItem) {
                            _add_single_resource(resource_index, _repo_data[subItem], _repo_data)
                        });
                    }
                };

                if (['course', 'lesson', 'assessment'].indexOf(this.type) === -1) {
                    _add_single_resource(_resource_index, this, _repo_data);
                }

                switch (this.type) {
                    case "pluginContent":
                    case "sequence":
                    case "html_sequence":
                    case "url_sequence":
                    case "separator":
                        addSequenceResource.call(this);
                        break;
                    case "differentiatedSequenceParent":
                        _.each(this.children, function f288(item) {
                            addSequenceResource.call({id: item});
                        });
                        break;
                }


                var _teacher_guide_resources = Schema._helper_global._get_teacher_guid_resources(this.data.teacherGuide);

                _.each(_teacher_guide_resources, function f289(_teacher_guide_resource_item) {
                    addToResourcesArray(_teacher_guide_resource_item, true);
                }, this);



                if (["lesson", "assessment", "html_sequence", "url_sequence",
                        "sequence", "separator", "pluginContent", "page", 'OVERLAY_EXTERNAL_URL',
                        'OVERLAY_IMAGE', 'OVERLAY_AUDIO', 'OVERLAY_VIDEO', 'OVERLAY_DL_SEQUENCE'].indexOf(this.type) !== -1) {
                    _server_json_struct.resources = _.union(_server_json_struct.resources || [], _resources_array);
                }

                if (["html_sequence", "url_sequence", "sequence", "separator", "pluginContent", "page",
                        'OVERLAY_EXTERNAL_URL', 'OVERLAY_IMAGE', 'OVERLAY_AUDIO',
                        'OVERLAY_VIDEO', 'OVERLAY_DL_SEQUENCE'].indexOf(this.type) !== -1) {
                    _server_json_struct.resourceRefId = _.pluck(_server_json_struct.resources, 'resId');
                }

                if (this.data.teacherGuide) {
                    _server_json_struct.teacherGuide = Schema._helper_global._get_teacher_guid.call(this, this.data.teacherGuide, _server_json_struct.resources)
                }

                if (Schema[this.type] && Schema[this.type].resources_settings && Schema[this.type].resources_settings.resources) {
                    Schema._helper_global._set_predefined_resources.call(this, _resource_index, _repo_data, _server_json_struct, globalScope, cache);
                }

                //return _resources_array;
            },
            _get_server_standards: function f290(standards) {
                var _count = 0;
                var standardPackages = {}
                var _process_standards_packages = [];

                _.each(standards, function f291(item, key) {
                    var _split_std_package = item.stdPackageId.split('_');

                    standardPackages[item.stdPackageId] = {
                        name: _split_std_package[0],
                        subjectArea: _split_std_package[1],
                        version: _split_std_package[2]
                    };
                });


                _.each(standardPackages, function f292(std_package_value, std_package_key) {

                    _process_standards_packages.push(_.extend(std_package_value, {"stdPackageId": Schema.stdPackages[std_package_key]}));

                    std_package_value.stdPackageId = Schema.stdPackages[std_package_key];

                    _.each(standards, function f293(_standard_item) {
                        if (_standard_item.stdPackageId === std_package_key) {
                            _standard_item.stdPackageId = Schema.stdPackages[std_package_key]
                        }
                    });
                }, this);

                return _process_standards_packages;
            },
            _get_standards_repo: function f294(standards, standardPackages) {
                var stds = [];
                var tempStandardsPackages = {};
                var _count = 0;

                _.each(standardPackages, function f295(item) {
                    item.stdPackageId = item.stdPackageId ; //|| "std_pck_" + (++_count);
                    tempStandardsPackages[item.stdPackageId] = item;
                });

                _.each(standards, function f296(value, key) {
                    _.each(value.pedagogicalIds, function f297(item, index) {
                        if (tempStandardsPackages[value.stdPackageId]) {
                            stds.push({
                                "pedagogicalId": item,
                                "name": tempStandardsPackages[value.stdPackageId].name,
                                "subjectArea": tempStandardsPackages[value.stdPackageId].subjectArea,
                                "version": tempStandardsPackages[value.stdPackageId].version
                            });
                        }
                    }, this);
                }, this);

                return stds;
            },
            get_diff_levels: function f298(_repo_data, _server_json_struct, globalScope, cache) {
                var diffLevels = globalScope.course && globalScope.course.differentiation && globalScope.course.differentiation.levels;
                var sequences = _.filter(globalScope.sequences, function f299(item) {
                    return this.children.indexOf(item.cid) !== -1;
                }, this);

                if (diffLevels.length) {
                    return _.chain(sequences)
                        .map(function f300(seq) {
                        return {
                            levelId: _.find(diffLevels,function f301(level) {
                                return level.id == _repo_data[seq.cid].data.diffLevel.id;
                            }).id,
                            sequence: globalScope.sequences[seq.cid]
                        }
                    })
                        .sortBy(function f302(level) {
                            return _.pluck(diffLevels, 'id').indexOf(level.levelId);
                        })
                        .value();
                }

                return [];
            },
            _set_predefined_resources: function f303(_resource_index, _repo_data, _server_json_struct, globalScope, cache) {
                var _predefined_resources = Schema[this.type].resources_settings.resources;
                var _href;

                var _resources_array;

                if (["html_sequence", "url_sequence", "sequence", "separator", "pluginContent", "page"].indexOf(this.type) !== -1) {
                    var p = this.parent;
                    var lessonData;

                    while (!globalScope.lessonsData[p]) {
                        if (!_repo_data[p]) return;
                        p = _repo_data[p].parent;
                    }

                    lessonData = globalScope.lessonsData[p];

                    _resources_array = _server_json_struct.resources || [];
                } else {
                    _resources_array = _server_json_struct.resources || [];
                }

                _.each(_predefined_resources, _.bind(function f304(item) {
                    if (_.isObject(item) && item.value && _.isFunction(item.value)) {
                        _href = item.value.call(this) || null;

                        if (_href) {
                            var resData = {
                                    href: _resource_path_process(_href, false),
                                    type: "media"
                                },
                                existingRes = Schema._helper_global._find_existing_resource(Schema.resources, resData);

                            if (!existingRes) {
                                if (item.assignToServer) {
                                    resData.resId = _server_json_struct[item.key] = "resource_" + (++_resource_index);
                                } else {
                                    resData.resId = "resource_" + (++_resource_index);
                                }
                                _resources_array.push(resData);
                                Schema.resources.push(resData);
                            }
                            else if (item.assignToServer) {
                                _server_json_struct[item.key] = existingRes.resId;
                            }
                        }
                    } else {
                        if (this.data[item]) {
                            _href = _resource_path_process(this.data[item], false) || null;

                            if (_href) {
                                var resData = {
                                        href: _resource_path_process(_href, false),
                                        type: "media"
                                    },
                                    existingRes = Schema._helper_global._find_existing_resource(Schema.resources, resData);
                                if (!existingRes) {
                                    resData.resId = "resource_" + (++_resource_index);
                                    _resources_array.push(resData);
                                    Schema.resources.push(resData);
                                }
                            }
                        }
                    }
                }, this));

                if (this.type === "course") {
                    if (this.data.references && this.data.references.length) {
                        _.each(this.data.references, function f305(item) {
                            _resources_array.push({
                                resId: "resource_" + (++_resource_index),
                                href: _resource_path_process(item.path, false),
                                type: "planning"
                            });
                        });
                    }
                    if (this.data.customizationPackManifest && this.data.customizationPackManifest.files && this.data.customizationPackManifest.files.length) {
                        var cp_id = "resource_" + (++_resource_index);
                        _resources_array.push({
                            resId: cp_id,
                            baseDir: this.data.customizationPackManifest.baseDir,
                            hrefs: this.data.customizationPackManifest.files,
                            type: "lib"
                        });
                        _server_json_struct.customizationPack.resourceId = cp_id;
                    }


                    for (var key in _repo_data) {
                        var item = _repo_data[key];
                        if (item.type === "toc" && item.data.image && item.data.image !== null && item.data.image !== "") {
                            var rid = "resource_" + (++_resource_index);
                            _resources_array.push({
                                resId: rid,
                                href: _resource_path_process(item.data.image, false),
                                type: "media"
                            });
                            item.data.imageResourceRef = rid;
                        }
                    }
                }

                _server_json_struct.resources = _.union(_server_json_struct.resources || [], _resources_array || []);
                if (Schema[this.type].properties['resourceRefId']) {
                    _server_json_struct.resourceRefId = _.pluck(_server_json_struct.resources, 'resId');
                }
            },
            _create_standards: function f306(selectedStandards) {
                var standards = [], standardsTmp = {}, keyTmp, tmpObj;

                if (_.isArray(selectedStandards) && _.size(selectedStandards)) {
                    _.each(selectedStandards, function f307(item, index) {
                        keyTmp = item.name + '_' + item.subjectArea + '_' + item.version;
                        if (!standardsTmp[keyTmp] && item.pedagogicalId) {
                            standardsTmp[keyTmp] = {"pedagogicalIds": []};
                        }
                        standardsTmp[keyTmp].pedagogicalIds.push(item.pedagogicalId);
                    }, this);

                    _.each(standardsTmp, function f308(value, key) {
                        tmpObj = {
                            "stdPackageId": key,
                            "pedagogicalIds": value.pedagogicalIds
                        };
                        standards.push(tmpObj);
                    }, this);

                }

                return standards;
            },
            _get_teacher_guid_resources: function f309(teacherGuide) {
                if (!teacherGuide) return;

                var _resources = {};

                var _images_list = $('<div>').html(teacherGuide.html).find('img');

                if (_images_list && _images_list.length) {
                    _.each(_images_list, function f310(item, index) {
                        _resources[item.attributes.relative_path.nodeValue] = {
                            "href": item.attributes.relative_path.nodeValue,
                            "type": 'media'
                        };
                    }, this);
                }

                if (teacherGuide.files && teacherGuide.files.length) {
                    _.each(teacherGuide.files, function f311(item, index) {
                        _resources[item.path] = {
                            "href": item.path,
                            "type": 'attachment'
                        };
                    }, this);
                }

                return _resources;
            },
            _get_resources_size: function f312(context, _resources) {
                var resources = _resources || [];

                if (_.size(context) > 0) {
                    _.each(context, function f313(item, itemName) {
                        if (!_.isObject(item)) {
                            return;
                        }

                        if (item.resourceRefId && item.resourceRefId.length) {
                            resources = _.union(item.resourceRefId, resources);
                        } else if (item.imageResourceRef) {
                            resources = _.union([item.imageResourceRef], resources);
                        } else if (itemName !== "resourceRefId") {
                            resources = Schema._helper_global._get_resources_size(item, resources);
                        }
                    });
                }

                return resources;
            },
            _get_all_resources: function f314(context, _repo_data, _resources, _root_reference) {
                var _resources_result = _resources || [];
                var current_object = this;
                var parents = ["assessment", "lesson"];

                if ((["assessment", "lesson"].indexOf(this.type)) !== -1 && !_root_reference) {
                    context = context.lessonsData[this.id];
                }
                else if ((!context.type && _.size(context) > 0) && !_root_reference) {
                    var p = _repo_data[current_object.id];

                    while (p && parents.indexOf(p.type) === -1) p = _repo_data[p.parent];

                    if (!p) return _resources_result;

                    context = context.lessonsData[p.id];
                }

                if (_.size(context)) {
                    _.each(context, function f315(item, propertyName) {
                        if (_.isObject(item) && item.resources && item.resources.length) {
                            _resources_result = _.merge(_resources, item.resources);
                        } else if (_.isObject(item) && propertyName !== "resources") {
                            _resources_result = Schema._helper_global._get_all_resources.call(this, item, _repo_data, _resources_result, context);
                        }
                    }, this);
                }

                return _resources_result;
            },
            _get_teacher_guid: function f316(teacherGuide, resources) {
                if (!teacherGuide || !resources) return;

                var _teacher_guid = {
                        "resourceRefId": [],
                        "attachments": [],
                        "data": null,
                        "mimeType": "text/html+base64Encoded"
                    },
                    _html_fragment = $("<div></div>").html(teacherGuide.html),
                    image_list = _html_fragment.find('img'),
                    _files = teacherGuide.files;

                if (!image_list.length && !_html_fragment.text().trim()) {
                    _html_fragment.text('');
                    if (!_files.length) {
                        return;
                    }
                }

                _.each(resources, function f317(_resource_item) {
                    image_list && image_list.length && image_list.each(function f318() {
                        var _image_item = $(this);

                        if (_image_item.attr('src').indexOf(_resource_item.href) !== -1) {
                            _image_item.attr({
                                'src': '',
                                'relative_path': _resource_item.resId
                            });

                            _teacher_guid.resourceRefId.push(_resource_item.resId);
                        }
                    });

                    _files && _files.length && _.each(_files, function f319(_file_item) {
                        if (_file_item.path.indexOf(_resource_item.href) !== -1) {
                            _teacher_guid.resourceRefId.push(_resource_item.resId);
                            if (_resource_item.type === "attachment") {
                                _teacher_guid.attachments.push({
                                    "displayName": _file_item.name,
                                    "resourceId": _resource_item.resId
                                })
                            }
                        }
                    });
                });

                try {
                    _teacher_guid.data = btoa(_html_fragment.html());
                }
                catch (ex) {
                    _teacher_guid.data = escape(_html_fragment.html());
                    _teacher_guid.mimeType = 'text/html-template';
                }


                return _teacher_guid;
            },
            _get_schema_name: function f320() {
                return configModel.configuration.schemaName;
            },
            getSequenceTasks: function f338(_repo_data, _server_json_struct, cache) {
                if (!this.children.length) return [];

                if (this.type === "pluginContent") {
                    var pluginClass = require("pluginModel").getPluginByPath(this.data.path);
                    var plugin_tasks;

                    if (pluginClass) {
                        plugin_tasks = pluginClass.invokeModelToTasks(this.id);
                    }

                    return plugin_tasks;
                }

                var _sequence_tasks = [],
                    excludeTasks = ['sharedContent', 'header', 'sequence', 'help'],
                    checkingTypeMap = {// manual/auto/none
                        'mc': 'auto',
                        'matching': 'auto',
                        'sorting': 'auto',
                        'sequencing': 'auto',
                        'FreeWriting': 'manual',
                        'appletTask': 'dependent',
                        'livePageAppletTask': 'dependent',
                        'cloze': 'dependent',
                        'ShortAnswer': 'dependent',
                        'questionOnly' : 'manual'
                    };

                var setTask = function (child) {
                    if (excludeTasks.indexOf(child.type) === -1) {
                        var task_standards =  Schema._helper_global._create_standards(child.data.selectedStandards),
                             packages = Schema._helper_global._get_server_standards(task_standards);
                        function findElementbyTypes(record, types) {
                            var retval = null;
                            if (record && record.children) {
                                _.each(record.children, function f342(childId) {
                                    if (_repo_data && _repo_data[childId] && types.indexOf(_repo_data[childId].type) !== -1) {
                                        retval = _repo_data[childId];
                                    }
                                    else {
                                        retval = retval || findElementbyTypes(_repo_data[childId], types);
                                    }
                                });
                            }

                            return retval;
                        }

                        var progress = findElementbyTypes(child, ['progress', 'advancedProgress']);

                        var taskCheckingType = 'none';

                        if( child.data.task_check_type && ['questionOnly', 'appletTask', 'livePageAppletTask'].indexOf(child.type) == -1){
                            taskCheckingType = child.data.task_check_type;
                        } else {

                            if (checkingTypeMap[child.type] && checkingTypeMap[child.type] != 'dependent') {
                                taskCheckingType = checkingTypeMap[child.type];
                            }
                            else if (checkingTypeMap[child.type] == 'dependent') {
                                if (child.type == 'appletTask' || child.type == 'livePageAppletTask') {
                                    var applet = findElementbyTypes(findElementbyTypes(child, ['appletAnswer']), ['applet']);
                                    if (applet) {
                                        taskCheckingType = applet.data.isCheckable ? 'auto' : 'manual';
                                    }
                                }
                                else if(child.type == "questionOnly"){
                                    taskCheckingType = progress.data.score ? 'manual' : 'none';
                                }
                                else if (progress) {
                                    taskCheckingType = progress.data.checking_enabled ? 'auto' : 'manual';
                                }
                            }
                        }

                        var task = {
                            'cid': child.id,
                            'type': 'task',
                            'title': child.data.title,
                            'allowedAttempts': _find_task_attempts(child.children),
                            'checkingType': taskCheckingType,
                            'standards': task_standards || [],
                            'standardPackages': packages
                        };

                        // Find item's assessment parent
                        var parent = _repo_data[this.parent];
                        if (parent) {
                            while (!~['assessment', 'quiz'].indexOf(parent.type) && parent.parent) {
                                parent = _repo_data[parent.parent];
                            }
                        }

                        // Assessment type
                        if (parent && ~['assessment', 'quiz'].indexOf(parent.type)) {
                            task.totalScore = progress && parseInt(progress.data.score) || 0;

                            task.type = 'assessmentTask';
                            delete task.allowedAttempts;

                            if (_.isObject(child.data.rubrics) && child.data.rubrics_enabled) {
                                task.rubricsCriterias = _.map(child.data.rubrics.rows, function(row) {
                                    return {
                                        'cid': row.id,
                                        'mimeType': 'text/plain',
                                        'nameData': row.name,
                                        'totalScore': parseInt(row.totalScore) || 0,
                                        'gradingScales': _.map(row.cells, function(cell, index) {
                                            return {
                                                'cid': cell.id,
                                                'scaleDescriptionData': child.data.rubrics.columnsHeaders[index],
                                                'gradingExplanationData': cell.explanation
                                            };
                                        })
                                    };
                                });
                            }
                        }

                        if (!~['pedagogicalStatement', 'narrative', 'selfCheck'].indexOf(child.type)) {
                            _sequence_tasks.push(task);
                        }

                    }
                };

                var _find_task_attempts = function f339(collection) {
                    var result;

                    _.each(collection, function f340(item) {
                        var child = _repo_data[item];

                        if (child && child.type === 'progress') {
                            result = parseInt(child.data.num_of_attempts, 10);
                        }
                    });

                    return (_.isNaN(result) || !result) ? 0 : result;
                };

                _.each(this.children, function f341(item) {
                    var child = _repo_data[item];


                    if (child.type === 'compare') {
                        _.each(child.children, function (compare_task) {
                            setTask.call(this, _repo_data[compare_task]);
                        }, this);
                    } else {
                        setTask.call(this, child);
                    }

                }, this);

                return _sequence_tasks;
            },
            getCustomMetadata: function(_repo_data, _server_json_struct, globalScope, cache){
                    var _custom_metadata_fields = [],

                    getItemTypeValueObj = function(item){
                        switch(item.type){
                            case 'text':
                                return {
                                    "maxLength": item.value,
                                    "value": item.courseValue
                                };
                            case 'integer':
                                return {
                                    "minValue": item.value_from,
                                    "maxValue": item.value_to,
                                    "value" : item.courseValue
                                };
                            case 'freeText':
                                return {
                                    "maxLines": item.value,
                                    "maxLength": item.maxLength,
                                    "value": item.courseValue
                                };
                            case 'tags':
                                return {
                                    "separator": item.value,
                                    "tags": item.courseValue
                                };
                            case 'date':
                                return {
                                    "format": item.value,
                                    "timestamp" : item.courseValue
                                };

                            case 'time':
                                return {
                                    "format": item.value_format,
                                    "timestamp" : item.courseValue,
                                    "includeSeconds" : item.value_includeSeconds
                                };

                            case 'list':
                                var values;
                                if (item.value == undefined) {
                                    values = null;
                                }
                                else if(_.isArray(item.value)){
                                    values = item.value;
                                }else{
                                    values = _.map(item.value.split(','), function(str){
                                        return {"key":str.trim(), "name":str.trim()};
                                    });
                                }
                                return {
                                    "selectedValue" : item.courseValue,
                                    "values" : values
                                };
                            case 'boolean':
                                return {
                                    "value": item.courseValue || false
                                };
                            case 'multiselect_large':
                            case 'multiselect':
                                return{
                                    "values" : item.value,
                                    "selectedValue" : item.courseValue || []
                                };

                            default:
                                return {
                                    "value": item.courseValue
                                };
                        }
                    };

                    _.each(this.data.customMetadataFields, function f324(item) {
                        _custom_metadata_fields.push(_.extend({
                            cid: item.id,
                            type: item.type,
                            name : item.name,
                            required : item.required === true
                        }, getItemTypeValueObj(item)));

                    });

                    return this.data.customMetadataFields && _custom_metadata_fields || null;

            }
        },
        course: {
            properties: {
                author: {
                    _reference: "data.author"
                },
                applets: {
                    _helper: "getApplets"
                },
                cgsVersion: {
                    _reference: "data.cgsVersion"
                },
                cid: {
                    _reference: "data.cid"
                },
                courseId: {
                    _reference: "id"
                },
                themingLastModified : {
                    _reference : 'data.themingLastModified'
                },
                header: {
                    _default: {
                        "last-modified": {
                            "$date": "1970-01-01"
                        }
                    }
                },
                includeLo: {
                    _default: false,
                    _reference: "data.includeLo"
                },
                maxDepth: {
                    _reference: "data.maxDepth",
                    _helper: "makeInt"
                },
                publisher: {
                    _reference: "data.publisher"
                },
                supplementaryNarrationLocales: {
                    _reference: "data.multiNarrationLocales"
                },
                customizationPack: {
                    _list :{
                        "name": {
                            _reference: "data.customizationPackManifest.name"
                        },
                        "version": {
                            _reference: "data.customizationPackManifest.version"
                        },
                        "language": {
                            _reference: "data.customizationPackManifest.language"
                        },
                        "date": {
                            _reference: "data.customizationPackManifest.date"
                        },
                        "author": {
                            _reference: "data.customizationPackManifest.author"
                        },
                        "structureVersion": {
                            _reference: "data.customizationPackManifest.structureVersion"
                        },
                        "customIconsPacks": {
                            _reference: "data.customizationPackManifest.customIconsPacks"
                        }
                    }
                },
                resources: {
                    _global: "_get_resources"
                },
                sample: {
                    _reference: "data.sample"
                },
                schema: {
                    _global: "_get_schema_name"
                },
                standards: {
                    _helper: "getStandards"
                },
                standardPackages: {
                    _helper: "getStandardPackages"
                },
                title: {
                    _reference: "data.title"
                },
                contentLocales: {
                    _reference: "data.contentLocales"
                },
                subjectArea: {
                    _reference: "data.subjectArea"
                },
                gradeLevel: {
                    _reference: "data.gradeLevel"
                },
                isbn: {
                    _reference: "data.isbn"
                },
                overview: {
                    _reference: "data.overview"
                },
                credits: {
                    _reference: "data.credits"
                },
                targetPopulation: {
                    _reference: "data.targetPopulation"
                },
                technicalRequirements: {
                    _reference: "data.technicalRequirements"
                },
                toolboxWidgets: {
                  _reference: "data.toolboxWidgets"
                },
                toc: {
                    _helper: "getTocItems"
                },
                type: {
                    _reference: "type"
                },
                version: {
                    _reference: "data.version"
                },
                differentiation: {
                    _helper: "getDifferentionLevels"
                },
                customFields : {
                    _global :'getCustomMetadata'
                },
                useTtsServices: {
                    _reference: "data.useTtsServices"
                },
                ttsServices: {
                    _reference: "data.ttsServices"
                },
                format :{
                    _reference : "data.format"
                },
                learningPaths: {
                    _reference : "data.learningPaths"
                },
                eBooksIds: {
                    _reference : "data.eBooksIds"
                }
            },
            repo: {
                id: "courseId",
                type: "type",
                data: [
                    "author",
                    "cgsVersion",
                    "header",
                    "themingLastModified",
                    "includeLo",
                    "maxDepth",
                    { "diffLevels": "_course_get_diff_levels" },
                    {"customMetadataFields" : "_get_custom_metadata_fields"},
                    { "cover": "coverRefId" },
                    { "coverUrl": "coverRefId" },
                    "publisher",
                    { "references": "_course_get_references" },
                    { "customizationPackManifest": "_course_get_language_pack" },
                    "schema",
                    "cid",
                    "courseId",
                    { "standartsPackages": "_course_get_standards_packages" },
                    { "selectedStandards": "_get_standards_repo" },
                    "title",
                    { "toc": "_course_get_toc_items" },
                    "version",
                    { "multiNarrationLocales": "supplementaryNarrationLocales"},
                    "contentLocales",
                    "subjectArea",
                    "useTtsServices",
                    "ttsServices",
                    "gradeLevel",
                    "isbn",
                    "overview",
                    "credits",
                    "targetPopulation",
                    "technicalRequirements",
                    "toolboxWidgets",
                    "format",
                    "learningPaths",
                    "eBooksIds",
                    "sample"
                ],
                parent: null,
                children: []
            },
            helpers: {
                getApplets: function f321() {
                    var appletManifest = require("appletModel").appletManifest;

                    return appletManifest && _.isArray(appletManifest["applets"]) && appletManifest["applets"] || null;
                },
                getDifferentionLevels: function f322(_repo_data, _server_json_struct, globalScope, cache) {
                    var _diff_levels = { defaultLevelId: null, levels: [] };

                    _.each(this.data.diffLevels, function f323(item) {
                        _diff_levels.defaultLevelId = item.isDefault ? item.id : _diff_levels.defaultLevelId;
                        _diff_levels.levels.push({
                            id: item.id,
                            name: item.name,
                            acronym: item.acronym
                        });
                    });

                    return this.data.diffLevels && _diff_levels || null;
                },
                getStandards: function f348() {
                    return  Schema._helper_global._create_standards.call(this, this.data.selectedStandards);
                },
                getStandardPackages: function f325(_repo_data, _server_json_struct, globalScope, cache) {
                    var _standard_processing = [];
                    var count = 0;

                    if (this.data.standartsPackages && _.size(this.data.standartsPackages)) {
                        _.each(this.data.standartsPackages, function f326(item, index) {
                            _standard_processing.push({
                                "stdPackageId": item.name + "_" + item.subjectArea + "_" + item.version,//"std_pck_" + (++count),
                                "name": item.name ? item.name : "",
                                "subjectArea": item.subjectArea ? item.subjectArea : "",
                                "version": item.version ? item.version : ""
                            });
                        });
                    }
                    return _standard_processing;
                },
                getTocItems: function f327(_repo_data, _server_json_struct, globalScope, cache) {
                    var _toc;

                    var getLessonsRef = function f328(_parentId) {
                        return _.chain(_repo_data[_parentId].children)
                            .map(function f329(childId) {
                                child = _repo_data[childId];
                                return child && { cid: child.id, type: child.type };
                            })
                            .filter(function f330(child) {
                                return child && ['lesson', 'assessment'].indexOf(child.type) != -1;
                            })
                            .value();
                    };

                    if (!globalScope.course.toc) {
                        globalScope.course.toc = {
                            cid: generateUniqueId(32),
                            title: this.data.title || "",
                            overview: this.data.overview || "",
                            keywords: this.data.keywords || [],
                            type: "tocItem",
                            tocItemRefs: getLessonsRef(this.id),
                            tocItems: []
                        };
                        _toc = globalScope.course.toc;


                    } else {
                        if (cache && _.isArray(cache)) {
                            var standards = Schema._helper_global._create_standards(this.data.selectedStandards);
                            cache.push({
                                cid: this.id,
                                title: this.data.title || "",
                                overview: this.data.overview || "",
                                keywords: this.data.keywords || [],
                                has_resources: true,
                                hideOverview: this.data.hideOverview,
                                hideTitle: this.data.hideTitle,
                                image: this.data.image,
                                imageResourceRef: this.data.imageResourceRef,
                                type: "tocItem",
                                standards: standards || [],
                                tocItemRefs: getLessonsRef(this.id),
                                tocItems: []
                            });

                            _toc = cache[cache.length - 1];
                        }
                    }

                    _.each(_repo_data[this.id].children, function(childId) {
                        var child = _repo_data[childId];
                        if (child && child.type == "toc") {
                            Schema.course.helpers.getTocItems.call(child, _repo_data, _server_json_struct, globalScope, _toc && _toc.tocItems);
                        }
                    });

                    return _toc;
                },
                makeInt: function f331() {
                    return parseInt(this.data.maxDepth);
                }
            },
            _map_type_json: "course",
            has_resources: true,
            resources_settings: {
                key: ['applets', 'resources'],
                resources: [
                    { key: "coverRefId", value: function f332() {
                        return _resource_path_process(this.data.cover, false);
                    }, assignToServer: true }
                ]
            }
        },
        pluginContent: {
            properties: {
                cid: {
                    _reference: "id",
                },
                title: {
                    _reference: "data.title"
                },
                mimeType: {
                    _default: "DL"
                },
                isPlugin: {
                    _default: true
                },
                path: {
                    _reference: "data.path"
                },
                tasks: {
                    _global: "getSequenceTasks"
                },
                type: {
                    _reference: "type"
                },
                resourceRefId: {
                    _default: null
                },
                resources: {
                    _global: "_get_resources"
                },
                standards: {
                    _helper: "getStandards"
                },
                standardPackages: {
                    _helper: "getStandardsPackages"
                }
            },
            repo: {
                id: "cid",
                type: "type",
                data: "data",
                parent: null,
                children: []
            },
            helpers: {
                getStandardsPackages: function f343(_repo_data, _server_json_struct, globalScope, cache) {
                    return Schema._helper_global._get_server_standards(_server_json_struct.standards);
                },
                getStandards: function f344() {
                    return Schema._helper_global._create_standards(this.data.selectedStandards);
                }
            },
            _map_type_json: "sequences",
            parent_schema: ["lo"],
            parent_schema_property: {
                lo: {
                    key: "sequences",
                    schemaName: "pluginContent"
                }
            },
            isCollection: true,
            _collectionIndex: 'id'
        },
        sequence: {
            properties: {
                cid: {
                    _reference: "id"
                },
                mimeType: {
                    _default: "DL"
                },
                tasks: {
                    _global: "getSequenceTasks"
                },
                resourceRefId: {
                    _default: null
                },
                resources: {
                    _global: "_get_resources"
                },
                standards: {
                    _helper: "getStandards"
                },
                standardPackages: {
                    _helper: "getStandardsPackages"
                },
                title: {
                    _reference: "data.title"
                },
                type: {
                    _reference: "type"
                }
            },
            repo: {
                id: "cid",
                type: "type",
                data: [
                    "exposure",
                    "title",
                    "type",
                    "tasks",
                    "standards",
                    { "selectedStandards": "_get_standards_repo" },
                    {"teacherGuide": "_get_teacher_guid_repo"}
                ],
                parent: null,
                children: []
            },
            has_resources: true,
            resources_settings: {
                key: 'resources',
                resources: [
                    { key: "footer_big", value: function f333() {
                        return this.data.creativeWrapper && _resource_path_process(this.data.creativeWrapper.footer_big, false)
                    } },
                    { key: "footer_small", value: function f334() {
                        return this.data.creativeWrapper && _resource_path_process(this.data.creativeWrapper.footer_small, false)
                    } },
                    { key: "margin", value: function f335() {
                        return this.data.creativeWrapper && _resource_path_process(this.data.creativeWrapper.margin, false)
                    } },
                    { key: "thumbnail", value: function f336() {
                        return this.data.creativeWrapper && _resource_path_process(this.data.creativeWrapper.thumbnail, false)
                    } },
                    { key: "image", value: function f337() {
                        return this.data.image && _resource_path_process(this.data.image, false)
                    } }

                ]
            },
            helpers: {
                getStandardsPackages: function f343(_repo_data, _server_json_struct, globalScope, cache) {
                    return Schema._helper_global._get_server_standards(_server_json_struct.standards);
                },
                getStandards: function f344() {
                    return Schema._helper_global._create_standards(this.data.selectedStandards);
                }
            },
            _map_type_json: "sequences",
            parent_schema: ["lo", "quiz"],
            parent_schema_property: {
                lo: {
                    key: "sequences",
                    schemaName: "sequence"
                },
                quiz: {
                    parent_property: "item",
                    key: "sequences",
                    schemaName: "sequence"
                }
            },
            isCollection: true,
            _collectionIndex: 'id'
        },
        referenceSequence: {
            properties: {
                cid: {
                    _reference: "id"
                },
                type: {
                    _default : 'sequenceRef'
                },
                'sequenceRef':{
                    _list: {
                        lessonCid: {
                            _reference: "data.referencedLessonId"
                        },
                        sequenceCid: {
                            _reference: "data.referencedSequenceId"
                        }
                    }
                }
            },
            repo: {
                id: "cid",
                type: "type",
                data: [{"referencedLessonId" :"lessonCid"}, {"referencedSequenceId" : "sequenceCid"}, "breadcrumbs"],
                parent: null,
                children: []
            },
            helpers: {},
            _map_type_json: "sequences",
            parent_schema: ["lo"],
            parent_schema_property: {
                lo: {
                    key: "sequences",
                    schemaName: "sequence"
                }
            },
            isCollection: true,
            _collectionIndex: 'id'
        },
        url_sequence: {
            properties: {
                cid: {
                    _reference: "id"
                },
                mimeType: {
                    _default: "DL"
                },
                resourceRefId: {
                    _default: null
                },
                resources: {
                    _global: "_get_resources"
                },
                title: {
                    _reference: "data.title"
                },
                type: {
                    _default: "sequence"
                }
            },
            repo: {
                id: "cid",
                type: "type",
                data: ["exposure", "title", "type"],
                parent: null,
                children: []
            },
            helpers: {},
            _map_type_json: "sequences",
            parent_schema: ["lo"],
            parent_schema_property: {
                lo: {
                    key: "sequences",
                    schemaName: "sequence"
                }
            },
            isCollection: true,
            _collectionIndex: 'id'
        },
        separator: {
            properties: {
                cid: {
                    _reference: "id"
                },
                mimeType: {
                    _default: "DL"
                },
                resourceRefId: {
                    _default: null
                },
                resources: {
                    _global: "_get_resources"
                },
                title: {
                    _reference: "data.title"
                },
                type: {
                    _default: "sequence"
                }
            },
            repo: {
                id: "cid",
                type: "type",
                data: ["separatorImage", "separatorSubTitle", "separatorSubTitleNarration",
                    "separatorTitle", "separatorTitleNarration", "type", "title"],
                parent: null,
                children: []
            },
            has_resources: true,
            resources_settings: {
                key: 'resources',
                resources: [
                    { key: "separatorImage", value: function f345() {
                        return this.data.separatorImage
                    }},
                    { key: "separatorSubTitleNarration", value: function f346() {
                        return this.data.separatorSubTitleNarration
                    }},
                    { key: "separatorTitleNarration", value: function f347() {
                        return this.data.separatorTitleNarration
                    }}
                ]
            },
            helpers: { },
            _map_type_json: "sequences",
            parent_schema: ["lo"],
            parent_schema_property: {
               lo: {
                    key: "sequences",
                    schemaName: "sequence"
                }
            },
            isCollection: true,
            _collectionIndex: 'id'
        },
        lesson: {
            properties: {
                cid: {
                    _reference: "id"
                },
                header: {
                    _reference: "data.header"
                },
                schema: {
                    _global: "_get_schema_name"
                },
                isHidden: {
                    _reference: "data.isHidden"
                },
                hideOverviewTitle: {
                  _reference: "data.hideOverviewTitle"
                },
                hideDescriptionAndObjective: {
                    _reference: "data.hideDescriptionAndObjective"
                },
                pedagogicalLessonType: {
                    _reference: "data.pedagogicalLessonType"
                },
                contentLocales: {
                    _global: "getCourseLocales"
                },
                supplementaryNarrationLocales: {
                    _helper: "getMultiNarrationLocales"
                },
                standards: {
                    _helper: "getStandards"
                },
                standardPackages: {
                    _helper: "getStandardsPackages"
                },
                learningObjects: {
                    _helper: "getLearningObject"
                },
                resources: {
                    _global: "_get_resources"
                },
                overview: {
                    _reference: "data.overview"
                },
                title: {
                    _reference: "data.title"
                },
                type: {
                    _reference: "type"
                },
                description: {
                    _reference: "data.description"
                },
                keywords: {
                    _reference: "data.keywords"
                },
                objective: {
                    _reference: "data.objective"
                },
                typicalLearningTime: {
                    _reference: 'data.typicalLearningTime',
                    _global: "convertMinutesToISOPeriod"
                },
                customFields : {
                    _global :'getCustomMetadata'
                },
                format: {
                     _reference: "data.format"
                },
                eBooks:{
                    _reference: "data.eBooks"
                },
                eBooksIds: {
                    _reference : "data.eBooksIds"
                },
                displayOddPages : {
                    _reference: "data.displayOddPages"
                },
            },
            helpers: {
                getStandards: function f348() {
                    return  Schema._helper_global._create_standards.call(this, this.data.selectedStandards);
                },
                getMultiNarrationLocales: function (_repo_data, _server_json_struct, globalScope, cache) {
                    return globalScope.course.supplementaryNarrationLocales;
                },
                getStandardsPackages: function f349(_repo_data, _server_json_struct, globalScope, cache) {
                    return Schema._helper_global._get_server_standards(_server_json_struct.standards);
                },
                getLearningObject: function f350(_repo_data, _server_json_struct, globalScope, cache) {
                    // If course does not allow LearningObject level
                    if (!globalScope.course.includeLo) {
                        var learningObjects = [];

                        // Create a mock learning object because Teach expects LO
                        learningObjects.push({
                            'cid': "00000000-0000-4000-9000-" + generateUniqueId(12),
                            'type': 'lo',
                            'title': ''
                        });

                        return learningObjects;
                    }
                }
            },

            repo: {
                id: "cid",
                type: "type",
                learningObjects: {
                    _schema: "lo",
                    type: "collection",
                    parent_index: 'cid',
                    child_index: 'cid'
                },
                data: [
                    "header",
                    "pedagogicalLessonType",
                    "title",
                    "overview",
                    "description",
                    "isHidden",
                    "hideOverviewTitle",
                    "hideDescriptionAndObjective",
                    "keywords",
                    "objective",
                    "format",
                    { "typicalLearningTime": "_convert_iso_period_into_minutes", "args": ["typicalLearningTime"] } ,
                    "standardPackages",
                    { "selectedStandards": "_get_standards_repo" },
                    {"teacherGuide": "_get_teacher_guid_repo"},
                    {"mode": "@normal" },
                    {"customMetadataFields" : "_get_custom_metadata_fields"},
                    "eBooks",
                    "eBooksIds",
                    "displayOddPages",
                    { "image": "imageResourceRef" },
                    { "imageUrl": "imageResourceRef" },
                ],
                parent: null,
                children: []
            },
            _map_type_json: "lessonsData",
            isCollection: true,
            _collectionIndex: 'id',
            _schema_settings: {
                "sequence": {}
            },
            has_resources: true,
            resources_settings: {
                key: ['resources'],
                resources: [
                    { key: "imageResourceRef", value: function () {
                        return _resource_path_process(this.data.image, false);
                    }, assignToServer: true }
                ]
            }
        },

        assessment: {
            properties: {
                cid: {
                    _reference: "id"
                },
                header: {
                    _reference: "data.header"
                },
                schema: {
                    _global: "_get_schema_name"
                },
                resources: {
                    _global: "_get_resources"
                },
                standards: {
                    _helper: "getStandards"
                },
                standardPackages: {
                    _helper: "getStandardsPackages"
                },
                title: {
                    _reference: "data.title"
                },
                contentLocales: {
                    _global: "getCourseLocales"
                },
                supplementaryNarrationLocales: {
                    _helper: "getMultiNarrationLocales"
                },
                overview: {
                    _reference: "data.overview"
                },
                type: {
                    _reference: "type"
                },
                description: {
                    _reference: "data.description"
                },
                keywords: {
                    _reference: "data.keywords"
                },
                objective: {
                    _reference: "data.objective"
                },
                typicalLearningTime: {
                    _reference: 'data.typicalLearningTime',
                    _global: "convertMinutesToISOPeriod"
                },
                useForDifferentialRecommendation: {
                    _default: false,
                    _reference: 'data.diffLevelRecommendation'
                },
                checkingType: {
                    _reference: 'data.pedagogicalLessonType'
                },
                placement: {
                    _default: false,
                    _reference: 'data.placement'
                },
                startByType: {
                  _reference: 'data.startByType'
                },
                containsInstructionalSequence: {
                    _default: false,
                    _reference: 'data.includeOverview'
                },
                customFields : {
                    _global :'getCustomMetadata'
                }
            },
            helpers: {
                getStandards: function f351() {
                    return  Schema._helper_global._create_standards.call(this, this.data.selectedStandards);
                },
                getStandardsPackages: function f352(_repo_data, _server_json_struct, globalScope, cache) {
                    return Schema._helper_global._get_server_standards(_server_json_struct.standards);
                },
                getMultiNarrationLocales: function (_repo_data, _server_json_struct, globalScope, cache) {
                    return globalScope.course.supplementaryNarrationLocales;
                }
            },

            repo: {
                id: "cid",
                type: "type",
                sequences: {
                    _schema: "sequence",
                    type: "collection",
                    parent_index: 'cid'
                },
                data: [
                    "header",
                    {"pedagogicalLessonType": "checkingType"},
                    "title",
                    "overview",
                    "description",
                    "keywords",
                    "objective",
                    "startByType",
                    "placement",
                    { "typicalLearningTime": "_convert_iso_period_into_minutes", "args": ["typicalLearningTime"] } ,
                    "standardPackages",
                    { "selectedStandards": "_get_standards_repo" },
                    {"teacherGuide": "_get_teacher_guid_repo"},
                    {"mode": "@assessment" },
                    {"customMetadataFields" : "_get_custom_metadata_fields"},
                ],
                parent: null,
                children: []
            },
            _map_type_json: "lessonsData",
            isCollection: true,
            _collectionIndex: 'id',
            _schema_settings: {
                "sequence": {
                    "lo": {
                        ignore_parent_schema: true
                    }
                }
            }
        },

        lo: {
            properties: {
                cid: {
                    _reference: "id"
                },
                title: {
                    _reference: "data.title"
                },
                type: {
                    _reference: "type"
                },
                standards: {
                    _helper: "getStandards"
                },
                //standardPackages: {
                //  _helper: "getStandardsPackages"
                //},
                modality: {
                    _reference: "data.modality"
                },
                pedagogicalLoType: {
                    _reference: "data.pedagogicalLoType"
                },
                typicalLearningTime: {
                    _reference: 'data.typicalLearningTime',
                    _global: "convertMinutesToISOPeriod"
                }
            },
            repo: {
                childConfig: null,
                type: "type",
                id: "cid",
                children: [],
                parent: null,
                data: [
                    "title",
                    "modality",
                    //"standards",
                    { "selectedStandards": "_get_standards_repo" },
                    "pedagogicalLoType",
                    {
                        "typicalLearningTime": "_convert_iso_period_into_minutes",
                        "args": ["typicalLearningTime"]
                    }
                ]
            },
            _map_type_json: "lo",
            isCollection: true,
            _collectionIndex: 'id',
            parent_schema: ["lesson"],
            parent_schema_property: {
                lesson: {
                    key: "learningObjects",
                    schemaName: "lo"
                }
            },
            helpers: {
                //getStandardsPackages: function f3439999(_repo_data, _server_json_struct, globalScope, cache) {
                //  return Schema._helper_global._get_server_standards(_server_json_struct.standards);
                //},
                getStandards: function f348() {
                    return  Schema._helper_global._create_standards.call(this, this.data.selectedStandards);
                    //return  Schema._helper_global._create_standards(this.data.selectedStandards);
                }
            }
        },
        page: {
            properties: {
                cid : {
                    _reference: "id"
                },
                eBookId: {
                    _reference: 'data.eBookId'
                },
                pageId: {
                    _reference: 'data.pageId'
                },
                href: {
                    _reference: 'data.href'
                },
                thumbnailHref: {
                    _reference: 'data.thumbnailHref'
                },
                title: {
                    _reference: 'data.title'
                },
                comments: {
                    _reference: 'data.comments'
                },
                type: {
                    _reference: "type"
                },
                originalIndex:{
                    _reference: "data.originalIndex"
                },
                resources: {
                    _global: "_get_resources"
                },
                standards: {
                    _helper: "getStandards"
                },
                standardPackages: {
                    _helper: "getStandardsPackages"
                },
                overlayElements: {
                    _helper: "getOverlayElements"
                },
                virtualData: {
                    _helper: "getVirtualData"
                }
            },

            repo: {
                type: "type",
                id: 'cid',
                children: { "children": "_get_overlay_resource" },
                parent: null,
                data: [
                    { "pageId": "pageId" },
                    'eBookId',
                    'href',
                    'thumbnailHref',
                    'title',
                    'comments',
                    { "virtualData": "_get_virtual_data" },
                    "originalIndex",
                    {"teacherGuide": "_get_teacher_guid_repo"},
                    { "selectedStandards": "_get_standards_repo" }
                ]
            },
            _map_type_json: "pages",
            isCollection: true,
            _collectionIndex: 'id',
            _serverChildIndex: 'cid',
            parent_schema: ["lo"],
            parent_schema_property: {
               lo: {
                    key: "pages",
                    schemaName: "page"
                }
            },
            helpers: {
                getStandardsPackages: function f343(_repo_data, _server_json_struct, globalScope, cache) {
                    return Schema._helper_global._get_server_standards(_server_json_struct.standards);
                },
                getStandards: function f344() {
                    return Schema._helper_global._create_standards(this.data.selectedStandards);
                },
                getVirtualData: function(_repo_data, _server_json_struct, globalScope, cache) {
                    if (_server_json_struct.resources.length > 0) {
                        if (!this.data.virtualData || this.data.virtualData.length === 0) return undefined;
                        var virtualData = JSON.parse(JSON.stringify(this.data.virtualData));
                        _server_json_struct.resources.forEach(function(resource) {
                            if ('/' + resource.href == virtualData['background-image'] || resource.href == virtualData['background-image']) {
                                virtualData['background-image'] = resource.resId;
                            }
                        });
                        return virtualData;
                    }
                    return this.data.virtualData;
                },
                getOverlayElements: function(_repo_data, _server_json_struct, globalScope, cache) {
                    if (!this.children.length) return [];

                    var _overlays = [];

                    /**
                     * checks whether the overlay holds a files as resource or url as resource, if it holds an url
                     * it gets deleted from the resources array and the field name is changed to "resourceHref"
                     * @param repoOverlay
                     * @param serverOverlayData
                     * @returns {boolean}
                     */
                    var assignOverlayResource = function(repoOverlay, serverOverlayData) {
                        switch (repoOverlay.data.overlayType) {
                            case 'AUDIO_URL':case 'VIDEO_URL':case 'VIDEO_YOUTUBE':case 'IMAGE_URL':case 'EXTERNAL_URL':
                                serverOverlayData.resourceHref = repoOverlay.data.overlaySrc;
                                // remove resource from _server_json_struct.resources
                                var indexToRemove = undefined;
                                _server_json_struct.resources.forEach(function(resource, index) {
                                    if (resource.href == repoOverlay.data.overlaySrc) {
                                        indexToRemove = index;
                                    }
                                });
                                if (indexToRemove !== undefined) {
                                    _server_json_struct.resources.splice(indexToRemove, 1);
                                }
                                break;
                            case 'AUDIO_FILE':case 'VIDEO_FILE':case 'IMAGE_FILE':
                                _server_json_struct.resources.forEach(function(resource) {
                                    if ('/' + resource.href == repoOverlay.data.overlaySrc || resource.href == repoOverlay.data.overlaySrc) {
                                        serverOverlayData.resourceRefId = resource.resId;
                                    }
                                });
                                break;
                            case 'DL_SEQUENCE':
                                _server_json_struct.resources.forEach(function(resource, index) {
                                    if (resource.href == repoOverlay.data.sequenceResource) {
                                        serverOverlayData.contentRef = resource.resId;
                                        _server_json_struct.resources[index].type = 'sequence';
                                    }
                                });
                                break;
                            default:
                                break;
                        }
                    };

                    /**
                     * replaces the server resources with only resources that contains files.
                     * @type {Array}
                     */
                    var server_resources = [];

                    var setOverlay = function(child) {
                        var overlay = {
                            cid: child.id,
                            "presentation": {
                                "type": child.data.displayType,
                                "position": {
                                    "x": child.data.positionX,
                                    "y": child.data.positionY
                                },
                                "size": {
                                    "height": child.data.height,
                                    "width": child.data.width
                                }
                            },
                            "content": {
                                "type": child.data.overlayType,
                                "data": {
                                    "title": child.data.title
                                }
                            },
                            'overlayOrder': child.data.overlayOrder
                        };

                        if (overlay.content.type == 'DL_SEQUENCE') {
                            var sequence = require('repo').get(child.children[0]);
                            overlay.content.data = {
                                dlSeqId: child.id,
                                sequenceId: child.children[0],
                                cid: child.children[0],
                                type: 'sequence',
                                title: overlay.content.data.title || sequence.data.title || 'new sequence',
                                version: sequence.data.version || '1.0.0',
                                // save the sequence data to the server so we can fetch it back.
                                sequenceData: sequence.data,
                                mimeType: sequence.mimeType
                            };
                            overlay.content.data.tasks = Schema._helper_global.getSequenceTasks.call(sequence, _repo_data, overlay.content.data, cache);
                            Schema._helper_global._get_resources.call(child, _repo_data, overlay, globalScope, cache);
                        }

                        assignOverlayResource(child, overlay.content.data, server_resources);

                        _overlays.push(overlay);
                    };

                    _.each(this.children, function f341(item) {
                        var child = _repo_data[item];

                        setOverlay.call(this, child);

                    }, this);
                    //_server_json_struct.resources = server_resources;

                    return _overlays;
                }
            }
        },

        quiz: {
            properties: {
                cid: {
                    _reference: "id"
                },
                title: {
                    _reference: "data.title"
                },
                pedagogicalLoType: {
                    _default: "quiz"
                },
                type: {
                    _default: "loItem"
                },
                item: {
                    _list : {
                        "cid": {
                            _reference: "id"
                        },
                        "title": {
                            _reference: "data.title"
                        },
                        "overview": {
                            _default: ""
                        },
                        standards: {
                            _helper: "getStandards"
                        },
                        "type": {
                            _default: "assessment"
                        },
                        "checkingType": {
                            _default: "auto"
                        },
                        "containsInstructionalSequence": {
                            _default: false
                        },
                        "typicalLearningTime": {
                            _reference: "data.typicalLearningTime"
                        },
                        "taskWeight": {
                            _reference: "data.taskWeight"
                        },
                        "assessmentType": {
                            _default: "quiz"
                        },
                        "scoreType": {
                            _reference: "data.scoreType"
                        },
                        "maxScore": {
                            _reference: "data.maxScore",
                            _helper: "makeInt"
                        },
                        "redoQuiz": {
                            _helper: "getRedoQuiz"
                        },
                        "useForDifferentialRecommendation": {
                            _reference: "data.useForDifferentialRecommendation"
                        },
                        "recommendationCriteria": {
                            _list: {
                                "type": {
                                    _default: "differentialPerLesson"
                                },
                                "differentialPerLessonCritirias": {
                                    _reference: "data.recommendationCriteria"
                                }
                            }
                        }
                    }
                }
            },
            helpers: {
                makeInt: function () {
                    return parseInt(this.data.maxScore);
                },
                getRedoQuiz: function () {
                    if (this.data.redoQuizEnabled) {
                        return {
                            "title": this.data.redoQuizTitle,
                            "enableMode": "LESSON_COMPLETION",
                            "displayAt": "END_OF_LESSON"

                        }
                    }
                },
                getStandards: function f348() {
                    return  Schema._helper_global._create_standards.call(this, this.data.selectedStandards);
                }
            },
            repo: {
                childConfig: null,
                type: "type",
                id: "cid",
                children: [],
                parent: null,
                data: [
                    "title",
                    "maxScore",
                    "pedagogicalLoType",
                    "scoreType",
                    "useForDifferentialRecommendation",
                    "taskWeight",
                    { "selectedStandards": "_get_standards_repo" },
                    {"recommendationCriteria": "_get_recommended_criteria"},
                    "typicalLearningTime",
                    {"redoQuizEnabled": "_getRedoQuizEnabled"},
                    {"redoQuizTitle": "_get_redo_quiz_title"}
                ]
            },
            _map_type_json: "quiz",
            isCollection: true,
            _collectionIndex: 'id',
            parent_schema: ["lesson"],
            parent_schema_property: {
                lesson: {
                    key: "learningObjects",
                    schemaName: "quiz"
                }
            }
        },

        differentiatedSequenceParent: {
            properties: {
                cid: {
                    _reference: "id"
                },
                levels: {
                    _global: 'get_diff_levels'
                },
                title: {
                    _reference: "data.title"
                },
                type: {
                    _reference: "type"
                }
            },
            repo: {
                id: "cid",
                type: "type",
                data: ["title"],
                parent: null,
                "children": { "children": "_differentiation_get_sequences" }
            },
            _map_type_json: "sequences",
            parent_schema: ["lo"],
            parent_schema_property: {
                lo: {
                    key: "sequences",
                    schemaName: "sequence"
                }
            },
            isCollection: true,
            _collectionIndex: 'id'
        },

        html_sequence: {
            properties: {
                cid: {
                    _reference: "id"
                },
                mimeType: {
                    _default: "livePage"
                },
                tasks: {
                    _global: "getSequenceTasks"
                },
                resourceRefId: {
                    _default: null
                },
                resources: {
                    _global: "_get_resources"
                },
                standards: {
                    _helper: "getStandards"
                },
                standardPackages: {
                    _helper: "getStandardsPackages"
                },
                type: {
                    _default: "sequence"
                },
                title: {
                    _reference: "data.title"
                }
            },
            repo: {
                id: "cid",
                parent: null,
                type: "type",
                data: ["html", "image", "title", "standards", {"teacherGuide": "_get_teacher_guid_repo"}],
                children: []

            },
            has_resources: true,
            resources_settings: {
                key: "resources",
                resources: [
                    {
                        key: "image",
                        value: function f353() {
                            return this.data.image
                        }
                    }
                ]
            },
            helpers: {
                getStandardsPackages: function f343(_repo_data, _server_json_struct, globalScope, cache) {
                    return Schema._helper_global._get_server_standards(_server_json_struct.standards);
                },
                getStandards: function f344() {
                    return Schema._helper_global._create_standards(this.data.selectedStandards);
                }
            },
            _map_type_json: "sequences",
            parent_schema: ["lo"],
            parent_schema_property: {
                lo: {
                    key: "sequences",
                    schemaName: "sequence"
                }
            },
            isCollection: true,
            _collectionIndex: 'id'
        }
    };

    return Schema;
});
