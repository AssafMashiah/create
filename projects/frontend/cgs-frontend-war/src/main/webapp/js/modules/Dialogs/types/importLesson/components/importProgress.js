'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(['react', 'components/TreeComponent/treeComponent', 'translate'], function (React, TreeComponent, i18n) {
    var ImportProgress = function (_React$Component) {
        _inherits(ImportProgress, _React$Component);

        function ImportProgress(props) {
            _classCallCheck(this, ImportProgress);

            var _this = _possibleConstructorReturn(this, (ImportProgress.__proto__ || Object.getPrototypeOf(ImportProgress)).call(this, props));

            _this.data = props.data;
            _this.currentToc = null;
            _this.viewModes = {
                IN_PROGRESS: "IN_PROGRESS",
                COMPLETED: "COMPLETED",
                FAILED: "FAILED"
            };
            _this.componentsWeight = {
                COPY_ASSETS: 30,
                TRANSFORM_TOC_ITEMS: 70
            };
            _this.state = {
                viewMode: _this.viewModes.IN_PROGRESS,
                loadingPercentage: 0,
                loadingStep: "started"
            };
            return _this;
        }

        _createClass(ImportProgress, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var postData = this.preparePostDataForImport(this.data);
                this.startImport(postData);
            }
        }, {
            key: 'startImport',
            value: function startImport(postData) {
                var publisherId = require("userModel").getPublisherId();
                this.ch = require("connectionManager").init({
                    postUrl: '/cgs/rest/publishers/' + publisherId + '/importTocItem',
                    websocketTopic: "job"
                });
                this.ch.setPostData(postData);
                this.ch.setEventListener(this.connectionEvent.bind(this));
                this.ch.open();
            }
        }, {
            key: 'connectionEvent',
            value: function connectionEvent(msg) {
                var _this2 = this;

                if (msg.status == "PROGRESS") {
                    if (msg.body && msg.body.componentsProgressInPercent) {
                        var loadingPercentage = this.getLoadingPercentage(msg.body.componentsProgressInPercent);
                        var loadingStep = this.getLoadingStep(msg.body.componentsProgressInPercent);
                        this.setState({
                            loadingPercentage: loadingPercentage,
                            loadingStep: loadingStep
                        });
                    }
                } else if (msg.status == "COMPLETED") {
                    this.ch.abort();
                    this.setState({
                        loadingPercentage: 100,
                        loadingStep: "completed"
                    });
                    var courseModel = require("courseModel");
                    courseModel.openCourse(courseModel.courseId, function (response) {
                        require('events').once('lock_course_success', _this2.loadToc.bind(_this2));
                        require('events').once('lock_ready', _this2.loadToc.bind(_this2));
                        require('events').fire('lock', 'course');
                    });
                    this.props.doneButtonHandler(true);
                } else if (msg.status == "ERROR") {
                    this.ch.abort();
                    this.setState({
                        loadingPercentage: 0,
                        loadingStep: "error",
                        errors: msg.body.errors
                    });
                    this.props.doneButtonHandler(true);
                }
            }
        }, {
            key: 'loadToc',
            value: function loadToc() {
                require('router').load(this.currentToc, require('courseModel').courseId == this.currentToc ? 'lessons' : '');
                require('events').unbind('lock_course_success', this);
                require('events').unbind('lock_ready', this);
            }
        }, {
            key: 'getLoadingPercentage',
            value: function getLoadingPercentage(components) {
                var loadingPercentage = 0;
                for (var key in this.componentsWeight) {
                    var weight = this.componentsWeight[key];
                    if (!components.hasOwnProperty(key)) {
                        components[key] = 0;
                    }
                    var component = components[key];
                    var product = weight * component;
                    loadingPercentage += product;
                }
                return loadingPercentage / 100;
            }
        }, {
            key: 'getLoadingStep',
            value: function getLoadingStep(components) {
                for (var key in components) {
                    if (components[key] != 100) {
                        return key;
                    }
                }
            }
        }, {
            key: 'preparePostDataForImport',
            value: function preparePostDataForImport(data) {
                var selectedLessons = data.selectedLessons;
                var diffMap = data.diffLevels || [];
                var courseId = require("courseModel").getCourseId();
                var activeRecord = require("repo").get(require("router").activeRecord.id);
                this.currentToc = activeRecord.id;
                var tocId = this.currentToc;
                if (activeRecord.type == "course") {
                    tocId = require("repo").get(courseId).data.toc.cid;
                }
                var postData = {
                    "destinationCourseId": courseId,
                    "destinationTocCid": tocId,
                    "index": this.data.indexOfFocusItem,
                    "tocItemsToImport": []
                };
                for (var courseId in selectedLessons) {
                    if (!diffMap[courseId]) diffMap[courseId] = {};
                    var importedCourse = {
                        "sourceCourseId": courseId,
                        "diffMap": diffMap[courseId],
                        "tocItemCids": []
                    };
                    selectedLessons[courseId].forEach(function (lesson) {
                        importedCourse.tocItemCids.push(lesson);
                    });
                    postData.tocItemsToImport.push(importedCourse);
                }
                return postData;
            }
        }, {
            key: 'getErrorsView',
            value: function getErrorsView(errors) {
                if ((typeof errors === 'undefined' ? 'undefined' : _typeof(errors)) == "object") return React.createElement(
                    'table',
                    null,
                    React.createElement(
                        'thead',
                        null,
                        React.createElement(
                            'tr',
                            null,
                            React.createElement(
                                'th',
                                null,
                                i18n.tran("error.code")
                            ),
                            React.createElement(
                                'th',
                                null,
                                i18n.tran("message")
                            )
                        )
                    ),
                    React.createElement(
                        'tbody',
                        null,
                        Object.keys(errors).map(function (key) {
                            return React.createElement(
                                'tr',
                                { key: key },
                                React.createElement(
                                    'td',
                                    null,
                                    key
                                ),
                                React.createElement(
                                    'td',
                                    null,
                                    errors[key]
                                )
                            );
                        })
                    )
                );else return JSON.stringify(errors);
            }
        }, {
            key: 'getViewContent',
            value: function getViewContent() {
                var viewMode = this.state.viewMode;
                switch (viewMode) {
                    case this.viewModes.IN_PROGRESS:
                        var progressStyle = {
                            width: this.state.loadingPercentage + "%",
                            transition: "width 0.5s"
                        };
                        var loadingStep = "importLesson.progress.step." + this.state.loadingStep;
                        var errors = this.state.errors || null;
                        return React.createElement(
                            'div',
                            null,
                            React.createElement(
                                'div',
                                { className: 'content-row' },
                                React.createElement(
                                    'div',
                                    { id: 'progress-info' },
                                    i18n.tran("importLesson.progress.importing").format(this.data.noOfLessons)
                                ),
                                React.createElement('br', null)
                            ),
                            React.createElement('br', null),
                            React.createElement(
                                'div',
                                { className: 'content-row' },
                                React.createElement(
                                    'div',
                                    { className: 'progress-bar' },
                                    React.createElement('div', { className: 'progress-info', style: progressStyle })
                                ),
                                React.createElement(
                                    'div',
                                    { id: 'progress-step' },
                                    i18n.tran(loadingStep)
                                )
                            ),
                            React.createElement('br', null),
                            errors ? this.getErrorsView(errors) : null
                        );
                        break;
                    case this.viewModes.COMPLETED:
                    // not used
                    case this.viewModes.FAILED:
                    //not used
                }
            }
        }, {
            key: 'render',
            value: function render() {
                return React.createElement(
                    'div',
                    null,
                    this.getViewContent()
                );
            }
        }]);

        return ImportProgress;
    }(React.Component);

    return ImportProgress;
});