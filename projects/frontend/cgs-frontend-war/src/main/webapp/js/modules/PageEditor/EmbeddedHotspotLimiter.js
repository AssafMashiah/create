'use strict';

define(['react', 'react-dom', 'translate'], function (React, ReactDOM, translate) {

	var EmbeddedHotspotLimiter = React.createClass({
		displayName: 'EmbeddedHotspotLimiter',


		render: function render() {
			var barClassName = 'dynamic-book-limiter-bar';
			var iconClass = 'icon-ebook-info';
			var message = translate.tran('ebook.blankPage.limit.message.info').format(parseInt(this.props.limit - this.props.currentNumOfItems), this.props.limit);
			if (this.props.currentNumOfItems >= this.props.limit) {
				barClassName = 'dynamic-book-limiter-bar limit-reached';
				iconClass = 'icon-ebook-cancel';
				message = translate.tran('ebook.blankPage.limit.message.error');
			}
			if (this.props.currentNumOfItems > 0) {
				return React.createElement(
					'div',
					{ className: barClassName },
					React.createElement('span', { className: iconClass }),
					message
				);
			}
			return null;
		}
	});

	return {
		render: function render(currentNumOfItems, limit) {
			ReactDOM.render(React.createElement(EmbeddedHotspotLimiter, { currentNumOfItems: currentNumOfItems, limit: limit }), document.getElementById('dynamic-book-limiter-bar-mounter'));
		}
	};
});