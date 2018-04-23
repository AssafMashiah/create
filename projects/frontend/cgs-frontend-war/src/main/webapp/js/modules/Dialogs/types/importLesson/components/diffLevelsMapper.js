'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(['react', 'translate'], function (React, i18n) {
    var DiffLevelsMapper = function (_React$Component) {
        _inherits(DiffLevelsMapper, _React$Component);

        function DiffLevelsMapper(props) {
            _classCallCheck(this, DiffLevelsMapper);

            var _this = _possibleConstructorReturn(this, (DiffLevelsMapper.__proto__ || Object.getPrototypeOf(DiffLevelsMapper)).call(this, props));

            _this.tran = require("translate");
            var diffLevelsData = _this.props.diffLevels;
            _this.state = {
                initialRender: true,
                hasCurrentDiff: diffLevelsData.currentCourse ? true : false,
                diffLevelsData: diffLevelsData,
                diffLevelsMap: _this.getDefaultDiffLevelsMap(diffLevelsData)
            };
            _this.parentChangeHandler = props.changeHandler;
            return _this;
        }

        _createClass(DiffLevelsMapper, [{
            key: 'componentWillReceiveProps',
            value: function componentWillReceiveProps(nextProps) {
                if (nextProps.initialRender !== this.state.initialRender) {
                    this.setState({ initialRender: nextProps.initialRender });
                }
            }
        }, {
            key: 'getDefaultDiffLevelsMap',
            value: function getDefaultDiffLevelsMap(diffLevelsData) {
                var diffLevelsMap = {};
                if (diffLevelsData.currentCourse) {
                    (function () {
                        var currentCourseLevels = diffLevelsData.currentCourse.levels;
                        diffLevelsData.remoteCourses.forEach(function (remoteCourse) {
                            diffLevelsMap[remoteCourse.courseId] = {};
                            currentCourseLevels.forEach(function (currentCourseLevel) {
                                diffLevelsMap[remoteCourse.courseId][currentCourseLevel.id.toString()] = -1;
                            });
                        });
                    })();
                } else {
                    diffLevelsData.remoteCourses.forEach(function (remoteCourse) {
                        diffLevelsMap[remoteCourse.courseId] = { "-1": -1 };
                    });
                }
                return diffLevelsMap;
            }
        }, {
            key: 'getOptionStyle',
            value: function getOptionStyle(courseId, currentLevel) {
                var _state = this.state;
                var initialRender = _state.initialRender;
                var diffLevelsMap = _state.diffLevelsMap;

                if (currentLevel == null) currentLevel = -1;
                if (!initialRender && diffLevelsMap[courseId][currentLevel.toString()] == -1) {
                    return { backgroundColor: "#FFCCCC" };
                } else {
                    return;
                }
            }
        }, {
            key: 'getTableHeader',
            value: function getTableHeader() {
                if (this.state.hasCurrentDiff) {
                    return React.createElement(
                        'thead',
                        null,
                        React.createElement(
                            'tr',
                            null,
                            React.createElement(
                                'th',
                                { colSpan: 2 },
                                i18n.tran("importLesson.currentCourse")
                            ),
                            React.createElement(
                                'th',
                                null,
                                i18n.tran("importLesson.importedCourse")
                            )
                        )
                    );
                } else {
                    return React.createElement(
                        'thead',
                        null,
                        React.createElement(
                            'tr',
                            null,
                            React.createElement(
                                'th',
                                null,
                                i18n.tran("importLesson.importedCourse")
                            ),
                            React.createElement(
                                'th',
                                null,
                                i18n.tran("importLesson.levelToImport")
                            )
                        )
                    );
                }
            }
        }, {
            key: 'getTableBodies',
            value: function getTableBodies() {
                var _this2 = this;

                var remoteCourses = this.state.diffLevelsData.remoteCourses;

                return remoteCourses.map(function (remoteCourse, key) {
                    return React.createElement(
                        'tbody',
                        { key: key },
                        _this2.getTableRows(remoteCourse)
                    );
                });
            }
        }, {
            key: 'getTableRows',
            value: function getTableRows(remoteCourse) {
                var _this3 = this;

                var currentCourse = this.state.diffLevelsData.currentCourse;

                return currentCourse.levels.map(function (currentLevel, key, array) {
                    return React.createElement(
                        'tr',
                        { key: key },
                        key == 0 ? React.createElement(
                            'td',
                            { rowSpan: array.length },
                            React.createElement(
                                'h4',
                                null,
                                remoteCourse.title
                            )
                        ) : null,
                        React.createElement(
                            'td',
                            { className: 'current_course_level' },
                            React.createElement(
                                'span',
                                null,
                                currentLevel.name,
                                ' ',
                                currentLevel.acronym,
                                ':'
                            )
                        ),
                        React.createElement(
                            'td',
                            { style: _this3.getOptionStyle(remoteCourse.courseId, currentLevel.id),
                                className: 'imported_course_level' },
                            React.createElement(
                                'select',
                                { onChange: _this3.levelSelectHandler.bind(_this3, remoteCourse.courseId, currentLevel.id) },
                                React.createElement(
                                    'option',
                                    { value: '-1' },
                                    i18n.tran("Select from list")
                                ),
                                _this3.getRemoteCourseLevels(remoteCourse, currentLevel.id),
                                React.createElement(
                                    'option',
                                    { value: '0' },
                                    i18n.tran("None")
                                )
                            )
                        )
                    );
                });
            }
        }, {
            key: 'getRemoteCourseLevels',
            value: function getRemoteCourseLevels(remoteCourse, currentLevelId) {
                var _this4 = this;

                return remoteCourse.levels.map(function (level, key) {
                    var levelsMap = _this4.state.diffLevelsMap[remoteCourse.courseId];
                    var isInUse = false;
                    if (currentLevelId != null) {
                        for (var l in levelsMap) {
                            if (l != currentLevelId) {
                                if (levelsMap[l] == level.id) {
                                    isInUse = true;
                                }
                            }
                        }
                    }
                    if (!isInUse) return React.createElement(
                        'option',
                        { value: level.id, key: key },
                        level.name,
                        ' ',
                        level.acronym
                    );
                });
            }
        }, {
            key: 'isDataValid',
            value: function isDataValid(diffLevelsMap) {
                var isValid = true;
                for (var courseId in diffLevelsMap) {
                    for (var level in diffLevelsMap[courseId]) {
                        if (diffLevelsMap[courseId][level] == -1) {
                            isValid = false;
                            break;
                        }
                    }
                    if (!isValid) break;
                }
                return isValid;
            }
        }, {
            key: 'levelSelectHandler',
            value: function levelSelectHandler(courseId, currentLevelId, event) {
                var remoteLevelId = event.target.value;
                remoteLevelId = remoteLevelId != 0 ? parseInt(remoteLevelId) : null;
                var diffLevelsMap = this.state.diffLevelsMap;

                if (currentLevelId) {
                    diffLevelsMap[courseId][currentLevelId.toString()] = remoteLevelId;
                } else {
                    //destination course has no diff levels and this should be the only entry in the map
                    diffLevelsMap[courseId]["-1"] = remoteLevelId;
                }
                this.setState({ diffLevelsMap: diffLevelsMap });
                this.parentChangeHandler(this.isDataValid(diffLevelsMap), diffLevelsMap);
            }
        }, {
            key: 'renderWithCurrentDiff',
            value: function renderWithCurrentDiff() {
                return React.createElement(
                    'div',
                    { id: 'import_lesson_levels_container' },
                    React.createElement(
                        'div',
                        null,
                        i18n.tran("import_lesson.different_differentation_values.msg_label")
                    ),
                    React.createElement('br', null),
                    React.createElement(
                        'table',
                        null,
                        this.getTableHeader(),
                        this.getTableBodies()
                    ),
                    React.createElement('br', null),
                    React.createElement(
                        'div',
                        { className: 'import-note' },
                        i18n.tran("Note: Levels not used will be deleted from the lesson")
                    )
                );
            }
        }, {
            key: 'renderWithoutCurrentDiff',
            value: function renderWithoutCurrentDiff() {
                var _this5 = this;

                var remoteCourses = this.state.diffLevelsData.remoteCourses;

                return React.createElement(
                    'div',
                    { id: 'import_lesson_levels_container' },
                    React.createElement(
                        'div',
                        null,
                        i18n.tran("import.lesson.with.differentiation.label")
                    ),
                    React.createElement(
                        'div',
                        null,
                        i18n.tran("import.lesson.with.differentiation.prompt")
                    ),
                    React.createElement('br', null),
                    React.createElement(
                        'table',
                        null,
                        this.getTableHeader(),
                        React.createElement(
                            'tbody',
                            null,
                            remoteCourses.map(function (remoteCourse, key) {
                                return React.createElement(
                                    'tr',
                                    { key: key },
                                    React.createElement(
                                        'td',
                                        { className: 'current_course_level' },
                                        remoteCourse.title
                                    ),
                                    React.createElement(
                                        'td',
                                        { style: _this5.getOptionStyle(remoteCourse.courseId, null),
                                            className: 'imported_course_level' },
                                        React.createElement(
                                            'select',
                                            { onChange: _this5.levelSelectHandler.bind(_this5, remoteCourse.courseId, null) },
                                            React.createElement(
                                                'option',
                                                { value: '-1' },
                                                i18n.tran("Select from list")
                                            ),
                                            _this5.getRemoteCourseLevels(remoteCourse, null),
                                            React.createElement(
                                                'option',
                                                { value: '0' },
                                                i18n.tran("None")
                                            )
                                        )
                                    )
                                );
                            })
                        )
                    )
                );
            }
        }, {
            key: 'render',
            value: function render() {
                if (this.state.hasCurrentDiff) {
                    return this.renderWithCurrentDiff();
                } else {
                    return this.renderWithoutCurrentDiff();
                }
            }
        }]);

        return DiffLevelsMapper;
    }(React.Component);

    return DiffLevelsMapper;
});