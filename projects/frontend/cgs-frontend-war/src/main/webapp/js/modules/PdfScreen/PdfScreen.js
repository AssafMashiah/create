define(['BaseScreen', './config', './PdfScreenView', 'events', 'repo'],
function f963(BaseScreen, config, PdfScreenView, events, repo) {
	var PdfScreen = BaseScreen.extend({

		initialize: function f964(options) {
			this._super(config, options);
			this.view = new PdfScreenView({ controller: this });
			
			this.hide_menu = true;
		}

	}, {type: 'PdfScreen'});

	return PdfScreen;
});
