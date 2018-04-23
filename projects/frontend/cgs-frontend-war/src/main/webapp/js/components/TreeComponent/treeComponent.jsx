define(['react', 'CGSTooltipUtil'], function(React, CGSTooltipUtil) {

    class TreeComponent extends React.Component {

        constructor(props) {
            super(props);
            this.dataChangeHandler = (typeof this.props.dataChangeHandler == 'function')
                                     ? this.props.dataChangeHandler
                                     : function(){};
            this.selectChangeHandler = (typeof this.props.selectChangeHandler == 'function')
                                       ? this.props.selectChangeHandler
                                       : function(){};
            this.changeHideSelectAll = this.changeHideSelectAll.bind(this);
            this.checkNodeHandler = this.checkNodeHandler.bind(this);
            let data = this.props.data;
            this.state = {
                collapsed: (typeof data.isCollapsed == 'undefined') ? true : data.isCollapsed,
                checked: (typeof data.isChecked == 'undefined') ? false : data.isChecked,
                hidden: (typeof data.isHidden == 'undefined') ? false : data.isHidden,
                allSelected: (typeof data.allSelected == 'undefined') ? false : data.allSelected,
                hideSelectAll: (typeof this.props.hideSelectAll == 'undefined') ? false : this.props.hideSelectAll,
                data: data
            };
            this.children = [];
        }

        componentWillReceiveProps(nextProps) {
            if (typeof nextProps.data == 'undefined') return;
            const nextState = {
                collapsed: typeof nextProps.data.isCollapsed == 'undefined' ? this.state.collapsed : nextProps.data.isCollapsed,
                checked: typeof nextProps.data.isChecked == 'undefined' ? this.state.checked : nextProps.data.isChecked,
                hidden: typeof nextProps.data.isHidden == 'undefined' ? false : nextProps.data.isHidden,
                data: typeof nextProps.data == 'undefined' ? this.state.data : nextProps.data,
                hideSelectAll: typeof nextProps.hideSelectAll == 'undefined' ? this.state.hideSelectAll : nextProps.hideSelectAll
            };
            if (typeof nextProps.data.allSelected == "boolean") nextState.allSelected =  nextProps.data.allSelected;
            this.setState(nextState);
        }

        shouldComponentUpdate(nextProps, nextState) {
            for (let key in this.state) {
                if (!(key in nextState) || (this.state[key] !== nextState[key] && key != "data")) {
                    return true;
                }
            }
            for (let key in this.state.data) {
                if (!(key in nextState.data) || (this.state.data[key] !== nextState.data[key])) {
                    return true;
                }
            }
            for (let key in nextState) {
                if (!(key in this.state) || (this.state[key] !== nextState[key] && key != "data")) {
                    return true;
                }
            }
            for (let key in nextState.data) {
                if (!(key in this.state.data) || (nextState.data[key] !== this.state.data[key])) {
                    return true;
                }
            }
            return false;
        }

        initTooltip(msg, e) {
            require('CGSTooltipUtil').render({
                target: e.currentTarget,
                title: msg,
                position: "bottom-left"
            });
        }

        destroyTooltip() {
            require('CGSTooltipUtil').empty();
        }

        selfSelectChangeHandler(value) {
            if (typeof value == "boolean" && this.state.allSelected === value && this.state.data.allSelected === value) return;
            let data = this.state.data;
            let allSelected = true;
            if (data.children && data.children.length) {
                data.children.forEach(child => {
                    if ((typeof child.children !== 'undefined' && typeof child.allSelected == 'undefined')
                        ||(typeof child.children == 'undefined' && typeof child.isChecked == 'undefined')
                        ||(typeof child.isChecked != 'undefined' && child.isChecked === false)
                        || (typeof child.allSelected != 'undefined' && child.allSelected === false && typeof child.isChecked == 'undefined')) {
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

        toggleCollapseNodeHandler(value) {
            let isCollapsed = (value === true || value === false) ? !value : !this.state.collapsed;
            if (this.state.collapsed === isCollapsed) return;
            this.setState({ collapsed: isCollapsed });
            //FIXME not so good!
            let data = this.state.data;
            data.isCollapsed = isCollapsed;
            this.dataChangeHandler("collapse", data);
        }

        checkNodeHandler(event) {
            if (event && event.target && event.target.nodeName !== "INPUT") return;
            let isChecked = false;
            if (typeof event.target !== 'undefined' && typeof event.target.checked !== 'undefined') {
                isChecked = event.target.checked;
            } else {
                isChecked = event;
            }
            if (this.state.checked === isChecked) return;
            this.setState({ checked: isChecked });
            let data = this.state.data;
            data.isChecked = isChecked;
            this.dataChangeHandler("check", data);
            this.selfSelectChangeHandler();
        }

        selectAllChildren(value) {
            let setValue = (typeof  value === "boolean")? value : !this.state.allSelected;
            let data = this.getSelectAllChildren(setValue);
            data.allSelected = setValue;
            this.setState({ data: data, allSelected: setValue });
            this.dataChangeHandler("check", data);
            Object.keys(this.refs).forEach(key => {
                var child = this.refs[key];
                if (child.constructor.name != "TreeComponent"
                    && typeof child.selectAllChildren !== 'undefined') {
                    child.selectAllChildren(setValue);
                }
            });
    }

        changeNodeSelection(value) {
            let setValue = !this.state.allSelected;
            this.selectAllChildren(setValue);
            this.selectChangeHandler();
        }

        changeHideSelectAll(value) {
            this.setState({ hideSelectAll: value });
        }

        getSelectAllChildren(value, data) {
            if (!data) data = this.state.data;
            if (data.children && data.children.length) {
                data.isCollapsed = false;
                data.allSelected = value;
                data.children.forEach(child => {
                    this.getSelectAllChildren(value, child);
                });
            } else if (!data.uncheckable && !data.isHidden) {
                data.isChecked = value;
            }
            return data;
        }

        getTreeContainer(isCollapsed, content, nodeContent) {
            let arrowClassName = 'tree-view_arrow';
            let containerClassName = 'tree-view_children';
            let isOpened = '';
            let allSelected = this.state.allSelected;
            let displaySelectAll = !this.state.hideSelectAll;
            if (isCollapsed) {
                arrowClassName += ' collapsed';
                containerClassName += ' collapsed';
                isOpened = 'closed';
            } else {
                isOpened = 'opened';
            }
            const arrow = (
                <div className={arrowClassName} />
            );
            if (React.isValidElement(content) || (Array.isArray(content) && content.length)) {
                return (
                    <div className={'tree-view ' + isOpened}>
                        <div className="tree-view_parent" onClick={this.toggleCollapseNodeHandler.bind(this)}>
                            <span>{arrow}</span>
                            <span className="parent-text">
                                {this.getNodeText(nodeContent.nodeText, null, nodeContent.searchText)}
                            </span>
                        </div>
                        {isCollapsed ? null :
                            <div className={containerClassName}>
                                {displaySelectAll ? (
                                <div onClick={this.changeNodeSelection.bind(this)} className="select-all">
                                    <input type="checkbox"
                                           onChange={()=>{}}
                                           checked={allSelected} />
                                    <a>{allSelected ? 'Deselect all' : 'Select all'}</a>
                                </div>
                                ) : null}
                                {content}
                            </div>
                        }
                    </div>
                );
            } else {
                return null;
            }

        }

        getNodeText(nodeText, nodeHint, searchText) {
            if (searchText) {
                const regEx = new RegExp(searchText, "i");
                const stringMatch = nodeText.match(regEx);
                if (stringMatch) {
                    nodeText = nodeText.replace(regEx, '<span class="text-match">' + stringMatch[0] + '</span>');
                }
            }
            if (nodeHint) {
                return (
                    <span className="item-text"
                          onMouseOver={this.initTooltip.bind(this, nodeHint)}
                          onMouseOut={this.destroyTooltip}
                          dangerouslySetInnerHTML={{ __html: nodeText }}></span>
                );
            } else {
                return ( <span className="item-text" dangerouslySetInnerHTML={{ __html: nodeText }}></span> );
            }
        }

        render() {
            let { collapsed, checked, hidden, data } = this.state;
            //let checked = this.props.data.isChecked;
            if (hidden) return null;
            if (data.children) {
                // if there is a subtree
                let subtree = data.children.map((child, index) => {
                    return <TreeComponent key={index}
                                           data={child}
                                           dataChangeHandler={this.dataChangeHandler.bind(this)}
                                           selectChangeHandler={this.selfSelectChangeHandler.bind(this)}
                                           ref={"child-" + index} />
                });
                return this.getTreeContainer(collapsed, subtree, data);
            } else if (this.props.children) {
                // if there is a children inside the TreeComponent
                let index = 0;
                let children = React.Children.map(this.props.children, function (child) {
                    return React.cloneElement(child, {
                        ref: 'child-' + (index++)
                    });
                });
                return this.getTreeContainer(collapsed, children, data);
            } else {
                // if there is a simple text node
                if (data.nodeText) {
                    return (
                        <div className={'tree-view_item ' + data.nodeClass }>

                            <input type="checkbox"
                                   onChange={this.checkNodeHandler.bind(this)}
                                   checked={checked}
                                   disabled={data.uncheckable} />
                            <span className="item-icon"></span>
                            {this.getNodeText(data.nodeText, data.nodeHint, data.searchText)}
                        </div>
                    );
                } else return null;
            }
        }
    }

    return TreeComponent;
});