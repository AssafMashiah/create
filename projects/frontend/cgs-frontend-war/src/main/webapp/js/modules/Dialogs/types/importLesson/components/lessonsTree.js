'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(['react', 'components/TreeComponent/treeComponent', './courseContent', 'translate', 'courseModel', 'react-dom'], function (React, TreeComponent, CourseContent, i18n, courseModel, ReactDOM) {
    var LessonsTree = function (_React$Component) {
        _inherits(LessonsTree, _React$Component);

        function LessonsTree(props) {
            _classCallCheck(this, LessonsTree);

            var _this = _possibleConstructorReturn(this, (LessonsTree.__proto__ || Object.getPrototypeOf(LessonsTree)).call(this, props));

            _this.searchBarHandler = _.debounce(_this.searchBarHandler, 500);
            _this.returnHandler = _this.props.returnHandler;
            _this.currentCourseId = require('courseModel').courseId;
            _this.getInitState();
            _this.enableSearch = true;
            _this.searchQuery = null;
            _this.fetchNextPageProps = {
                pageSize: 60,
                offset: 400,
                currentPage: 0,
                readyToFetch: false
            };
            return _this;
        }

        _createClass(LessonsTree, [{
            key: 'getInitState',
            value: function getInitState() {
                var _this2 = this;

                var repo = require("repo");
                var allCourses = [];
                this.props.config.structure.allCourses.forEach(function (item) {
                    if (item.courseId !== _this2.currentCourseId) {
                        allCourses.push({
                            courseId: item.courseId,
                            title: item.title,
                            isCollapsed: true,
                            hideSelectAll: true
                        });
                    }
                });
                this.initalState = {
                    allCourses: allCourses,
                    coursesData: []
                };
                this.state = {
                    allCourses: allCourses,
                    coursesData: [],
                    searchInProgress: false,
                    selectedLessons: [],
                    fetchingNextPage: false
                };
            }
        }, {
            key: 'componentDidMount',
            value: function componentDidMount() {
                ReactDOM.findDOMNode(this.refs.lessonTree).addEventListener('scroll', this.updateViewport.bind(this), false);
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                ReactDOM.findDOMNode(this.refs.lessonTree).removeEventListener('scroll', this.updateViewport);
            }
        }, {
            key: 'updateViewport',
            value: function updateViewport(event) {
                var t = event.currentTarget;
                var offset = this.fetchNextPageProps.offset;
                if (t.scrollHeight - t.scrollTop - offset <= t.clientHeight && this.fetchNextPageProps.readyToFetch) {
                    this.fetchNextPageProps.currentPage++;
                    if (this.fetchNextPageProps.currentPage < this.fetchNextPageProps.totalPages) {
                        this.fetchNextPage();
                    }
                }
            }
        }, {
            key: 'fetchNextPage',
            value: function fetchNextPage() {
                var _this3 = this;

                if (this.state.fetchingNextPage) return;
                this.setState({ fetchingNextPage: true });
                var daoConfig = this.getDaoConfig("SEARCH");
                this.fetchNextPageDao = require('dao').remote(daoConfig, function (receivedJson) {
                    var _state = _this3.state;
                    var allCourses = _state.allCourses;
                    var coursesData = _state.coursesData;

                    receivedJson.items.forEach(function (course) {
                        var courseId = course.courseId;
                        var matchInCourse = course.title.toLowerCase().indexOf(_this3.searchQuery) >= 0;
                        coursesData[courseId] = _this3.transformData(course.toc, courseId, _this3.searchQuery, matchInCourse);
                        allCourses.push({
                            courseId: courseId,
                            title: course.title,
                            isCollapsed: coursesData[courseId].isCollapsed,
                            hideSelectAll: false,
                            searchText: _this3.searchQuery
                        });
                    });
                    _this3.setState({
                        fetchingNextPage: false,
                        allCourses: allCourses,
                        coursesData: coursesData
                    });
                }, function (error) {
                    _this3.fetchNextPageProps.currentPage--;
                    _this3.setState({
                        searchError: "Getting courses failed!",
                        fetchingNextPage: false
                    });
                    setTimeout(function () {
                        _this3.setState({ searchError: null });
                    }, 5000);
                });
            }
        }, {
            key: 'fetchCourseData',
            value: function fetchCourseData(courseId) {
                var _this4 = this;

                var promise = new Promise(function (resolve, reject) {
                    var sourceCourseIds = [];
                    sourceCourseIds.push(courseId);
                    var daoConfig = _this4.getDaoConfig("NO_SEARCH", sourceCourseIds);
                    require('dao').remote(daoConfig, function (receivedJson) {
                        if (!receivedJson.numberOfItems) {
                            resolve([]);return;
                        }
                        var courseJson = _.find(receivedJson.items, { courseId: courseId });
                        var courseData = _this4.transformData(courseJson.toc, courseId);
                        _this4.setCourseDataOnState(courseId, courseData);
                        resolve(courseData);
                    }, function (error) {
                        reject(error);
                    });
                });
                return promise;
            }
        }, {
            key: 'getDaoConfig',
            value: function getDaoConfig(type, sourceCourseIds) {
                var path = "";
                if (type == "SEARCH") {
                    path = require('restDictionary').paths.GET_VALIDATED_TOC_FOR_IMPORT_SEARCH;
                } else {
                    path = require('restDictionary').paths.GET_VALIDATED_TOC_FOR_IMPORT;
                }
                return {
                    path: path,
                    pathParams: {
                        publisherId: require('userModel').getPublisherId(),
                        sourceCourseIds: sourceCourseIds,
                        destinationCourseId: this.currentCourseId,
                        searchText: type == "SEARCH" ? this.searchQuery : "",
                        page: this.fetchNextPageProps.currentPage,
                        pageSize: this.fetchNextPageProps.pageSize
                    }
                };
            }
        }, {
            key: 'transformData',
            value: function transformData(data, courseId, searchText, matchInParent) {
                var _this5 = this;

                var newData = [];
                newData.isCollapsed = true;
                var matchInChildren = false;
                if (data.tocItems.length) {
                    data.tocItems.forEach(function (tocItem) {
                        var nodeItem = {};
                        var nodeColor = 'black';
                        if (tocItem && tocItem.errors && tocItem.errors.length) {
                            nodeColor = 'red';
                            nodeItem.nodeHint = tocItem.errors.join("; ");
                            nodeItem.uncheckable = true;
                        } else if (tocItem && tocItem.warnings && tocItem.warnings.length) {
                            nodeColor = 'yellow';
                            nodeItem.nodeHint = tocItem.warnings.join("; ");
                        }
                        nodeItem.nodeText = tocItem.title;
                        nodeItem.lessonId = tocItem.cid;
                        nodeItem.courseId = courseId;
                        if (tocItem.type == "assessment") tocItem.format = null;
                        if (tocItem.hidden) tocItem.format = "hidden";
                        nodeItem.nodeClass = 'lesson-link type-' + tocItem.type + '-' + (tocItem.format ? tocItem.format : '') + ' ' + nodeColor;
                        if (searchText) {
                            var matchInNode = nodeItem.nodeText.toLowerCase().indexOf(searchText) >= 0;
                            if (matchInNode) {
                                matchInChildren = true;
                                newData.isCollapsed = false;
                                nodeItem.searchText = searchText;
                            }
                            nodeItem.isHidden = !matchInNode && !matchInParent;
                            nodeItem.matchInNode = matchInNode;
                        }
                        newData.push(nodeItem);
                    });
                    newData.hasLeaves = true;
                } else {
                    newData.hasLeaves = false;
                }
                if (searchText) {
                    newData.matchInChildren = matchInChildren;
                }
                if (data.tocChildren && data.tocChildren.length) {
                    data.tocChildren.forEach(function (tocChild) {
                        var nodeItem = {};
                        nodeItem.nodeText = tocChild.title;
                        if (searchText) {
                            nodeItem.matchInToc = nodeItem.nodeText.toLowerCase().indexOf(searchText) >= 0;
                        }
                        nodeItem.children = _this5.transformData(tocChild, courseId, searchText, matchInParent || nodeItem.matchInToc);
                        if (!newData.hasLeaves) newData.hasLeaves = nodeItem.children.hasLeaves;
                        if (searchText) {
                            if (nodeItem.matchInToc) {
                                nodeItem.searchText = searchText;
                                newData.matchInChildren = true;
                                newData.isCollapsed = false;
                            }
                            if (nodeItem.children.matchInChildren || nodeItem.children.isCollapsed == false) {
                                nodeItem.isCollapsed = false;
                                newData.isCollapsed = false;
                            } else {
                                nodeItem.isCollapsed = true;
                            }
                            if (!matchInParent && !nodeItem.matchInToc && !nodeItem.children.matchInChildren) {
                                nodeItem.isHidden = true;
                            } else if (nodeItem.children.matchInChildren) {
                                newData.matchInChildren = true;
                            }
                        }
                        if (nodeItem.children.hasLeaves) newData.push(nodeItem);
                    });
                }
                return newData;
            }
        }, {
            key: 'setCourseDataOnState',
            value: function setCourseDataOnState(courseId, courseData) {
                var tempCoursesData = this.state.coursesData;
                tempCoursesData[courseId] = courseData;
                this.setState({ coursesData: tempCoursesData });
                this.initalState.coursesData = tempCoursesData;
                this.initalState.allCourses.forEach(function (course) {
                    if (course.courseId == courseId) {
                        course.hideSelectAll = false;
                    }
                });
            }
        }, {
            key: 'setInitialState',
            value: function setInitialState() {
                this.setState({
                    allCourses: this.initalState.allCourses,
                    coursesData: this.initalState.coursesData,
                    searchInProgress: false
                });
            }
        }, {
            key: 'searchBarHandler',
            value: function searchBarHandler() {
                var searchQuery = this.refs.searchInput.value.trim().toLowerCase();
                this.setState({ searchError: null });
                this.fetchNextPageProps.readyToFetch = false;
                this.fetchNextPageProps.currentPage = 0;
                if (searchQuery.length > 2) {
                    this.search(searchQuery);
                } else {
                    if (searchQuery.length > 0) this.setState({ searchError: i18n.tran('importLesson.searchError.minChars') });
                    this.searchDao && this.searchDao.abort();
                    this.setInitialState();
                }
            }
        }, {
            key: 'search',
            value: function search(searchQuery) {
                var _this6 = this;

                if (this.state.searchInProgress && this.searchDao && typeof this.searchDao.abort == "function") {
                    this.searchDao.abort();
                }
                if (this.state.fetchingNextPage) {
                    this.fetchNextPageDao.abort();
                    this.setState({ fetchingNextPage: false });
                }
                this.setState({
                    searchInProgress: true,
                    searchError: null
                });
                this.fetchNextPageProps.readyToFetch = true;
                this.searchQuery = searchQuery;
                var daoConfig = this.getDaoConfig("SEARCH");
                this.searchDao = require('dao').remote(daoConfig, function (receivedJson) {
                    var allCourses = [];
                    var coursesData = {};
                    _this6.fetchNextPageProps.totalPages = receivedJson.totalPages;
                    receivedJson.items.forEach(function (course) {
                        var courseId = course.courseId;
                        var matchInCourse = course.title.toLowerCase().indexOf(searchQuery) >= 0;
                        coursesData[courseId] = _this6.transformData(course.toc, courseId, searchQuery, matchInCourse);
                        allCourses.push({
                            courseId: courseId,
                            title: course.title,
                            isCollapsed: coursesData[courseId].isCollapsed,
                            hideSelectAll: false,
                            searchText: searchQuery
                        });
                    });
                    _this6.setState({
                        searchInProgress: false,
                        allCourses: allCourses,
                        coursesData: coursesData
                    });
                }, function (error) {
                    _this6.setState({
                        searchInProgress: false,
                        searchError: i18n.tran('importLesson.searchError.general')
                    });
                    setTimeout(function () {
                        _this6.setState({ searchError: null });
                    }, 5000);
                });
            }
        }, {
            key: 'getAllCoursesTree',
            value: function getAllCoursesTree() {
                var _this7 = this;

                var _state2 = this.state;
                var allCourses = _state2.allCourses;
                var coursesData = _state2.coursesData;
                var fetchingNextPage = _state2.fetchingNextPage;

                return React.createElement(
                    'div',
                    { className: 'all-courses-tree', ref: 'lessonTree' },
                    allCourses.map(function (node, i) {
                        var courseData = coursesData[node.courseId] || [];
                        if (node.isHidden) return null;
                        return React.createElement(
                            TreeComponent,
                            {
                                key: i,
                                data: { nodeText: node.title,
                                    isCollapsed: node.isCollapsed,
                                    courseId: node.courseId,
                                    searchText: node.searchText },
                                hideSelectAll: node.hideSelectAll,
                                dataChangeHandler: _this7.dataChangeHandler.bind(_this7),
                                ref: 'tc_' + i },
                            React.createElement(CourseContent, {
                                key: i,
                                courseId: node.courseId,
                                courseData: courseData,
                                dataChangeHandler: _this7.dataChangeHandler.bind(_this7),
                                finishLoadingHandler: _this7.finishLoadingHandler.bind(_this7, i),
                                fetchCourseDataHandler: _this7.fetchCourseData.bind(_this7),
                                selectChangeHandler: _this7.selectChangeHandlerFromCC.bind(_this7, i)
                            })
                        );
                    }),
                    fetchingNextPage ? React.createElement(
                        'div',
                        { className: 'inProgress' },
                        React.createElement('i', null),
                        React.createElement('i', null),
                        React.createElement('i', null)
                    ) : null
                );
            }
        }, {
            key: 'getSearchBar',
            value: function getSearchBar() {
                var _state3 = this.state;
                var searchInProgress = _state3.searchInProgress;
                var searchError = _state3.searchError;

                var progressIcon = React.createElement(
                    'div',
                    { className: 'inProgress' },
                    React.createElement('i', null),
                    React.createElement('i', null),
                    React.createElement('i', null)
                );
                return React.createElement(
                    'div',
                    { className: 'search-filter-container' },
                    React.createElement(
                        'div',
                        { className: 'search-container', onChange: this.searchBarHandler.bind(this) },
                        React.createElement('input', { type: 'text',
                            style: { borderColor: searchError ? "red" : null },
                            ref: 'searchInput',
                            className: 'search-bar',
                            placeholder: i18n.tran('import.lesson.search.placeholder') }),
                        React.createElement('div', { className: 'magnifying-glass' }),
                        searchInProgress ? progressIcon : null
                    ),
                    searchError ? React.createElement(
                        'div',
                        { className: 'search-error' },
                        ' ',
                        searchError,
                        ' '
                    ) : null
                );
            }
        }, {
            key: 'dataChangeHandler',
            value: function dataChangeHandler(mode, data) {
                if (mode == "check") {
                    var coursesData = this.state.coursesData;
                    var selectedLessons = [];
                    for (var courseId in coursesData) {
                        var courseData = coursesData[courseId];
                        _.extend(selectedLessons, this.getSelectedLessonsRecursive(courseData));
                    }
                    this.setState({ selectedLessons: selectedLessons });
                    //send to parent component selected lessons
                    this.props.selectedLessonsHandler(selectedLessons, this.getSelectedLessonsNo(selectedLessons));
                } else if (mode == "collapse") {
                    if (data.courseId) {
                        var allCourses = this.state.allCourses;
                        for (var i = 0; i < allCourses.length; i++) {
                            if (allCourses[i].courseId === data.courseId) {
                                allCourses[i].isCollapsed = data.isCollapsed;
                            }
                        }
                    }
                }
            }
        }, {
            key: 'finishLoadingHandler',
            value: function finishLoadingHandler(index) {
                this.refs['tc_' + index].changeHideSelectAll(false);
            }
        }, {
            key: 'selectChangeHandlerFromCC',
            value: function selectChangeHandlerFromCC(index, value) {
                this.refs['tc_' + index].selfSelectChangeHandler(value);
            }
        }, {
            key: 'getSelectedLessonsRecursive',
            value: function getSelectedLessonsRecursive(courseData, currentObj) {
                if (!courseData.length) return [];
                var selectedLessons = [];
                if (currentObj) {
                    selectedLessons = currentObj;
                }
                for (var i = 0; i < courseData.length; i++) {
                    var node = courseData[i];
                    if (node.isChecked) {
                        if (selectedLessons[node.courseId] === undefined) {
                            selectedLessons[node.courseId] = [];
                        }
                        selectedLessons[node.courseId].push(node.lessonId);
                    }
                    if (node.children && node.children.length != 0) {
                        var childrenSelectedLessons = this.getSelectedLessonsRecursive(node.children, selectedLessons);
                        _.extend(selectedLessons, childrenSelectedLessons);
                    }
                }
                return selectedLessons;
            }
        }, {
            key: 'getSelectedLessonsNo',
            value: function getSelectedLessonsNo(selectedLessons) {
                var noOfSelectedLessons = 0;
                for (var courseId in selectedLessons) {
                    selectedLessons[courseId].forEach(function () {
                        noOfSelectedLessons++;
                    });
                }
                return noOfSelectedLessons;
            }
        }, {
            key: 'render',
            value: function render() {
                return React.createElement(
                    'div',
                    { className: 'import-lesson-tree' },
                    this.enableSearch ? this.getSearchBar() : null,
                    this.getAllCoursesTree()
                );
            }
        }]);

        return LessonsTree;
    }(React.Component);

    return LessonsTree;
});