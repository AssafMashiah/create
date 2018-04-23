define([], function () {
	var Settings = function () {
		this.initialize = function (callback) {
			require(['interface_locales/' + require('userModel').account.interfaceLocales.selected + "/" + require('userModel').account.interfaceLocales.selected], function (lang) {
				this.interface_lang = { lang: lang };
				callback();
			}.bind(this));
		};

		this.load_i18n_configuration = function () {
			return this.interface_lang || {};
		};
	};

	return new Settings;
});