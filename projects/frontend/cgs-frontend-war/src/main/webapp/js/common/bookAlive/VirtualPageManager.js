define(['lodash', 'jquery', 'mustache', 'text!modules/PageEditor/templates/BlankPageTemplate.html', 'assets'],
	function(_, $, mustache, fallBackTemplate, assets) {
	/**
	 *
	 * @constructor
	 */
	function VirtualPageManager() {

		this.blobUrls = [];
		/**
		 *
		 * @param object HTML string
		 * @param type MIME type
		 * @returns {*}
		 */
		var defaultPageProperties = {
			'background-color': '#ffffff',
			'background-image': false,
			'background-repeat': 'no-repeat',
			'background-position': 'left top',
			'background-size': '100% 100%',
			width: '1366px',
			height: '1000px'
		};

		if (!window.blankPageTemplate) {
			getTemplateFromServer();
		}

		/**
		 *
		 */
		function getTemplateFromServer() {
			var dao = require('dao');
			var restDictionary = require('restDictionary');
			var daoConfig = {
				path: restDictionary.paths.GET_BLANK_PAGE_TEMPLATE,
				pathParams: {
					publisherId : require('userModel').getPublisherId()
				}
			};
			window.blankPageTemplate = fallBackTemplate;

			dao.remote(daoConfig, function (response) {
				window.blankPageTemplate = response;
				// todo: Write back the file to it's original place modules/PageEditor/templates/BlankPageTemplate.html
			}, function () {
				console.error('failed to fetch template from server (blank page template) -- Falling back to local template');
			});
		}

		/**
		 *
		 * @param object
		 * @param type
		 * @returns {*}
		 */
		this.createBlobFile = function(object, type) {
			var blob = new Blob([object], {type: type});
			var url = window.URL.createObjectURL(blob);
			this.blobUrls.push(url);
			return url;
		};

		/**
		 *
		 */
		this.clearBlobUrls = function() {
			this.blobUrls.forEach(function(blobElement) {
				window.URL.revokeObjectURL(blobElement);
			});
		};

		/**
		 *
		 * @param url
		 */
		this.deleteUrl = function(url) {
			window.URL.revokeObjectURL(url);
		};

		this.renderTemplate = function(props) {
			var rendered = mustache.render(window.blankPageTemplate, props);
			delete props['file-path'];
			return rendered;
		};

		/**
		 *
		 * @param props
		 * @param url
		 * @returns {*}
		 */
		this.getVirtualPage = function(props, url) {
			if (url && url.startsWith('blob')) {
				this.deleteUrl(url);
			}
			var propsClone = JSON.parse(JSON.stringify(props));

			if (propsClone['background-image']) {
				propsClone['background-image'] = assets.serverPath(propsClone['background-image']);
			}
			var newBlankPage = mustache.render(window.blankPageTemplate, propsClone);
			// mustache modified props object and added new function to it, we don't need it, so it gets deleted.
			delete props['file-path'];
			delete propsClone['file-path'];
			return this.createBlobFile(newBlankPage, 'text/html');
		};

		/**
		 *
		 * @returns {{url: *, properties}}
		 */
		this.getDefaultVirtualPage = function() {
			var props = JSON.parse(JSON.stringify(defaultPageProperties));
			var newBlankPage = mustache.render(window.blankPageTemplate, props);
			delete props['file-path'];
			return 	{
				url:this.createBlobFile(newBlankPage, 'text/html'),
				properties: props
			}
		};

		/**
		 *
		 * @param width
		 * @param height
		 * @returns {{url, properties}|{url: *, properties}}
		 */
		this.getSizedVirtualPage = function(width, height) {
			defaultPageProperties.width = width + 'px';
			defaultPageProperties.height = height + 'px';
			return this.getDefaultVirtualPage();
		}
	}

	return VirtualPageManager;
});
