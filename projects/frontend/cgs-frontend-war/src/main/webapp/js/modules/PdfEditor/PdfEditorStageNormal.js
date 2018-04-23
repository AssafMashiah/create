define(['jquery', 'BaseStageContentView', 'events', 'text!modules/PdfEditor/templates/PdfEditorStageNormal.html',
		'jquery_ui', 'imgAreaSelect',
		/* 'css!imgareaselect-default', */ 'bootstrap'],
function($, BaseStageContentView, events, template) {

	/* Get (more like "guess") scale from the CSS transform matrix. Fragile. */
	function getScale(selector) {
		var trans_mx = $(selector).css("transform"),
			retval = parseFloat(trans_mx.split("(")[1]);
		if (isNaN(retval)) return 1;
		return retval;
	}

	/* Get background-size CSS value for the image. */
	function getBgSize(selector, scale) {
		var obj = $(selector)[0];
		if (obj && obj.naturalWidth) {
			return (obj.naturalWidth * scale) + "px";
		}
		return "auto";
	}

	/* Set CSS scale based on slider position. */
	function setScale(selector, scale) {
		if (scale.constructor && scale.constructor === String) {
			scale = parseInt(scale) / 100;
		}
		$(selector).css("-webkit-transform", "scale(" + scale + ")")
	}

	var PdfEditorStageNormal = BaseStageContentView.extend({
		el: "#stage_base",

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},

		toolbarButtonEvent: function(handler) {
			var self = this;

			return function(event) {
				$(this).button('toggle');
				handler.call(self, event);
			}
		},

		render: function() {
			var self = this;

			this._super();

			/* Start in text mode. */
			this.$html_layer = $(".html_layer_wrapper").addClass("not_selectable");

			/* Disable image dragging. */
			$('#pdf_page > .flow_container > img')[0].ondragstart = function(event) {
				event.preventDefault();
				return false;
			};

			/* Initialize text selection. */
			this.selectText({which: 1});

			/* Initialize toolbar. */
			$("#pdf_tool_image").click(this.toolbarButtonEvent(this.selectImage));

			$("#pdf_tool_text").click(this.toolbarButtonEvent(this.selectText));

			$("#pdf_page_zoom").change(function(event) {
				setScale("#pdf_page > .flow_container > img, #pdf_page .html_layer_wrapper .html_layer", this.value);

				$("#pdf_page > .flow_container").css({
					width: ($("#pdf_page > .flow_container > img").width() / 100) * (parseFloat(this.value)),
					height: ($("#pdf_page > .flow_container > img").height() / 100) * (parseFloat(this.value)),
				});
			});

			// $("#pdf_toolbar").draggable();

			$("body").css("overflow", "hidden"); // should this be the default?

			$("#pdf_page > .flow_container > img")[0].onload = function f959() {
				$("#pdf_page > .flow_container").css({
					width: ($("#pdf_page > .flow_container > img").width() / 100) * parseFloat($("#pdf_page_zoom").attr('value')),
					height: ($("#pdf_page > .flow_container > img").height() / 100) * parseFloat($("#pdf_page_zoom").attr('value'))
				});
			}

			return true;
		},

		dispose: function f960() {
			this.imageSelect && this.imageSelect.remove();
			this._super();
		},

		selectText: function(event) {
			if (event.which === 1 /* $(event.target).hasClass("active") */) {
				/* Do nothing if already in text mode. */
				if (this.$html_layer.hasClass("ui-selectable")) return;

				/* BUG: imgAreaSelect#remove doesn't remove its data. */
				this.imageSelect && this.imageSelect.remove();

				var _img_data = $('#pdf_page > .flow_container').data('imgAreaSelect');
				if (_img_data) _img_data.remove();

				$('#pdf_page > .flow_container').removeData('imgAreaSelect'); // see jQuery.fn.imgAreaSelect

				/* Initialize text mode. */
				this.$html_layer.selectable({
					filter: ".html_layer > div",
					stop: function() {
						var objs = []
						$(".ui-selected", this).each(function() {
							objs.push(this)
						})
						if (!objs.length) return;

						$(objs).draggable({
							appendTo: $("#pdf_page"),
							drag: function f961(event, ui) {
								var pdfOffset = $("#pdf_page").offset();
								var sTop = document.querySelector("#pdf_page").scrollTop;

								if (ui.offset.left < pdfOffset.left && $("#pdf_page").css('overflow') !== 'visible') {
									$("#pdf_page").css('margin-top', -sTop);
									$("#pdf_page").css('overflow', 'visible');
								}
							},
							stop: function f962(event, ui) {
								$("#pdf_page").css('margin-top', 0);
								$("#pdf_page").css('overflow', 'auto');
							},
							helper: function() {

								var c = $('<div>').attr({
										'id': 'draggingContainer_' + new Date().getTime(),
										'class': 'draggingContainer',
										'type': 'text'
									}),
									p = $('<p class=drag-text>'),

									text_scale = getScale("#pdf_page > .flow_container > img"),

									_left = Math.min.apply(Math,
										$(objs).map(function(i, obj) {
											return parseInt($(obj).css('left')) - document.querySelector("#pdf_page").scrollLeft
										})),

									_top = Math.min.apply(Math,
										$(objs).map(function(i, obj) {
											return parseInt($(obj).css('top')) - document.querySelector("#pdf_page").scrollTop
										}));

								p.append($(objs).clone()).appendTo(c);

								p.css({marginLeft: -_left * text_scale, marginTop: -_top * text_scale,
									'-webkit-transform': 'scale(' + text_scale + ')',
									'-webkit-transform-origin': '0 0'
								})

								return c
							}
						})
					},
					unselected: function() {
						var objs = []
						$(".ui-draggable", this).each(function() {
							objs.push(this)
						});

						if (!objs.length) return
						$(objs).draggable("destroy")
					}
				});

				this.$html_layer.show();
			}
		},

		selectImage: function(event) {
			if (event.which === 1 /* $(event.target).hasClass("active") */) {
				if (this.$html_layer.hasClass("ui-selectable")) {
					/* Turn off text mode. */
					this.$html_layer.selectable("destroy");
					this.$html_layer.hide();

					/* Clear text selection. */
					this.$html_layer.find(".ui-selected").each(function(index, tag) {
						tag.className = tag.className.replace("ui-selected", "")
					})
				}

				/* Initialize image mode. */
				var pdf_page = $('#pdf_page'), selectionArea = $('#pdf_page > .flow_container')

				this.imageSelect = selectionArea.imgAreaSelect({
					handles: false,
					instance: true,
					movable: false,
					resizable: false,
					onInit: function() {
						$('.imgareaselect-selection').parent().draggable({
							helper: function() {
								var c = $('<div>').attr({
									'id': 'draggingContainer_' + new Date().getTime(),
									'class': 'draggingContainer',
									'type': 'image'
								});

								var sel = $('.imgareaselect-selection'),
								page_pos = pdf_page.offset(),
								sel_pos = sel.offset(),
								img_scale = getScale("#pdf_page > .flow_container > img"),
								bg_size = getBgSize("#pdf_page > .flow_container > img", img_scale),
								_left = (sel_pos.left - page_pos.left + pdf_page.scrollLeft()) + 'px',
								_top = (sel_pos.top - page_pos.top + pdf_page.scrollTop()) + 'px';

								c.css({
									background: 'url(' + selectionArea.find('img').attr("src") + ') no-repeat' +
										(' -' + _left) +
										(' -' + _top),
									backgroundSize: bg_size,
									height: sel.css('height'),
									width: sel.css('width')
								})
								return c
							}
						})
					}
				})
			}
		}

	}, {type: 'PdfEditorStageNormal'});

	return PdfEditorStageNormal;
});
