define(["jquery", "backbone", "mustache", "modules/CGSTooltipUtil/CGSTooltipWrapper", "modules/CGSTooltipUtil/CGSTooltipView"],
	function ($, Backbone, mustache, CGSTooltipWrapper, CGSTooltipView) {

		var CGSTooltipUtil = Backbone.View.extend({

			initialize: function () {

				var parent = $("body");

				// A wrapper to contain the tooltip. Needed to be differed in the DOM
				this.wrapper = new CGSTooltipWrapper({
					parent: parent
				});

				// The tooltip itself is applied to the wrapper
				this.tooltipView = new CGSTooltipView({
					parent: this.wrapper.$el
				});

			},

			render: function (args) {

				var srcElem = $(args.target);

				this.tooltipView.render({
					title: srcElem.attr("data-title") || args.title,
					position: srcElem.attr("data-position") || args.position || "top-left",
					selector: srcElem
				});

			},

			empty: function () {

				// Empty the wrapper
				this.wrapper.empty();

			},

			dispose: function () {

				this.wrapper.dispose();
				this.remove();

			}

		});

		return new CGSTooltipUtil();

	});