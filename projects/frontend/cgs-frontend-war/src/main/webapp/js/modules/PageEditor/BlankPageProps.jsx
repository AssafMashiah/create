define(['react', 'react-dom', 'assets', 'translate', 'repo', 'dialogs'], function (React, reactDOM, assets, translate, repo, dialogs) {

	var BlankPageProps = React.createClass({
		displayName: 'BlankPageProps',

		onInputChange: function onInputChange(e) {
			amplitude.logEvent('Change background color', {
                "Course ID" : repo._courseId,
				"Lesson ID":  require("lessonModel").getLessonId()
			});

			var data = {};
			data[e.target.name] = e.target.value;

			this.setPageData(data);
		},

		setPageData: function(newPageData) {
			this.props.onPageDataChange.call(this, Object.assign(this.props.pageData, newPageData));
		},

		changeBackgroundPosition: function(position, e) {
			this.setPageData({
				"background-position": position
			});
		},

		resetBackgroundColor: function() {
			amplitude.logEvent('Change background color', {
                "Course ID" : repo._courseId,
				"Lesson ID":  require("lessonModel").getLessonId()
			});

			this.refs.bgColor.value = '#ffffff';
			this.setPageData({
				"background-color": '#ffffff'
			});
		},

		toggleBackgroundCover: function(e) {
			var size = "auto";
			if (e.target.checked) {
				size = "100% 100%";
			}
			this.setPageData({
				"background-size": size
			});
		},
		componentWillMount: function() {
			var button = document.createElement('div');
			button.setAttribute('id', 'blank-page-upload-image');
			button.setAttribute('class', 'btn btn-small v-align-bottom');
			button.innerHTML = '...';

			this._myButton = button;
		},
		componentDidMount: function() {
			reactDOM.findDOMNode(this.refs.resetButton).setAttribute('cantBeEnabled', 'true');
		},

		openImageCropperDialog: function() {
			var thi$ = this;
			var dialogConfig = {
				buttons: { ok: {label: 'OK'}, cancel: {label: 'Cancel'} },
				content: {},
				data: {
					img: this.props.pageData['background-image'],
					beforeTerminationCallback: function (blob) {
						assets.uploadBlobAndSaveItLocally(blob, function (filePathInsideMediaFolder) {
							amplitude.logEvent('Change background image', {
				                "Course ID" : repo._courseId,
								"Lesson ID":  require("lessonModel").getLessonId()
							});
							thi$.setPageData({
								'background-image': filePathInsideMediaFolder
							});
						});
					}
				}
			};
			this.previewDialog = dialogs.create('imageCropper', dialogConfig);
		},

		render: function render() {
			var hasImage = this.props.pageData['background-image'] ? true : false;
			var positioningVisibility = this.props.pageData['background-size'] == '100% 100%' ? 'hidden' : 'visible';
			var isBackgroundColorDefault = this.props.pageData['background-color'] == '#ffffff';
			var position = this.props.pageData['background-position'];
			var imageElement =
				<div>
					<h4 className="ebook-props-title">{translate.tran("ebook.blankPage.props.image.title")}:</h4>
					<div className="previewImage inline-block noImage"></div>
					<span ref={function(ref) {if(ref) {ref.appendChild(this._myButton)}}.bind(this)}/>
				</div>;
			if (hasImage) {
				imageElement =
					<div>
						<h4 className="ebook-props-title">{translate.tran("ebook.blankPage.props.image.title")}:</h4>
						<img src={assets.absPath(this.props.pageData['background-image'], true)} alt="background-image" className="preview-image" />
						<span ref={function(ref) {if(ref) {ref.appendChild(this._myButton)}}.bind(this)}/>
						<button id="button_image_editor" className="image-cropper-edit-button btn btn-small edit_element v-align-bottom" onClick={this.openImageCropperDialog}>
							<span className="base-icon icon-cog" />
						</button>
						<button className='btn btn-small delete icon-trash file-upload v-align-bottom'/>
						<div className="blank-page-image-positioning">
							<input type="checkbox" onChange={this.toggleBackgroundCover} checked={this.props.pageData['background-size'] === '100% 100%'}/>
							Stretch
							<div style={{visibility: positioningVisibility}}>
								<button className={`ebook-props-position-button${ position == 'left top' ? ' selected': ''}`}
										onClick={this.changeBackgroundPosition.bind(this, 'left top')}>
									<div className="position-icon"></div>
								</button>
								<button className={`ebook-props-position-button${ position == 'center top' ? ' selected': ''}`}
										onClick={this.changeBackgroundPosition.bind(this, 'center top')}>
									<div className="position-icon"></div>
								</button>
								<button className={`ebook-props-position-button${ position == 'right top' ? ' selected': ''}`}
										onClick={this.changeBackgroundPosition.bind(this, 'right top')}>
									<div className="position-icon"></div>
								</button>
							</div>
							<div style={{visibility: positioningVisibility}}>
								<button className={`ebook-props-position-button${ position == 'left center' ? ' selected': ''}`}
										onClick={this.changeBackgroundPosition.bind(this, 'left center')}>
									<div className="position-icon"></div>
								</button>
								<button className={`ebook-props-position-button${ position == 'center center' ? ' selected': ''}`}
										onClick={this.changeBackgroundPosition.bind(this, 'center center')}>
									<div className="position-icon"></div>
								</button>
								<button className={`ebook-props-position-button${ position == 'right center' ? ' selected': ''}`}
										onClick={this.changeBackgroundPosition.bind(this, 'right center')}>
									<div className="position-icon"></div>
								</button>
							</div>
							<div style={{visibility: positioningVisibility}}>
								<button className={`ebook-props-position-button${ position == 'left bottom' ? ' selected': ''}`}
										onClick={this.changeBackgroundPosition.bind(this, 'left bottom')}>
									<div className="position-icon"></div>
								</button>
								<button className={`ebook-props-position-button${ position == 'center bottom' ? ' selected': ''}`}
										onClick={this.changeBackgroundPosition.bind(this, 'center bottom')}>
									<div className="position-icon"></div>
								</button>
								<button className={`ebook-props-position-button${ position == 'right bottom' ? ' selected': ''}`}
										onClick={this.changeBackgroundPosition.bind(this, 'right bottom')}>
									<div className="position-icon"></div>
								</button>
							</div>
						</div>
					</div>
			}
			return (
				<div className="ebook-props">

					<div className="blank-page-background-wrapper control-group">
						<h4 className="ebook-props-title">{translate.tran("ebook.blankPage.props.background.title")}:</h4>
						<label className="control-label" htmlFor="blank-page-background">{translate.tran("ebook.blankPage.props.color.title")}:</label>
						<input type="color" ref="bgColor" name="background-color" onChange={this.onInputChange} value={this.props.pageData['background-color']} id="blank-page-background" />
						<button className="btn btn-small background-reset-button" ref="resetButton" disabled={isBackgroundColorDefault} onClick={this.resetBackgroundColor}>{translate.tran("ebook.blankPage.props.reset.button")}</button>
					</div>
					<div className="blank-page-image-background">
						{imageElement}
					</div>
				</div>
			);
		}
	});

	return {
		render: function render(data) {
			reactDOM.render(React.createElement(BlankPageProps, data), document.getElementById('virtual-page-properties'));
		}
	};
});