define(['lodash','jquery', 'BaseView', 'mustache', 'events', 'modules/Dialogs/BaseDialogView', 
	'text!modules/Dialogs/types/tts/TTSDialog.html',
	'text!modules/Dialogs/types/tts/GenericForm.html'],
function(_, $, BaseView, Mustache, events, BaseDialogView, template, generic_form_template) {

	var TTSDialogView = BaseDialogView.extend({

		tagName : 'div',

		className : 'css-dialog',

		events: {
			"change #service-selector": "change_service",
			"keydown input[type=number]": "prevent",
			"change [data-key]": "on_form_change"
		}, 

		initialize: function(options) {		
			this.customTemplate = template;
			this.providers = options.config.providers;
			this._super(options);
		},

		setReturnValueCallback: {
			"yes": function () { 
				var is_valid = true;

				_.each(this.model.configurations.admin, function (item) {
					if (item.validation.required && !item.selected) {
						is_valid = false;
					}
				}, this);

				return is_valid && this.model;
			}
		},
		getProvider: function (id) {
			return _.find(this.providers, function (item) {
				return item.id === parseInt(id)
			});
		},
		getTemplate: function (template, data) {
			return Mustache.render(template, data);
		},
		change_service: function (e) {
			var selected_option = $(e.target).find("option:selected"),
				model = this.getProvider(selected_option.attr('value')),
				form_data,
				html_render;

			if (model) {
				this.model = _.clone(model, true);

				form_data = this._prepare_form_data(this.model.configurations.admin);
				html_render = this.getTemplate(generic_form_template, form_data);

				this.$(".generated-form").html(html_render);
				this.setForm();
			} else {
				this.$(".generated-form").empty();
			}
		},

		getFromItemData: function (el) {
			return {
				key: el.attr('data-key'),
				type: el.attr('data-type')
			}
		},

		getSpecificConfiguration: function (data, key) {
			return _.find(data, function (item) { 
				return item.key === key;
			});
		},

		setForm: function () {
			/* 
				Inner functions references to get specific data from the 
				dom/configuration use to avoid using "self" context 
			*/
			var getFromItemData = this.getFromItemData;
			var getSpecificConfiguration = this.getSpecificConfiguration;
			var model = this.model.configurations.admin;

			this.$('[data-key]').each(function () {
				var element_properties = getFromItemData($(this));
				var element_config = getSpecificConfiguration(model, element_properties.key);
				var element_value;

				if (element_config.selected) {
					element_value = element_config.selected;
				} else {
					element_value = element_config['default'];

					if (element_config.selected) {
						element_config.selected = element_value;
					}
				}

				if (element_value) {
					switch (element_properties.type) {
						case 'text':
							$(this).val(element_value);
						break;
					}
				}

			});
		},
		on_form_change: function (e) {
			var element_config = this.getSpecificConfiguration(this.model.configurations.admin, $(e.target).attr('data-key'));
			var element_properties = this.getFromItemData($(e.target));

			switch (element_properties.type) {
				case 'text':
					element_config.selected = $(e.target).val();
				break;
			}

			this.setForm();
		},

		prevent: function (e) {
			return e.preventDefault();
		},

		_prepare_form_data: function (structure) {
			_.each(structure, function (item) {
				switch (item.type) {
					case 'text':
						item.is_input = true;
					break;
				}

				if (item.attributes) {
					item.attributes_str = _.map(item.attributes, function () {
						return arguments[1] + '=' + arguments[0];
					}).join(" ");
				}
			});

			return {properties: structure};
		},

		render: function( $parent ) {
			this._super($parent, this.customTemplate);
		}

	}, {type: 'TTSDialogView'});

	return TTSDialogView;

});
