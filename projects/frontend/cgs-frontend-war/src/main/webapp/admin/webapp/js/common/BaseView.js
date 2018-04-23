define(['lodash', 'jquery', 'backbone_super', 'mustache', 'translate'],
function(_, $, Backbone, Mustache, i18n) {

	var BaseView = Backbone.View.extend({

		clearOnRender: true,
		removeElement: false,

		initialize: function(options) {
			if (this.options.controller)
				this.controller = this.options.controller;

			if (this.options.obj)
				this.obj = this.options.obj;

			if(typeof this.options.clearOnRender != "undefined")
				this.clearOnRender = this.options.clearOnRender;

			this.render();
		},


		remove: function() {
			this.undelegateEvents();

			if (this.removeElement) this.$el.remove();
			else this.$el.empty();

			return this;
		},


        /**
         *
         * @param template
         * @param partials [optional] {partial_name : partial_template} give you the ability to add partials templates to main template
         */
		render: function(template, templateData, partials) {
			if (this.clearOnRender) this.$el.empty();

			//render template
			var template_html = Mustache.render(i18n._(template), this , partials).trim();
			var div;
			//cut only part of the template according to the selector
			if(this.options.contentSelector) {
				div = $('<div></div>');
				div.html(template_html);

				template_html = div.find(this.options.contentSelector).html();
			}

			//used for task settings tab - appends props template to one parent container (appendToSelector - jquery selector)
			if (this.options.appendToSelector) {
				if (template_html.length) {
					if (!this.options.hideHeader) {
						this.$el.find(this.options.appendToSelector).append('<div><h4>' + this.controller.elementName + '</h4></div>');      //header
					}
					this.$el.find(this.options.appendToSelector).append('<div class="' + this.controller.elementType + '_editor" />');  //content wrapper

					var element_wrapper = this.$el.find('.' + this.controller.elementType + '_editor');
					this.setElement(element_wrapper);
					element_wrapper.append(template_html);
				}

			} else {
				this.$el.append(template_html);
			}

			if (this.appendToParent && this.$parent && this.$parent.length) {
				this.$parent.append(this.$el);
			}

		},

		dispose: function() {
			this.remove();
		}

	}, {type: 'BaseView'});

	return BaseView;

});
