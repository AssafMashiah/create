'use strict';

define(['react', 'react-dom', "assets", "./sectionTitle", "cgsUtil", "translate"], function (React, ReactDOM, assets, SectionTitle, cgsUtil, translate) {

	var OpenCourseThumbnail = React.createClass({
		displayName: 'OpenCourseThumbnail',


		render: function render() {
			var coverImage = this.props.data.thumbnail ? assets.absPath(this.props.data.thumbnail, true, this.props.data.id) : "media/landingPopup/coursePlaceholder.png";

			return React.createElement(
				'div',
				{ className: 'course-thumbnail',
					onClick: this.props.openCourse.bind(this, "open", this.props.data.id) },
				React.createElement('img', { className: 'course-thumbnail-image', src: coverImage }),
				React.createElement(
					'div',
					{ className: 'course-name', title: this.props.data.title },
					this.props.data.title
				),
				React.createElement(
					'div',
					{ className: 'course-version' },
					this.props.data.version
				)
			);
		}
	});
	var SearchBox = React.createClass({
		displayName: 'SearchBox',

		getDefaultProps: function getDefaultProps() {
			return {
				initialValue: '',
				onChange: null
			};
		},

		getInitialState: function getInitialState() {
			return {
				value: this.props.initialValue
			};
		},

		render: function render() {
			var state = this.state;
			return React.createElement(
				'div',
				{ className: 'search-container' },
				React.createElement('input', { type: 'text', className: 'course-search-bar',
					placeholder: translate.tran("landing.page.search.placeholder"),
					value: state.value,
					onChange: this.onVolatileChange }),
				React.createElement('div', { className: 'magnifying-glass' })
			);
		},

		onVolatileChange: function onVolatileChange(event) {
			this.setState({
				value: event.target.value
			});

			this.scheduleChange();
		},
		scheduleChange: _.debounce(function () {
			this.onChange();
		}, 300),

		onChange: function onChange() {
			var props = this.props;
			if (props.onChange != null) {
				props.onChange.call(this, this.state.value);
			}
		}
	});

	//component with search box and filter by "recent"/"show all"
	var SearchAndFilter = React.createClass({
		displayName: 'SearchAndFilter',


		handleSearchChange: function handleSearchChange(textToSearch) {
			this.props.handleSearchChange(textToSearch);
		},
		onFilterChange: function onFilterChange(type) {
			this.props.handleFilterChange(type);
		},
		getButtonClass: function getButtonClass(buttonType) {
			if (buttonType == this.props.activeFilter) {
				return "course-filter-button selected";
			}
			return "course-filter-button";
		},

		render: function render() {
			return React.createElement(
				'div',
				{ className: 'search-filter-container' },
				React.createElement(SearchBox, { initialValue: this.props.filterText,
					onChange: this.handleSearchChange }),
				React.createElement(
					'div',
					{ className: 'filter-buttons-container' },
					React.createElement(
						'div',
						{ className: this.getButtonClass("recent"),
							onClick: this.onFilterChange.bind(this, "recent") },
						translate.tran("landing.page.filter.recent")
					),
					React.createElement(
						'div',
						{ className: this.getButtonClass("all"),
							onClick: this.onFilterChange.bind(this, "all") },
						translate.tran("landing.page.filter.all")
					)
				)
			);
		}
	});
	var EmptyCourses = React.createClass({
		displayName: 'EmptyCourses',

		render: function render() {
			return React.createElement(
				'div',
				{ className: 'empty-courses-container' },
				React.createElement('div', { className: 'empty-courses-image' }),
				React.createElement(
					'div',
					{ className: 'empty-courses-text' },
					translate.tran(this.props.text)
				)
			);
		}
	});

	var LoadingCourses = React.createClass({
		displayName: 'LoadingCourses',

		render: function render() {
			return React.createElement(
				'div',
				{ className: 'course-loader-container' },
				React.createElement('div', { className: 'course-loader' })
			);
		}
	});

	return React.createClass({

		getInitialState: function getInitialState() {
			return {
				courses: [],
				filterText: "",
				activeFilter: "recent",
				isLoading: true
			};
		},

		componentDidMount: function componentDidMount() {
			//first state get the recent courses
			cgsUtil.getAllRecent(function (result) {
				if (result.length) {
					this.setState({
						courses: result,
						isLoading: false
					});
				} else {
					//if there are no recent- get all the courses
					cgsUtil.getAllCourses(function (result) {
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
		searchCourses: function searchCourses(searchText) {
			this.filterData("all", searchText);
		},

		//filter to recent/ show all coursese
		filterData: function filterData(type, searchText) {

			this.setState({ isLoading: true });
			if (type == "recent") {
				cgsUtil.getAllRecent(function (result) {
					this.setState({
						courses: result,
						activeFilter: "recent",
						filterText: searchText ? searchText : "",
						isLoading: false
					});
				}.bind(this));
			}
			if (type == "all") {
				cgsUtil.getAllCourses(function (result) {
					this.setState({
						courses: result,
						activeFilter: "all",
						filterText: searchText ? searchText : "",
						isLoading: false
					});
				}.bind(this));
			}
		},
		getCoursesTemplate: function getCoursesTemplate() {
			var coursesAfterFilter = _.filter(this.state.courses, function (course) {
				return course.title.toLowerCase().indexOf(this.state.filterText.toLowerCase()) > -1;
			}.bind(this));

			//send event to amplitude when a there is a course search 
			if (this.state.filterText.length) {
				amplitude.logEvent('Search existing content', {
					"Search value": this.state.filterText,
					"Results": coursesAfterFilter.length
				});
			}

			//set loading template
			if (this.state.isLoading) {
				return React.createElement(LoadingCourses, null);
			}

			//set empty course template when there are no courses on state
			if (!this.state.courses.length) {
				return React.createElement(EmptyCourses, { text: 'landing.page.noCourses' });
			}

			//set empty course template when the search text didn't match any result
			if (!coursesAfterFilter.length) {
				return React.createElement(EmptyCourses, { text: 'landing.page.noSearchResult' });
			}

			//set regulare template with courses thumbnails
			return React.createElement(
				'div',
				{ className: 'courses-thumbnails-container' },
				coursesAfterFilter.map(function (course) {
					return React.createElement(OpenCourseThumbnail, { key: course.id, data: course,
						openCourse: this.props.openCourseHandler });
				}.bind(this))
			);
		},

		render: function render() {

			return React.createElement(
				'div',
				{ className: 'open-course-template' },
				React.createElement(SectionTitle, { title: 'landing.page.title.openCourse' }),
				React.createElement(SearchAndFilter, { filterText: this.state.filterText, activeFilter: this.state.activeFilter,
					handleFilterChange: this.filterData, handleSearchChange: this.searchCourses }),
				React.createElement(
					'div',
					{ className: 'courses-container' },
					this.getCoursesTemplate()
				)
			);
		}
	});
});