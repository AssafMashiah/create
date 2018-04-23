'use strict';

define(['react', 'react-dom', "./sectionTitle", "./openCourse", "assets", "translate"], function (React, ReactDOM, SectionTitle, OpenCourse, assets, translate) {

	var OpenAndNewCourse = React.createClass({
		displayName: 'OpenAndNewCourse',

		closeDialog: function closeDialog() {
			this.props.userInputHandler("cancel");
		},

		render: function render() {
			var newCourseTemplate = null;

			if (!this.props.isOpenModeOnly) {
				newCourseTemplate = React.createElement(
					'div',
					{ className: 'new-course-container' },
					React.createElement(NewCourse, { userInputHandler: this.props.userInputHandler }),
					React.createElement(ImportCourse, { userInputHandler: this.props.userInputHandler })
				);
			}
			return React.createElement(
				'div',
				{ className: 'landing-popoup' },
				React.createElement('div', { id: 'close', className: 'close-dialog', onClick: this.closeDialog }),
				newCourseTemplate,
				React.createElement(
					'div',
					{ className: 'open-course-container' },
					React.createElement(OpenCourse, { openCourseHandler: this.props.userInputHandler })
				)
			);
		}
	});

	var NewCourse = React.createClass({
		displayName: 'NewCourse',


		render: function render() {

			return React.createElement(
				'div',
				{ className: 'create-new-course' },
				React.createElement(SectionTitle, { title: 'landing.page.title.newCourse' }),
				React.createElement(ImageButton, { type: 'newcourse', userInputHandler: this.props.userInputHandler,
					buttonClass: 'bornDigital image-button',
					buttonLabel: 'landing.page.button.newcourse' })
			);
		}
	});

	/*add new course button*/
	var ImageButton = React.createClass({
		displayName: 'ImageButton',


		newCourseHandler: function newCourseHandler() {
			var returnValue;
			switch (this.props.type) {
				case "newcourse":
					returnValue = "new_course";
					break;
				case "import":
					returnValue = "cgs_new";
					break;
				case "epub":
					returnValue = "import_epub";
					break;
			}
			this.destroyTooltip();
			this.props.userInputHandler(returnValue);
		},

		initTooltip: function initTooltip(e) {
			require('CGSTooltipUtil').render({
				target: e.currentTarget,
				title: "create.new.course.tooltip." + this.props.type
			});
		},
		destroyTooltip: function destroyTooltip() {
			require('CGSTooltipUtil').empty();
		},

		render: function render() {

			return React.createElement(
				'div',
				{ className: 'action-button', 'data-position': 'middle-right', onClick: this.newCourseHandler,
					onMouseOver: this.initTooltip, onMouseOut: this.destroyTooltip },
				React.createElement('div', { className: this.props.buttonClass }),
				React.createElement(
					'div',
					{ className: 'button-description' },
					translate.tran(this.props.buttonLabel)
				)
			);
		}
	});

	var ImportCourse = React.createClass({
		displayName: 'ImportCourse',


		render: function render() {
			return React.createElement(
				'div',
				{ className: 'import-course-container' },
				React.createElement(SectionTitle, { title: 'landing.page.title.importcourse' }),
				React.createElement(ImageButton, { type: 'import', userInputHandler: this.props.userInputHandler,
					buttonClass: 'icon-real-download-alt',
					buttonLabel: 'landing.page.button.importCourse' }),
				require('userModel').account.enableEpubConversion ? React.createElement(ImageButton, { type: 'epub', userInputHandler: this.props.userInputHandler,
					buttonClass: 'icon-import-epub',
					buttonLabel: 'landing.page.button.importEpub' }) : null
			);
		}
	});

	return {
		render: function render(domElement, userInputHandler, isOpenModeOnly) {
			ReactDOM.render(React.createElement(OpenAndNewCourse, { isOpenModeOnly: isOpenModeOnly,
				userInputHandler: userInputHandler }), domElement);
		}
	};
});