define(['lodash', 'repo', 'userModel'], function f2087(_, repo, userModel) {
	var TTSModel = function f2088() {
		var localeMapping = {
			"en_GB" : "en_UK"
		};
	
		var getServices = function f2089() {
			var _services = {};
			var courseData = repo.get(repo._courseId);
			var contentLocales =  require('cgsUtil').cloneObject(_.union(courseData.data.contentLocales, courseData.data.multiNarrationLocales));
			var ttsServices = userModel.account.ttsProviders;

			_.each(ttsServices, function f2090(service) {
				//lowecase the service locales for equal propose
				service.locales = _.map(service.locales, function f2091() {
					return arguments[0].toLowerCase();
				});

				_.each(_.compact(contentLocales), function (localeItem) {
					if(localeMapping[localeItem]){
						localeItem = localeMapping[localeItem];
					}
					if (~service.locales.indexOf(localeItem.toLowerCase())) {
						if (!_services[localeItem]) {
							_services[localeItem] = {
								locale: localeItem,
								providers: []
							};
						}

						_services[localeItem].providers.push({
							id: service.id,
							name: service.name,
							configurations: {
								course: (function f2092(process_service) {
											var _course_cfg = process_service.configurations.course;
											var results = {};
                                            var multiSelectionDefault;

											_.each(_course_cfg, function f2093(item) {
                                                multiSelectionDefault = (item.type != 'multiselection' || !item.options) ? null : {
                                                    key: localeItem.toLowerCase(),
                                                    index: 0,
                                                    indexValue: item.options[localeItem.toLowerCase()][0]
                                                };

												results[item.key] = (function f2094(v) {
													return _.isObject(v) ? v.indexValue : v;
												})(item.selected || multiSelectionDefault || item['default']);
											});

											return results;
										})(service)
							}
						});

					} else {
						if (!_services[localeItem]) {
							_services[localeItem] = {
								locale: localeItem,
								providers: []
							};
						}
					}
				});
			});

			return _services;
		};

		var handle_api_response = function f2098(successCallback, xhr) {
            if (xhr.status == 200 && xhr.readyState === 4) {
                var dataView = new DataView(xhr.response);
                var blob = new Blob([dataView], { type: 'audio/mpeg' });

                require("assets").uploadBlobAndSaveItLocally(blob, function _uploadBlobAndSaveItLocally(mp3Path) {
	                if (_.isFunction(successCallback)) {
		                successCallback(mp3Path);
	                }
                }, 'mp3');
            }
        };

		var go = function f2100(locale, text, successCallback, errorCallback) {
			if(localeMapping[locale]){
				locale = localeMapping[locale];
			}
			//get the course data
			var course = repo.get(repo._courseId);
			//select the service by the locale from the course
			var service = course.data.ttsServices && course.data.ttsServices[locale];
			var provider_configuration = _.find(userModel.account.ttsProviders, function (provider) {
				return provider.id === service.id;
			});

			//if there is no service for the locale end the execution of the function
			if (!service) {
				require('showMessage').clientError.show({errorId: 'TTS1'});
                return errorCallback("No text to speech service");
			}

			//build the structure of the api, use array buffer response type for manage the blob and save it to the filesystem

			var _data = require('cgsUtil').cloneObject(service.configurations.course);
			var _appendToParams = _.filter(provider_configuration.configurations.course, function (item) {
				return item.appendTo;
			});

			_.each(_appendToParams, function (param) {
				if (_data[param.key]) {				
					if (!_data[param.appendTo]) {
						_data[param.appendTo] = [];
						_data[param.appendTo].push({
							key: param.key,
							value: _data[param.key].toString()
						});
					} else {
						_data[param.appendTo].push({
							key: param.key,
							value: _data[param.key].toString()
						});
					}
					
					delete _data[param.key];
				}
				
			});


			var _api = provider_configuration.configurations.api;
			var _admin = (function f2095(process_service) {
							var _admin_cfg = process_service.configurations.admin;
							var results = {};

							_.each(_admin_cfg, function f2096(item) {
								results[item.key] = (function f2097(v) {
									return _.isObject(v) ? v.indexValue : v;
								})(item.selected || item['default']);
							});

							return results;
						})(provider_configuration);
			var _concat_data = _api.excludeLanguage ? _data : _.merge({ lang: locale }, _data);
				_concat_data = _.merge(_concat_data, _.omit(_api.template.data, 'base_url'));
				_concat_data = _.merge(_concat_data, _admin);
				_concat_data = _.merge(_concat_data, { text: text });

			var urlQueryString = _api.template.data.base_url + "?" + $.param(_concat_data);
			var _base_path = require("configModel").configuration.basePath;

			if (!_api.isInternalAPI) {
				require("cgsUtil").requestProxy(_base_path + "/proxy?" + urlQueryString,
											handle_api_response.bind(this, successCallback),
											errorCallback.bind(this, provider_configuration.name));
			} else {
				require("cgsUtil").requestPostProxy(_base_path + "/" + _api.template.data.base_url,
											JSON.stringify(_concat_data),
											handle_api_response.bind(this, successCallback),
											errorCallback.bind(this, provider_configuration.name));
			}
		};

		var isTtsServiceEnabledByLocale = function f2101(locale) {
			if(!userModel.account.enableTextToSpeach) {
				return false;
			}

			if(localeMapping[locale]){
				locale = localeMapping[locale];
			}
			var course = repo.get(repo._courseId);
			//select the service by the locale from the course
			var service = userModel.account.ttsProviders && userModel.account.ttsProviders.length > 0 && course.data.ttsServices && course.data.ttsServices[locale];

			return !!service;
		};

		return {
			getServices: getServices,
			go: go,
			isTtsServiceEnabledByLocale: isTtsServiceEnabledByLocale,
			localeMapping : localeMapping
		};
	};

	return new TTSModel;
});