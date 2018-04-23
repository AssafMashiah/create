'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(['react', './components/lessonsTree', './components/diffLevelsMapper', './components/importProgress', 'dao', 'translate'], function (React, LessonsTree, DiffLevelsMapper, ImportProgress, dao, i18n) {
    var ImportLessonContainer = function (_React$Component) {
        _inherits(ImportLessonContainer, _React$Component);

        function ImportLessonContainer(props) {
            _classCallCheck(this, ImportLessonContainer);

            var _this = _possibleConstructorReturn(this, (ImportLessonContainer.__proto__ || Object.getPrototypeOf(ImportLessonContainer)).call(this, props));

            _this.viewModes = {
                lessonTree: "lessonTree",
                diffLevelsMapper: "diffLevelsMapper",
                importProgress: "importProgress"
            };
            _this.diffLevelsConflict = {};
            _this.returnHandler = _this.props.returnHandler;
            _this.getInitState();
            return _this;
        }

        _createClass(ImportLessonContainer, [{
            key: 'getInitState',
            value: function getInitState() {
                this.state = {
                    selectedLessons: [],
                    noOfSelectedLessons: 0,
                    diffLevels: {
                        initialRender: true,
                        isDataValid: false,
                        receivedMap: null
                    },
                    viewMode: this.viewModes.lessonTree,
                    enableDone: false
                };
            }
        }, {
            key: 'selectedLessonsHandler',
            value: function selectedLessonsHandler(lessons, number) {
                this.setState({
                    selectedLessons: lessons,
                    noOfSelectedLessons: number
                });
            }
        }, {
            key: 'diffLevelsMapperChangeHandler',
            value: function diffLevelsMapperChangeHandler(isDataValid, diffLevelsMap) {
                var currentDiffLevelsState = this.state.diffLevels;
                if (currentDiffLevelsState.isDataValid !== isDataValid) currentDiffLevelsState.isDataValid = isDataValid;
                if (isDataValid) {
                    currentDiffLevelsState.receivedMap = diffLevelsMap;
                } else {
                    currentDiffLevelsState.receivedMap = null;
                }
                this.setState({ diffLevels: currentDiffLevelsState });
                console.log("diffLevelsMapperReturnHandler", isDataValid, diffLevelsMap);
            }
        }, {
            key: 'doneButtonHandler',
            value: function doneButtonHandler(value) {
                this.setState({ enableDone: value });
            }
        }, {
            key: 'getDiffLevelsConflict',
            value: function getDiffLevelsConflict(selectedLessons) {
                var _this2 = this;

                return new Promise(function (resolve, reject) {
                    var currentCourseJson = null;
                    var currentCourseDiffLevel = null;
                    var conflictedRemoteDiffLevels = [];
                    var remoteCoursePromises = [];
                    var daoConfigCurrentCourse = {
                        path: require("restDictionary").paths.GET_COURSE,
                        pathParams: {
                            courseId: require("courseModel").courseId,
                            publisherId: require("userModel").getPublisherId(),
                            fileSuffix: '/manifest'
                        }
                    };
                    require("dao").getLocal(daoConfigCurrentCourse, function (localCourseJson) {
                        // load current course diff levels
                        currentCourseJson = localCourseJson;
                        currentCourseDiffLevel = currentCourseJson && currentCourseJson.differentiation || null;
                        // load each remote course diff levels
                        for (var remoteCourseId in selectedLessons) {
                            remoteCoursePromises.push(_this2.fetchRemoteCourseJson(remoteCourseId));
                        }
                        Promise.all(remoteCoursePromises).then(function (remoteCourses) {
                            remoteCourses.forEach(function (remoteCourseJson) {
                                var remoteCourseDiffLevel = remoteCourseJson && remoteCourseJson.differentiation || null;
                                if (JSON.stringify(currentCourseDiffLevel) !== JSON.stringify(remoteCourseDiffLevel) && !!remoteCourseDiffLevel) {
                                    remoteCourseDiffLevel.courseId = remoteCourseJson.courseId;
                                    remoteCourseDiffLevel.title = remoteCourseJson.title;
                                    conflictedRemoteDiffLevels.push(remoteCourseDiffLevel);
                                }
                            });
                            var response = {};
                            if (conflictedRemoteDiffLevels.length) response = { isConflict: true,
                                currentCourseDiffLevel: currentCourseDiffLevel,
                                conflictedRemoteDiffLevels: conflictedRemoteDiffLevels };else response = { isConflict: false,
                                currentCourseDiffLevel: currentCourseDiffLevel,
                                conflictedRemoteDiffLevels: null };
                            resolve(response);
                        });
                    });
                });
            }
        }, {
            key: 'fetchRemoteCourseJson',
            value: function fetchRemoteCourseJson(courseId) {
                var daoConfigRemoteCourse = {
                    path: require("restDictionary").paths.GET_COURSE,
                    pathParams: {
                        courseId: courseId,
                        publisherId: require("userModel").getPublisherId()
                    },
                    data: {}
                };
                return new Promise(function (resolve, reject) {
                    require("dao").remote(daoConfigRemoteCourse, function (remoteCourseJson) {
                        resolve(remoteCourseJson);
                    });
                });
            }
        }, {
            key: 'getViewContent',
            value: function getViewContent() {
                var viewContent = {};
                switch (this.state.viewMode) {
                    case this.viewModes.lessonTree:
                        var noOfSelectedLessons = this.state.noOfSelectedLessons;
                        var focusedItem = this.props.config.structure.indexOfFocusItem !== null ? true : false;
                        viewContent.dialogTitle = i18n.tran("importLesson.lessonTree.title");
                        viewContent.dialogContent = React.createElement(LessonsTree, { config: this.props.config,
                            selectedLessonsHandler: this.selectedLessonsHandler.bind(this) });
                        viewContent.dialogButtons = React.createElement(
                            'div',
                            null,
                            focusedItem ? React.createElement(
                                'div',
                                { className: 'focused-item' },
                                i18n.tran("Import will replace the selected item")
                            ) : null,
                            noOfSelectedLessons ? React.createElement(
                                'div',
                                { className: 'selected-items' },
                                noOfSelectedLessons,
                                ' ',
                                i18n.tran("importLesson.lessonTree.itemsSelected"),
                                ' '
                            ) : null,
                            React.createElement(
                                'button',
                                { className: 'btn btnImport',
                                    onClick: this.tryImport.bind(this),
                                    disabled: noOfSelectedLessons ? false : true },
                                ' ',
                                i18n.tran("Import"),
                                ' '
                            ),
                            React.createElement(
                                'button',
                                { className: 'btn btnCancel',
                                    onClick: this.cancelImport.bind(this) },
                                ' ',
                                i18n.tran("cancel"),
                                ' '
                            )
                        );
                        break;
                    case this.viewModes.diffLevelsMapper:
                        viewContent.dialogTitle = i18n.tran("import.lesson.differentiated.levels.dialog.title");
                        viewContent.dialogContent = React.createElement(DiffLevelsMapper, { diffLevels: this.diffLevelsConflict,
                            initialRender: this.state.diffLevels.initialRender,
                            changeHandler: this.diffLevelsMapperChangeHandler.bind(this) });
                        viewContent.dialogButtons = React.createElement(
                            'div',
                            null,
                            React.createElement(
                                'button',
                                { className: 'btn btnImport',
                                    onClick: this.tryImport.bind(this) },
                                ' ',
                                i18n.tran("Import"),
                                ' '
                            ),
                            React.createElement(
                                'button',
                                { className: 'btn btnCancel',
                                    onClick: this.cancelImport.bind(this) },
                                ' ',
                                i18n.tran("cancel"),
                                ' '
                            )
                        );
                        break;
                    case this.viewModes.importProgress:
                        viewContent.dialogTitle = i18n.tran("importLesson.progress.title");
                        var enableDone = this.state.enableDone;
                        var data = {
                            diffLevels: this.state.diffLevels.receivedMap || null,
                            selectedLessons: this.state.selectedLessons,
                            noOfLessons: this.state.noOfSelectedLessons,
                            indexOfFocusItem: this.props.config.structure.indexOfFocusItem
                        };
                        viewContent.dialogContent = React.createElement(ImportProgress, { data: data,
                            doneButtonHandler: this.doneButtonHandler.bind(this) });
                        viewContent.dialogButtons = React.createElement(
                            'button',
                            { className: 'btn btnDone',
                                disabled: enableDone ? false : true,
                                onClick: this.cancelImport.bind(this) },
                            ' ',
                            i18n.tran("Done"),
                            ' '
                        );
                }
                return viewContent;
            }
        }, {
            key: 'tryImport',
            value: function tryImport() {
                var _this3 = this;

                switch (this.state.viewMode) {
                    case this.viewModes.lessonTree:
                        var selectedLessons = this.state.selectedLessons;
                        this.getDiffLevelsConflict(selectedLessons).then(function (response) {
                            if (response.isConflict) {
                                _this3.diffLevelsConflict = {
                                    currentCourse: response.currentCourseDiffLevel,
                                    remoteCourses: response.conflictedRemoteDiffLevels
                                };
                                _this3.setState({ viewMode: _this3.viewModes.diffLevelsMapper });
                            } else {
                                _this3.setState({ viewMode: _this3.viewModes.importProgress });
                            }
                        });
                        break;
                    case this.viewModes.diffLevelsMapper:
                        var diffLevelsState = this.state.diffLevels;
                        if (!diffLevelsState.isDataValid) {
                            if (diffLevelsState.initialRender != false) {
                                this.setState({ diffLevels: diffLevelsState });
                                diffLevelsState.initialRender = false;
                            }
                        } else {
                            this.setState({ viewMode: this.viewModes.importProgress });
                        }
                        break;
                }
            }
        }, {
            key: 'cancelImport',
            value: function cancelImport() {
                this.returnHandler("cancel", null);
            }
        }, {
            key: 'render',
            value: function render() {
                var vc = this.getViewContent();
                return React.createElement(
                    'div',
                    { id: 'dialog', className: 'importLesson modal fade in' },
                    React.createElement(
                        'div',
                        { id: 'dialogTitle' },
                        React.createElement(
                            'h3',
                            null,
                            vc.dialogTitle
                        )
                    ),
                    React.createElement(
                        'div',
                        { id: 'dialogContent', className: 'modal-body' },
                        vc.dialogContent
                    ),
                    React.createElement(
                        'div',
                        { id: 'dialogControls', className: 'modal-footer' },
                        vc.dialogButtons
                    )
                );
            }
        }]);

        return ImportLessonContainer;
    }(React.Component);

    return ImportLessonContainer;
});