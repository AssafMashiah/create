define(['backbone_super', 'mustache', 'text!components/dialogComponent/template/dialogTemplate.html'],
	function (Backbone, mustache, template) {
		'use strict';
		var DialogComponent = Backbone.View.extend({
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

			dispose: function(ok) {
				this.$el.data('modal', null);
				this.remove();
				this.off();

				if(this.config.onClose) {
					this.config.onClose(ok == true);
				}
			},

			render: function () {
				this.$el.html(mustache.render(this.template, this));
				this.$el.modal({show: false});
				var self = this;
				var ok = this.$el.find('.ok-button');
				this.$el.find('.ok-button').on('click', function () {
					self.$el.modal('hide');
					self.dispose(true);
				});
				
				return this;
			}
		});

		return DialogComponent;
	});