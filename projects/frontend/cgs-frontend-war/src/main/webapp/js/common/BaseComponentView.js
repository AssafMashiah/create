define(['lodash', 'jquery', 'backbone_super', 'mustache', 'translate', 'editMode', 'rivets'], function(_, $, Backbone, Mustache, i18n, editMode, rivets) {
	var BaseComponentView = Backbone.View.extend({
		ui: {
			form_selectors: 'input, select, textarea, button[canBeDisabled!="false"]'
		},
		tagName: 'div',
		className: 'component_view',
		clearOnRender: true,
		initialize: function (options) {
			if (!options) {
				throw new TypeError("No options defined for BaseComponentView");
			}

			this.options = options;


			this.handleOptions();

			this.setModel();

			this.render();
			this.handleReadOnlyMode();
		},
		handleOptions: function () {
			this.controller = this.options.controller;

			if (!this.options.parentContainer) {
				throw new TypeError("No parent container define for Component");
			} 

			this._parent_container = $(this.options.parentContainer);

			if (!this._parent_container.length) {
				return false;
			}

		},
		setModel: function () {
			var Model = Backbone.Model.extend({});

			this.model = new Model(this.options.model());

			if (this.options.controllerEvents) {
				_.each(this.options.controllerEvents, function (item, eventName) {
					this.model.on('change:' + eventName, function (model) {
						item.call(this, model.get(eventName));
					});
				},this);
			}
		},
		partialEdit: function () {
			return editMode.partialEdit();
		},
		handleReadOnlyMode: function () {
			var self = this;

			function _disabled_elements (options) {
				if (!editMode.readOnlyMode && !!$(this).attr('cantBeEnabled')) {
					return false;
				}

				$(this).attr('disabled', editMode.readOnlyMode);
			};

			return this.$el.find(this.ui.form_selectors).each(function () {
				return _disabled_elements.call(this, self.options)
			});
		},
		render: function (template, partials) {
			var _template_html = Mustache.render(i18n._(template), this, partials).trim();

			if (this.clearOnRender) {
				this.$el.empty();
				this._parent_container.find("[component-name=" + this.options.name + "]").remove();
			}

			this.$el.attr('component-name', this.options.name);

			if (_template_html.length) {
				this._parent_container.append(this.selectorAppendable ?
														this.$el.append(_template_html) : _template_html);
			} else {
				if (this.selectorAppendable) {
					this._parent_container.append(this.$el);
				}
			}

			this.rivetsView = rivets.bind(this.$el, {obj: this.model});

			if (this.options.onRendered) {
				this.options.onRendered.call(this);
			}
		},
		dispose: function () {
			this.model && this.model.off();
			this.unbind();
            this.remove();

            delete this.model;
		},

		hide : function () {
			this.$el.hide();
		},

		show : function () {
			this.$el.show();
		}

	}, {
		type: 'BaseComponentView'
	});

	return BaseComponentView;
});