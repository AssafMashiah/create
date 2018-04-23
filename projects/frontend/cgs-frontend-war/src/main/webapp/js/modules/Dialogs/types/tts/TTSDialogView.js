define(['lodash','jquery', 'BaseView', 'mustache', 'events', 'modules/Dialogs/BaseDialogView', 'repo',
	'text!modules/Dialogs/types/tts/TTSDialog.html',
	'text!modules/Dialogs/types/tts/GenericForm.html'],
function(_, $, BaseView, Mustache, events, BaseDialogView, repo, template, generic_form_template) {

	var TTSDialogView = BaseDialogView.extend({

		tagName : 'div',

		className : 'css-dialog',

		events: {
			"keydown input[type=number]": "prevent",
			"change [data-key]": "on_form_change"
		}, 

		initialize: function(options) {		
			this.customTemplate = template;
			this.model = options.config.model;
			this._super(options);
		},

		setReturnValueCallback: {
			"yes": function f719() { 
				var is_valid = true;

				_.each(this.model.configurations.course, function f720(item) {
					if (item.validation && item.validation.required && !item.selected) {
						is_valid = false;
					}
				}, this);

				return is_valid && this.model.configurations.course;
			}
		},
		getProvider: function f721(id) {
			return _.find(this.providers, function f722(item) {
				return item.id === parseInt(id)
			});
		},
		getTemplate: function f723(template, data) {
			return Mustache.render(generic_form_template, data);
		},
		render_service_form: function f724() {
			var form_data = this._prepare_form_data(this.model.configurations.course),
				html_render = this.getTemplate(generic_form_template, form_data);
			
			this.$(".generated-form").html(html_render);

			this.setForm();
		},

		getFromItemData: function f725(el) {
			return {
				key: el.attr('data-key'),
				type: el.attr('data-type')
			}
		},

		getSpecificConfiguration: function f726(data, key) {
			return _.find(data, function f727(item) { 
				return item.key === key 
			});
		},

		setForm: function f728() {
			/* 
				Inner functions references to get specific data from the 
				dom/configuration use to avoid using "self" context 
			*/
			var getFromItemData = this.getFromItemData;
			var getSpecificConfiguration = this.getSpecificConfiguration;
			var model = this.model.configurations.course;

			this.$('[data-key]').each(function f729() {
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
						case 'number':
							$(this).val(element_value);
						break;
						case 'multiselection':
							$(this).val(element_config.selected.key);
							$(this).next().next().children().remove();

							_.each(element_config.sub_options, function f730(item) {
								this.append($("<option></option>").attr({
									value: item
								}).text(item));
							}, $(this).next().next());


							$(this).next().next().val(element_config.selected.indexValue);
						break;
						case 'array':
							$(this).val(element_value.indexValue);
						break;
					}
				}

			});
		},
		on_form_change: function f731(e) {
			var element_config = this.getSpecificConfiguration(this.model.configurations.course, $(e.target).attr('data-key'));
			var element_properties = this.getFromItemData($(e.target));
			var html_render;

			switch (element_properties.type) {
				case 'text':
				case 'number':
					element_config.selected = $(e.target).val();
				break;
				case "multiselection":
					var selected_option = $(e.target).find('option:selected').val();

					element_config.selected = {
						key: selected_option,
						index: 0,
						indexValue: element_config.options[selected_option][0]
					}

					element_config.sub_options = element_config.options[selected_option]
				break;
				case "sub_multiselection":
					element_config.selected = {
						key: $(e.target).prev().find('option:selected').val(),
						index: $(e.target).find('option:selected').index(),
						indexValue: $(e.target).find('option:selected').val()
					};
				break;
				case 'array':
					element_config.selected = {
						index: $(e.target).children('option:selected').index(),
						indexValue: $(e.target).children('option:selected').val()
					};
				break;
			}

			this.setForm();
		},

		prevent: function f732(e) {
			return e.preventDefault();
		},

		_prepare_form_data: function f733(structure) {
			_.each(structure, function f734(item) {
				switch (item.type) {
					case 'text':
					case 'number':
						item.is_input = true;
					break;
					case 'multiselection':
						item.is_multiselection = true;

						if (item.filterOptionsByLocale) {
							item.options = _.pick(item.options, this.options.config.locale.toLowerCase());
						}

						item.keys = _.keys(item.options);
						item.sub_options = item.options[item.selected.key];

							
					break;
					case 'array':
						item.is_select = true;
					break;
				}

				if (item.attributes) {
					item.attributes_str = _.map(item.attributes, function f735() {
						return arguments[1] + '=' + arguments[0];
					}).join(" ");
				}
			}, this);

			return {properties: structure};
		},

		render: function( $parent ) {
			this._super($parent, this.customTemplate);
			this.render_service_form();
		}

	}, {type: 'TTSDialogView'});

	return TTSDialogView;

});
