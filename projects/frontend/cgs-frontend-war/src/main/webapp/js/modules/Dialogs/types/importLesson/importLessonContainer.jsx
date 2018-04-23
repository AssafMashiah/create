define(['react', './components/lessonsTree', './components/diffLevelsMapper', './components/importProgress', 'dao', 'translate'],
    function(React, LessonsTree, DiffLevelsMapper, ImportProgress, dao, i18n) {

    class ImportLessonContainer extends React.Component {

        constructor(props) {
            super(props);
            this.viewModes = {
                lessonTree: "lessonTree",
                diffLevelsMapper: "diffLevelsMapper",
                importProgress: "importProgress"
            };
            this.diffLevelsConflict = {};
            this.returnHandler = this.props.returnHandler;
            this.getInitState();
        };

        getInitState() {
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

        selectedLessonsHandler(lessons, number) {
            this.setState({
                selectedLessons: lessons,
                noOfSelectedLessons: number
            });
        }

        diffLevelsMapperChangeHandler(isDataValid, diffLevelsMap) {
            let currentDiffLevelsState = this.state.diffLevels;
            if (currentDiffLevelsState.isDataValid !== isDataValid) currentDiffLevelsState.isDataValid = isDataValid;
            if (isDataValid) {
                currentDiffLevelsState.receivedMap = diffLevelsMap;
            } else {
                currentDiffLevelsState.receivedMap = null;
            }
            this.setState({ diffLevels: currentDiffLevelsState });
            console.log("diffLevelsMapperReturnHandler", isDataValid, diffLevelsMap);
        }

        doneButtonHandler(value) {
            this.setState({ enableDone: value });
        }

        getDiffLevelsConflict(selectedLessons) {
            return new Promise((resolve, reject) => {
                let currentCourseJson = null;
                let currentCourseDiffLevel = null;
                let conflictedRemoteDiffLevels = [];
                let remoteCoursePromises = [];
                let daoConfigCurrentCourse = {
                    path: require("restDictionary").paths.GET_COURSE,
                    pathParams: {
                        courseId: require("courseModel").courseId,
                        publisherId: require("userModel").getPublisherId(),
                        fileSuffix: '/manifest'
                    }
                };
                require("dao").getLocal(daoConfigCurrentCourse, (localCourseJson) => {
                    // load current course diff levels
                    currentCourseJson = localCourseJson;
                    currentCourseDiffLevel = currentCourseJson &&
                        currentCourseJson.differentiation || null;
                    // load each remote course diff levels
                    for (let remoteCourseId in selectedLessons) {
                        remoteCoursePromises.push(this.fetchRemoteCourseJson(remoteCourseId));
                    }
                    Promise.all(remoteCoursePromises)
                        .then((remoteCourses) => {
                            remoteCourses.forEach((remoteCourseJson) => {
                                let remoteCourseDiffLevel = remoteCourseJson &&
                                    remoteCourseJson.differentiation || null;
                                if (JSON.stringify(currentCourseDiffLevel) !== JSON.stringify(remoteCourseDiffLevel)
                                    && !!remoteCourseDiffLevel) {
                                    remoteCourseDiffLevel.courseId = remoteCourseJson.courseId;
                                    remoteCourseDiffLevel.title = remoteCourseJson.title;
                                    conflictedRemoteDiffLevels.push(remoteCourseDiffLevel);
                                }
                            });
                            let response = {};
                            if (conflictedRemoteDiffLevels.length)
                                response = { isConflict: true,
                                             currentCourseDiffLevel: currentCourseDiffLevel,
                                             conflictedRemoteDiffLevels: conflictedRemoteDiffLevels };
                            else
                                response = { isConflict: false,
                                             currentCourseDiffLevel: currentCourseDiffLevel,
                                             conflictedRemoteDiffLevels: null } ;
                            resolve(response);
                        });
                });
            });
        }

        fetchRemoteCourseJson(courseId) {
            let daoConfigRemoteCourse = {
                path: require("restDictionary").paths.GET_COURSE,
                pathParams: {
                    courseId: courseId,
                    publisherId: require("userModel").getPublisherId()
                },
                data: {}
            };
            return new Promise((resolve, reject) => {
                require("dao").remote(daoConfigRemoteCourse, (remoteCourseJson) => {
                    resolve(remoteCourseJson);
                });
            });
        }

        getViewContent() {
            let viewContent = {};
            switch (this.state.viewMode) {
                case this.viewModes.lessonTree:
                    let noOfSelectedLessons = this.state.noOfSelectedLessons;
                    let focusedItem = this.props.config.structure.indexOfFocusItem !== null ? true : false;
                    viewContent.dialogTitle = i18n.tran("importLesson.lessonTree.title");
                    viewContent.dialogContent = (
                        <LessonsTree config={this.props.config}
                                     selectedLessonsHandler={this.selectedLessonsHandler.bind(this)} />
                    );
                    viewContent.dialogButtons = (
                        <div>
                            {focusedItem ? <div className="focused-item">
                                {i18n.tran("Import will replace the selected item")}
                            </div> : null}
                            {noOfSelectedLessons ? <div className="selected-items">
                                {noOfSelectedLessons} {i18n.tran("importLesson.lessonTree.itemsSelected")} </div> : null}
                            <button className='btn btnImport'
                                 onClick={this.tryImport.bind(this)}
                                 disabled={noOfSelectedLessons ? false : true}> {i18n.tran("Import")} </button>
                            <button className='btn btnCancel'
                            onClick={this.cancelImport.bind(this)}> {i18n.tran("cancel")} </button>
                        </div>
                    );
                    break;
                case this.viewModes.diffLevelsMapper:
                    viewContent.dialogTitle = i18n.tran("import.lesson.differentiated.levels.dialog.title");
                    viewContent.dialogContent = (
                        <DiffLevelsMapper diffLevels={this.diffLevelsConflict}
                                          initialRender={this.state.diffLevels.initialRender}
                                          changeHandler={this.diffLevelsMapperChangeHandler.bind(this)}/>
                    );
                    viewContent.dialogButtons = (
                        <div>
                            <button className='btn btnImport'
                                 onClick={this.tryImport.bind(this)}> {i18n.tran("Import")} </button>
                            <button className='btn btnCancel'
                                 onClick={this.cancelImport.bind(this)}> {i18n.tran("cancel")} </button>
                        </div>
                    );
                    break;
                case this.viewModes.importProgress:
                    viewContent.dialogTitle = i18n.tran("importLesson.progress.title");
                    let enableDone = this.state.enableDone;
                    let data = {
                        diffLevels: this.state.diffLevels.receivedMap || null,
                        selectedLessons: this.state.selectedLessons,
                        noOfLessons: this.state.noOfSelectedLessons,
                        indexOfFocusItem: this.props.config.structure.indexOfFocusItem
                    };
                    viewContent.dialogContent = (
                        <ImportProgress data={ data }
                                        doneButtonHandler={this.doneButtonHandler.bind(this)} />
                    );
                    viewContent.dialogButtons = (
                        <button className='btn btnDone'
                             disabled={enableDone ? false : true}
                             onClick={this.cancelImport.bind(this)}> {i18n.tran("Done")} </button>
                    );
            }
            return viewContent;
        }

        tryImport() {
            switch (this.state.viewMode) {
                case this.viewModes.lessonTree:
                    let selectedLessons = this.state.selectedLessons;
                    this.getDiffLevelsConflict(selectedLessons)
                        .then((response) => {
                            if (response.isConflict) {
                                this.diffLevelsConflict = {
                                    currentCourse: response.currentCourseDiffLevel,
                                    remoteCourses: response.conflictedRemoteDiffLevels
                                };
                                this.setState({ viewMode: this.viewModes.diffLevelsMapper });
                            } else {
                                this.setState({ viewMode: this.viewModes.importProgress });
                            }
                        });
                    break;
                case this.viewModes.diffLevelsMapper:
                    let diffLevelsState = this.state.diffLevels;
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

        cancelImport() {
            this.returnHandler("cancel", null);
        }

        render() {
            let vc = this.getViewContent();
            return (
                <div id="dialog" className="importLesson modal fade in">
                    <div id="dialogTitle">
                        <h3>{vc.dialogTitle}</h3>
                    </div>
                    <div id="dialogContent" className="modal-body">
                        {vc.dialogContent}
                    </div>
                    <div id="dialogControls" className="modal-footer">
                        {vc.dialogButtons}
                    </div>
                </div>
            );
        }
    }

    return  ImportLessonContainer;
});