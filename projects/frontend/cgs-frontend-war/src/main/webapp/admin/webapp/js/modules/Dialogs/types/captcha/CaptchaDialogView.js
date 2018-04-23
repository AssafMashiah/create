define(['lodash','jquery', 'BaseView', 'mustache', 'events', 'modules/Dialogs/BaseDialogView', 'text!modules/Dialogs/types/captcha/CaptchaDialog.html'],
function(_, $, BaseView, Mustache, events, BaseDialogView, template) {

	var CaptchaDialogView = BaseDialogView.extend({

		tagName : 'div',
		className : 'css-dialog',
		events: {
			'keyup #captcha-code': 'check'
		},
		
		initialize: function(options) {
			
			this.customTemplate = template;
			
			this._super(options);

		},

		render: function( $parent ) {
			this._super($parent, this.customTemplate);
			this.generateCaptchaCode();
			this.setDisabled()
		},
		generateCaptchaCode: function () {

			function getColor() {
				return '#'+(Math.random()*0xFFFFFF<<0).toString(16);
			}
			var _place_holder = this.$el.find('.captcha-place-holder');
			var _random_number = _.map("AAAA".split(""), function () {
				return "<span style=\"color: " + getColor() + "\">" + Math.ceil(Math.random() * 10) + "</span>";
			}).join('');

			_place_holder.html(_random_number);
		},
		setEnabled: function () {
			this.$el.find("#ok").attr('disabled', false);
		},
		setDisabled: function () {
			this.$el.find("#ok").attr('disabled', true);
		},
		check: function () {
			var _x = this.$el.find('.captcha-place-holder').text();
			var _y = this.$el.find("#captcha-code").val();

			if (_x === _y) {
				this.setEnabled()
			} else {
				this.setDisabled()
			}
		}

	}, {type: 'CaptchaDialogView'});

	return CaptchaDialogView;

});
