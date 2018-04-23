define(['react', 'translate'], function(React, i18n) {

    class DiffLevelsMapper extends React.Component {

        constructor(props) {
            super(props);
            this.tran = require("translate");
            let diffLevelsData = this.props.diffLevels;
            this.state = {
                initialRender: true,
                hasCurrentDiff: diffLevelsData.currentCourse ? true : false,
                diffLevelsData: diffLevelsData,
                diffLevelsMap: this.getDefaultDiffLevelsMap(diffLevelsData)
            };
            this.parentChangeHandler = props.changeHandler;
        }

        componentWillReceiveProps(nextProps) {
            if (nextProps.initialRender !== this.state.initialRender) {
                this.setState({ initialRender: nextProps.initialRender })
            }
        }

        getDefaultDiffLevelsMap(diffLevelsData) {
            let diffLevelsMap = {};
            if (diffLevelsData.currentCourse) {
                let currentCourseLevels = diffLevelsData.currentCourse.levels;
                diffLevelsData.remoteCourses.forEach(remoteCourse => {
                    diffLevelsMap[remoteCourse.courseId] = {};
                    currentCourseLevels.forEach(currentCourseLevel => {
                        diffLevelsMap[remoteCourse.courseId][currentCourseLevel.id.toString()] = -1;
                    });
                });
            } else {
                diffLevelsData.remoteCourses.forEach(remoteCourse => {
                    diffLevelsMap[remoteCourse.courseId] = {"-1": -1};
                });
            }
            return diffLevelsMap;
        }

        getOptionStyle(courseId, currentLevel) {
            let { initialRender, diffLevelsMap } = this.state;
            if (currentLevel == null) currentLevel = -1;
            if (!initialRender && diffLevelsMap[courseId][currentLevel.toString()] == -1)  {
                return { backgroundColor: "#FFCCCC" };
            } else {
                return;
            }
        }

        getTableHeader() {
            if (this.state.hasCurrentDiff) {
                return (
                    <thead>
                    <tr>
                        <th colSpan={2}>{i18n.tran("importLesson.currentCourse")}</th>
                        <th>{i18n.tran("importLesson.importedCourse")}</th>
                    </tr>
                    </thead>
                );
            } else {
                return (
                    <thead>
                        <tr>
                            <th>{i18n.tran("importLesson.importedCourse")}</th>
                            <th>{i18n.tran("importLesson.levelToImport")}</th>
                        </tr>
                    </thead>
                );
            }
        }

        getTableBodies() {
            const { remoteCourses } = this.state.diffLevelsData;
            return remoteCourses.map((remoteCourse, key) => {
               return (
                   <tbody key={key}>
                       {this.getTableRows(remoteCourse)}
                   </tbody>
                );
            });
        }

        getTableRows(remoteCourse) {
            const { currentCourse } = this.state.diffLevelsData;
            return currentCourse.levels.map((currentLevel, key, array) => {
                return (
                    <tr key={key}>
                        {(key == 0) ? <td rowSpan={array.length}><h4>{remoteCourse.title}</h4></td> : null}
                        <td className="current_course_level">
                            <span>{currentLevel.name} {currentLevel.acronym}:</span>
                        </td>
                        <td style={this.getOptionStyle(remoteCourse.courseId, currentLevel.id)}
                            className="imported_course_level">
                            <select onChange={this.levelSelectHandler.bind(this,
                                                                           remoteCourse.courseId,
                                                                           currentLevel.id)}>
                                <option value="-1">{i18n.tran("Select from list")}</option>
                                {this.getRemoteCourseLevels(remoteCourse, currentLevel.id)}
                                <option value="0">{i18n.tran("None")}</option>
                            </select>
                        </td>
                    </tr>
                )
            });
        }

        getRemoteCourseLevels(remoteCourse, currentLevelId) {
            return remoteCourse.levels.map((level, key) => {
                let levelsMap = this.state.diffLevelsMap[remoteCourse.courseId];
                let isInUse = false;
                if (currentLevelId != null) {
                    for (let l in levelsMap) {
                        if (l != currentLevelId) {
                            if (levelsMap[l] == level.id) {
                                isInUse = true;
                            }
                        }
                    }
                }
                if (!isInUse) return (
                    <option value={level.id} key={key}>{level.name} {level.acronym}</option>
                );
            });
        }

        isDataValid(diffLevelsMap) {
            let isValid = true;
            for (let courseId in diffLevelsMap) {
                for (let level in diffLevelsMap[courseId]) {
                    if (diffLevelsMap[courseId][level] == -1) {
                        isValid = false;
                        break;
                    }
                }
                if (!isValid) break;
            }
            return isValid;
        }

        levelSelectHandler(courseId, currentLevelId, event) {
            let remoteLevelId = event.target.value;
            remoteLevelId = (remoteLevelId != 0) ? parseInt(remoteLevelId) : null;
            let {diffLevelsMap} = this.state;
            if (currentLevelId) {
                diffLevelsMap[courseId][currentLevelId.toString()] = remoteLevelId;
            } else {
                //destination course has no diff levels and this should be the only entry in the map
                diffLevelsMap[courseId]["-1"] = remoteLevelId;
            }
            this.setState({ diffLevelsMap: diffLevelsMap });
            this.parentChangeHandler(this.isDataValid(diffLevelsMap), diffLevelsMap);
        }

        renderWithCurrentDiff() {
            return (
                <div id="import_lesson_levels_container">
                    <div>{i18n.tran("import_lesson.different_differentation_values.msg_label")}</div><br />
                    <table>
                        {this.getTableHeader()}
                        {this.getTableBodies()}
                    </table><br />
                    <div className="import-note">
                        {i18n.tran("Note: Levels not used will be deleted from the lesson")}
                    </div>
                </div>
            );
        }

        renderWithoutCurrentDiff() {
            const { remoteCourses } = this.state.diffLevelsData;
            return (
                <div id="import_lesson_levels_container">
                    <div>{i18n.tran("import.lesson.with.differentiation.label")}</div>
                    <div>{i18n.tran("import.lesson.with.differentiation.prompt")}</div><br />
                    <table>
                        {this.getTableHeader()}
                        <tbody>
                        {remoteCourses.map((remoteCourse, key) => {
                            return (
                                <tr key={key}>
                                    <td className="current_course_level">{remoteCourse.title}</td>
                                    <td style={this.getOptionStyle(remoteCourse.courseId, null)}
                                        className="imported_course_level">
                                        <select onChange={this.levelSelectHandler.bind(this,
                                                          remoteCourse.courseId, null)}>
                                            <option value="-1">{i18n.tran("Select from list")}</option>
                                            {this.getRemoteCourseLevels(remoteCourse, null)}
                                            <option value="0">{i18n.tran("None")}</option>
                                        </select>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            );
        }

        render() {
            if (this.state.hasCurrentDiff) {
                return this.renderWithCurrentDiff();
            } else {
                return this.renderWithoutCurrentDiff();
            }
        }
    }

    return  DiffLevelsMapper;
});