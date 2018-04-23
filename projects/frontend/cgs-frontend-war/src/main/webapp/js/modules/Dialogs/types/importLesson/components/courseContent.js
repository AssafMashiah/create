'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(['react', 'components/TreeComponent/treeComponent'], function (React, TreeComponent) {
    var CourseContent = function (_React$Component) {
        _inherits(CourseContent, _React$Component);

        function CourseContent(props) {
            _classCallCheck(this, CourseContent);

            var _this = _possibleConstructorReturn(this, (CourseContent.__proto__ || Object.getPrototypeOf(CourseContent)).call(this, props));

            _this.state = {
                courseId: props.courseId,
                courseData: props.courseData,
                loading: true
            };
            return _this;
        }

        _createClass(CourseContent, [{
            key: 'componentWillReceiveProps',
            value: function componentWillReceiveProps(nextProps) {
                if (!nextProps.courseData) return;
                this.setState({
                    courseId: nextProps.courseId,
                    courseData: nextProps.courseData
                });
            }
        }, {
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _this2 = this;

                var courseId = this.state.courseId;
                if (this.state.courseData.length) {
                    this.setState({ loading: false });
                } else {
                    this.props.fetchCourseDataHandler(courseId).then(function (courseData) {
                        _this2.props.finishLoadingHandler();
                        _this2.setState({
                            courseData: courseData,
                            loading: false
                        });
                    }, function (error) {
                        throw Error("[importLesson] Error in fetching course data:", error);
                    });
                }
            }
        }, {
            key: 'selectChangeHandler',
            value: function selectChangeHandler() {
                var allSelected = true;
                if (this.refs) {
                    for (var i in this.refs) {
                        var child = this.refs[i];
                        var data = child.state.data;
                        if (typeof data.children !== 'undefined' && typeof data.allSelected == 'undefined' || typeof data.children == 'undefined' && typeof data.isChecked == 'undefined' || typeof data.isChecked != 'undefined' && data.isChecked === false || typeof data.allSelected != 'undefined' && data.allSelected === false && typeof data.isChecked == 'undefined') {
                            allSelected = false;
                        }
                    }
                }
                this.props.selectChangeHandler(allSelected);
            }
        }, {
            key: 'dataChangeHandler',
            value: function dataChangeHandler(mode, data) {
                this.props.dataChangeHandler(mode, data);
            }
        }, {
            key: 'selectAllChildren',
            value: function selectAllChildren(value) {
                var _this3 = this;

                Object.keys(this.refs).forEach(function (key) {
                    var child = _this3.refs[key];
                    if (typeof child.selectAllChildren !== 'undefined') {
                        child.selectAllChildren(value);
                    }
                });
            }
        }, {
            key: 'render',
            value: function render() {
                var _this4 = this;

                var _state = this.state;
                var courseData = _state.courseData;
                var loading = _state.loading;

                if (loading) {
                    return React.createElement(
                        'div',
                        { className: 'inProgress' },
                        React.createElement('i', null),
                        React.createElement('i', null),
                        React.createElement('i', null)
                    );
                } else {
                    return React.createElement(
                        'div',
                        null,
                        courseData.map(function (node, i) {
                            return React.createElement(TreeComponent, {
                                key: i,
                                data: node,
                                dataChangeHandler: _this4.dataChangeHandler.bind(_this4),
                                selectChangeHandler: _this4.selectChangeHandler.bind(_this4),
                                ref: "tcChild-" + i });
                        })
                    );
                }
            }
        }]);

        return CourseContent;
    }(React.Component);

    return CourseContent;
});