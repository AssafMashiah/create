define(['react', 'components/TreeComponent/treeComponent', './courseContent', 'translate', 'courseModel', 'react-dom'],
    function(React, TreeComponent, CourseContent, i18n, courseModel, ReactDOM) {

    class LessonsTree extends React.Component {

        constructor(props) {
            super(props);
            this.searchBarHandler = _.debounce(this.searchBarHandler, 500);
            this.returnHandler = this.props.returnHandler;
            this.currentCourseId =  require('courseModel').courseId;
            this.getInitState();
            this.enableSearch = true;
            this.searchQuery = null;
            this.fetchNextPageProps = {
                pageSize: 60,
                offset: 400,
                currentPage: 0,
                readyToFetch: false
            }
        };

        getInitState() {
            let repo = require("repo");
            let allCourses = [];
            this.props.config.structure.allCourses.forEach((item) => {
                if (item.courseId !== this.currentCourseId) {
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

        componentDidMount() {
            ReactDOM.findDOMNode(this.refs.lessonTree).addEventListener('scroll', this.updateViewport.bind(this), false);
        }

        componentWillUnmount() {
            ReactDOM.findDOMNode(this.refs.lessonTree).removeEventListener('scroll', this.updateViewport);
        }

        updateViewport(event) {
            const t = event.currentTarget;
            const offset = this.fetchNextPageProps.offset;
            if (t.scrollHeight - t.scrollTop - offset <= t.clientHeight && this.fetchNextPageProps.readyToFetch) {
                this.fetchNextPageProps.currentPage++;
                if (this.fetchNextPageProps.currentPage < this.fetchNextPageProps.totalPages) {
                    this.fetchNextPage();
                }
            }
        }

        fetchNextPage() {
            if (this.state.fetchingNextPage)  return;
            this.setState({ fetchingNextPage: true });
            let daoConfig = this.getDaoConfig("SEARCH");
            this.fetchNextPageDao = require('dao').remote(daoConfig, (receivedJson) => {
                let { allCourses, coursesData } = this.state;
                receivedJson.items.forEach(course => {
                    const courseId = course.courseId;
                    const matchInCourse = (course.title.toLowerCase().indexOf(this.searchQuery) >= 0);
                    coursesData[courseId] = this.transformData(course.toc, courseId, this.searchQuery, matchInCourse);
                    allCourses.push({
                        courseId: courseId,
                        title: course.title,
                        isCollapsed: coursesData[courseId].isCollapsed,
                        hideSelectAll: false,
                        searchText: this.searchQuery
                    });
                });
                this.setState({
                    fetchingNextPage: false,
                    allCourses: allCourses,
                    coursesData: coursesData
                });
            }, (error) => {
                this.fetchNextPageProps.currentPage--;
                this.setState({
                    searchError: "Getting courses failed!",
                    fetchingNextPage: false
                });
                setTimeout(() => {
                    this.setState({ searchError: null });
                }, 5000);
            });
        }

        fetchCourseData(courseId) {
            let promise = new Promise((resolve, reject) => {
                let sourceCourseIds = [];
                sourceCourseIds.push(courseId);
                let daoConfig = this.getDaoConfig("NO_SEARCH", sourceCourseIds);
                require('dao').remote(daoConfig, (receivedJson) => {
                    if (!receivedJson.numberOfItems) {
                        resolve([]); return;
                    }
                    let courseJson = _.find(receivedJson.items, { courseId: courseId });
                    let courseData = this.transformData(courseJson.toc, courseId);
                    this.setCourseDataOnState(courseId, courseData);
                    resolve(courseData);
                }, (error) => {
                    reject(error);
                });
            });
            return promise;
        }

        getDaoConfig(type, sourceCourseIds) {
            let path = "";
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
                    searchText: (type == "SEARCH") ? this.searchQuery : "",
                    page: this.fetchNextPageProps.currentPage,
                    pageSize: this.fetchNextPageProps.pageSize
                }
            };
        }

        transformData(data, courseId, searchText, matchInParent) {
            let newData = [];
            newData.isCollapsed = true;
            let matchInChildren = false;
            if (data.tocItems.length) {
                data.tocItems.forEach((tocItem) => {
                    let nodeItem = {};
                    let nodeColor = 'black';
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
                    nodeItem.nodeClass = `lesson-link type-${tocItem.type}-${tocItem.format ? tocItem.format : ''} ${nodeColor}`;
                    if (searchText) {
                        let matchInNode = nodeItem.nodeText.toLowerCase().indexOf(searchText) >= 0;
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
                data.tocChildren.forEach((tocChild) => {
                    let nodeItem = {};
                    nodeItem.nodeText = tocChild.title;
                    if (searchText) {
                        nodeItem.matchInToc = (nodeItem.nodeText.toLowerCase().indexOf(searchText) >= 0);
                    }
                    nodeItem.children = this.transformData(tocChild, courseId, searchText, matchInParent || nodeItem.matchInToc );
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

        setCourseDataOnState(courseId, courseData) {
            let tempCoursesData = this.state.coursesData;
            tempCoursesData[courseId] = courseData;
            this.setState({ coursesData: tempCoursesData });
            this.initalState.coursesData = tempCoursesData;
            this.initalState.allCourses.forEach(course => {
                if (course.courseId == courseId) {
                    course.hideSelectAll = false;
                }
            });
        }

        setInitialState() {
            this.setState({
                allCourses: this.initalState.allCourses,
                coursesData: this.initalState.coursesData,
                searchInProgress: false
            });
        }

        searchBarHandler() {
            let searchQuery = this.refs.searchInput.value.trim().toLowerCase();
            this.setState({ searchError: null });
            this.fetchNextPageProps.readyToFetch = false;
            this.fetchNextPageProps.currentPage = 0;
            if (searchQuery.length > 2) {
                this.search(searchQuery);
            } else {
                if (searchQuery.length > 0) this.setState({ searchError: i18n.tran('importLesson.searchError.minChars')})
                this.searchDao && this.searchDao.abort();
                this.setInitialState();
            }
        }

        search(searchQuery) {
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
            let daoConfig = this.getDaoConfig("SEARCH");
            this.searchDao = require('dao').remote(daoConfig, (receivedJson) => {
                let allCourses = [];
                let coursesData = {};
                this.fetchNextPageProps.totalPages = receivedJson.totalPages;
                receivedJson.items.forEach(course => {
                    const courseId = course.courseId;
                    const matchInCourse = (course.title.toLowerCase().indexOf(searchQuery) >= 0);
                    coursesData[courseId] = this.transformData(course.toc, courseId, searchQuery, matchInCourse);
                    allCourses.push({
                        courseId: courseId,
                        title: course.title,
                        isCollapsed: coursesData[courseId].isCollapsed,
                        hideSelectAll: false,
                        searchText: searchQuery
                    });
                });
                this.setState({
                    searchInProgress: false,
                    allCourses: allCourses,
                    coursesData: coursesData
                });
            }, (error) => {
                this.setState({
                    searchInProgress: false,
                    searchError: i18n.tran('importLesson.searchError.general')
                });
                setTimeout(() => {
                    this.setState({ searchError: null });
                }, 5000);
            });
        }

        getAllCoursesTree() {
            let { allCourses, coursesData, fetchingNextPage } = this.state;
            return (
                <div className="all-courses-tree" ref="lessonTree">
                    {allCourses.map((node, i) => {
                        let courseData = coursesData[node.courseId] || [];
                        if (node.isHidden) return null;
                        return (
                            <TreeComponent
                                key={i}
                                data={{nodeText: node.title,
                                       isCollapsed: node.isCollapsed,
                                       courseId: node.courseId,
                                       searchText: node.searchText }}
                                hideSelectAll={node.hideSelectAll}
                                dataChangeHandler={this.dataChangeHandler.bind(this)}
                                ref={'tc_' + i}>
                                <CourseContent
                                    key={i}
                                    courseId={node.courseId}
                                    courseData={courseData}
                                    dataChangeHandler={this.dataChangeHandler.bind(this)}
                                    finishLoadingHandler={this.finishLoadingHandler.bind(this, i)}
                                    fetchCourseDataHandler={this.fetchCourseData.bind(this)}
                                    selectChangeHandler={this.selectChangeHandlerFromCC.bind(this, i)}
                                />
                            </TreeComponent>
                        );
                    })}
                    {fetchingNextPage ?  (<div className="inProgress">
                                            <i></i><i></i><i></i>
                                           </div>) : null}
                </div>
            );
        }

        getSearchBar() {
            let { searchInProgress, searchError } = this.state;
            let progressIcon = (
                <div className="inProgress">
                    <i></i><i></i><i></i>
                </div>
            );
            return (
                <div className="search-filter-container">
                    <div className="search-container" onChange={this.searchBarHandler.bind(this)}>
                        <input type="text"
                               style={{borderColor: searchError? "red" : null}}
                               ref="searchInput"
                               className="search-bar"
                               placeholder={i18n.tran('import.lesson.search.placeholder')} />
                        <div className="magnifying-glass"></div>
                        {searchInProgress ? progressIcon : null}
                    </div>
                    {searchError ? <div className="search-error"> {searchError} </div> : null}
                </div>
            );
        }

        dataChangeHandler(mode, data) {
            if (mode == "check") {
                let coursesData = this.state.coursesData;
                let selectedLessons = [];
                for (let courseId in coursesData) {
                    let courseData = coursesData[courseId];
                    _.extend(selectedLessons, this.getSelectedLessonsRecursive(courseData));
                }
                this.setState({ selectedLessons: selectedLessons });
                //send to parent component selected lessons
                this.props.selectedLessonsHandler(selectedLessons, this.getSelectedLessonsNo(selectedLessons));
            } else if (mode == "collapse") {
                if (data.courseId) {
                    let allCourses = this.state.allCourses;
                    for (let i = 0; i < allCourses.length; i++) {
                        if (allCourses[i].courseId === data.courseId) {
                            allCourses[i].isCollapsed = data.isCollapsed;
                        }
                    }
                }
            }
        }

        finishLoadingHandler(index) {
            this.refs['tc_' + index].changeHideSelectAll(false);
        }

        selectChangeHandlerFromCC(index, value) {
            this.refs['tc_' + index].selfSelectChangeHandler(value);
        }

        getSelectedLessonsRecursive(courseData, currentObj) {
            if (!courseData.length) return [];
            let selectedLessons = [];
            if (currentObj) {
                selectedLessons = currentObj;
            }
            for (let i = 0; i < courseData.length; i++) {
                let node = courseData[i];
                if (node.isChecked) {
                    if (selectedLessons[node.courseId] === undefined) {
                        selectedLessons[node.courseId] = [];
                    }
                    selectedLessons[node.courseId].push(node.lessonId);
                }
                if (node.children && node.children.length != 0) {
                    let childrenSelectedLessons = this.getSelectedLessonsRecursive(node.children, selectedLessons);
                    _.extend(selectedLessons, childrenSelectedLessons);
                }
            }
            return selectedLessons;
        }

        getSelectedLessonsNo(selectedLessons) {
            let noOfSelectedLessons = 0;
            for (let courseId in selectedLessons) {
                selectedLessons[courseId].forEach(() => {
                    noOfSelectedLessons++;
                });
            }
            return noOfSelectedLessons;
        }

        render() {
            return (
                <div className="import-lesson-tree">
                    {this.enableSearch ? this.getSearchBar() : null}
                    {this.getAllCoursesTree()}
                </div>
            );
        }
    }

    return  LessonsTree;
});