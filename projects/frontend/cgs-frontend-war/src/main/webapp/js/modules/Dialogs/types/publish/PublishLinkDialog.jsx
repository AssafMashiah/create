define(['react', 'react-dom', 'translate'], function(React, ReactDOM, translate) {
	var PublishLinkDialog = React.createClass({

		getInitialState: function() {
			return {
				copyButtonText: translate.tran('publish.url.dialog.copy.button')
			}
		},

		closeDialog: function(){
			this.props.userInputHandler("done");
		},

		copyToClipboard: function() {
			this.refs.publishUrl.select();
			document.execCommand('copy');
			window.getSelection().removeAllRanges();
			var prevCopyText = this.state.copyButtonText;
			this.setState({
				copyButtonText: translate.tran('publish.url.dialog.copied.button')
			});
			setTimeout(function() {
				this.setState({
					copyButtonText: prevCopyText
				});
			}.bind(this), 3000);
		},

		render: function() {
			var basePlayUrl = AuthenticationData.account.publishSettings.publishPlayServerUrl;
			var title = this.props.publishData.courseName;
			if (this.props.publishData.lessonName) {
				title += ` / ${this.props.publishData.lessonName}`;
			}
			return (
				<div className="publish-url-dialog">
					<div className="dialog-title">
						{translate.tran('publish.url.dialog.share.a.link')}
						<div className="close-dialog" onClick={this.closeDialog}></div>
					</div>

					<div className="url-input-area">
						<div className="publish-url-title">
							<h4>{title}</h4>
						</div>
						<div className="url-input-group">
							<input ref="publishUrl" type="text" readOnly value={basePlayUrl + this.props.publishData.tinyKey} />
							<button className="dialog-button copy-button" onClick={this.copyToClipboard}>{this.state.copyButtonText}</button>
						</div>
					</div>
					<div className="dialog-footer">
						<div className="publish-open-link">
							<a href={basePlayUrl + this.props.publishData.tinyKey} target="_blank">{translate.tran('publish.url.dialog.open.in.a.new.tab')}</a>
						</div>
						<button className="dialog-button" onClick={this.closeDialog}>{translate.tran('publish.url.dialog.done.button')}</button>
					</div>
				</div>
			)		
		}
	});

	return {
		render: function (domElement, userInputHandler, publishData) {
			ReactDOM.render(<PublishLinkDialog userInputHandler={userInputHandler} publishData={publishData}/>, domElement);
		}
	}
});
