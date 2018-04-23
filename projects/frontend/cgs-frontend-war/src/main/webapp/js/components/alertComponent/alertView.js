define(['backbone_super', 'mustache', 'text!components/alertComponent/template/alertTemplate.html'],
	function (Backbone, mustache, template) {
		'use strict';
		var AlertComponent = Backbone.View.extend({
			id: 'base-modal',
			className: 'modal',

			events: {
				'hidden': 'dispose'
			},

			initialize: function (config) {
				this.template = template;
				this.config = config;

				this.render();
			},

			show: function() {
				this.$el.modal('show');
			},

			dispose: function() {
				this.$el.data('modal', null);
				this.remove();
				this.off();

				if(this.config.onClose) {
					this.config.onClose();
				}
			},

			render: function () {
				this.$el.html(mustache.render(this.template, this));
				this.$el.modal({show: false});

				return this;
			}
		});

		return AlertComponent;
	});