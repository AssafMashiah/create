define(['lodash','events', 'dao', 'restDictionary', 'PermissionsModel'], function(_, events, dao, rest_dictionary, permissionsModel) {

	function UserModel() {}

	UserModel.prototype = {

		init: function(onEndLoad) {
			// get user from index.html
			this.getUserDetails(function (response) {
				this.setUserModel(response, onEndLoad);
			}.bind(this));
		},

		getUserDetails: function(callback) {
			if (this.data) {
				callback(this.data);
				return;
			}
			
			var config = {
				path: rest_dictionary.paths.GET_AUTHENTICATION_DATA
			};

			dao.remote(config, callback);
		},
		setUserModel: function (response, onEndLoad) {
			this.data = response;
			this.user = response.user;
			this.account = response.account;
			this.configuration = response.configuration;

			require("settings").initialize(function () {
				require("configModel").setConfig(this.configuration);
				require('files').setFileSizeLimits(this.account.fileSizeLimits);

				permissionsModel.init();

				if (onEndLoad && _.isFunction(onEndLoad)) {
					onEndLoad();
				}
			}.bind(this));
		},
		getConfiguration: function (callback) {
			return this.configuration;
		},
		getUserName: function() {
			return this.user.username
		},

		getPublisherName: function() {
			return this.account.name;
		},

		getAccountMode: function() {
			return this.account.accountMode || 'TRIAL';
		},

		getPublisherId: function() {
			return this.user.relatesTo.id;
		},	

		getPermissions: function f2102() {
			return this.user.role.permissions;
		},

		getAccount: function() {
			return this.account;

		}

	};

	return new UserModel();

});
