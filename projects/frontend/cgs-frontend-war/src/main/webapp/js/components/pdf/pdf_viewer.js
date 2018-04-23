/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/* Copyright 2012 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define(['lodash', 'jquery', 'canvas_blob'], function f1746(_, $) {

    var DEFAULT_SCALE = 'auto';
    var DEFAULT_SCALE_DELTA = 1.1;
    var UNKNOWN_SCALE = 0;
    var CSS_UNITS = 96.0 / 72.0;
    var SCROLLBAR_PADDING = 40;
    var VERTICAL_PADDING = 5;
    var MIN_SCALE = 0.25;
    var MAX_SCALE = 4.0;
    var IMAGE_DIR = './images/';
    var SETTINGS_MEMORY = 20;
    var ANNOT_MIN_SIZE = 10;

    var mozL10n = document.mozL10n || document.webL10n;
    var currentPageNumber = 1;

    var PDFView = {
        pages: [],
        thumbnails: [],
        currentScale: UNKNOWN_SCALE,
        currentScaleValue: null,
        initialBookmark: document.location.hash.substring(1),
        startedTextExtraction: false,
        pageText: [],
        container: null,
        thumbnailContainer: null,
        initialized: false,
        fellback: false,
        pdfDocument: null,
        sidebarOpen: false,
        pageViewScroll: null,
        thumbnailViewScroll: null,
        isFullscreen: false,
        previousScale: null,
        pageRotation: 0,
        mouseScrollTimeStamp: 0,
        mouseScrollDelta: 0,
        lastScroll: 0,
        _config: { /* initialize configuration for pdf dialog caching*/
        },
        _dom_configuration: {},

        // called once when the document is loaded
        initialize: function pdfViewInitialize() {
            var hash = window.location.hash.replace('#', '');
            var get_params = hash.split('_');
            var startFrom, limit;

            if (!get_params.length || get_params.length < 2) {
                startFrom = 0;
                limit = 9;
            } else {
                startFrom = parseInt(get_params[0]) + 1;
                limit = parseInt(get_params[1]);
            }

            this.start = startFrom;
            this.limit = limit;

            this.currentIndex = this.start;
        },
        initialize_document_set_configuration: function f1747(handler, container, scale, password, ranges, pagesCount, pdfDocument) {
            this._config.handler = handler;
            this._config.container = container;
            this._config.scale = scale;
            this._config.password = password;
            this._config.ranges = ranges;

            this._total_rendered_pages = this._total_rendered_pages || pagesCount || null;

            if (pdfDocument) {
                PDFView.pdfDocument = pdfDocument;
            }
        },
        initialize_dom_configuration: function f1748() {
            this.pageContainer = $("#pageContainer");
            this.textCanvas = $("#textCanvas");
            this.textLayer = $("#html_layer");
            this.textLayerFrag = $("<div></div>");
        },
        initialize_document_handling: function f1749(pdfDocument, ranges, _initialize_deffered) {
            this._config.pdfDocument = pdfDocument;
            this._config._total_pages = pdfDocument.numPages;

            PDFView.documentFingerprint = this._config._pdf_document_id = pdfDocument.id;


            this._promises = [];
            this._not_found_pages = [];
            this._total_rendered_pages = null;
            this._dialog_notification = null;
            this._all_promises_binding = null;
            this._all_promises_done = null;

            if (_.isArray(this._config.ranges)) {
                _.each(this._config.ranges, function f1750(page) {
                    if (page <= this._config._total_pages) {
                        this._promises.push(this._config.pdfDocument.getPage(page));
                    } else {
                        this._not_found_pages.push(page);
                    }
                }, this);

                this._total_rendered_pages = this._promises.length;

                if (this._not_found_pages.length === ranges.length) {
                    this._dialog_notification = "<span class=\"red\">No pages found in PDF</span>";
                    this._refresh_dialog = true;
                } else {
                    if (this._not_found_pages.length) {
                        if (this._not_found_pages.length > 1) {
                            this._dialog_notification = "Those pages not found <span class=\"red\">" + this._not_found_pages.join(", ") + "</span>";
                        } else {
                            this._dialog_notification = "This page not found <span class=\"red\">" + this._not_found_pages[0] + "</span>";
                        }
                    }
                }
            } else {
                this._total_rendered_pages = this._config._total_pages;

                for (var i = 1; i <= this._config._total_pages; i++) {
                    this._promises.push(this._config.pdfDocument.getPage(i));
                }
            }
            try {
                this._all_promises_binding = Promise.all(this._promises);
            } catch (e) {
                return;
            }
            this._all_promises_binding.then(function f1751(promisedPages) {
                this._all_promises_done = promisedPages;
                this.initialize_document_done(this, this._all_promises_done, _initialize_deffered, this._total_rendered_pages, this._config.pdfDocument);
            }.bind(this));
        },
        initialize_document_done: function f1752(context, result, dfd, pagesCount, pdfDocument) {
            return dfd.resolveWith(context, [result, pagesCount, pdfDocument]);
        },
        initialize_document: function f1753(data, ranges, _initialize_deffered) {
            PDFJS.getDocument(data).then(function f1754(pdfDocument) {
                this.initialize_document_handling.call(this, pdfDocument, ranges, _initialize_deffered)
            }.bind(this));
        },
        getOutputScale: function pdfViewGetOutputDPI() {
            if (!window) return;

            var pixelRatio = 'devicePixelRatio' in window ? window.devicePixelRatio : 1;
            return {
                sx: pixelRatio,
                sy: pixelRatio,
                scaled: pixelRatio != 1
            };
        },
        getPageView: function f1755(container, page, index, scale, stats) {
            return new PageView(container, page, index, scale,
            stats, $.noop, this.pageContainer);
        },
        disposeView: function () {
            $("#canvas_page_" + this.view.pdfPage.pageInfo.pageIndex).remove();

            this.view.pdfPage.objs.clear();
            this.view.pdfPage.destroy();

            delete this.view;
        },
        onRenderViewComplete: function () {
            if ( this.deferred.state() === 'pending' ) return;

            if (this._config.handler && typeof (this._config.handler) === 'function') {
                this._config.handler($("#canvas_page_" + this.view.pdfPage.pageInfo.pageIndex).get(0), this.textLayer.html(), this._total_rendered_pages, function () {
                    ++this.currentIndex;

                    this.disposeView();
                    this.renderAll(this.pages, this.deferred);
                }.bind(this));
            }

        },
        renderAll: function f1756(promisedPages, dfd) {
            if (this.currentIndex === this._total_rendered_pages) {
                delete this.pages;

                return dfd.reject();
            }


            this.pages = promisedPages;
            this.view = this.getPageView(this._config.container, this.pages[this.currentIndex], this._config.ranges[this.currentIndex] || (this.currentIndex + 1), this._config.scale);
            this.deferred = new $.Deferred
            this.renderObject = this.renderView(this.view, 'page', this.deferred, this.textLayerFrag, this.textCanvas);


            return $.when(this.renderObject).
            done(this.onRenderViewComplete.bind(this));
        },
        renderView: function pdfViewRender(view, type, dfd, textLayerFrag, textCanvas) {
            return view.draw(null, dfd, textLayerFrag, textCanvas);
        }
    };


    var PageView = function pageView(container, pdfPage, id, scale,
    stats, navigateTo, div) {
        this.id = id;
        this.pdfPage = pdfPage;

        this.rotation = 0;
        this.scale = scale || 1.0;
        this.viewport = this.pdfPage.getViewport(this.scale, this.pdfPage.rotate);

        this.textContent = null;
        this.textLayer = null;

        var pageWidth = Math.floor(this.viewport.width);
        var pageHeight = Math.floor(this.viewport.height);

        if (div.css('width') !== pageWidth) {
            div.css('width', pageWidth);
        }

        if (div.css('height') !== pageHeight) {
            div.css('height', pageHeight);
        }

        this.destroy = function pageViewDestroy() {
            this.pdfPage.destroy();
        };

        this.width = this.viewport.width;
        this.height = this.viewport.height;

        this.getPagePoint = function f1759(x, y) {
            return this.viewport.convertToPdfPoint(x, y);
        };

        this.getTextContent = function f1760() {
            if (!this.textContent) {
                this.textContent = this.pdfPage.getTextContent();
            }
            return this.textContent;
        };

        this._render_helper = function f1761(textLayer, textLayerDiv, dfd) {
            if (textLayer) {
                this.getTextContent().then(function f1762(textContent) {
                    textLayerDiv.empty();
                    textLayer.setTextContent(textContent);
                    dfd.resolve();
                });
            } else {
                dfd.resolve();
            }

        };
        this.draw = function f1763(callback, dfd, textLayerFrag, textCanvas) {
            textLayerFrag.empty();

            var textLayerDiv;
            var canvas_ref = $("<canvas></canvas>").appendTo('body');
            var ctx = canvas_ref.get(0).getContext('2d');
            var textLayerDiv = $("#html_layer")

            ctx.clearRect(0, 0, 0, 0);

            var textLayer = new TextLayerBuilder(textLayerDiv, this.id - 1, dfd, textLayerFrag, textCanvas);

            var viewport = this.viewport;
            var scale = this.scale;

            var outputScale = PDFView.getOutputScale();

            var cWidth = Math.floor(viewport.width) * (outputScale && outputScale.sx) || 1;
            var cHeight = Math.floor(viewport.height) * (outputScale && outputScale.sy) || 1;

            canvas_ref.attr({
                'width': cWidth,
                    'height': cHeight,
                    'mozopaque': true,
                    'id': 'canvas_page_' + this.pdfPage.pageInfo.pageIndex
            });



            if (outputScale && outputScale.scaled) {
                var cssScale = 'scale(' + (1 / outputScale.sx) + ', ' + (1 / outputScale.sy) + ')';
                canvas_ref.css({
                    'transform': cssScale,
                        'transformOrigin': '0% 0%'
                });

                textLayerDiv.css({
                    'transform': cssScale,
                        'transformOrigin': '0% 0%'
                });
            }


            if (outputScale && outputScale.scaled) {
                ctx.scale(outputScale.sx, outputScale.sy);
            }

            ctx.save();
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.fillRect(0, 0, canvas_ref.get(0).width, canvas_ref.get(0).height);
            ctx.restore();

            var renderContext = {
                canvasContext: ctx,
                viewport: this.viewport,
                textLayer: textLayer
            }

            if (this.pdfPage) {
                var renderObj = this.pdfPage.render(renderContext);

                renderObj.promise.then(
                this._render_helper.bind(this, textLayer, textLayerDiv, dfd),

                function pdfPageRenderError(error) {
                    logger.error(logger.category.GENERAL, 'PDF Render Error');
                });


                // this.pdfPage.render(renderContext).promise.then(this._render_helper.bind(this, textLayer, textLayerDiv, dfd));
            }
            return dfd.promise();
        };
    };

    var TextLayerBuilder = function f1764(textLayerDiv, pageIdx, dfd, textLayerFrag, textCanvas) {
        this.textLayerDiv = textLayerDiv;
        this.layoutDone = false;
        this.divContentDone = false;
        this.pageIdx = pageIdx;

        this.canvas_context = textCanvas[0].getContext('2d');

        this.beginLayout = function f1765() {
            this.textDivs = [];
            this.textLayerQueue = [];
            this.renderingDone = false;
        };

        this.endLayout = function f1766() {
            this.layoutDone = true;
            this.insertDivContent();
        };

        this.renderLayer = function f1767() {
            var self = this;
            var textDivs = this.textDivs;
            var textLayerDiv = this.textLayerDiv;

            var textWidth,
            textScale;

            self.canvas_context.restore();
            self.canvas_context.save();
            self.canvas_context.fillStyle = 'rgb(255, 255, 255)';
            self.canvas_context.fillRect(0, 0, 0, 0);
            self.canvas_context.restore();

            _.each(textDivs, function f1768(textDiv) {
                textLayerFrag.append(textDiv);

                self.canvas_context.font = textDiv.css('font-size') + ' ' + textDiv.css('font-family');
                textWidth = self.canvas_context.measureText(textDiv.text()).width;

                if (textWidth > 0) {
                    textScale = textDiv[0].dataset.canvasWidth / textWidth;
                    textDiv.css({
                        'transform': 'scale(' + textScale + ', 1)',
                            'transformOrigin': '0% 0%'
                    })

                    textLayerDiv.append(textDiv);
                }
            });

            this.renderingDone = true;

            textLayerDiv.append(textLayerFrag);

            delete textDivs;
            delete textLayerFrag;
        };
        this.appendText = function f1769(geom) {
            var textDiv = $("<div></div>")

            // vScale and hScale already contain the scaling to pixel units
            var fontHeight = geom.fontSize * geom.vScale;

            textDiv[0].dataset.canvasWidth = geom.canvasWidth * geom.hScale;
            textDiv[0].dataset.fontName = geom.fontName;


            textDiv.css({
                'font-size': fontHeight + 'px',
                    'font-family': geom.fontFamily,
                    'left': geom.x,
                    'top': (geom.y - fontHeight)
            });

            this.textDivs.push(textDiv);
        };

        this.insertDivContent = function f1770() {
            // Only set the content of the divs once layout has finished, the content
            // for the divs is available and content is not yet set on the divs.
            if (!this.layoutDone || this.divContentDone || !this.textContent) return;

            this.divContentDone = true;

            var textDivs = this.textDivs;
            var bidiTexts = this.textContent;
            var bidiText;
            var textDiv;

            for (var i = 0; i < bidiTexts.length; i++) {
                bidiText = bidiTexts[i];
                textDiv = textDivs[i];

                textDiv.text(bidiText.str /* .replace(/\s/g, '') */ );

                textDiv.addClass('pdf-text-element');

                textDiv.css({
                    'direction': bidiText.dir
                })
            }

            this.renderLayer();
        };

        this.setTextContent = function f1771(textContent) {
            this.textContent = textContent;
            this.insertDivContent();
        };
    };

    return PDFView;
});