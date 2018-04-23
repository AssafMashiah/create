define(['lodash', 'jquery', 'backbone_super', 'mustache', 'translate', 'editMode', 'events'],
function(_, $, Backbone, Mustache, i18n, editMode, events, router) {

	var BaseView = Backbone.View.extend({

		clearOnRender: true,
		removeElement: false,
		autohintEditors: ['CourseEditor','TocEditor', 'LessonEditor','SequenceEditor', 'LoEditor'],
		autohintScreens: ['CourseScreen','LessonScreen', 'DialogScreen','TaskScreen'],
		initialize: function(options) {
			if (this.options.controller)
				this.controller = this.options.controller;

			if (this.options.obj)
				this.obj = this.options.obj;

			if(typeof this.options.clearOnRender != "undefined")
				this.clearOnRender = this.options.clearOnRender;

			this.render();

			this.setInputMode();
		},
		showElementById: function (id) {
			this.$("#" + id).removeClass("hide");
		},
		hideElementById: function (id) {
			this.$("#" + id).addClass("hide");
		},
		/**
		 * set input fields mode (readonly/edit) according to the global setting
		 */
		setInputMode:function () {
			this.$('input, select, textarea, button[canBeDisabled!="false"]')
				.each(function (i, input) {
					//if mode is readonly disable all element, if mode not readonly enable only elements that can be enabled
					if (!editMode.readOnlyMode && !!input.getAttribute('cantBeEnabled')) {
						return false;
					}

					input.disabled = editMode.readOnlyMode;

				});
		},

		remove: function() {
			this.undelegateEvents();
			if (this.removeElement){
                //this.$el.remove();
                this._super();
            }
			else this.$el.children().remove();

			return this;
		},

		partialEdit: function(){
			return editMode.partialEdit();
		},

		fireAfterRenderEvents: function () {
			if (this.controller && ~this.autohintEditors.indexOf(this.controller.constructor.type)) {
				if (this.isEditorCoachMarksEnabled()) {
					events.fire('dispose-cgs-hints');
					events.fire("init-cgs-hints");
				}
			} else if (this.controller && ~this.autohintScreens.indexOf(this.controller.constructor.type)) {
				if (this.isScreenCoachMarksEnabled()) {
					events.fire('dispose-cgs-hints');
					events.fire("init-cgs-hints");
				}
			} else if (this.controller && this.isComponent()) {
				events.fire("init-cgs-hints");
			}
		},
		/**
         *
         * @param template
         * @param partials [optional] {partial_name : partial_template} give you the ability to add partials templates to main template
         */
		render: function(template,partials) {
			if (this.clearOnRender) this.$el.empty();

			//render template
			var template_html = Mustache.render(template, this , partials).trim();
			var div;
			//cut only part of the template according to the selector
			if(this.options.contentSelector) {
				div = $('<div></div>');
				div.html(template_html);

				template_html = div.find(this.options.contentSelector).html();
			}

			//used for task settings tab - appends props template to one parent container (appendToSelector - jquery selector)
			if (this.options.appendToSelector) {
				if (template_html.length && template_html.trim().length) {
					if (!this.options.hideHeader) {
						this.$el.find(this.options.appendToSelector).append(
							'<div><h5>' + i18n.tran(this.controller.elementRenderName) + '</h5></div>');      //header
					}
 						this.$el.find(this.options.appendToSelector).append(
						    '<div class="' + this.controller.elementType + '_editor" />');  //content wrapper
 					
					var element_wrapper = this.$el.find('.' + this.controller.elementType + '_editor');
					this.setElement(element_wrapper);
					element_wrapper.append(template_html);
				}

			} else {
				this.$el.append(template_html);
			}

			this.fireAfterRenderEvents();
		},

		isComponent: function () {
			return ~['MenuComponent', 'NavBarComponent','TreeComponent'].indexOf(this.controller.constructor.type);
		},
		isEditorCoachMarksEnabled: function () {
			var activeEditor = this.controller && this.controller.router && this.controller.router.activeScreen && this.controller.router.activeScreen.editor;
           	var hints = activeEditor && activeEditor.config && activeEditor.config.cgsHints;

            return !!hints;
		},
		isScreenCoachMarksEnabled: function () {
			var activeScreen = this.controller && this.controller.router && this.controller.router.activeScreen;
           	var hints = activeScreen && activeScreen.config && activeScreen.config.cgsHints;

            return !!hints;
		},

		dispose: function() {
			this.unbind();
			this.remove();

			for (var key in this) {
				if (this.hasOwnProperty(key)) {
					if ((["el", "$el", "__stack", "_super"].indexOf(key) < 0) && this[key]) {
						delete this[key];
					}
				}
			}

		}

	}, {type: 'BaseView'});

	return BaseView;

});
