define(['lodash','jquery', 'BaseView', 'mustache', 'events', 'configModel', 'modules/Dialogs/BaseDialogView', 'text!modules/Dialogs/types/narrations_locales/NarrationsLocaleDialog.html'],
function(_, $, BaseView, Mustache, events, configModel, BaseDialogView, template) {

	var NarrationsLocaleDialogView = BaseDialogView.extend({

		tagName : 'div',
		className : 'css-dialog',
		events: {
			"change #check_all": "check_all",
			"change input.locale_selection": "locale_selected"
		},
		setReturnValueCallback: {
			"add": function () { 
				return this.results;
			},
			"cancel": function () {
				return false;
			}
		},
		locale_selected: function (e) {
			this.$("#check_all").attr('checked', (this.$("input.locale_selection:checked").length === this.$("input.locale_selection").length))
			
			this.update();
		},
		check_all: function (e) {
			this.$("input.locale_selection").attr('checked', $(e.currentTarget).is(':checked'));

			this.update();
		},
		update: function () {
			this.results = _.map(this.$('input.locale_selection:checked'), function (item) {
				return _.find(this.narrationsLocales, function (localeObj) {
					return $(item).attr('data-value') === localeObj.locale;
				});
			}, this);
		},
		initialize: function(options) {
			this.narrationsLocales = configModel.getMultiNarrationsLocales();
			this.customTemplate = template;
			this._super(options);

		},
		setModel: function (model) {
			var reduce_filter_arr = _.map(model, function (item) {
				return '[data-value=' + item.locale + ']';
			});

			this.$(reduce_filter_arr.join(",")).attr('checked', true);
			this.$("#check_all").attr('checked', (reduce_filter_arr.length === this.$("input.locale_selection").length))
		},

		render: function( $parent ) {
			this._super($parent, this.customTemplate);
			
			this.options.config.model && this.setModel(this.options.config.model);
		}

	}, {type: 'NarrationsLocaleDialogView'});

	return NarrationsLocaleDialogView;

});
