define(['files', 'assets', 'jquery', 'BaseStageContentView', 'events', 'mustache',
	"text!modules/ConvertEditors/templates/ConvertEditors.html",
	'jquery_ui'],
function(files, assets, $, BaseStageContentView, events, Mustache, template) {

	var ConvertEditorsView = BaseStageContentView.extend({
		clearOnRender: true,
		initialize: function(options) {
			this._super(options);
			this.template = template;
		},
		onRemoveContentHandler: function f379(e, context) {
			var ref = $(this).parents(".drop-zone")
                ,$parent = $(this).parent(),
                isContentImage = $(this).parent().parent().attr("dropable-content") == "image";

			$parent.parent().children('br').remove();
			$parent.remove();

			events.fire("drop_content", 
						ref.attr('dropable-event-id'), 
						ref.attr('dropable-content-id'), 
						ref.html());

			if (ref.attr('onremovehelper') &&  isContentImage) {
				var helper = ref.attr('onremovehelper');

				context.helpers[helper].call(null, ref);
			}
		},
		over: function f380(event, ui) {
			function clearDisabled() {
				$(arguments).each(function f381() {
					$(this).removeClass('disabled');
				});
			};

			function setDisabled() {
				$(arguments).each(function f382() {
					$(this).addClass('disabled');
				});
			};

			$(this).addClass('over');

			//limit the dropzones content size
			if ($(this).attr('dropable-limit')) {
				var size = $(this).attr('dropable-limit');

				if ($(this).children().length === parseInt(size)) {
					setDisabled(this, ui.helper);
				} else {
					clearDisabled(this, ui.helper);
				}
			} 

			if ($(this).attr('dropable-content').indexOf(ui.helper.attr('type')) === -1) {
				setDisabled(this, ui.helper);
			}
		},
		out: function f383(event, ui) {
			$(this).removeClass('over');
			$(this).removeClass('disabled');

			if (ui && ui.helper && ui.helper.length) {
				ui.helper.removeClass('disabled');
			}
		},

		converters: {
			image: function f384(cloneContent, dropableData, container, remove, context) {

				var getProportionalDimensions = function f385(data) {
		            var img_width = data.naturalWidth,
		                img_height = data.naturalHeight,
		                ratio = 0;

		            if (img_width > data.required_width) {
		                ratio = data.required_width / img_width;

		                data.required_height = img_height * ratio;
		                data.required_width = img_width * ratio;
		            }

		            if (img_height > data.required_height) {
		                ratio = data.required_height / img_height;

		                data.required_width = img_width * ratio;
		            }

		            return data;
		        };

				var imageElement = $("#pdf_page > .flow_container > img")[0],
						// "real" image size
						imageWidth = imageElement.naturalWidth,
						imageHeight = imageElement.naturalHeight,
						aspectRatio = imageWidth / imageHeight,
						// visual image size
						resizedWidth = parseFloat(cloneContent.css("background-size")),
						resizedHeight = resizedWidth / aspectRatio, // FIXME: do we need this?
						resizeFactor = resizedWidth / imageWidth;

						// "real" selection size
				var selectionWidth = cloneContent.width() / resizeFactor,
						selectionHeight = cloneContent.height() / resizeFactor;


				if (dropableData.dropElement.attr('resize-width') && dropableData.dropElement.attr('resize-height')) {

					var required_width = parseInt(dropableData.dropElement.attr('resize-width')),
						required_height = parseInt(dropableData.dropElement.attr('resize-height'));

					
					var proportional_size = getProportionalDimensions({
						required_width: required_width,
						required_height: required_height,
						naturalHeight: selectionHeight,
						naturalWidth: selectionWidth
					}), 

					proportional_width = proportional_size.required_width,
					proportional_height = proportional_size.required_height;
				}

						// offset
				var offset = cloneContent.css('background-position').split(' ').map(parseFloat),
						offsetLeft = -offset[0] / resizeFactor,
						offsetTop = -offset[1] / resizeFactor,
						// canvas and 2d context
						temporaryCanvas = $("<canvas width={0} height={1}>".format(proportional_width || selectionWidth, proportional_height || selectionHeight)),
						ctx = temporaryCanvas[0].getContext("2d");

					// Useful for debugging:
					// $("#editors").append(temporaryCanvas);

					ctx.drawImage(imageElement,
						/* source position */ offsetLeft, offsetTop,
						/* source size --> */ selectionWidth, selectionHeight,
						/* canvas position */ 0, 0,
						/* canvas size --> */ proportional_width || selectionWidth, proportional_height || selectionHeight);

					temporaryCanvas[0].toBlob(function(blob) {
						var assets = require("assets");
						assets.uploadBlobAndSaveItLocally(blob, function(imagePath) {
							var image = $("<img src={0}>".format(assets.serverPath(imagePath)));
							// TODO: save imagePath.
							cloneContent.append(image);

							image[0].onload = _.bind(context.handleOver, this, remove, container, context)();
							
							events.fire("drop_content", 
										dropableData.dropableEditorId, 
										dropableData.dropableContentId, 
										dropableData.dropElement.html());
						});
					});

					container.append(cloneContent.empty().attr("style", "")).appendTo(dropableData.dropElement);
			},

			text: function f386(cloneContent, dropableData, container, remove, context) {
					cloneContent.css({
						'left': 0,
						'top': 0,
						'margin-top': 0,
						'margin-left': 0,
						'-webkit-user-select': 'text'
					});

					cloneContent.attr({
						'contenteditable': true
					});

					/* Clean up text. */
					function ptext(_, obj) {
						// FIXME: take word spacing into account (see below)

						// obj.innerHTML = obj.innerHTML.replace(/(\w)\s(\w)/g, "$1$2");

						// return $.text(obj);

						var text = $(obj).find("div").map(function(n, div) { return $.text(div) }).toArray().join(" ");
						return text.replace(/  +/g, " ");
					}

					var plainText = Array.prototype.join.call(cloneContent.children().map(ptext), ' ');


					cloneContent.text(plainText);
					container.append(cloneContent).appendTo(dropableData.dropElement);

					_.bind(context.handleOver, this, remove, container, context)();

					events.fire("drop_content", 
										dropableData.dropableEditorId, 
										dropableData.dropableContentId, 
										dropableData.dropElement.html());
			}
		},
		//helpers use for invoking action before the drop activate
		helpers: {
			//imageViewer place holder helper, remove it and set the size of the wrapper to be auto expend
			removePlaceHolder: function f387(dropElement) {
				//get the content-area wrapper
				var contentArea = dropElement.parents(".content-area"),
				//backbone editor wrapper
					contentAreaParent = contentArea.parent().parent();

				//remove the classes from the DOM
				contentArea.removeClass('no-image-content-area previewImage noImage');
			},
			addPlaceHolder: function f388(dropElement) {
				if (dropElement.children().length) return;

				//get the content-area wrapper
				var contentArea = dropElement.parents(".content-area"),
				//backbone editor wrapper
					contentAreaParent = contentArea.parent().parent();

				//add the classes to the DOM
				contentArea.addClass('no-image-content-area previewImage noImage');
			}
		},
		drop: function f389(event, ui, context) {
			//content to drop
			var dropContent = ui.helper,
				//where do we drop out content
				dropElement = $(this);

			if (dropElement.attr('helper')) {
				var helper = dropElement.attr('helper');

				if (context.helpers[helper] && _.isFunction(context.helpers[helper])) {
					context.helpers[helper](dropElement);
				}
			}

			//limit the dropzones content size
			if (dropElement.attr('dropable-limit')) {
				var size = dropElement.attr('dropable-limit');

				if (dropElement.children().length === parseInt(size)) {
					context.out.apply(this, null);
					return false;
				}
			}
			//call out method for remove the over class from the UI
			context.out.apply(this, null);

			//check if the drop element has drop-zone area
			if (!dropElement.length) {
				return false;
			} 

			//check if the drop element has dropable-content properties and editor id
			if (!dropElement.attr('dropable-content') || !dropElement.attr('dropable-event-id')) {
				return false;
			}

			//get array with the enable content type
			/*
				TYPES: image, text
			*/
			var dropableContent = dropElement.attr('dropable-content').split(',');

			// if we doesn't wrap the dragged content with type so we exit this action
			if (!dropContent.attr('type') || dropableContent.indexOf(dropContent.attr('type')) === -1) {
				return false;
			} 
				//dragged content type
			var dropContentType = dropContent.attr('type'),
				//clone the dragged content because on drop jquey is delete it and if we use it to append (so reference, etc...)
				cloneContent = dropContent.clone(),
				//the editor we drop the content to it
				dropableEditorId = dropElement.attr('dropable-event-id'),
				//the content id inside the editor
				dropableContentId = dropElement.attr('dropable-content-id'),
				//wrapper for removing the content with nice X button
				elementDataContainer = $("<div></div>"),
				//nice X button
				elementRemoveButton = $("<button></button>"),
				//nice X Text
				elementSpanRemove = $("<span></span>"),
				//just set z-index to the drop content (we have a lot of absolute/relative elements in the drop-zone area)
				zIndex = isNaN(parseInt(dropContent.css('z-index'))) ? 1 : parseInt(dropContent.css('z-index')) + 1,
				//use for keeping out repo update with the latest drops/deleted items
				dropableData = {
								dropableEditorId: dropableEditorId,
								dropableContentId: dropableContentId,
								dropElement: dropElement
							},
				//which drop method we need to invoke (image || text)
				dropInvoke = context && context['converters'] && context['converters'][dropContentType] || false;

			elementSpanRemove.attr('class', 'base-icon icon-remove');
			elementRemoveButton.attr('class', 'btn btn-small delete_element').css('z-index', zIndex);
			elementDataContainer.attr('class', 'data-container').
								append(elementRemoveButton.append(elementSpanRemove));

			if (typeof (dropInvoke) === 'function') {
				_.bind(dropInvoke, this, cloneContent, dropableData, elementDataContainer, elementRemoveButton, context)();
			}
		},

		setDroppable: function f390(editorId) {
			var selector = (editorId) ? ".drop-zone[dropable-event-id='" + editorId + "']" : ".drop-zone";

			var dropZones = $(selector),
				self = this;

			if (dropZones.length === 0) {
				return false;
			}

			var getMethod = function f391(type) {
				return function f392() {
					Array.prototype.push.apply(arguments, [self]);
					self[type].apply(this, arguments);
				}
			};

			var droppableData = {};
			var droppableMethods = ['drop', 'over', 'out'];

			_.each(droppableMethods, function f393(item) {
				droppableData[item] = getMethod(item);
			});
			//register the dropzones for drop/over/out events
			dropZones.each(function f394() {
				$(this).droppable(droppableData);
			});
		},

		handleOver: function f395(remove, container, context) {
			if (!context || !context.onRemoveContentHandler) {
				return false;
			}

			if (!container.length || !remove.length) {
				return false;
			}

			//bind the remove method to the content X-Button
			remove.bind('click', function f396(e) {
				context.onRemoveContentHandler.call(this, e, context);
			});

			var hoverHandler = function f397(e) {
				$(this).find('button').show();
			};

			var mouseoutHandler = function f398(e) {
				var _event = e.toElement || e.relatedTarget;
					
				if (container.has(_event).length) {
					return false;
				}

				container.find('button').hide();
			};

			container.hover(hoverHandler).mouseout(mouseoutHandler);		
		},

		setEvents: function f399(editorId) {
			var editor = $(".drop-zone[dropable-event-id='" + editorId + "']");
			var self = this;
			
			var dfd = $.Deferred();
			var images = editor.find('.data-container').find('img');
			
			//method that using the deffered object to know when we finish to load images on dom
			function isFinsihLoad(images, dfd) {
				var i = 0;

				for (var j = 0; j < images.length; ++j) {
					images[j].onload = function f400() {
						++i;

						if (i === images.length) {
							return dfd.resolve();
						} else {
							return dfd.promise();
						}
					}
				}

				return dfd.promise();
			}

			$.when(isFinsihLoad(images, dfd)).then(function f401() {
				editor.find('.data-container').each(function f402() {
					self.handleOver($(this).find('button'), $(this), self);	
				});
			});

			this.initContentChange(editorId);
		},

		initContentChange: function f403(editorId) {
			var editor = $(".drop-zone[dropable-event-id='" + editorId + "']"),
				self = this;

			if (!editor.length) {
				return false;
			}

			editor.each(function f404() {
				var current = $(this);

				current.bind('keyup', function f405() {
					if (!this.lastChild || this.lastChild.nodeName.toLowerCase() != "br") {
						$(this).append($("<br>"));
					}

					self.controller.onDropContent($(this).attr('dropable-event-id'), $(this).attr('dropable-content-id'), $(this).html());
				}).keypress(function f406(e) {
					if (e.which == 13) {
						if (window.getSelection) {
							var selection = window.getSelection(),
							range = selection.getRangeAt(0),
							br = document.createElement("br");
							range.deleteContents();
							range.insertNode(br);
							range.setStartAfter(br);
							range.setEndAfter(br);
							range.collapse(false);
							selection.removeAllRanges();
							selection.addRange(range);
							self.controller.onDropContent($(this).attr('dropable-event-id'), $(this).attr('dropable-content-id'), $(this).html());
							return false;
						}
					}
				});
			});
		},

		render: function() {
			this._super($("#editors"));
		}
	}, {type: 'ConvertEditorsView'});

	return ConvertEditorsView;

});
