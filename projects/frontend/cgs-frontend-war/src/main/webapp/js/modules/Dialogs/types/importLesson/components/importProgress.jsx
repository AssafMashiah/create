define(['react', 'components/TreeComponent/treeComponent', 'translate'], function(React, TreeComponent, i18n) {

    class ImportProgress extends React.Component {

        constructor(props) {
            super(props);
            this.data = props.data;
            this.currentToc = null;
            this.viewModes = {
                IN_PROGRESS: "IN_PROGRESS",
                COMPLETED: "COMPLETED",
                FAILED: "FAILED"
            };
            this.componentsWeight = {
                COPY_ASSETS: 30,
                TRANSFORM_TOC_ITEMS: 70
            };
            this.state = {
                viewMode: this.viewModes.IN_PROGRESS,
                loadingPercentage: 0,
                loadingStep: "started"
            };
        }

        componentDidMount() {
            let postData = this.preparePostDataForImport(this.data);
            this.startImport(postData);
        }

        startImport(postData) {
            let publisherId = require("userModel").getPublisherId();
            this.ch = require("connectionManager").init({
                postUrl: '/cgs/rest/publishers/' + publisherId + '/importTocItem',
                websocketTopic: "job"
            });
            this.ch.setPostData(postData);
            this.ch.setEventListener(this.connectionEvent.bind(this));
            this.ch.open();
        }

        connectionEvent(msg) {
            if (msg.status == "PROGRESS") {
                if (msg.body && msg.body.componentsProgressInPercent) {
                    let loadingPercentage = this.getLoadingPercentage(msg.body.componentsProgressInPercent);
                    let loadingStep = this.getLoadingStep(msg.body.componentsProgressInPercent);
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
                let courseModel = require("courseModel");
                courseModel.openCourse(courseModel.courseId, (response) => {
                    require('events').once('lock_course_success', this.loadToc.bind(this));
                    require('events').once('lock_ready', this.loadToc.bind(this));
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

        loadToc() {
            require('router').load(this.currentToc, require('courseModel').courseId == this.currentToc ? 'lessons' : '');
            require('events').unbind('lock_course_success', this);
            require('events').unbind('lock_ready', this);
        }

        getLoadingPercentage(components) {
            let loadingPercentage = 0;
            for (let key in this.componentsWeight) {
                let weight = this.componentsWeight[key];
                if (!components.hasOwnProperty(key)) {
                    components[key] = 0;
                }
                let component = components[key];
                let product = weight * component;
                loadingPercentage += product;
            }
            return loadingPercentage / 100;
        }

        getLoadingStep(components) {
            for (let key in components) {
                if (components[key] != 100) {
                    return key;
                }
            }
        }

        preparePostDataForImport(data) {
            var selectedLessons = data.selectedLessons;
            var diffMap = data.diffLevels || [];
            var courseId = require("courseModel").getCourseId();
            var activeRecord = require("repo").get(require("router").activeRecord.id);
            this.currentToc = activeRecord.id;
            let tocId = this.currentToc;
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
                selectedLessons[courseId].forEach(function(lesson) {
                    importedCourse.tocItemCids.push(lesson);
                });
                postData.tocItemsToImport.push(importedCourse);
            }
            return postData;
        }

        getErrorsView(errors) {
            if (typeof errors == "object")
            return (
                <table>
                    <thead>
                        <tr>
                            <th>{i18n.tran("error.code")}</th>
                            <th>{i18n.tran("message")}</th>
                        </tr>
                    </thead>
                    <tbody>
                    {Object.keys(errors).map((key) => {
                        return (
                            <tr key={key}>
                                <td>{key}</td>
                                <td>{errors[key]}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            );
            else return JSON.stringify(errors);
        }

        getViewContent() {
            let viewMode = this.state.viewMode;
            switch (viewMode) {
                case this.viewModes.IN_PROGRESS:
                    let progressStyle = {
                        width: this.state.loadingPercentage + "%",
                        transition: "width 0.5s"
                    };
                    let loadingStep = "importLesson.progress.step." + this.state.loadingStep;
                    let errors = this.state.errors || null;
                    return (
                        <div>
                            <div className="content-row">
                                <div id="progress-info">
                                    {i18n.tran("importLesson.progress.importing").format(this.data.noOfLessons)}
                                </div><br />
                            </div><br />
                            <div className="content-row">
                                <div className="progress-bar">
                                    <div className="progress-info" style={progressStyle}></div>
                                </div>
                                <div id="progress-step">{i18n.tran(loadingStep)}</div>
                            </div><br />
                            {errors ? this.getErrorsView(errors) : null}
                        </div>
                    );
                    break;
                case this.viewModes.COMPLETED:
                    // not used
                case this.viewModes.FAILED:
                    //not used
            }
        }

        render() {
            return (
                <div>
                    { this.getViewContent() }
                </div>
            );
        }
    }

    return  ImportProgress;
});