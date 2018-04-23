define(['lodash', 'jquery', 'repo', 'BaseView', 'userModel', 'ttsModel', 'events', 'text!./components/TTSComponent/templates/TTSComponent.html'], 
	function f1798(_, $, repo, BaseView, userModel, ttsModel, events, template) {
	var TTSComponent = BaseView.extend({
		appendToSelector: true,
		clearOnRender: true,
		showNarrationDialogOnEdit: false,
		initialize: function f1799(options) {
			//get services return structure { locale: service }, use to array for itreate with mustache on the providers
			this.providers = _.toArray(ttsModel.getServices());

			_.each(this.providers, function (item) {
				item.has_providers = item.providers.length ? true : false;
			});

			if (!this.providers.length) {
				if (options.target) {
					return this.onEmptyProviders();
				} else {
					$("#field_useTtsServices").prop('checked', false);
					return;
				}
			}

			//component element wrapper
            this.$el = $(options.el);

            this._super(options);

            if( _.size( this.options.data.ttsServices ) > 0 ){
            	this.showNarrationDialogOnEdit = true;
            }

            //set the course content locale service if exists
            this.setServices();

            this.show();
		},

		events: {
           'click .edit-service': 'edit',
           'change .locale-service': 'setProperties'
		},

		showSimpleWarningDialog: function(e) {
			if( ! $( e.target ).hasClass('disabled')) {
				if(!repo.getChildrenByTypeRecursive(repo._courseId, 'lesson').length){
					return false;
				}

				return true;
			}
        },
		setServices: function () {
			_.each(this.options.data.ttsServices, function (item, locale) {
				//search for the content locale row inside the component table and set the selected service to it
				this.$("#locale_" + locale).
					find('.locale-service').
					find('option[value=' + item.id +']').
					prop('selected', true);


				this.$("#locale_" + locale).find('.edit-service').removeClass('disabled');

				//set the service properties (speed,pitch,etc....)
				this.setServiceViewProperties(locale, item.id)
			}, this);
		},
        
        clearServices: function () {
            this.options.data.ttsServices = this.options.update_model();
        },

		onEmptyProviders: function f1801() {
			var dialogConfig = {
                title: "No supporting service",
                content:{
                    text: "No supporting service for this locale",
                    icon:""
                },
                buttons:{
                    'yes': { label:'OK' }
                }
            };

            require('events').once('onEmptyProvidersApprove', function f1802(result) {
            	$("#field_useTtsServices").attr('checked', false);
            });

            require("dialogs").create('simple', dialogConfig, 'onEmptyProvidersApprove');
		},

		show: function f1803() {
			//expose show method from the component for external use (if we have tts services under the course so show the table)
			this.$el.show();
		},

		edit: function f1804(e) {
			//the clicked edit button target
			var service_edit_target = $(e.target);
			//get the service id: each edit button has custom attribute that contain data-locale attribute,
			//every row (locale, locale_service, properties, edit) has specific id #locale_{{locale}}
			//use it to search the selected service of each locale
			var serviceId = this.$("#locale_" + service_edit_target.attr('data-locale')).
                							find('.locale-service').
                							find('option:selected').val();
          	
          	//get the model by the service id and the locale
            var model = this.getModel(service_edit_target.attr('data-locale'), serviceId, true);


            function onEndEditTTsService(result) {
            	if (result) {
	            	var list = {};
	            	var service = this.options.data.ttsServices[service_edit_target.attr('data-locale')];

	            	_.each(result, function f1806(item, key) {
	            		list[item.key] = _.isObject(item.selected) ? item.selected.indexValue : item.selected;
	            	}, this);

	            	service.configurations.course = list;

	            	this.options.data.ttsServices = this.options.update_model(service_edit_target.attr('data-locale'), service)

	            	this.showNarrationDialogOnEdit = true;

	            	this.setServices();
            	}
            }

            //if no choose service stop the execution of the function
            if (!model) return;


            //dialog configuration (tts dialog type)
            //contain the generic form builder by the service data
			var dialogConfig = {
                title: "Edit Text-to-Speech Service Settings",
                content:{
                    text: "",
                    icon:""
                },
                locale: service_edit_target.attr('data-locale'),
                closeOutside: false,
                buttons:{
                    'yes': { label:'OK', value: true },
                    'cancel': { label:'Cancel', value: false }
                },
                model: model,
                warning: this.showSimpleWarningDialog.call(this, e),
                warningSettings: {
                	dialogName: 'simple',
                	dialogConfig: {
		                title: "Text-to-Speech Settings",
		                closeOutside: false,
		                content: {
		                	text : "The course may already contain narrations that were created for the previous property settings. To have all narrations based on the current settings, you will have to redo the previous narrations."
		                } ,
		                buttons: {
		                    ok: {label: 'OK', value: true },
		                    Cancel: { label: 'Cancel', value: false }
		                }
		          	},
		          	dialogEvent: 'onNarrationWarningClose',
		          	dialogCallback: function(dialogResponse){
                        dialogResponse && onEndEditTTsService.call(this, this.ttsServicesResponse);
		            }.bind(this)
                }
            };

            require('events').once('onEndEditTTsService', function (result) {
        		if (dialogConfig.warning) {
        			this.ttsServicesResponse = result;
        		} else {
        			onEndEditTTsService.call(this, result);
        		}
        	}.bind(this));


            require("dialogs").create('tts', dialogConfig, 'onEndEditTTsService');
		},

		setProperties: function f1807(e) {
			var locale = $(e.target).attr('data-locale');

			this.setServiceViewProperties(locale, $(e.target).find('option:selected').val());
			this.setServices();
		},

		setServiceViewProperties: function f1808(locale, serviceId) {
			//get the service model
			var service = this.getModel(locale,serviceId);

			//check that we have this service if not we update the properties under the locale to empty string and delete it from the ttsServices
			if (!service) {
				this.$("#locale_" + locale).find('.service-properties').text("");
				this.$("#locale_" + locale).find('.edit-service').addClass('disabled');

				if (this.options.data.ttsServices && this.options.data.ttsServices[locale]) {
					this.options.data.ttsServices = this.options.update_model(locale);
				}

				return;
			}

			var properties = _.map(service.configurations.course, function(val, key) { return key + ':' + val }).join(", ");

			this.$("#locale_" + locale).find('.service-properties').text(properties);
			this.$("#locale_" + locale).find('.edit-service').removeClass('disabled');

			this.options.data.ttsServices = this.options.update_model(locale, service);

		},
		getProvidersByLocale: function f1809(locale) {
			var _result = _.find(this.providers, function f1810(item) {
				return item.locale === locale;
			});

			return _result && _result.providers;
		},
		getProviderById: function f1811(id) {
			return _.find(userModel.account.ttsProviders, function f1812(item) {
				return item.id === id;
			})
		},
		setProviderData: function f1813(providerId, data, locale) {
			var provider_config_template = require('cgsUtil').cloneObject(this.getProviderById(providerId));

			//merge each result by the data type (must for regenerate the template on edit)
			_.each(provider_config_template.configurations.course, function f1814(configValue) {
				switch (configValue.type) {
					case 'array':
						configValue.selected = {
							indexValue: data.configurations.course[configValue.key],
							index: configValue.options.indexOf(data.configurations.course[configValue.key])
						}
					break;
					case 'number':
						configValue.selected = data.configurations.course[configValue.key];
					break;
					case 'multiselection':
						configValue.selected = {
							key: locale.toLowerCase(),
							index: configValue.options[locale.toLowerCase()].indexOf(data.configurations.course[configValue.key]),
							indexValue: data.configurations.course[configValue.key]
						};
					break;
				}
			});

			return provider_config_template;
		},
		getModel: function f1815(locale, serviceId, merge) {

			var service = null;

			//check if we have service with this serviceId under this locale on the course
			if (this.options.data.ttsServices && this.options.data.ttsServices[locale] && this.options.data.ttsServices[locale].id === parseInt(serviceId)) {
				//set the service from the course
				service = this.options.data.ttsServices[locale];
			} else {
				//set the service by locale & provider
				service = _.find(this.getProvidersByLocale(locale), function f1816(item) {
					return item.id === parseInt(serviceId);
				});
			}

			if (!service) return;

			//check if we found the service and need merge with exists results (template vs course data)
			//to keep it clean
			if (merge) {
				return this.setProviderData(service.id, service, locale);
			} else {
				return service;
			}
		},
		getService: function f1817(serviceId) {
			//search service inside the providers (under the publisher account) by id
			return _.find(userModel.account.ttsProviders, function f1818(item) {
				return item.id === parseInt(serviceId);
			});
		},
		hide: function f1819() {
			this.$el.hide();
		},
		getLocaleFromCourse: function f1821() {
			return this.options.data.contentLocales[0];
		},
		render: function f1822() {
			this._super(template);
		},
		dispose: function f1820() {
			this._super();

			delete this.providers;
		},
		getMappedName: function () {
			return function(text, render){
				var mappedItemIndex = _.values(ttsModel.localeMapping).indexOf(this.locale);
				if(mappedItemIndex != -1){
					return render(text) + " ("+_.keys(ttsModel.localeMapping)[mappedItemIndex]+")";
				}else{
					return render(text);
				}
			} ;
		}
	});

	return TTSComponent;
});