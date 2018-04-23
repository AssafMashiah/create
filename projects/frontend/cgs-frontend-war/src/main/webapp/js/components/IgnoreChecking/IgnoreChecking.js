define(["BaseComponentView", 'text!components/IgnoreChecking/templates/IgnoreCheckingPropsView.html', 'localeModel'], function f1453(BaseComponentView, template, localeModel) {
	var IgnoreChecking = BaseComponentView.extend({
		initialize: function f1454(options) {
			this.template = template;

			this._super(options);

		},
		selectorAppendable: true,
		events: {
			"change #ignore_checking_enabled": 'onCheck',
			"change .ignore-checking-list input[type=checkbox]": 'onIgnoreItemSelected'
		},
		render: function f1455() {

			if (!this.model.get('ignore_checking_list')) {
				this.options.update(this.model, "ignore_checking_list", localeModel.getConfig("ignore_checking"));
			}

			var _list = this.model.get('ignore_checking_list');

			_.each(_list, function f1456(item) {
				item.display = require("translate").tran(item.display);
			});

			this._super(this.template);
		},
		onCheck: function f1457(e) {
			var _checked = $(e.currentTarget).is(':checked');

			this.options.update(this.model, 'ignore_checking_enabled', _checked);

			this.showList(_checked);

			if (!_checked) {
				_.each(this.model.get('ignore_checking_list'), function f1458(item) {
					item.checked = false;

					$("#" + item.id).attr('checked', false);
				});
			}
		},
		onIgnoreItemSelected: function f1459(e) {
			var _findItem = _.find(this.model.get('ignore_checking_list'), function f1460(item) { return item.id === $(e.currentTarget).attr('id') });

			_findItem.checked =  $(e.currentTarget).is(':checked');

			this.options.update(this.model, 'ignore_checking_list', this.model.get('ignore_checking_list'));
		},
		showList: function f1461(show) {
			if (show) {
				this.$el.find('.ignore-checking-list').removeClass('hidden');
			} else {
				this.$el.find('.ignore-checking-list').addClass('hidden');
			}
		}
	});

	return IgnoreChecking;
});