define(['react', 'react-dom', "./sectionTitle", "./openCourse", "assets", "translate"],
	function (React, ReactDOM, SectionTitle, OpenCourse, assets, translate) {

		var OpenAndNewCourse = React.createClass({
			closeDialog: function(){
				this.props.userInputHandler("cancel");
			},

			render: function () {
				var newCourseTemplate = null;

				if (!this.props.isOpenModeOnly) {
					newCourseTemplate = <div className="new-course-container">
						<NewCourse userInputHandler={this.props.userInputHandler}/>
						<ImportCourse userInputHandler={this.props.userInputHandler}/>
					</div>;
				}
				return (
					<div className="landing-popoup">
						<div id="close" className="close-dialog" onClick={this.closeDialog}></div>
						{newCourseTemplate}
						<div className="open-course-container">
							<OpenCourse openCourseHandler={this.props.userInputHandler}/>
						</div>
					</div>);
			}
		});

		var NewCourse = React.createClass({

			render: function () {

				return (
					<div className="create-new-course">
						<SectionTitle title="landing.page.title.newCourse"/>
						<ImageButton type="newcourse" userInputHandler={this.props.userInputHandler}
						             buttonClass="bornDigital image-button"
						             buttonLabel="landing.page.button.newcourse"></ImageButton>
					</div>
				);
			}
		});

		/*add new course button*/
		var ImageButton = React.createClass({

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

			initTooltip: function (e) {
				require('CGSTooltipUtil').render({
					target: e.currentTarget,
					title: "create.new.course.tooltip." + this.props.type
				});

			},
			destroyTooltip: function () {
				require('CGSTooltipUtil').empty();
			},

			render: function () {

				return (
					<div className="action-button" data-position="middle-right" onClick={this.newCourseHandler}
					     onMouseOver={this.initTooltip} onMouseOut={this.destroyTooltip}>
						<div className={this.props.buttonClass}></div>
						<div className="button-description">{translate.tran(this.props.buttonLabel)}</div>
					</div>
				);
			}
		});

		var ImportCourse = React.createClass({

			render: function () {
				return (
					<div className="import-course-container">
						<SectionTitle title="landing.page.title.importcourse"/>
						<ImageButton type="import" userInputHandler={this.props.userInputHandler}
						             buttonClass="icon-real-download-alt"
						             buttonLabel="landing.page.button.importCourse"></ImageButton>
						{require('userModel').account.enableEpubConversion? 
						<ImageButton type="epub" userInputHandler={this.props.userInputHandler}
						             buttonClass="icon-import-epub"
						             buttonLabel="landing.page.button.importEpub"></ImageButton> : null
						}
					</div>
				);
			}
		});

		return {
			render: function (domElement, userInputHandler, isOpenModeOnly) {
				ReactDOM.render(<OpenAndNewCourse isOpenModeOnly={isOpenModeOnly}
				                                  userInputHandler={userInputHandler}/>, domElement);
			}
		}
	});