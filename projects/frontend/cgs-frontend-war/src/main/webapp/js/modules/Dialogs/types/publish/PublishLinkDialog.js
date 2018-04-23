'use strict';

define(['react', 'react-dom', 'translate'], function (React, ReactDOM, translate) {
	var PublishLinkDialog = React.createClass({
		displayName: 'PublishLinkDialog',


		getInitialState: function getInitialState() {
			return {
				copyButtonText: translate.tran('publish.url.dialog.copy.button')
			};
		},

		closeDialog: function closeDialog() {
			this.props.userInputHandler("done");
		},

		copyToClipboard: function copyToClipboard() {
			this.refs.publishUrl.select();
			document.execCommand('copy');
			window.getSelection().removeAllRanges();
			var prevCopyText = this.state.copyButtonText;
			this.setState({
				copyButtonText: translate.tran('publish.url.dialog.copied.button')
			});
			setTimeout(function () {
				this.setState({
					copyButtonText: prevCopyText
				});
			}.bind(this), 3000);
		},

		render: function render() {
			var basePlayUrl = AuthenticationData.account.publishSettings.publishPlayServerUrl;
			var title = this.props.publishData.courseName;
			if (this.props.publishData.lessonName) {
				title += ' / ' + this.props.publishData.lessonName;
			}
			return React.createElement(
				'div',
				{ className: 'publish-url-dialog' },
				React.createElement(
					'div',
					{ className: 'dialog-title' },
					translate.tran('publish.url.dialog.share.a.link'),
					React.createElement('div', { className: 'close-dialog', onClick: this.closeDialog })
				),
				React.createElement(
					'div',
					{ className: 'url-input-area' },
					React.createElement(
						'div',
						{ className: 'publish-url-title' },
						React.createElement(
							'h4',
							null,
							title
						)
					),
					React.createElement(
						'div',
						{ className: 'url-input-group' },
						React.createElement('input', { ref: 'publishUrl', type: 'text', readOnly: true, value: basePlayUrl + this.props.publishData.tinyKey }),
						React.createElement(
							'button',
							{ className: 'dialog-button copy-button', onClick: this.copyToClipboard },
							this.state.copyButtonText
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'dialog-footer' },
					React.createElement(
						'div',
						{ className: 'publish-open-link' },
						React.createElement(
							'a',
							{ href: basePlayUrl + this.props.publishData.tinyKey, target: '_blank' },
							translate.tran('publish.url.dialog.open.in.a.new.tab')
						)
					),
					React.createElement(
						'button',
						{ className: 'dialog-button', onClick: this.closeDialog },
						translate.tran('publish.url.dialog.done.button')
					)
				)
			);
		}
	});

	return {
		render: function render(domElement, userInputHandler, publishData) {
			ReactDOM.render(React.createElement(PublishLinkDialog, { userInputHandler: userInputHandler, publishData: publishData }), domElement);
		}
	};
});