define(['mustache', 'text!./components/externalAccounts/templates/ExternalAccounts.html'], function(Mustache, template) {
	var ExternalAccountsComponent = function(config) {
		var url = '/cgs/rest/publishers/' + config.accountId + '/externalId',
			container = $(config.container),
			req = new XMLHttpRequest;

		req.responseType = 'json';

		req.onload = function(ev) {
			var data = ev.target.response;

			if (!_.isArray(data) || !data.length) {
				container.hide();
			}
			else {
				container.html(Mustache.render(template, { accounts: data }));
			}
		};

		req.onerror = function() {
			container.hide();
		};

		req.open('get', url);
		req.send();
	}

	return ExternalAccountsComponent;
});