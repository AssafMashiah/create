define(['react', 'translate'], function (React, translate) {

	return React.createClass({

		render: function () {
			return (
				<div className="section-title-container">
					<div className="section-title">{translate.tran(this.props.title)}</div>
					<div className="underline-seperator"></div>
				</div>
			);
		}
	});
});