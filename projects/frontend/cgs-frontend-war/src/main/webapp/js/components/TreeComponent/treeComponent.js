'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(['react', 'CGSTooltipUtil'], function (React, CGSTooltipUtil) {
    var TreeComponent = function (_React$Component) {
        _inherits(TreeComponent, _React$Component);

        function TreeComponent(props) {
            _classCallCheck(this, TreeComponent);

            var _this = _possibleConstructorReturn(this, (TreeComponent.__proto__ || Object.getPrototypeOf(TreeComponent)).call(this, props));

            _this.dataChangeHandler = typeof _this.props.dataChangeHandler == 'function' ? _this.props.dataChangeHandler : function () {};
            _this.selectChangeHandler = typeof _this.props.selectChangeHandler == 'function' ? _this.props.selectChangeHandler : function () {};
            _this.changeHideSelectAll = _this.changeHideSelectAll.bind(_this);
            _this.checkNodeHandler = _this.checkNodeHandler.bind(_this);
            var data = _this.props.data;
            _this.state = {
                collapsed: typeof data.isCollapsed == 'undefined' ? true : data.isCollapsed,
                checked: typeof data.isChecked == 'undefined' ? false : data.isChecked,
                hidden: typeof data.isHidden == 'undefined' ? false : data.isHidden,
                allSelected: typeof data.allSelected == 'undefined' ? false : data.allSelected,
                hideSelectAll: typeof _this.props.hideSelectAll == 'undefined' ? false : _this.props.hideSelectAll,
                data: data
            };
            _this.children = [];
            return _this;
        }

        _createClass(TreeComponent, [{
            key: 'componentWillReceiveProps',
            value: function componentWillReceiveProps(nextProps) {
                if (typeof nextProps.data == 'undefined') return;
                var nextState = {
                    collapsed: typeof nextProps.data.isCollapsed == 'undefined' ? this.state.collapsed : nextProps.data.isCollapsed,
                    checked: typeof nextProps.data.isChecked == 'undefined' ? this.state.checked : nextProps.data.isChecked,
                    hidden: typeof nextProps.data.isHidden == 'undefined' ? false : nextProps.data.isHidden,
                    data: typeof nextProps.data == 'undefined' ? this.state.data : nextProps.data,
                    hideSelectAll: typeof nextProps.hideSelectAll == 'undefined' ? this.state.hideSelectAll : nextProps.hideSelectAll
                };
                if (typeof nextProps.data.allSelected == "boolean") nextState.allSelected = nextProps.data.allSelected;
                this.setState(nextState);
            }
        }, {
            key: 'shouldComponentUpdate',
            value: function shouldComponentUpdate(nextProps, nextState) {
                for (var key in this.state) {
                    if (!(key in nextState) || this.state[key] !== nextState[key] && key != "data") {
                        return true;
                    }
                }
                for (var _key in this.state.data) {
                    if (!(_key in nextState.data) || this.state.data[_key] !== nextState.data[_key]) {
                        return true;
                    }
                }
                for (var _key2 in nextState) {
                    if (!(_key2 in this.state) || this.state[_key2] !== nextState[_key2] && _key2 != "data") {
                        return true;
                    }
                }
                for (var _key3 in nextState.data) {
                    if (!(_key3 in this.state.data) || nextState.data[_key3] !== this.state.data[_key3]) {
                        return true;
                    }
                }
                return false;
            }
        }, {
            key: 'initTooltip',
            value: function initTooltip(msg, e) {
                require('CGSTooltipUtil').render({
                    target: e.currentTarget,
                    title: msg,
                    position: "bottom-left"
                });
            }
        }, {
            key: 'destroyTooltip',
            value: function destroyTooltip() {
                require('CGSTooltipUtil').empty();
            }
        }, {
            key: 'selfSelectChangeHandler',
            value: function selfSelectChangeHandler(value) {
                if (typeof value == "boolean" && this.state.allSelected === value && this.state.data.allSelected === value) return;
                var data = this.state.data;
                var allSelected = true;
                if (data.children && data.children.length) {
                    data.children.forEach(function (child) {
                        if (typeof child.children !== 'undefined' && typeof child.allSelected == 'undefined' || typeof child.children == 'undefined' && typeof child.isChecked == 'undefined' || typeof child.isChecked != 'undefined' && child.isChecked === false || typeof child.allSelected != 'undefined' && child.allSelected === false && typeof child.isChecked == 'undefined') {
                            allSelected = false;
                        }
                    });
                    data.allSelected = allSelected;
                    this.setState({ data: data, allSelected: allSelected });
                } else if (typeof value !== 'undefined' && value !== null) {
                    data.allSelected = value;
                    this.setState({ data: data, allSelected: value });
                }
                this.selectChangeHandler();
            }
        }, {
            key: 'toggleCollapseNodeHandler',
            value: function toggleCollapseNodeHandler(value) {
                var isCollapsed = value === true || value === false ? !value : !this.state.collapsed;
                if (this.state.collapsed === isCollapsed) return;
                this.setState({ collapsed: isCollapsed });
                //FIXME not so good!
                var data = this.state.data;
                data.isCollapsed = isCollapsed;
                this.dataChangeHandler("collapse", data);
            }
        }, {
            key: 'checkNodeHandler',
            value: function checkNodeHandler(event) {
                if (event && event.target && event.target.nodeName !== "INPUT") return;
                var isChecked = false;
                if (typeof event.target !== 'undefined' && typeof event.target.checked !== 'undefined') {
                    isChecked = event.target.checked;
                } else {
                    isChecked = event;
                }
                if (this.state.checked === isChecked) return;
                this.setState({ checked: isChecked });
                var data = this.state.data;
                data.isChecked = isChecked;
                this.dataChangeHandler("check", data);
                this.selfSelectChangeHandler();
            }
        }, {
            key: 'selectAllChildren',
            value: function selectAllChildren(value) {
                var _this2 = this;

                var setValue = typeof value === "boolean" ? value : !this.state.allSelected;
                var data = this.getSelectAllChildren(setValue);
                data.allSelected = setValue;
                this.setState({ data: data, allSelected: setValue });
                this.dataChangeHandler("check", data);
                Object.keys(this.refs).forEach(function (key) {
                    var child = _this2.refs[key];
                    if (child.constructor.name != "TreeComponent" && typeof child.selectAllChildren !== 'undefined') {
                        child.selectAllChildren(setValue);
                    }
                });
            }
        }, {
            key: 'changeNodeSelection',
            value: function changeNodeSelection(value) {
                var setValue = !this.state.allSelected;
                this.selectAllChildren(setValue);
                this.selectChangeHandler();
            }
        }, {
            key: 'changeHideSelectAll',
            value: function changeHideSelectAll(value) {
                this.setState({ hideSelectAll: value });
            }
        }, {
            key: 'getSelectAllChildren',
            value: function getSelectAllChildren(value, data) {
                var _this3 = this;

                if (!data) data = this.state.data;
                if (data.children && data.children.length) {
                    data.isCollapsed = false;
                    data.allSelected = value;
                    data.children.forEach(function (child) {
                        _this3.getSelectAllChildren(value, child);
                    });
                } else if (!data.uncheckable && !data.isHidden) {
                    data.isChecked = value;
                }
                return data;
            }
        }, {
            key: 'getTreeContainer',
            value: function getTreeContainer(isCollapsed, content, nodeContent) {
                var arrowClassName = 'tree-view_arrow';
                var containerClassName = 'tree-view_children';
                var isOpened = '';
                var allSelected = this.state.allSelected;
                var displaySelectAll = !this.state.hideSelectAll;
                if (isCollapsed) {
                    arrowClassName += ' collapsed';
                    containerClassName += ' collapsed';
                    isOpened = 'closed';
                } else {
                    isOpened = 'opened';
                }
                var arrow = React.createElement('div', { className: arrowClassName });
                if (React.isValidElement(content) || Array.isArray(content) && content.length) {
                    return React.createElement(
                        'div',
                        { className: 'tree-view ' + isOpened },
                        React.createElement(
                            'div',
                            { className: 'tree-view_parent', onClick: this.toggleCollapseNodeHandler.bind(this) },
                            React.createElement(
                                'span',
                                null,
                                arrow
                            ),
                            React.createElement(
                                'span',
                                { className: 'parent-text' },
                                this.getNodeText(nodeContent.nodeText, null, nodeContent.searchText)
                            )
                        ),
                        isCollapsed ? null : React.createElement(
                            'div',
                            { className: containerClassName },
                            displaySelectAll ? React.createElement(
                                'div',
                                { onClick: this.changeNodeSelection.bind(this), className: 'select-all' },
                                React.createElement('input', { type: 'checkbox',
                                    onChange: function onChange() {},
                                    checked: allSelected }),
                                React.createElement(
                                    'a',
                                    null,
                                    allSelected ? 'Deselect all' : 'Select all'
                                )
                            ) : null,
                            content
                        )
                    );
                } else {
                    return null;
                }
            }
        }, {
            key: 'getNodeText',
            value: function getNodeText(nodeText, nodeHint, searchText) {
                if (searchText) {
                    var regEx = new RegExp(searchText, "i");
                    var stringMatch = nodeText.match(regEx);
                    if (stringMatch) {
                        nodeText = nodeText.replace(regEx, '<span class="text-match">' + stringMatch[0] + '</span>');
                    }
                }
                if (nodeHint) {
                    return React.createElement('span', { className: 'item-text',
                        onMouseOver: this.initTooltip.bind(this, nodeHint),
                        onMouseOut: this.destroyTooltip,
                        dangerouslySetInnerHTML: { __html: nodeText } });
                } else {
                    return React.createElement('span', { className: 'item-text', dangerouslySetInnerHTML: { __html: nodeText } });
                }
            }
        }, {
            key: 'render',
            value: function render() {
                var _this4 = this;

                var _state = this.state;
                var collapsed = _state.collapsed;
                var checked = _state.checked;
                var hidden = _state.hidden;
                var data = _state.data;
                //let checked = this.props.data.isChecked;

                if (hidden) return null;
                if (data.children) {
                    // if there is a subtree
                    var subtree = data.children.map(function (child, index) {
                        return React.createElement(TreeComponent, { key: index,
                            data: child,
                            dataChangeHandler: _this4.dataChangeHandler.bind(_this4),
                            selectChangeHandler: _this4.selfSelectChangeHandler.bind(_this4),
                            ref: "child-" + index });
                    });
                    return this.getTreeContainer(collapsed, subtree, data);
                } else if (this.props.children) {
                    var _ret = function () {
                        // if there is a children inside the TreeComponent
                        var index = 0;
                        var children = React.Children.map(_this4.props.children, function (child) {
                            return React.cloneElement(child, {
                                ref: 'child-' + index++
                            });
                        });
                        return {
                            v: _this4.getTreeContainer(collapsed, children, data)
                        };
                    }();

                    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
                } else {
                    // if there is a simple text node
                    if (data.nodeText) {
                        return React.createElement(
                            'div',
                            { className: 'tree-view_item ' + data.nodeClass },
                            React.createElement('input', { type: 'checkbox',
                                onChange: this.checkNodeHandler.bind(this),
                                checked: checked,
                                disabled: data.uncheckable }),
                            React.createElement('span', { className: 'item-icon' }),
                            this.getNodeText(data.nodeText, data.nodeHint, data.searchText)
                        );
                    } else return null;
                }
            }
        }]);

        return TreeComponent;
    }(React.Component);

    return TreeComponent;
});