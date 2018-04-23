define(['react', 'components/TreeComponent/treeComponent'], function(React, TreeComponent) {

    class CourseContent extends React.Component {

        constructor(props) {
            super(props);
            this.state = {
                courseId: props.courseId,
                courseData: props.courseData,
                loading: true
            };
        }

        componentWillReceiveProps(nextProps) {
            if (!nextProps.courseData) return;
            this.setState({
                courseId: nextProps.courseId,
                courseData: nextProps.courseData
            });
        }

        componentDidMount() {
            let courseId = this.state.courseId;
            if (this.state.courseData.length) {
                this.setState({ loading: false });
            } else {
                this.props.fetchCourseDataHandler(courseId).then((courseData) => {
                    this.props.finishLoadingHandler();
                    this.setState({
                        courseData: courseData,
                        loading: false
                    });
                }, (error) => {
                    throw Error("[importLesson] Error in fetching course data:", error);
                });
            }
        }

        selectChangeHandler() {
            let allSelected = true;
            if (this.refs) {
                for(let i in this.refs) {
                    let child = this.refs[i];
                    let data = child.state.data;
                    if ((typeof data.children !== 'undefined' && typeof data.allSelected == 'undefined')
                        ||(typeof data.children == 'undefined' && typeof data.isChecked == 'undefined')
                        ||(typeof data.isChecked != 'undefined' && data.isChecked === false)
                        ||(typeof data.allSelected != 'undefined' && data.allSelected === false && typeof data.isChecked == 'undefined')) {
                        allSelected = false;
                    }
                }
            }
            this.props.selectChangeHandler(allSelected);
        }

        dataChangeHandler(mode, data) {
            this.props.dataChangeHandler(mode, data);
        }

        selectAllChildren(value){
            Object.keys(this.refs).forEach(key => {
                var child = this.refs[key];
                if (typeof child.selectAllChildren !== 'undefined') {
                    child.selectAllChildren(value);
                }
            });
        }

        render() {
            let { courseData, loading } = this.state;
            if (loading) {
                return (
                  <div className="inProgress">
                      <i></i><i></i><i></i>
                  </div>
                );
            } else {
                return (
                    <div>
                        {courseData.map((node, i) => {
                            return (
                                <TreeComponent
                                    key={i}
                                    data={node}
                                    dataChangeHandler={this.dataChangeHandler.bind(this)}
                                    selectChangeHandler={this.selectChangeHandler.bind(this)}
                                    ref={"tcChild-" + i}>
                                </TreeComponent>
                            );
                        })}
                    </div>
                );
            }
        }
    }

    return  CourseContent;
});