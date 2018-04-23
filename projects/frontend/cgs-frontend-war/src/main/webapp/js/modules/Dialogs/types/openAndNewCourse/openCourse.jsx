define(['react', 'react-dom', "assets", "./sectionTitle", "cgsUtil", "translate"],
	function (React, ReactDOM, assets, SectionTitle, cgsUtil, translate) {

		var OpenCourseThumbnail = React.createClass({

			render: function () {
				var coverImage = this.props.data.thumbnail ? assets.absPath(this.props.data.thumbnail, true, this.props.data.id) : "media/landingPopup/coursePlaceholder.png";

				return (
					<div className="course-thumbnail"
					     onClick={this.props.openCourse.bind(this,"open", this.props.data.id)}>
						<img className="course-thumbnail-image" src={coverImage}></img>
						<div className="course-name" title={this.props.data.title}>{this.props.data.title}</div>
						<div className="course-version">{this.props.data.version}</div>
					</div>
				);
			}
		});
		var SearchBox = React.createClass({
			getDefaultProps: function () {
				return {
					initialValue: '',
					onChange: null
				};
			},

		    getInitialState: function () {
		        return {
		            value: this.props.initialValue
		        };
		    },

		    render: function () {
		    	var state = this.state;
		      	return (
		      		<div className="search-container">
			        	<input type="text" className="course-search-bar"
			        		placeholder={translate.tran("landing.page.search.placeholder")}
							value={state.value}
							onChange={this.onVolatileChange} />
						<div className="magnifying-glass"></div>
					</div>

		      );
		    },

		    onVolatileChange: function (event) {
		      this.setState({ 
					value: event.target.value 
				});

				this.scheduleChange();
		    },
		    scheduleChange: _.debounce(function () { this.onChange(); }, 300),

			onChange: function () {
				var props = this.props;
				if (props.onChange != null) {
					props.onChange.call(this, this.state.value)
				}
			}
		});

		//component with search box and filter by "recent"/"show all"
		var SearchAndFilter = React.createClass({

			handleSearchChange: function (textToSearch) {
				this.props.handleSearchChange(textToSearch);
			},
			onFilterChange: function (type) {
				this.props.handleFilterChange(type);
			},
			getButtonClass: function (buttonType) {
				if (buttonType == this.props.activeFilter) {
					return "course-filter-button selected";
				}
				return "course-filter-button";
			},
		
			render: function () {
				return (
					<div className="search-filter-container">
						<SearchBox 	initialValue={this.props.filterText}
                     				onChange={this.handleSearchChange}/>
						<div className="filter-buttons-container">
							<div className={this.getButtonClass("recent")}
							     onClick={this.onFilterChange.bind(this,"recent")}>{translate.tran("landing.page.filter.recent")}</div>
							<div className={this.getButtonClass("all")}
							     onClick={this.onFilterChange.bind(this,"all")}>{translate.tran("landing.page.filter.all")}</div>
						</div>
					</div>
				);
			}
		});
		var EmptyCourses = React.createClass({
			render: function () { 
				return( 	
					<div className="empty-courses-container">
						<div className="empty-courses-image"></div>
						<div className="empty-courses-text">{translate.tran(this.props.text)}</div>
					</div>
				);
			}
		});

		var LoadingCourses = React.createClass({
			render: function () { 
				return(
					<div className="course-loader-container">
						<div className="course-loader"></div>
					</div>
				);
			}
		});

		return React.createClass({

			getInitialState: function () {
				return {
					courses: [],
					filterText: "",
					activeFilter: "recent",
					isLoading: true
				};
			},

			componentDidMount: function () {
				//first state get the recent courses
				cgsUtil.getAllRecent(function (result) {
					if(result.length){
						this.setState({
							courses: result,
							isLoading: false
						});
					}else{
						//if there are no recent- get all the courses
						cgsUtil.getAllCourses(function(result){
							this.setState({
								courses: result,
								activeFilter: "all",
								isLoading: false
							});
						}.bind(this));
					}
				}.bind(this));
			},

			//search course by name
			searchCourses: function (searchText) {
				this.filterData("all", searchText);
			},

			//filter to recent/ show all coursese
			filterData: function (type, searchText) {
				
				this.setState({isLoading: true});
				if (type == "recent") {
					cgsUtil.getAllRecent(function (result) {
						this.setState({
							courses: result,
							activeFilter: "recent",
							filterText : searchText? searchText : "",
							isLoading: false
						});
					}.bind(this));
				}
				if (type == "all") {
					cgsUtil.getAllCourses(function (result) {
						this.setState({
							courses: result,
							activeFilter: "all",
							filterText : searchText? searchText : "",
							isLoading: false
						});
					}.bind(this));
				}
			},
			getCoursesTemplate: function(){
				var coursesAfterFilter = _.filter(this.state.courses, function(course){
					return course.title.toLowerCase().indexOf(this.state.filterText.toLowerCase()) > -1
				}.bind(this));

				//send event to amplitude when a there is a course search 
				if(this.state.filterText.length){
					amplitude.logEvent('Search existing content', {
						"Search value" : this.state.filterText,
						"Results": coursesAfterFilter.length
					});
				}

				//set loading template
				if(this.state.isLoading){
					return <LoadingCourses/>;
				}

				//set empty course template when there are no courses on state
				if(!this.state.courses.length){
					return <EmptyCourses text="landing.page.noCourses"/>;
				}

				//set empty course template when the search text didn't match any result
				if( !coursesAfterFilter.length){
					return <EmptyCourses text="landing.page.noSearchResult"/>
				}

				//set regulare template with courses thumbnails
				return <div className="courses-thumbnails-container">
					{coursesAfterFilter.map(function (course) {
						return <OpenCourseThumbnail key={course.id} data={course}
						                            openCourse={this.props.openCourseHandler}/>
					}.bind(this))}
				</div>
			},

			render: function () {

				return (
					<div className="open-course-template">
						<SectionTitle title="landing.page.title.openCourse"/>
						<SearchAndFilter filterText={this.state.filterText} activeFilter={this.state.activeFilter}
						                 handleFilterChange={this.filterData} handleSearchChange={this.searchCourses}/>
						<div className="courses-container">
							{this.getCoursesTemplate()}
						</div>
					</div>
				);
			}
		});
});