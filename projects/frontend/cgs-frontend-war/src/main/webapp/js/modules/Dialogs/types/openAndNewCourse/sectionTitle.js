'use strict';

define(['react', 'translate'], function (React, translate) {

	return React.createClass({

		render: function render() {
			return React.createElement(
				'div',
				{ className: 'section-title-container' },
				React.createElement(
					'div',
					{ className: 'section-title' },
					translate.tran(this.props.title)
				),
				React.createElement('div', { className: 'underline-seperator' })
			);
		}
	});
});