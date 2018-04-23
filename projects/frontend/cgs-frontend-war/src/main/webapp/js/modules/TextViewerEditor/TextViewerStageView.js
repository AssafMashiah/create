define(['jquery', 'BaseNormalStageContentView', 'rivets', 'events', 'repo', 'translate', 'editMode', 'repo_controllers', 'dialogs', 'localeModel',
        'assets', 'files', 'keyboard', 'components/mathfield/MathField', 'text!modules/TextViewerEditor/templates/TextViewerStagePreview.html', 'FileUpload',
        'mathjax', 'libs/html2Canvas/html2canvas'
    
    ],
    function f1152($, BaseNormalStageContentView, rivets, events, repo, i18n, editMode, repo_controllers, dialogs, localeModel, assets, files, keyboard, MathFieldView, previewTemplate, FileUpload, mathjax) {

        var placeholders = {
            image: 'media/placeholder_inline.png',
            audio: 'media/placeholder.mp3'
        },
            inlineTypes = {
                image: FileUpload.params.image,
                audio: FileUpload.params.audio
            };

        var TextViewerStageView = BaseNormalStageContentView.extend({

            initialize: function f1153(options) {
                if (options.formatter) {
                    this.formatter = true;
                    return;
                }
                this.template = previewTemplate;
                this._super(options);

                var textViewerMenu = _.find(this.controller.config.menuItems, function(mi) {
                    return mi.id == 'menu-button-text-editor'
                }),
                    styleMenu = _.find(textViewerMenu && textViewerMenu.subMenuItems, function(mi) {
                        return mi.id == 'menu-button-text-style'
                    });

                this.styles = styleMenu && _.map(styleMenu.subMenuItems, function f1154(mi) {
                    return mi.args[1].style
                });
                this.courseLocale = repo.get(repo._courseId).data.contentLocales[0];
            },
            //override parent function, because we dont want to render the children
            //(the text viewer has inline objects that we dont want to display as children)
            // Check if stage can be editable (not read only mode)
            showStagePreviewWait: function f1155($parent, previewConfig) {
                this.render($parent);
                if (this.canBeEditable()) {
                    if ( !! this.controller.isTask) {
                        if ( !! previewConfig.bindTaskEvents) {
                            this.bindStageEvents();
                        }

                    } else {
                        if ( !! previewConfig.bindEvents)
                            this.bindStageEvents();
                    }
                }
            },
			showStagePreview: function f1155($parent, previewConfig) {
                if (!window.customizationPackLoading) {
					this.showStagePreviewWait($parent, previewConfig);
					return;
				}
				var self = this;
				(function() {
					var intervalId = setInterval(function() {
						if (!window.customizationPackLoading) {
							clearInterval(intervalId);
							self.showStagePreviewWait.call(self, $parent, previewConfig);
						}
					}, 500);
				})();
			},
            setIframeHeight: function f1156() {
                //select the iframe element and set the body and the document DOM objects
                this.resetDocumentProperties();

                this.iframeWidth = this.iframe.width();
                if(this.iframe.length){
                    
                    $(this.iframe[0].contentWindow).resize(function(ev) {
                        if (this.iframe.width() != this.iframeWidth) {
                            this.setIframeHeight();
                        }
                    }.bind(this));
                }

                var _totalHeight = 0;

                this.body.children().each(function f1157() {
                    var _item = $(this);
					var childrenHeight = _item.children().outerHeight(true);
	                var itemHeight = _item.outerHeight(true);

                    _totalHeight += (itemHeight > childrenHeight) ? itemHeight : childrenHeight;
                });

                _totalHeight += this.body.outerHeight(true) - this.body.outerHeight();

                //   _totalHeight += _.isNumber(parseInt(this.body.css('font-size'))) ? parseInt(this.body.css('font-size')) : 0;

                this.iframe.css('height', _totalHeight);
            },
            measureTextWidth: function f1158(text) {
                var canvasFragment = document.createElement("canvas");
                var context = canvasFragment.getContext('2d');

                context.font = '22px T2K-Ayala';

                return context.measureText(text).width;
            },
            setIframeWidth: function f1159() {

                var imageLoadHandler = function f1160(w, div, img, imagesTotalWidth) {
                    //on image load re-select the width from the element and get the maximum width between the prev width and the current width
                    w = Math.max((div.outerWidth(true) - div.width()) +
                        this.measureTextWidth(div.text()) +
                        imagesTotalWidth +
                        img.outerWidth(true) + 1, w);

                    var bodyMargin = this.body.outerWidth(true) - this.body.width();

                    if (w < parseInt(this.controller.record.data.maxWidth)) {
                        //set the width to body and iframe
                        this.iframe.css('width', w + bodyMargin);
                        this.body.css('width', w + bodyMargin);
                    }

                    return w;
                }
                //select the iframe element and set the body and the document DOM objects
                this.resetDocumentProperties();
                //check that we have iframe and body element
                if (this.iframe && this.body) {
                    //initialize the width and context
                    var w = 0;
                    var self = this;

                    //itreath through the body children
                    $(this.body).children().each(function f1161() {
                        var imagesTotalWidth = 0;
                        //if we have image inside the current element
                        if ($(this).find('img').length) {
                            //wait for the image to load
                            var div = $(this);
                            $(this).find('img').one('load', function f1162() {
                                w = imageLoadHandler.call(self, w, div, $(this), imagesTotalWidth);
                                imagesTotalWidth += $(this).width();
                            }).each(function f1163() {
                                if (this.complete) $(this).load();
                            });
                        } //else {
                        var text = "",
                            nodeWidth = 0;
                        _.each($(this).get(0).childNodes, function f1164(item) {
                            //get mathfield width
                            if (~["MATHFIELDTAG","LATEX","MATHML"].indexOf(item.nodeName)) {
                                nodeWidth += $(item).width();
                                //get all text in the div without text inside mathfield, to calulate the length later
                            } else if (item.nodeName === "#text") {
                                text += item.textContent;
                            } else if (item.nodeName == 'A') {
                                nodeWidth += $(item).width() + 45;
                            }
                        });
                        nodeWidth += $(this).outerWidth( true ) - $(this).innerWidth();
                        //add width of text to mathfield width
                        nodeWidth += parseInt(self.measureTextWidth(text));

                        //get the maximum width between the current element and the previous element
                        w = (w === 0) ? nodeWidth : Math.max(nodeWidth, w);

                        if (w < parseInt(self.controller.record.data.maxWidth)) {
                            //set the iframe and body width
                            var _computed_width = w + ($(this).outerWidth(true) - $(this).width());
                            var _current_width = self.iframe.width();

                            if (_computed_width !== _current_width) {
                                self.iframe.css('width', _computed_width);
                                self.body.css('width', _computed_width);
                            }
                        } else {
                            self.iframe.css('width', self.controller.record.data.maxWidth);
                            self.body.css('width', self.controller.record.data.maxWidth);
                        }
                        //}
                    });
                }
            },
            //bind all menu events to menucmd function
            registerEvents: function f1165() {
                //double click on info baloon loads the info baloon dialog screen
                this._handleInlineElementsEvents(this.body.find(".infoBaloon, .hyperlink"));

                this.body.on("blur", function f1166() {
                    this.saveData(true); // save data without removing the empty mathfields
                    this.setSelectionMode(false);
                }.bind(this));

                //catching the paste event to prevent pasting of rich text from outside (don't want to copy links, etc..)
                this.body.bind('paste', this.handlePaste.bind(this));
            },
            insertElement: function f1167(el, parentNode, attributes, appendToParent) {
                //el is string type parameter for example ("<li></li>") create a fragment of the element
                var jqContext = $(el);

                if (!appendToParent) {
                    var selection = this.document.getSelection();
                    var range = selection.getRangeAt(0);

                    range.setStart(range.startContainer, range.startOffset);
                    range.setEnd(range.endContainer, range.endOffset);

                    jqContext.attr(attributes || {});

                    //assign attributes to the element
                    range.collapse(false);
                    if (["LI", "UL"].indexOf(jqContext.get(0).nodeName) === -1) {
                        range.insertNode(jqContext[0], range.endOffset);
                    } else {
                        jqContext.appendTo(parentNode);
                    }
                } else {
                    jqContext.appendTo(parentNode);
                }

                //return reference to the jQuery element
                return jqContext;
            },
            resetDocumentProperties: function f1168() {
                //get the iframe element
                this.iframe = this.$("#textViewerEditor_" + this.controller.record.id);
                //set the document object
                this.setDocument();
                //set the body element
                this.setBody();
                //set the head element
                this.setHead();
            },
            updateMathMLItem: function(el){

                if (!this.isStartEditing) return;

                // keeping "this" for the scope with "self"
                var self = this;

                // config of the dialog to be created
                var dialogConfig = {
                        closeOutside: false,
                        title: "Edit MathML",
                        content: {
                            text: ""
                        },
                        data: {
                            markup: el.attr('markup')
                        },
                        buttons: {
                            save: {
                                label: 'Save'
                            },
                            cancel: {
                                label: 'Cancel'
                            }
                        }
                    },
                    // settings type of the dialog
                    dialog_type = "mathMLDialog";

                // binding listener for dialog response
                events.register('onDialogResponse', function f1170(response) {

                    // once the event is fired, unbinding the listener
                    events.unbind('onDialogResponse');

                    // Convert the wiris mathml to image
                    if (response.text) {
                        this.createMathMlImage(el, response.text, true);
                    }
                }, this);

                // craeting the dialog
                return dialogs.create(dialog_type, dialogConfig, 'onDialogResponse');
            },
            updateLatexItem: function f1169(el) {
                if (!this.isStartEditing) return;

                var dialogConfig = {
                    closeOutside: false,
                    title: "Edit LaTEX",
                    content: {
                        text: "Edit your LaTEX"
                    },
                    data: {
                        markup: el.attr('markup').replace( /(^\$\$|\$\$$)/g , "" )
                    },
                    buttons: {
                        yes: {
                            label: 'OK'
                        },
                        cancel: {
                            label: 'Cancel'
                        }
                    }
                },
                    _dialog_type = "latexdialog";

                events.register('onDialogResponse', function f1170(response) {
                    events.unbind('onDialogResponse');

                    if (response !== "cancel") {
                        if (response) {
                            response = "$$" + response.trim().replace(/\n/g, "").replace(/\r/g, "").replace( /(^\$\$|\$\$$)/g , "" ).replace( /(^\\\[|\\\]$)/g , "" ) + "$$";

                            repo.startTransaction();

                            var _latex = $("<latex></latex>").css({
                                display: "inline-block",
                                fontSize: "75%",
                                '-webkit-user-select': 'none',
                                'cursor': 'pointer',
                                'vertical-align': 'middle',
                                'direction': 'ltr',
                                'background-color': 'transparent'
                            }).attr({
                                    markup: response,
                                    contenteditable: false
                                }).text(response);

                            el.replaceWith(_latex);

                            mathjax.Hub.Queue(["Typeset", mathjax.Hub, _latex.get(0),
                                function f1171() {
                                    this.update_text_viewer_dimensions();
                                    this.setLatexToImage.call(this, _latex, response);
                                    //this.setIframeHeight();
                                }.bind(this)
                            ]);
                        }
                    }
                }, this);

                return dialogs.create(_dialog_type, dialogConfig, 'onDialogResponse');
            },
            setLatexToImage: function f1172(el, markup) {
                el.css({
                    'padding-top': '9px',
                    'padding-right': '8px',
                    'padding-bottom': '8px'
                });

                var latexContainer = el.find('[style*="absolute"]').sort(function() { return -$(this).outerWidth() }).first(),
                    formulaWidth = latexContainer.outerWidth(),
                    formulaParent = latexContainer;

                while (formulaParent.length && formulaParent[0].tagName.toLowerCase() != 'latex') {
                    formulaParent.width(Math.max(formulaParent.width(), formulaWidth));
                    formulaParent = formulaParent.parent();
                }

                el.width(Math.max(el.width(), formulaWidth));

                html2canvas( [ el.get(0) ], {
                    logging: true,
                    doc: this.document,
                    onrendered: function(canvas) {
                        canvas.toBlob(_.bind(function f1173(blob) {
                            assets.uploadBlobAndSaveItLocally(blob, function f1174(imagePath) {
                                el.empty();

                                var _img = $("<img />");

                                var _component_src = imagePath;

                                _img.attr({
                                    type: 'latex',
                                    'class': 'component',
                                    markup: markup,
                                    src: assets.serverPath(imagePath),
                                    component_src: _component_src,
                                    naturalWidth: canvas.width,
                                    naturalHeight: canvas.height
                                }).on('dragstart', function f1175(e) {
                                    return e.preventDefault();
                                })

                                _img.css({
                                    'vertical-align': 'middle'
                                });

                                el.css({
                                    height: canvas.height,
                                    width: canvas.width,
                                    'padding-top': '0px'
                                });

                                el.append(_img);

                                // &nbsp; patch for caret
                                /<\/latex>(&nbsp;)+/.test( el.parent().html() ) || el.append( "&nbsp;" );

                                _img.on('click', function f1176(e) {
                                    this.updateLatexItem($(e.target));
                                }.bind(this));

                                _img.unwrap();

                                _img.one("load", function f1177() {
                                    this.update_text_viewer_dimensions();
                                    this.saveData(true);
                                    repo.endTransaction();
                                }.bind(this));

                                var parentContents = _img.parent().contents(),
                                    imgIndex = parentContents.index(_img);

                                if (parentContents.length > imgIndex + 1) {
                                    if (!parentContents.eq(imgIndex + 1).text().trim()) {
                                        this.setCaretPositionEnd(parentContents.eq(imgIndex + 1), document.getSelection());
                                    }
                                    else {
                                        this.setCaretPositionStart(parentContents.eq(imgIndex + 1), document.getSelection());
                                    }
                                }

                                this.saveAndValidate();
                            }.bind(this));
                        }, this));
                    }.bind(this),
                    background: undefined
                });
            },
            createMathMlImage: function(el, markup, isUpdate) {
                markup = markup.replace(/[\n\r]/g , "");

                var mathmlWrapper = $('<mathml/>', {
                    class: 'mathmlWrapper',
                    markup: markup,
                    css: {
                        display: "inline-block",
                        fontSize: "75%",
                        '-webkit-user-select': 'none',
                        'cursor': 'pointer',
                        'vertical-align': 'middle',
                        'direction': 'ltr',
                        'background-color': 'transparent'
                    },
                    html: i18n.tran("textViewer.mathMl.loading")
                });

                if (isUpdate) {
                    el.replaceWith(mathmlWrapper);
                } else { // isAppend
                    this.insertElement(mathmlWrapper, el);
                }

                this.update_text_viewer_dimensions();

                repo.startTransaction();

                // Get the image from the wiris render service on server and save to filesystem
                var onImageUploadedToServer = function (imagePath) {
                        mathmlWrapper.empty();

                        var _img = $("<img />"),
                            _pid = require('userModel').getPublisherId(),
                            _courseId = require('courseModel').getCourseId();

                        // cleaning the URL to make it relative to the domain
                        var _component_src = imagePath;

                        _img.attr({
                            type: 'MathML',
                            'class': 'component',
                            markup: markup,
                            src: assets.serverPath(imagePath),
                            component_src: _component_src
                        }).one('load', function (e) {
                            var width = e.target.naturalWidth;
                            var height = e.target.naturalHeight;
                            $(e.target).attr({
                                naturalWidth: width,
                                naturalHeight: height
                            });

                            mathmlWrapper.css({
                                width: width,
                                height: height,
                                'padding-top': '0px 4px 4px 0px'
                            });

                            this.update_text_viewer_dimensions();
                            this.saveData(true);
                            repo.endTransaction();
                            logger.debug(logger.category.EDITOR, {
                                message: 'MathML Png downloaded and loaded successfully',
                                markup: markup
                            });
                        }.bind(this))
                            .on('dragstart', function f1175(e) {
                                return e.preventDefault();
                            });

                        _img.css({
                            'vertical-align': 'middle'
                        });

                        mathmlWrapper.append(_img);

                        // &nbsp; patch for caret
                        /<\/mathml>(&nbsp;)+/.test(mathmlWrapper.parent().html()) || mathmlWrapper.append("&nbsp;");

                        // settings click event listener to the element to allow editing its content
                        _img.on('click', function f1176(e) {
                            this.updateMathMLItem($(e.target));
                        }.bind(this));

                        _img.unwrap();

                        var parentContents = _img.parent().contents(),
                            imgIndex = parentContents.index(_img);

                        if (parentContents.length > imgIndex + 1) {
                            if (!parentContents.eq(imgIndex + 1).text().trim()) {
                                this.setCaretPositionEnd(parentContents.eq(imgIndex + 1), document.getSelection());
                            }
                            else {
                                this.setCaretPositionStart(parentContents.eq(imgIndex + 1), document.getSelection());
                            }
                        }

                        this.saveAndValidate();
                }.bind(this);

                var onImageDownloadedFromWiris = function(blobbedIimage){
                    assets.uploadBlobAndSaveItLocally(blobbedIimage, onImageUploadedToServer);
                };

                logger.debug(logger.category.EDITOR, {message: 'Downloading MathML Png using /WIRISeditor/render', markup: markup});

                files.downloadFileToMemory({
                    url: '/WIRISeditor/render?centerBaseline=false&mml={0}'.format(encodeURIComponent(markup)),
                    callback: onImageDownloadedFromWiris
                });
            },
            methods: {
                'insertMathML': {
                    callback: function(response, parentNode){
                        if (response.text) {
                            this.createMathMlImage($(parentNode), response.text, false);
                        }
                    },
                    type: 'dialog',
                    name: 'mathMLDialog',
                    dialogConfig: {
                        title: 'Create MathML markup',
                        /*
                        content: {
                            text: 'Use editor to create MathML markup'
                        },
                        */

                        buttons: {
                            save: {
                                label: 'Save'
                            },
                            cancel: {
                                label: 'Cancel'
                            }
                        }
                    },
                    onDialogResponse: function(response, callback){
                        response && response !== 'cancel' && callback.call(this, response);
                    }
                },
                'insertLatex':  {
                    callback: function f1178(response, parentNode) {
                        //response = response.replace(/\n/g, "").replace(/\r/g, "");
                        response = "$$" + response.trim().replace(/\n/g, "").replace(/\r/g, "").replace( /(^\$\$|\$\$$)/g , "").replace( /(^\\\[|\\\]$)/g , "" ) + "$$";

                        repo.startTransaction();

                        var _latex_wrapper = this.insertElement('<latex />', parentNode, {
                            markup: response
                        });


                        _latex_wrapper.css({
                            display: "inline-block",
                            fontSize: "75%",
                            '-webkit-user-select': 'none',
                            'cursor': 'pointer',
                            'direction': 'ltr',
                            'vertical-align': 'middle',
                            'background-color': 'transparent'
                        });



                        _latex_wrapper.text(response);

                         mathjax.Hub.Config({
                            "HTML-CSS": {
                                scale: 110,
                                minScaleAdjust: 100
                            }
                        });


                        mathjax.Hub.Queue(["Typeset", mathjax.Hub, _latex_wrapper.get(0),
                            function f1179() {
                                _latex_wrapper.css('width', Math.max.apply(Math, _latex_wrapper.find("*:not(script)").map(function () { return $(this).width() }).get()));

                                this.update_text_viewer_dimensions();
                                this.setLatexToImage.call(this, _latex_wrapper, response);
                            }.bind(this)
                        ]);


                    },
                    type: "dialog",
                    name: "latexdialog",
                    dialogConfig: {
                        title: "Insert LaTEX Markup",
                        content: {
                            text: "Enter LaTEX markup in the text area."
                        },
                        buttons: {
                            yes: {
                                label: 'OK'
                            },
                            cancel: {
                                label: 'Cancel'
                            }
                        }
                    },
                    onDialogResponse: function f1180(response, continueCallback, type) {
                        if (response && response !== "cancel") {
                            continueCallback.call(this, response);
                        }
                    }
                },
                'insertInlineImage': {
                    callback: function f1181(objResponse, parentNode) {
                        // Check if it's just order id - insert default image without component_src
                        var response = objResponse[this.courseLocale],
                            self = this;

                        if (!_.isObject(response)) return;

                        if (response.isOrder) {
                            var ph = placeholders['image'],
                                filename = ph.substr(ph.lastIndexOf('/') + 1);

                            files.downloadFileToMemory({
                                url: ph,
                                
                                callback: function f1182(blob) {
                                    assets.uploadBlobAndSaveItLocally(blob, function(placeholderPath){

                                        this.insertElement('<img />', parentNode, {
                                            type: 'inlineImage',
                                            'class': 'component',
                                            src: assets.serverPath('/' + placeholderPath),
                                            component_src: '/' + placeholderPath,
                                            height: '32px',
                                            assetId: response.assetId,
                                            state: 'false',
                                            notes: response.notes
                                        }).one('load', function f1183(event) {
                                            $(this).attr('naturalWidth', event.target.naturalWidth);
                                            $(this).attr('naturalHeight', event.target.naturalHeight);
                                            self.setIframeHeight();// set only height because set width function reloads the img, causing an endless loop
                                            self.saveData(true);
                                        });
                                        this.update_text_viewer_dimensions(); // update width + height after loadin order img
                                    }.bind(this));
                                }.bind(this)
                            });
                        } else {
                           this.insertElement('<img />', parentNode, {
                                type: 'inlineImage',
                                'class': 'component',
                                src: assets.serverPath(response.src),
                                component_src: response.src,
                                height: '32px'
                            }).one('load', function f1184(event) {
                                $(this).attr('naturalWidth', event.target.naturalWidth);
                                $(this).attr('naturalHeight', event.target.naturalHeight);
                                self.setIframeHeight();// set only height because set width function reloads the img, causing an endless loop
                                self.saveData(true);
                            });
                        }


                    },
                    type: "dialog"
                },
                'insertSoundButton': {
                    callback: function f1185(objResponse, parentNode) {
                        // Check if it's just order id - insert sound image without component_src
                         var response = objResponse[this.courseLocale];

                        if (!_.isObject(response)) return;

                        if (response.isOrder) {
                            var ph = placeholders['audio'],
                                filename = ph.substr(ph.lastIndexOf('/') + 1);

                            files.downloadFileToMemory({
                                url: ph,
                                callback: function f1186(blob) {
                                    assets.uploadBlobAndSaveItLocally(blob, function(placeholderPath){
                                        this.insertElement('<img />', parentNode, {
                                            type: 'inlineSound',
                                            'class': 'component sound_icon',
                                            component_src: '/' + placeholderPath,
                                            assetId: response.assetId,
                                            state: 'false',
                                            notes: response.notes
                                        });
                                        this.update_text_viewer_dimensions(); // update width + height after loadin order img
                                        this.saveData(true);
                                    }.bind(this));
                                }.bind(this)
                            });
                        } else {
                            this.insertElement('<img />', parentNode, {
                                type: 'inlineSound',
                                'class': 'component sound_icon',
                                component_src: response.src
                            });
                            this.saveData(true);
                        }
                    },
                    type: "dialog"
                },
                'insertNarration': {
                    callback: function f1187(response, parentNode, options) {
                        // Check if it's just order id - insert sound image without component_src

                        if (_.size(response) === 0) return;

                        var self = this;

                        var ph = placeholders['audio'];
                            filename = ph.substr(ph.lastIndexOf('/') + 1);

                            /*this is the expected path of the file, after it will be uploaded to the server
                            we are not wiating to the response from the server before assigning the path to the element
                            because that the function is sync, and making it async is too problematic*/
                        var expectedPathAtServer = "/media/c3/a8/c3a8340ff003e02bd893cf05c7caa6fcbef1c269.mp3";

                        var defaultsOrderAttributes = {
                            isNarration: true
                        };

                        var component_narrations = {};

                        var placeholderDownload = false;

                        var narrationElement = null;
                        var narrationParent = $("<narration />");
                        var narrationActions = {
                            'remove': $("<button />"),
                            'edit': $("<button />")
                        };

                        var narrationActionsGroup = $("<div />");

                        _.each(response, function (narrationItem) {
                            if (_.isObject(narrationItem)) {
                                if (narrationItem.isUpload) {
                                    component_narrations[narrationItem.locale] = {
                                        component_src: narrationItem.src,
                                        locale: narrationItem.locale,
                                        asIs: !!narrationItem.asIs,
                                        srcAttr: 'component_src',
                                        origin: narrationItem.origin,
                                        narrationText: narrationItem.narrationText
                                    }
                                } else if (narrationItem.isOrder) {
                                    component_narrations[narrationItem.locale] = _.extend({
                                        assetId: narrationItem.assetId,
                                        notes: narrationItem.notes,
                                        state: !!narrationItem.state,
                                        asIs: !!narrationItem.asIs,
                                        locale: narrationItem.locale,
                                        origin: narrationItem.origin,
                                        srcAttr: 'component_src',
                                        narrationText: narrationItem.narrationText
                                    }, _.clone(defaultsOrderAttributes));

                                    if (!narrationItem.src) {

                                        component_narrations[narrationItem.locale].component_src = expectedPathAtServer;

                                        if (!placeholderDownload) {
                                            //download once the placeholder and save it at server
                                            files.downloadFileToMemory({
                                                url: ph,
                                                callback: function f1186(blob) {
                                                    assets.uploadBlobAndSaveItLocally(blob, function(placeholderPath){
                                                    });
                                                }
                                            });

                                            placeholderDownload = true;
                                        }
                                    } else {
                                        component_narrations[narrationItem.locale].component_src = narrationItem.src;
                                    }
                                }
                            }
                        });

                            narrationActionsGroup.addClass('actionsGroup');
                            narrationParent.attr('contenteditable', false);

                            if (options && options.override) {
                                narrationElement = options.el;

                                narrationElement.attr('narrations', JSON.stringify(component_narrations));
                            } else {
                                narrationElement = this.insertElement('<img />', parentNode, {
                                                                                type: 'inlineNarration',
                                                                                'class': 'component narration_icon',
                                                                                'narrations': JSON.stringify(component_narrations)
                                                                            });

                                narrationParent = narrationElement.wrap(narrationParent).parent();

                                narrationActions.remove.append($("<span />").attr(
                                        {
                                            'class': 'icon-trash base-icon'
                                        }
                                ))

                                narrationActions.edit.append($("<span />").attr(
                                        {
                                            'class': 'icon-cog base-icon'
                                        }
                                ))



                                narrationActions.remove.addClass('btn remove-narration');
                                narrationActions.remove.on('click', function (e) {
                                    $(this).parents('.actionsGroup').hide();

                                    var dialogConfig = {
                                        closeOutside: false,
                                        title: "Narration Button - Delete",
                                        content: {
                                            text: "Are you sure you want to delete the Narration button?"
                                        },
                                        buttons: {
                                            yes: {label: 'OK'},
                                            cancel: {label: 'Cancel'}
                                        }
                                    };

                                    dialogs.create('simple', dialogConfig, 'onDialogResponse');

                                    events.once('onDialogResponse', function f1170(response) {

                                        if (response === "yes") {
                                            narrationParent.remove();
                                        }
                                    });
                                });

                                narrationActions.edit.on('click', function (e) {
                                    this.menuCmd('insertNarration', null, {
                                        override: true,
                                        el: narrationParent.find('img'),
                                        dialogOptions: {
                                            editMode: true,
                                            narrations: JSON.parse(narrationParent.find('img').attr('narrations'))
                                        }
                                    });

                                    $(e.target).parents('.actionsGroup').hide();
                                }.bind(this));

                                narrationActions.edit.addClass('btn edit-narration');

                                narrationActionsGroup.append(narrationActions.remove)
                                                .append(narrationActions.edit);

                                narrationParent.append(narrationActionsGroup);

                                narrationParent.on('mouseover', function (e) {
                                    if (!self.isStartEditing) return;
                                    self.setNarrationActionsGroupLocation(narrationActionsGroup);
                                    narrationActionsGroup.show();
                                }).on('mouseout', function (e) {
                                    if (!e.toElement || !$(e.toElement).parent('.actionsGroup').length) {
                                        if (!self.isStartEditing) return;
                                        narrationActionsGroup.hide();
                                    }
                                });

                                narrationParent.after("&nbsp;");
                            }

                        this.saveData();

                    },
                    type: "dialog"
                }
            },
			//place the inline narration buttons according to the narration location inside the TVE
            setNarrationActionsGroupLocation: function(narrationActionsGroupElement){
                var narrationIcon = narrationActionsGroupElement.parent();
                var TVEWidth = this.body.width();
                var narrationActionsGroupWidth = narrationActionsGroupElement.width();

                if(narrationActionsGroupElement.width() +
                narrationIcon.width() +
                narrationIcon.offset().left > TVEWidth){
                    narrationActionsGroupElement.css('left', '-45px');
                }else{
                    narrationActionsGroupElement.css('left', '32px');
                }




            },
            getSelectionType: function f1189() {
                return this.document.getSelection().type;
            },
            update_text_viewer_dimensions: function f1190() {
                if (this.controller.record.data.mode === "thin") {
                    this.setIframeWidth();
                }

                this.setIframeHeight();

                if (events.exists('text_viewer_dimensions_updated')) {
                    events.fire('text_viewer_dimensions_updated', this.controller.record.id);
                }
            },
            getMathfieldConfiguration: function (attributes) {
                return _.extend(attributes, {
                    editMode: 'on',
                    autoComma: 'false',
                    validate: 'false',
                    devMode: 'false',
                    maxHeight: 'secondLevel',
                    italicVariables: 'true'
                });
            },
            getMathfieldMarkup: function (mathfieldElem) {
                var mathfieldClass = this.mathfieldArr[mathfieldElem.attr('id')];

                return (mathfieldClass && mathfieldClass.view.getMarkUpValue()) || "";
            },
            getMathfieldWidthEM: function (mathfieldElem) {
                var mathfieldClass = this.mathfieldArr[mathfieldElem.attr('id')];

                return mathfieldClass && mathfieldClass.view.getWidthEM();
            },
            removeMathfield: function (mathfieldElem) {
                var mathfieldClass = this.mathfieldArr[mathfieldElem.attr('id')];

                mathfieldClass.dispose();

                delete this.mathfieldArr[mathfieldElem.attr('id')];

                mathfieldElem.unbind()
                mathfieldElem.remove();
            },


            //all events that are fired from the menu
            menuCmd: function f1191(command, param, options) {

                this.saveData(true);

                //reset the iframe dom element if we call stop editing and commands still work's
                this.resetDocumentProperties();

                //get the document selection
                var selection = this && this.document && this.document.getSelection() || null;
                var parentNode;

                //check if the type of the selection is Caret(no text selected only the symbol of writing text)
                //or range of text selected
                if (selection && selection.type && ['Caret', 'Range'].indexOf(selection.type) !== -1) {
                    //check if the parent node is valid (Paragraph) and not #textNode
                    //if textNode will return the parent node
                    parentNode = selection.focusNode.nodeName === 'DIV' ? selection.focusNode : selection.focusNode.parentNode;
                } else {
                    //if the selection type is none we go on the body
                    if (!selection || selection.type === 'None') {
                        parentNode = this.body[0];
                    }
                }

                if (!this.selectedMathfield) {
                    //case the selection is none the node name will be body and not [DIV]
                    if (parentNode && parentNode.nodeName !== "DIV") {
                        //check for any case that we on the body element
                        if (parentNode.nodeName === "BODY") {
                            //check that the body has only one children (if we on new editor mode)
                            if ($(parentNode).children().length) { // ==1
                                //take the first node from the body
                                parentNode = $(parentNode).children().first();
                            } else {
                                throw 'No paragraph selected';
                                return false;
                            }
                        }
                    }

                    //no parent node no commands!
                    if (!parentNode || !$(parentNode).length) {
                        throw 'No paragraph inside text viewer';
                        return false;
                    }
                }


                var handleMathField = function f1192() {

                    var selection = this.document.getSelection();
                    var focusNode = selection.anchorNode;
                    var self = this;
                     var range = selection.getRangeAt(0);


                    if (selection.type === 'Range') return;

                    if (focusNode.parentNode.nodeName === "MATHFIELDTAG") {
                        this.setCaretPositionEnd(focusNode.parentNode.nextSibling, selection);
                    }

                    if (focusNode.parentNode.nodeName === 'ANSWERFIELD' || $(focusNode).parents('answerfield').length) {
                        var _answerField = focusNode.parentNode.nodeName === 'ANSWERFIELD'  ? $(focusNode.parentNode) : $(focusNode).parents('answerfield');
                        if (_answerField.attr('type') === 'text') {
                            return false;
                        }
                    }

                    //if the parentNode isn't div we need to search a valid parent
                    if (parentNode.nodeName !== 'DIV') {
                        //bubble up the parents until we find div or return if there is only body
                        while (parentNode.nodeName !== 'DIV') {
                            parentNode = parentNode.parentNode;

                            if (!parentNode || parentNode.nodeName === 'BODY') return;
                        }
                    }

                    //create new mathfield element
                    var mElement = this.insertMathfieldTag(parentNode);
                    var preset = this.controller.getKeyboardPreset(mElement);
                    var attributes = this.getMathfieldConfiguration({
                        keyboardPreset: preset,
                        parentContainer: this.isTableChild() ? $('body') : parentNode,
                        fontLocale: require("localeModel").getConfig("mfConfig").fontLocale,
                    });

                    var mathFieldId = mElement.attr('id');
                    var mf = this.initMathField(mathFieldId, attributes);

                    if (mf) {
                        mf.view.setEnabled(true);
                        this.mathfieldArr[mathFieldId] = mf;
                    }

                    if (mElement.parent().get(0).nodeName === "SPAN") {
                        mElement.parent().contents().each(function f1193() {
                            if (this.nodeName === "#text") {
                                $(this).wrap($(this).parent().clone().empty());
                            } else {
                                $(this).wrap($("<span></span>").attr('moveable', true));
                            }
                        });

                        mElement.parent().parent().contents().each(function f1194() {
                            if ($(this).attr('moveable')) {
                                $(this).contents().unwrap();
                            } else if (this.nodeName === 'SPAN' && this.parentNode.nodeName === 'SPAN') {
                                $(this).unwrap();
                            }
                        });
                    }

                    var fix_spaces = function f1195() {
                        var _contents = mElement.parent().contents();

                        _contents.each(function f1196(index) {
                            if (_contents.get(index).nodeName === "#text" && _contents.get(index).length === 0) {
                                $(_contents.get(index)).remove();
                            }
                        });

                        _contents = mElement.parent().contents();

                        _contents.each(function f1197(index) {
                            if (_contents.get(index + 1)) {
                                if (_contents.get(index + 1).nodeName === 'MATHFIELDTAG' && _contents.get(index).nodeName === 'MATHFIELDTAG') {
                                    $(_contents.get(index)).after('&nbsp;');
                                }
                            }
                        });

                        _contents = mElement.parent().contents();

                        _contents.each(function f1198(index) {
                            if (_contents.get(index).nodeName === "#text" && _contents.get(index).length === 0) {
                                $(_contents.get(index)).remove();
                            }
                        });

                        if (_contents.last().is('MATHFIELDTAG')) {
                            mElement.parent().append('&nbsp;');
                        } else if (_contents.last().is('BR')) {
                            _contents.last().replaceWith("&nbsp;");
                        }

                        if (_contents.first().is('MATHFIELDTAG')) {
                            mElement.parent().prepend('&nbsp;');
                        } else if (_contents.first().is('BR')) {
                            _contents.first().replaceWith("&nbsp;");
                        }
                    };

                    fix_spaces();


                    range.setStartAfter(mElement.get(0));
                    range.setEndAfter(mElement.get(0));
                    selection.removeAllRanges();
                    selection.addRange(range);

                    return mf;
                };

                var handleOrderedList = function f1199(className) {
                    //generate unique id to the list
                    var uniqueId = new Date().valueOf() + '_' + Math.ceil(Math.random() * 1999);
                    //get the document selection
                    var selection = this.document.getSelection();


                    if (!selection) {
                        return false;
                    }

                    //get the selected range node
                    var range = selection.getRangeAt(0);
                    range = range && range.cloneRange();

                    var _focus_node = selection && selection.focusNode;

                    if ($(_focus_node).is("body")) {
                        _focus_node = $(_focus_node).children().first();
                    } else {
                        _focus_node = (_focus_node && _focus_node.nodeName && _focus_node.nodeName !== 'DIV') ? $(_focus_node).parents('div') : $(_focus_node);
                    }



                    var _selected_item = selection.anchorNode.parentNode;

                    if (_selected_item.nodeName === "LI") {
                        var _parent_list = $(_selected_item).closest("ul");
                        var _activeClassName = _parent_list.attr('class');

                        if (_activeClassName !== className) {
                            _parent_list.attr('class', className);
                        }

                        return true;
                    }

                    if (!range) {
                        return false;
                    }

                    function lookup(container) {
                        if (!$(container).is('DIV')) {
                            return $(container).parents('div');
                        } else {
                            return $(container);
                        }
                    }

                    function is_multiparagraph_selection() {
                        var startContaier = lookup(range.startContainer.parentNode).get(0);
                        var endContainer = lookup(range.endContainer.parentNode).get(0);

                        return startContaier && !startContaier.isSameNode(endContainer);
                    };

                    function set_multiparagraph_list() {
                        var firstParagraph = lookup(range.startContainer.parentNode);
                        var endParagraph = lookup(range.endContainer.parentNode);

                        var startIndex = firstParagraph.index();
                        var endIndex = endParagraph.index();

                        var startOffset = range.startOffset;
                        var endOffset = range.endOffset;

                        //wrap all the content of the first paragraph in li
                        firstParagraph.contents().wrapAll($("<li />").attr({
                           'class': 'listItem',
                            'queue': true
                        }));

                        firstParagraph.contents().unwrap();

                        //wrap all the content of the first paragraph in li
                        endParagraph.contents().wrapAll($("<li />").attr({
                           'class': 'listItem',
                            'queue': true
                        }));

                        endParagraph.contents().unwrap();



                        this.body.children().each(function (index , item) {
                            if (index  > startIndex && index < endIndex) {
                                var wrapper = $("<li></li>").attr({
                                    'class': 'listItem',
                                    'queue': true
                                });

                                $(this).wrap(wrapper).contents().unwrap();
                            }
                        });

                        this.body.find('[queue]').wrapAll($(this._default_paragraph_html).attr({ contenteditable: true }).append($("<ul />").attr({
                            type: 'insertOrderedList',
                            'class': className
                        })));

                        this.body.find('[queue]').removeAttr('queue');

                        this.setIframeHeight();

                    }


                    //check that they are exists
                    if (range.startContainer && range.endContainer) {
                        //if they doesn't have the same parent (multi-paragraph selection) will not create the list
                        if (is_multiparagraph_selection()) {
                            if (~['orderedList', 'unOrderedList'].indexOf(className)) {
                                set_multiparagraph_list.call(this);
                            }
                            return false;
                        }
                    }

                    //create ul element
                    var ulElement = $('<ul></ul>').attr({
                        type: 'insertOrderedList',
                        'class': className,
                        'id': uniqueId
                    });

                    var liElement;


                    if (range.startOffset === 0 && range.endOffset === 0) {
                        if (range.startContainer.nodeName !== "#text") {
                             range.selectNodeContents(range.startContainer);
                        }else if (range.endContainer.nodeName !== "#text") {
                            range.selectNodeContents(range.startContainer);
                        }
                    }

                    //check the type of the selection
                    //case we select a range so we need to convert the range to list
                    if (selection.type === "Range" && selection.anchorNode.nodeName === "#text") {
                        //wrap the selected range with li element
                        liElement = this.wrapElement(range, selection, "<li></li>", {
                            'contenteditable': true,
                            'class': 'listItem'
                        });
                        //append the li to ul
                        liElement.wrap(ulElement);
                    } else {
                        if (selection.anchorNode.parentNode.nodeName == "LI") {
                            var currentTextNode = selection.anchorNode.parentNode;
                            var ulParentNode = currentTextNode.parentNode;

                            $(currentTextNode).contents().unwrap();

                            if (ulParentNode.nodeName == "UL" &&
                                ulParentNode.children.length == 0) {
                                if (ulParentNode.textContent.length === 0) {
                                    $(ulParentNode).remove();
                                } else {
                                    $(ulParentNode).contents().unwrap(); // remove ul element
                                }
                            }

                        } else {

                            _focus_node = this.reformat_element_content(_focus_node);

                            range.selectNodeContents(_focus_node.get(0));

                            //create a simple li with no content
                            liElement = this.wrapElement(range, selection, '<li></li>', {
                                'contenteditable': true,
                                'class': 'listItem'
                            }).wrap(ulElement);

                            //set the caret position to the li element
                            this.setCaretPositionEnd(liElement.get(0), selection);
                            //remove shortcuts like ("ctrl + b", "ctrl + i") for custom styling
                            this.styleShorcuts(liElement);
                        }
                    }

                    //set the iframe height
                    this.setIframeHeight();
                };

                /*
                         Methods is an object that contains different types of element creation

                         inlineImage, soundButton, narration

                         all those elements require a dialog first
                         */

                var dialogText = {
                    'insertInlineImage': 'Inline Image',
                    'insertSoundButton': 'Sound Button',
                    'insertNarration': 'Narration'
                };



                //execute the function according to the command
                switch (command) {
                case "addStyle":
                    this.handleSetStyle(param);
                    command = param.style;

                    this.update_text_viewer_dimensions();
                    break;
                case "insertMathField":
                    if (selection.type === "Caret") {
                        var mf = handleMathField.call(this);
                        this.update_text_viewer_dimensions();
                        if (mf && mf.view && mf.view.startEdit) {
                            mf.view.startEdit();
                        }
                    }
                    break;

                case "insertInfoBaloon":
                    this.insertInlineElement(parentNode, 'infoBaloon');
                    break;
                case "insertLink":
                    this.insertInlineElement(parentNode, 'hyperlink');
                    break;
                case "insertOrderedList":
                    handleOrderedList.call(this, "orderedList");
                    this.saveData(true);
                    break;
                case "insertUnorderedList":
                    handleOrderedList.call(this, "unOrderedList");
                    this.saveData(true);
                    break;
                case "insertAnswerField": // use this when inserting an answer field                    
                    this.methods["insertAnswerField"].callback.call(this, param);
                    break;    
                default:
                    if (this.methods[command]) {
                        var method_item = this.methods[command];

                        if (method_item.type === "dialog") {
                            this.insertNewItem(function f1200(response) {
                                method_item.callback.call(this, response, parentNode, options);
                                this.saveData(true);
                                this.update_text_viewer_dimensions();
                            }.bind(this), command, dialogText[command], method_item.name, method_item.onDialogResponse, method_item.dialogConfig, options && options.dialogOptions);
                        } else {
                            method_item.callback.call(this, param);
                        }
                    } else {
                        //if (selection.type !== "Caret") {
                        if (selection.type) {
                            this.handleSetEffect(command);
                            this.update_text_viewer_dimensions();
                        } else {
                            return true;
                        }
                    }
                    break;
                }

                this.setMenu(command);
            },
            insertMathfieldTag: function (parentNode) {
                //get mathfield index
                var idx = this.getNextMathfieldIndex();
                //build mathfield id
                var mathFieldId = this.controller.elementId + "_" + idx;

                return this.insertElement($('<mathfieldTag />').attr({
                    id: mathFieldId,
                    idx: idx,
                    'class': 'mathfieldItem'
                }), parentNode, {}, $(parentNode).is('ANSWERFIELD'));

            },
            clearBreakLines: function f1201() {
                this.body.find('br').remove();
            },
            setCaretPositionEnd: function f1202(targetEl, selection) {
                //get the selected range

                var range = this.document.createRange();


                targetEl = targetEl instanceof jQuery ? targetEl.get(0) : targetEl;
                targetEl && range.selectNodeContents(targetEl); //Select the entire contents of the element with the range
                range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start

                if (selection) {
                    selection.removeAllRanges(); //remove any selections already made
                    selection.addRange(range);
                }

                targetEl && targetEl.focus && targetEl.focus();
            },
            setCaretPositionStart: function f1203(targetEl, selection) {
                //get the selected range

                var range = this.document.createRange();


                targetEl = targetEl instanceof jQuery ? targetEl.get(0) : targetEl;
                targetEl && range.selectNodeContents(targetEl); //Select the entire contents of the element with the range
                range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start

                range.setStart(range.startContainer, 0);
                range.setEnd(range.endContainer, 0);

                if (selection) {
                    selection.removeAllRanges(); //remove any selections already made
                    selection.addRange(range);
                }

                targetEl && targetEl.focus && targetEl.focus();
            },
            clear_empty_text_nodes: function f1204(el) {
                el.contents().each(function f1205(item) {
                    if ($(this).get(0).nodeType === 3 && !$(this).get(0).textContent.length) {
                        $(this).remove();
                    }
                });
            },
            is_text_node: function f1206(el) {
                return el.get(0).nodeName === "#text" ? true : false;
            },

            //helpers for binding key event like Enter/Backspace/ArrowUp/ArrowDown
            keyEventHelpers: {
                /**
                 * enter press!!!
                 * @param e
                 * @param parentElement -> the body tag
                 * @param selection     -> document.selection();
                 * @param elementType
                 * @param jqElement     -> html string of html element
                 * @param cssAttributes -> css attributes
                 * @param domAttribute  -> another dom attributes
                 * @returns {*}
                 */
                8: function f1207(e, parentElement, selection, elementType, jqElement, cssAttributes, domAttribute) {
                    if (!selection || !selection.anchorNode) return;

                    var _range = selection.getRangeAt(0);
                    var self = this;
                    var spaciel_elements_selector = 'MATHFIELDTAG,ANSWERFIELD,IMG,SPAN';

                    var handleListItemBullet = function f1208() {
                        var _anchor = selection.anchorNode.parentNode;

                        var _peregraph = $(_anchor).parents('div');

                        if (_anchor.nodeName === "LI") {
                            if (_range.startOffset === 0) {
                                var _parents_count = $(_anchor).parents("ul").length,
                                    _parent_list_item_count = $(_anchor).parent().children().length,
                                    _index = $(_anchor).index();

                                if (_parents_count === 1) {
                                    if (_parent_list_item_count === 1) {
                                        $(_anchor).contents().unwrap().unwrap();

                                        this.reformat_element_content(_peregraph);
                                    }
                                }
                            }
                        }
                    };



                    handleListItemBullet.call(this);

                    var _get_paragraph = selection.anchorNode.nodeName !== 'DIV' ?
                                        selection.anchorNode.nodeName === "#text" ?
                                            $(selection.anchorNode).closest('DIV') :
                                                $(selection.anchorNode.parentNode).is('DIV') ?
                                                    $(selection.anchorNode.parentNode) :
                                                        $(selection.anchorNode.parentNode).closest('DIV') :
                                                            $(selection.anchorNode);

                    if (selection.anchorNode.nodeName === 'LI' && selection.anchorNode.childNodes.length === 1 && selection.anchorNode.firstChild.nodeName === 'BR') {
                        var cloneParagraph = _get_paragraph.clone().empty();

                        cloneParagraph.append("&nbsp;");
                        cloneParagraph.insertAfter(_get_paragraph);

                        _range.setStart(cloneParagraph.get(0).childNodes[0], 0);
                        _range.setEnd(cloneParagraph.get(0).childNodes[0], 0)

                        $(selection.anchorNode).remove();

                        selection.removeAllRanges();
                        selection.addRange(_range);


                        return e.preventDefault();
                    }

                    this.clear_empty_text_nodes(_get_paragraph);

                    _get_paragraph.find('br').remove();

                    var paragraph_contents = _get_paragraph.contents();

                    if (!paragraph_contents.length) {
                        _get_paragraph.prev().focus();

                        this.setCaretPositionEnd(_get_paragraph.prev().get(0), selection);
                        _get_paragraph.remove();
                        return e.preventDefault();
                    }


                    //fix backspace at offset 0, when spaciel elements are inside (MATHFIELD,ANSWERFIELD,IMG)
                    if (_range.startOffset === 0 && (!_range.startContainer.previousSibling || _range.startContainer.previousSibling.tagName == 'DIV')) {
                        if (_get_paragraph.children(spaciel_elements_selector).size()) {
                            if (_get_paragraph.prev().is('DIV')) {
                                if (_get_paragraph.prev().contents().length) {
                                    _get_paragraph.contents().insertAfter(_get_paragraph.prev().contents().last());
                                    _get_paragraph = _get_paragraph.prev();
                                    _get_paragraph.next().remove();
                                    this.setCaretPositionEnd(_get_paragraph, selection);
                                } else {
                                    _get_paragraph.prev().remove();
                                }

                                if (_get_paragraph.contents().last().is(spaciel_elements_selector)) {
                                    _get_paragraph.append('&nbsp;')
                                }

                                this.setIframeHeight();

                                return e.preventDefault();
                            }
                        }
                    }

                    if (e.keyCode === 8) {
                        if (_range &&
                            //check if we delete the space or the mathfield
                            _range.startOffset > 0 &&
                            _range.endContainer.nodeName === "#text" &&
                            _range.endContainer.nodeValue.match(/^\s$/) &&
                            (!_range.endContainer.previousSibling || $(_range.endContainer.previousSibling).is('MATHFIELDTAG'))) {
                            if (_range.endContainer.previousSibling) {
                                return $(_range.endContainer.previousSibling).remove() && e.preventDefault();
                            }
                        }
                    } else if (e.keyCode === 46) {
                        if (_range &&
                            //check if we delete the space or the mathfield
                            _range.startOffset === 0 &&
                            _range.endContainer.nodeName === "#text" &&
                            _range.endContainer.nodeValue.match(/^\s$/) &&
                            (!_range.endContainer.nextSibling || $(_range.endContainer.nextSibling).is('MATHFIELDTAG'))) {
                            if (_range.endContainer.nextSibling) {
                                return $(_range.endContainer.nextSibling).remove() && e.preventDefault();
                            }
                        }
                    }

                    if (!_get_paragraph.find('img, mathfieldtag, latex').length && _get_paragraph.text().length === 1) {
                        _get_paragraph.contents().replaceWith("<br />");
                        return e.preventDefault();

                    }

                    if ($(_range.endContainer).is('div') && $(_range.endContainer).text().length === 0) {
                        $(_range.endContainer).remove();
                        return e.preventDefault();
                    }

                    if (e.keyCode === 8) {
                        _.delay(this.setMenuFromSelection.bind(this, 50));
                    }
                },
                46: function f1210(e, parentElement, selection, elementType, jqElement, cssAttributes, domAttribute) {
                    return this.keyEventHelpers[8].apply(this, arguments);
                },
                13: function f1211(e, parentElement, selection, elementType, jqElement, cssAttributes, domAttribute) {
                    //get the range
                    var range = selection.getRangeAt(0);

                    //create the required element (Generic function for handling UL/OL/DIV)
                    var wrapper = $(jqElement);

                    //set the attributes for the specific element
                    wrapper.attr(domAttribute);
                    //set the css for the specific element
                    wrapper.css(cssAttributes);

                    //can be useful if we want to get specific type of elements from the editor
                    wrapper.attr('content-type', elementType)

                    //check if we have parent element to append the new line
                    var selectedTarget = selection.anchorNode.nodeName === "#text" ? selection.anchorNode.parentNode : selection.anchorNode;

                    if (selectedTarget.nodeName === "LI" &&
                        selectedTarget.innerHTML.replace(/(\<br\/?\>|\r|\n)/g, '') === "") {
                        var _list_item_parent = $(selectedTarget).parent();
                        var _parent = _list_item_parent.parent();

                        var _list_item_parent_older_sibilings = _parent.contents().filter(function f1212() {
                            return $(this).index() > _list_item_parent.index() && this.nodeName === "#text";
                        });


                        if (_list_item_parent_older_sibilings.length === 0) {
                            if ($(selectedTarget).parents("ul").length === 1) {

                                var _list_item_sibilings = $(selectedTarget).parents("ul").filter(function f1213() {
                                    return $(this).index() > $(selectedTarget).index() && this.nodeName === "LI";
                                });


                                $(selectedTarget).remove();
                                _parent.append("&nbsp;");
                            } else {
                                _parent.append($(selectedTarget).clone());
                                $(selectedTarget).remove();
                            }

                            this.setCaretPositionEnd(_parent.get(0), selection);

                            e.preventDefault();
                        } else {
                            if (_parent.get(0).nodeName === 'DIV') {
                                $(selectedTarget).remove();
                                this.setCaretPositionEnd(_parent.get(0), selection);
                                e.preventDefault();
                            }
                        }
                    }

                    //itreate through the children and remove garbage
                    $(selectedTarget).children().each(function f1214() {
                        if (this.nodeName === 'DIV' || this.nodeName === "BR") {
                            $(this).remove();
                        }
                    });

                    //set the menu according to the selected element
                    _.delay(this.setMenuFromSelection.bind(this, 50));
                    this.setIframeHeight();
                },
                //arrow down handling
                40: function f1215(e, parentElement, selection, elementType, jqElement) {
                    //get the current focus node
                    var focusNode = selection.focusNode && selection.focusNode.nodeName === "#text" && selection.focusNode.parentNode ||
                        selection.focusNode && selection.focusNode.nodeName !== "#text" && selection.focusNode ||
                        false;
                    //collection for checking if the current focus node nodeName is part of the valid elements
                    var nodesCollection = {
                        'paragraph': 'DIV'
                    };
                    if (focusNode && focusNode.nodeName === nodesCollection[elementType]) {
                        //get the next element
                        var nextEl = $(focusNode).next();

                        if (this.controller.record.data.mode === 'thin') {
                            //on thin mode we go 2 steps next because of the be
                            nextEl = nextEl.next();
                        }

                        if (nextEl) {
                            //focus the next line with the caret
                            this.setCaretPositionEnd(nextEl[0], selection, 0);
                        }
                    }

                    _.delay(this.setMenuFromSelection.bind(this, 50));
                },
                //arrow up handling
                38: function f1216(e, parentElement, selection, elementType, jqElement) {
                    //get the current focus node
                    var focusNode = selection.focusNode && selection.focusNode.nodeName === "#text" && selection.focusNode.parentNode ||
                        selection.focusNode && selection.focusNode.nodeName !== "#text" && selection.focusNode ||
                        false;

                    //collection for checking if the current focus node nodeName is part of the valid elements
                    var nodesCollection = {
                        'paragraph': 'DIV'
                    };

                    if (focusNode && focusNode.nodeName === nodesCollection[elementType]) {
                        //get the previous element
                        var prevEl = $(focusNode).prev();

                        if (this.controller.record.data.mode === 'thin') {
                            //if we on thin mode go 2 steps back
                            prevEl = prevEl.prev();
                        }

                        if (prevEl) {
                            //if prev el exists set the caret to the previous element
                            this.setCaretPositionEnd(prevEl[0], selection, 0);
                        }
                    }

                    _.delay(this.setMenuFromSelection.bind(this, 50));
                },
                //space handling
                32: function f1216(e, parentElement, selection, range) {
                   if (!e.ctrlKey) return;
                   var nbsp = document.createElement('nbsp');
                   nbsp.setAttribute('contenteditable','false');
                   nbsp.innerHTML = '&nbsp;';
                   this.insertAtCursor(nbsp,selection, range);
                }
            },
            getValidSelector: function f1217(selection) {
                var selector, tempSelector;

                if (selection && selection.anchorNode && selection.anchorNode.nodeName === "#text") {
                    selector = selection.anchorNode.parentNode;
                } else {
                    selector = selection.anchorNode;


                    if (!selector) return;

                    if (selector.parentNode.nodeName === 'ANSWERFIELD') {
                        return selector;
                    }
                    //if the selector is not valid (can be span)
                    if (['DIV', 'LI'].indexOf(selector.nodeName) === -1) {
                        //so search for the closest container (DIV)
                        tempSelector = $(selector).closest("div")[0];

                        if (!tempSelector) {
                            //NOT FOUND div search for li closest container
                            tempSelector = $(selector).closest("li")[0];

                            //NOT FOUND li will return
                            if (!tempSelector) {
                                if (this.body.children("div").length == 0) {
                                    return;
                                }
                                tempSelector = selector;
                            }
                        }

                        selector = tempSelector;
                    }
                }

                return selector;
            },
            handleKeyEvent: function f1218(e, helpers, eventType) {
                //handle the mouseover title live update

                /* if (e.keyCode === 46) {
                            return e.preventDefault();
                        }*/

                //get the selection
                if (!this.document) return false;

                var selection = this.document.getSelection();

                if (selection.anchorNode && $(selection.anchorNode).parents('ANSWERFIELD').length) {
                     return this.setMenu("disableInsertInfoBaloon") || this.setMenu("disableInsertLink");
                }

                if ([37, 38, 39, 40].indexOf(e.keyCode) !== -1) {
                    if (selection && selection.anchorNode && $(selection.anchorNode).parents('answerfield').length) {
                        this.onFocusAnswerField('disable');
                    }
                    return;
                }

                try {
                    var range = selection.getRangeAt(0);
                } catch (exception) {
                   if (e.which === 8) return e.preventDefault();
                }
               
                if (!selection || !selection.anchorNode) {
                    return; // in case we dont have an anchore node- currentlly happening inside mathfield
                }
                //if we have a spaciel method for this key
                if (helpers[e.keyCode]) {
                    var selector = this.getValidSelector(selection);

                    if (!selector) {
                        return;
                    }

                    if ($(selector).is('span')) {
                        if (range.startOffset === 0 && e.which === 8) {
                            helpers[e.keyCode].call(this, e, selector.parentNode, selection);
                        }
                    } else if ($(selector).is('answerfield')) {
                        return;
                    }

                    if (e.keyCode == 32 && e.ctrlKey && e.shiftKey && eventType === 'keydown') {
                        helpers[e.keyCode].call(this, e, selector.parentNode, selection, range);     
                    } else if (selector.nodeName === 'LI' && eventType === 'keydown') {
                        //same as div type just with LI
                        helpers[e.keyCode].call(this, e, selector.parentNode, selection, "list-item", "<li></li>", {}, {
                            'contenteditable': true,
                            'class': 'listItem'
                        });
                    } else if (selector.nodeName === "BODY" && e.keyCode === 8) {
                        this.setCaretPositionEnd(this.body.children("div:last")[0], selection);
                    } else if (selector.nodeName === 'DIV') {
                        switch (e.keyCode) {
                            case 8:
                            case 46:
                                if (helpers[e.keyCode]) {
                                    helpers[e.keyCode].call(this, e, selector.parentNode, selection);
                                     _.delay(this.setIframeHeight.bind(this), 50);
                                }
                            break;
                        }
                    } else if (selector.nodeName === 'SPAN') {
                        if (e.keyCode === 13) {

                            if ($(selector).parents('LI').length) {

                                if ($(selector).text().length) {
                                    _.delay(function () {
                                        $(selector).parents('LI').next().contents().replaceWith('<br />');
                                        $(selector).parents('LI').focus();
                                    }, 100)
                                }

                            }

                        }
                    } 
                }

                //fix chrome bug- after removig info baloon and writing in the same place the text get wrapped
                //with <font> and <b> elements, inherited from the info baloon css style
                if ($(selection.anchorNode).parents('B').length) {
                    var originalNode = selection.anchorNode;
                    $(selection.anchorNode).unwrap();
                    if ($(selection.anchorNode).is('font')) {
                        $(selection.anchorNode).contents().unwrap();
                    }
                    this.setCaretPositionEnd(originalNode, selection);
                }

                if (selection && selection.type === "Range" &&
                    !~[8, 46, 13].indexOf(e.keyCode) &&
                    this.isSingleParagraph(selection)) {

                    if (!this.controller.record.data.disableInfoBalloon) {
                        this.setMenu("insertInfoBaloon");
                    }
                    else {
                        this.setMenu("disableInsertInfoBaloon");
                    }
                    this.setMenu("insertLink");
                } else {
                    this.setMenu("disableInsertInfoBaloon");
                    this.setMenu("disableInsertLink");
                }


                return true;
            },

            handleAnswerField: function f1219(e, helpers, eventType) {
                var selection = this.document.getSelection();

                if (!selection || !selection.anchorNode) {
                    return; // in case we dont have an anchore node- currentlly happening inside mathfield
                }
                //if we have a spaciel method for this key

                var selector = this.getValidSelector(selection);
                var range = selection.getRangeAt(0);

                if (!selector) {
                    return;
                }

                if (selector.nodeName === 'DIV') {
                    switch (selection.type) {
                        case 'Range':
                            switch (e.keyCode) {
                                case 13:
                                    try {
                                        var contents = range.cloneContents();
                                            contents = $("<temp></temp>").append($(contents));

                                        if (contents.find('img, latex, mathfieldtag, answerfield').length) {
                                            return e.preventDefault();
                                        }
                                    } catch (err) {
                                        return e.preventDefault();
                                    }
                                break;
                                case 46:
                                case 8:
                                    //disable delete of range selection of answerfields
                                    var childSelected = $(range.commonAncestorContainer).children('ANSWERFIELD');

                                    childSelected.each(function () {
                                        if ($(this).get(0).nextSibling === null) {
                                            $(" ").insertAfter($(this));
                                        }
                                    });

                                    if (childSelected.length) {
                                        return e.preventDefault();
                                    } else {
                                        if (selection.focusOffset === 0) {
                                            return $(range.startContainer).prev().after("&nbsp;");
                                        } else {
                                            if (range.startContainer.wholeText && range.startContainer.wholeText.length === 1) {
                                                if (!~[32, 160].indexOf(range.startContainer.textContent.charCodeAt())) {
                                                    $(range.startContainer).replaceWith(' ');

                                                    this.setCaretPositionEnd(range.startContainer.parentNode, selection);
                                                }

                                                return e.preventDefault();
                                            } else if (range.startContainer.textContent.length > 1 && selection.focusOffset === 1) {
                                                var _char = range.startContainer.textContent.substr(0, selection.focusOffset);

                                                if (~[32, 160].indexOf(_char.charCodeAt())) {
                                                    return e.preventDefault();
                                                }
                                            }
                                        }
                                    }
                                break;
                            }
                        break;
                        case 'Caret':
                            switch (e.keyCode) {
                                case 8:
                                    var childSelected = $(range.commonAncestorContainer).children('ANSWERFIELD');

                                    childSelected.each(function () {
                                        if ($(this).get(0).nextSibling === null) {
                                            $(this).after("&nbsp;");
                                        }
                                    });

                                    if (range.startContainer &&
                                        range.startContainer.nodeName === "#text" &&
                                        $(range.startContainer).prev().length &&
                                        $(range.startContainer).prev().is("ANSWERFIELD")) {

                                        if (selection.focusOffset === 0) {
                                            return e.preventDefault();
                                        } else {
                                            if (range.startContainer.wholeText.length === 1) {
                                                if (!~[32, 160].indexOf(range.startContainer.textContent.charCodeAt())) {
                                                    $(range.startContainer).replaceWith(' ');

                                                    this.setCaretPositionEnd(range.startContainer.parentNode, selection);
                                                }

                                                return e.preventDefault();
                                            } else if (range.startContainer.textContent.length > 1 && selection.focusOffset === 1) {
                                                var _char = range.startContainer.textContent.substr(0, selection.focusOffset);

                                                if (~[32, 160].indexOf(_char.charCodeAt())) {
                                                    return e.preventDefault();
                                                }
                                            }
                                        }
                                    }
                                break;
                                case 46:
                                    if (range.startContainer.nextSibling &&
                                        range.startContainer.nextSibling.nodeName === "ANSWERFIELD" &&
                                        selection.focusNode.length == selection.focusOffset) {

                                        return e.preventDefault();
                                    }
                                break;
                            }
                        break;
                    }
                } else if (selector.nodeName === 'SPAN') {
                    if ($(selector).closest('ANSWERFIELD').length) {
                        switch (e.keyCode) {
                            case 8:
                                if (range.startOffset === 0) {
                                    return e.preventDefault();
                                }
                            break;
                            case 13:
                                return e.preventDefault();
                            break;
                        }
                    }
                }

                return true;

            },
            wrapElement: function f1220(cloneRange, selection, tagName, attributes) {
                //wrapper creation
                var createWrapper = $(tagName).attr(attributes);

                //cloneRange eq(range.cloneRange()) surround it with the wrapper
                cloneRange.surroundContents(createWrapper[0]);

                //remove all the ranges from the selection
                selection.removeAllRanges();
                //add the new range
                selection.addRange(cloneRange);

                //return reference to the wrapper
                return createWrapper;
            },
            reformat_element_content: function f1221(element, clear) {
                var _p_text;
                var _text = '';
                var _chunks = [];

                var _clone_element;

                var cleaners = {
                    'SPAN': function (_clone_element) {
                        _clone_element.append($(this).contents().unwrap())
                    },
                    'UL': function (_clone_element) {
                        this.find('li').each(function () {
                            $(this).find('span').each(function () {
                                $(this).contents().unwrap();
                            })
                        });

                        _clone_element.append(this);
                    }
                }

                element = element instanceof jQuery ? element : $(element);

                var _text_nodes = element.contents().filter(function () {
                    return this.nodeName === "#text";
                });

                if (!_text_nodes.length && !clear) return element;

                element.contents().each(function f1222(item) {
                    if (this.nodeName === "#text" && $(this).text().length > 0) {
                        _text += $(this).text();
                    } else {
                        if (!~['IMG','MATHFIELDTAG', 'SPAN', 'ANSWERFIELD', 'UL', 'LI'].indexOf(this.nodeName) &&
                            !$(this).is('a[type="infoBaloon"],a[type="hyperlink"]')) {
                            $(this).remove();
                        } else {
                            if (_text.length > 0) {
                                _chunks.push(_text);
                            }

                            if (!$(this).is('SPAN')) {
                                _chunks.push($(this).clone(true, true));
                            } else {
                                if ($(this).text().length) {
                                    _chunks.push($(this).clone(true, true));
                                }
                            }

                            _text = '';
                        }
                    }

                });

                if (_text) {
                    if (_chunks.length === 0 || !_.isString(_.last(_chunks))) {
                        _chunks.push(_text);
                    }
                    else {
                        _chunks[_chunks.length - 1] += _text;
                    }
                }

                _clone_element = element.clone(true, true).empty();

                _.each(_chunks, function f1223(item) {
                    if (clear && !_.isString(item) && cleaners[item.get(0).nodeName]) {
                        cleaners[item.get(0).nodeName].call(item, _clone_element);
                    } else {
                        _clone_element.append(_.isString(item) ? document.createTextNode(item) : item);
                    }
                });


                element.replaceWith(_clone_element);

                _clone_element.find('img').each(function f1224() {
                    $(this).one('load', this.update_text_viewer_dimensions.bind(this));
                }.bind(this));


                return clear ? this.reformat_element_content(_clone_element) : _clone_element;
            },
            /*
                     handleSetEffect is use for making the emphasis/softEmphasis/superscript/subscript/etc... effects
                     */
            handleSetEffect: function f1225(command) {
                //get text selection

                var selection = this.document.getSelection();

                //if we doesn't select any text we don't do anything
                //if (selection.type === "Caret") return false;

                //get the selected range - return the startOffset and endOffset and the shared dom element if exists
                var range = selection && selection.type !== 'None' && selection.getRangeAt(0);



                if (!range) {
                    return false;
                }

                //selection anchorNode use if we doesn't select range and we just set the carret on specific node
                var selectedNode = selection.anchorNode;


                //just make sure that we have a valif dom fragment and not textNode (will be use later)
                var anchorParentNode = selectedNode.nodeName === "#text" ? selectedNode.parentNode : selectedNode;

                //clone the range
                var cloneRange = range.cloneRange();

                var commandType;

                if ($(anchorParentNode).is('ANSWERFIELD') || $(anchorParentNode).parents('ANSWERFIELD').length) {
                    return false;
                }


                var endContainer = range.endContainer.nodeName === "#text" ? range.endContainer.parentNode : range.endContainer;
                var startContainer = range.startContainer.nodeName === "#text" ? range.startContainer.parentNode : range.startContainer;




                var _common_selection = range.commonAncestorContainer;
                var contents = $("<temp></temp>").append($(range.cloneContents()));

                if (contents.find('mathfieldtag,img,answerfield,latex').length) {
                    return false;
                }


                function selectIndentClass(node, className) {
                    var _indent_classes = ['indent1', 'indent2', 'indent3'];

                    if (node.attr('class') && node.attr('class').match(/indent[0-9]/g)) {
                        var _current_indent_class = node.attr('class').match(/indent[0-9]/g);
                        var _select_idx = _indent_classes.indexOf(_current_indent_class[0]);
                        var _next_class = className === 'indent' ?
                            _indent_classes[_select_idx + 1] :
                            className === 'outdent' ? _indent_classes[_select_idx - 1] : null;

                        if (_next_class) {
                            node.removeClass(_current_indent_class[0]);
                            node.addClass(_next_class);
                        } else if (!_next_class && command === "outdent") {
                            node.removeClass(_current_indent_class[0]);
                            node.contents().unwrap();
                        }
                    } else {
                        if (className === 'indent') {
                            node.addClass('indent1');
                        } else if (className === 'outdent') {
                            node.contents().unwrap();
                        }
                    }
                };


                function addSuitableStyles(anchorParentNode, command) {
                    if (commandType && commandType === 'indent') {
                        selectIndentClass($(anchorParentNode), command);
                    } else {
                        var _unique_classes = [
                            'emphasis',
                            'softEmphasis',
                            'strongEmphasis',
                            'colorEmphasis',
                            'strongColorEmphasis',
                            'redEmphasis',
                            'redItalEmphasis',
                            'blueEmphasis',
                            'blueItalEmphasis',
                            'greenEmphasis',
                            'greenItalEmphasis',
                            'orangeEmphasis',
                            'turqoiseEmphasis'
                        ];
                        var _anchor_node_class = ($(anchorParentNode).attr('class') && _.compact($(anchorParentNode).attr('class').split(" "))) || [];

                        if (_unique_classes.indexOf(command) === -1) {
                            if (!$(anchorParentNode).hasClass(command)) {
                                if (selection.type === 'Range' && ($(anchorParentNode).text().length !== range.endOffset || range.startOffset > 0)) {
                                    this.wrapElement(range, selection, '<span></span>', {
                                        styleable: true
                                    });

                                    $(anchorParentNode).contents().each(function f1226() {
                                        if (this.nodeName === "#text") {
                                            $(this).wrap($(this).parent().clone().empty());
                                        } else if ($(this).attr('styleable')) {
                                            $(this).addClass(command);
                                            $(this).addClass($(this).parent().attr('class'));
                                            $(this).removeAttr("styleable");
                                        }
                                    });

                                    $(anchorParentNode).contents().unwrap();
                                } else {
                                    $(anchorParentNode).addClass(command);
                                }
                            }
                        } else {
                            if (selection.type === 'Range' && ($(anchorParentNode).text().length !== range.endOffset || range.startOffset > 0)) {
                                this.wrapElement(range, selection, '<span></span>', {
                                    styleable: true
                                });

                                $(anchorParentNode).contents().each(function f1226() {
                                    if (this.nodeName === "#text") {
                                        $(this).wrap($(this).parent().clone().empty());
                                    } else if ($(this).attr('styleable')) {
                                        $(this).addClass(command);
                                        $(this).removeAttr("styleable");
                                    }
                                });

                                $(anchorParentNode).contents().unwrap();
                            } else {

                                _.each(_anchor_node_class, function (v) {
                                    if (/^effects_/.test(v)) {
                                        _unique_classes.push(v);
                                    }
                                });

                                var _intersect_arrays = _.intersection(_anchor_node_class, _unique_classes);

                                if (_intersect_arrays && _intersect_arrays.length) {
                                    _.each(_intersect_arrays, function f1227(className) {
                                        $(anchorParentNode).removeClass(className);
                                    });
                                }

                                 $(anchorParentNode).addClass(command);
                            }
                        }
                    }
                };


                function _multi_paragraph_selection_handle() {
                    var _common_paragraph_selection = _.filter(_common_selection.childNodes, function f1228(item) {
                        return $(item).is('DIV') && $(item).index() !== $(endContainer).index() && $(item).index() !== $(startContainer).index();
                    });
                    var _start_container_clone_range = range.cloneRange();
                    var _end_container_clone_range = range.cloneRange();
                    var _wrapper = $("<span></span>").attr('class', command);

                    var is_end_container_partial_selected = range.endOffset !== (range.endContainer.wholeText && range.endContainer.wholeText.length);
                    var is_start_container_partial_selected = range.startOffset !== 0



                    var startIndex = $(startContainer).is('span') ? $(startContainer).parent().index() : $(startContainer).index();
                    var lastIndex = $(endContainer).is('span') ? $(endContainer).parent().index() : $(endContainer).index();



                    var _start_offset = range.startOffset;
                    var _total_text_nodes = _.size(_.map($(startContainer).contents(), function f1229(item) {
                        return item.nodeName === "#text";
                    }));

                    if (_total_text_nodes > 1) {
                        _.each($(startContainer).contents(), function f1230(item) {
                            if (item.nodeName && item.nodeName === "#text") {
                                _wrapper = _wrapper.clone().empty();

                                $(item).wrap(_wrapper)

                            }
                        });
                    } else {
                        if (!is_start_container_partial_selected) {
                            var p = this.reformat_element_content($(range.startContainer).parents('div'), true);

                            wrapper = _wrapper.clone().empty();

                             p.contents().each(function () {
                                $(this).wrap(wrapper);
                             })
                        } else {
                            _wrapper = _wrapper.clone().empty();

                            _start_container_clone_range.setStart(range.startContainer, range.startOffset);
                            _start_container_clone_range.setEnd(range.startContainer, range.startContainer.parentNode.textContent.length);

                            _start_container_clone_range.surroundContents(_wrapper.get(0));
                        }

                        if (!is_end_container_partial_selected) {
                            var p = this.reformat_element_content($(range.endContainer).parents('div'), true);

                            wrapper = _wrapper.clone().empty();

                             p.contents().each(function () {
                                $(this).wrap(wrapper);
                             })
                        } else {
                            _wrapper = _wrapper.clone().empty();

                            _start_container_clone_range.setStart(range.endContainer, 0);
                            _start_container_clone_range.setEnd(range.endContainer, range.endOffset);

                            _start_container_clone_range.surroundContents(_wrapper.get(0));
                        }
                    }



                    _.each(_common_paragraph_selection, function f1231(item) {

                        if ($(item).index() >startIndex && $(item).index() < lastIndex) {

                            _.each($(item).contents(), function f1232(item) {
                                _wrapper = _wrapper.clone().empty();

                                if (item.nodeName === "#text") {
                                    $(item).wrap(_wrapper);
                                } else if (item.nodeName === "SPAN") {
                                    $(item).contents().wrap(_wrapper).parent().parent().contents().unwrap();
                                }
                            });
                        }
                    });


                    if (endContainer.nodeName === 'SPAN' && $(endContainer).children('span').length) {
                        if (is_end_container_partial_selected) {
                            $(endContainer).contents().each(function () {
                                if (this.nodeName === "#text") {
                                    $(this).wrap($(this).parent().clone().empty());
                                }
                            });
                        }

                        $(endContainer).contents().unwrap();
                    }

                    if (startContainer.nodeName === 'SPAN' && $(startContainer).children('span').length) {
                        if (is_start_container_partial_selected) {
                            $(endContainer).contents().each(function () {
                                if (this.nodeName === "#text") {
                                    $(this).wrap($(this).parent().clone().empty());
                                }
                            });
                        }

                        $(startContainer).contents().unwrap();
                    }

                    selection.removeAllRanges();
                };

                function partial_selection(rangeContainer, startOffset, endOffset) {
                    var _range = document.createRange();

                    _range.selectNodeContents(rangeContainer);

                    _range.setStart(rangeContainer, startOffset)
                    _range.setEnd(rangeContainer, endOffset);

                    _.each(_range.commonAncestorContainer.childNodes, function f1233(item) {
                        if (item.nodeName === 'SPAN') {
                            $(item).contents().unwrap()
                        }
                    });

                    var _parent_container = rangeContainer.parentNode;

                    if (_parent_container.nodeName === 'SPAN') {
                        this.wrapElement(_range, selection, '<span></span>', {
                            clearable: true
                        });


                        $(_parent_container).contents().each(function f1234() {
                            if (this.nodeName === "#text") {
                                $(this).wrap($(this).parent().clone().empty());
                            } else if ($(this).attr('clearable')) {
                                $(this).contents().unwrap();
                            }
                        });


                        $(_parent_container).contents().unwrap();
                    }
                }

                function multi_span_selection() {
                    _.each(range.commonAncestorContainer.childNodes, function f1235(item) {
                        if (item.nodeName !== "#text" && !$(item).is('MATHFIELDTAG,IMG,ANSWERFIELD')) {
                            if (item.isSameNode(range.startContainer.parentNode)) {
                                partial_selection.call(this, range.startContainer, range.startOffset, range.startContainer.textContent.length);
                            } else if (!item.isSameNode(range.endContainer.parentNode) && $(item).index() > $(range.startContainer.parentNode).index()) {
                                if ($(item).contents().length) {
                                    $(item).contents().unwrap();
                                } else {
                                    $(item).remove();
                                }
                            }
                        }
                    }, this);

                    _.each(range.commonAncestorContainer.childNodes, function f1236(item) {
                        if (item.nodeName !== "#text") {
                            if (item.isSameNode(range.endContainer.parentNode)) {
                                partial_selection.call(this, range.endContainer, 0, range.endOffset);
                            }
                        }
                    }, this);



                    this.reformat_element_content($(range.commonAncestorContainer));
                }

                function _remove_format() {
                    if (selection.type === "Caret") {
                        var _clear_element = anchorParentNode.nodeName === 'DIV' ?
                            $(anchorParentNode) :
                            anchorParentNode.nodeName === 'SPAN' ?
                            $(anchorParentNode).closest("div") : false;

                        if (_clear_element) {
                            this.reformat_element_content(_clear_element, true);
                        }
                    } else { // not a Caret type
                        var _common_selection = range.commonAncestorContainer;
                        var _common_paragraph_selection = _.filter(_common_selection.childNodes, function f1237(item) {
                            return item.nodeName === 'DIV';
                        });

                        var _common_text_node_selection = _.filter(_common_selection.childNodes, function f1238(item) {
                            return item.nodeName === '#text';
                        });

                        var _parent_paragraph;

                        _.each(_common_paragraph_selection, function f1239(item) {
                            this.reformat_element_content(item, true);
                        }, this);

                        if (anchorParentNode.nodeName === 'SPAN') {
                            if (!_common_selection.childNodes.length) {
                                //check if we select all of the span content
                                if (startContainer.isSameNode(endContainer) &&
                                    range.startOffset === 0 &&
                                    range.endOffset === startContainer.textContent.length) {

                                    _parent_paragraph = $(anchorParentNode).closest('div');

                                    $(anchorParentNode).contents().unwrap('SPAN');

                                    this.reformat_element_content(_parent_paragraph);
                                } else {
                                    var _clearable_area = $("<span></span>").attr({
                                        clearable: true
                                    });

                                    range.surroundContents(_clearable_area.get(0));

                                    $(anchorParentNode).contents().each(function f1240() {
                                        if (this.nodeName === "#text") {
                                            $(this).wrap($(this).parent().clone().empty())
                                        } else if (this.nodeName !== '#text' && this.textContent.length === 0) {
                                            $(this).remove();
                                        } else if ($(this).attr('clearable')) {
                                            $(this).contents().unwrap();
                                        }
                                    });

                                    _parent_paragraph = $(anchorParentNode).closest('div');

                                    $(anchorParentNode).contents().unwrap();

                                    this.reformat_element_content(_parent_paragraph);
                                }
                            } else if (!range.startContainer.parentNode.isSameNode(range.endContainer.parentNode)) {
                                multi_span_selection.call(this);
                            }
                        } else if (~['DIV', 'LI'].indexOf(anchorParentNode.nodeName) && _common_text_node_selection.length) {
                            if (!range.startContainer.parentNode.isSameNode(range.endContainer.parentNode)) {
                                multi_span_selection.call(this);
                            } else {
                                range.surroundContents($("<span></span>").attr({
                                    clearable: true
                                }).get(0))

                                var _unwrap_contents = $(anchorParentNode).find('span[clearable="true"]');

                                _unwrap_contents.contents().each(function f1241() {
                                    if (this.nodeName !== "#text" && this.nodeName !== 'MATHFIELDTAG') {
                                        $(this).contents().unwrap();
                                    }
                                });

                                _unwrap_contents.contents().unwrap();


                                this.reformat_element_content($(anchorParentNode));
                            }
                        }
                    }
                };

                function _set_effect() {
                    if (selection.type === "Caret") {
                        var _paragraph = $(anchorParentNode);

                        if (commandType && commandType === 'indent') {
                            if (_paragraph.get(0).nodeName === 'DIV' || _paragraph.get(0).nodeName === 'LI') {
                                if (!_paragraph.children().first().length || _paragraph.children().first().get(0).nodeName !== "SPAN") {
                                    _paragraph.contents().wrapAll($("<span></span>"));
                                }

                                selectIndentClass(_paragraph.children().first(), command);
                            } else if (_paragraph.get(0).nodeName === 'SPAN') {
                                selectIndentClass(_paragraph, command);
                            }

                        } else {
                            var _not_text_nodes;

                            if (~['superscript', 'subscript'].indexOf(command)) return;

                            if (_paragraph.get(0).nodeName === 'DIV' ||
                                _paragraph.get(0).nodeName === 'LI' ||
                                _paragraph.get(0).nodeName === 'SPAN') {

                                if (_paragraph.get(0).nodeName === 'SPAN') {
                                    _paragraph = _paragraph.closest('div');
                                }

                                if (_paragraph.contents().length) {
                                    _not_text_nodes = _.filter(_paragraph.contents(), function f1242(item) {
                                        return item.nodeName !== "#text";
                                    });

                                    if (_not_text_nodes.length) {
                                        _paragraph.contents().each(function f1243() {
                                            if (this.nodeName === "#text" && this.nodeName !== 'MATHFIELDTAG') {
                                                $(this).wrap($("<span></span>"))
                                            }
                                        });
                                    } else {
                                        _paragraph.contents().wrapAll($("<span></span>"));
                                    }

                                    _.each(_paragraph.contents(), function f1244(item) {
                                        if (item.nodeName === 'SPAN') {
                                            addSuitableStyles.call(this, item, command);
                                        }
                                    }, this);

                                    this.setCaretPositionEnd(_paragraph.children().first().get(0), this.document.getSelection());
                                }
                            }
                        }

                    } else {
                        var _paragraph_selected = _.compact(_.filter(_common_selection.childNodes, function f1245(item) {
                            return item.nodeName === 'DIV';
                        }));


                        var wrap = function (range, position, unwrapContainer) {
                            var _create_range = document.createRange();

                            _create_range.selectNodeContents(range[position]);
                            _create_range.setStart(range[position], position == 'startContainer' ? range.startOffset : 0);
                            _create_range.setEnd(range[position],position == 'startContainer' ? range[position].textContent.length : range.endOffset);

                            var el = this.wrapElement(_create_range, selection, "<span></span>", {
                                'class': command
                            });

                            $(unwrapContainer).contents().each(function () {
                                if (this.nodeName === "#text") {
                                    $(this).wrap($(this).parent().clone().empty());
                                }
                                else if (this.nodeName === "SPAN") {
                                    $(this).addClass($(this).parent().attr('class'));
                                }
                            })

                            unwrapContainer && $(unwrapContainer).contents().unwrap();

                            return el.get(0);
                        }

                        if (_paragraph_selected.length && _common_selection.childNodes.length > 1) {
                            if (commandType && commandType === 'indent') {
                                _.each(_common_selection.childNodes, function f1246(item) {
                                    if (item.nodeName === 'DIV') {
                                        $(item).contents().wrapAll($("<span></span>"));
                                        selectIndentClass($(item).children().first(), command);
                                    }
                                });
                            } else {
                                _multi_paragraph_selection_handle.call(this);
                            }
                        } else {
                            if (!_common_selection.childNodes.length) {
                                if (anchorParentNode.nodeName === 'SPAN') {
                                    addSuitableStyles.call(this,anchorParentNode, command);
                                } else {
                                    if (commandType && commandType === 'indent') {
                                        selectIndentClass($("<span></span>"), command);
                                    } else {
                                        var _wrapper = $("<span></span>");

                                        _wrapper.attr('class', command);

                                        cloneRange.surroundContents(_wrapper.get(0));
                                    }

                                }
                            } else {
                                var _content = cloneRange.cloneContents();
                                    _content = _.filter($(_content).contents(), function f1247(item) {
                                        return item.nodeName === 'MATHFIELDTAG';
                                    });

                                if (_content.length) return;



                                var isNodeEqual = startContainer && endContainer && (startContainer.isSameNode(endContainer));


                                if (isNodeEqual) {
                                    this.wrapElement(cloneRange, selection, "<span></span>", {
                                        'class': command,
                                    });
                                } else {
                                    var _start_range = document.createRange(),
                                        _end_range = document.createRange();


                                    var startContainer = (cloneRange.startContainer) ?
                                                        (cloneRange.startContainer.nodeName === "#text" ?
                                                            ((cloneRange.startContainer.parentNode.nodeName === 'SPAN') ? cloneRange.startContainer.parentNode : cloneRange.startContainer) :
                                                                cloneRange.startContainer) : false;
                                    var endContainer = (cloneRange.endContainer) ?
                                                        (cloneRange.endContainer.nodeName === "#text" ?
                                                            ((cloneRange.endContainer.parentNode.nodeName === 'SPAN') ? cloneRange.endContainer.parentNode : cloneRange.endContainer) :
                                                            cloneRange.endContainer) : false;
                                    var commonParent = $(startContainer).parents('div');


                                    if (!$(startContainer).hasClass(command)) {
                                        startContainer = wrap.call(this, cloneRange, 'startContainer', startContainer);
                                    }

                                    if (!$(endContainer).hasClass(command)) {
                                        endContainer = wrap.call(this, cloneRange, 'endContainer', endContainer);
                                    }


                                    commonParent = this.reformat_element_content(commonParent, false);


                                    var startIndex = _.first(_.compact(_.map(commonParent.contents(), function (el, index) {
                                        return el.isEqualNode(startContainer) ? index.toString() : null;
                                    }), function (v) {
                                        return v >= 0;
                                    }));

                                    startIndex = +startIndex;

                                    var endIndex = _.first(_.compact(_.map(commonParent.contents(), function (el, index) {
                                        return el.isEqualNode(endContainer) ? index.toString() : null;
                                    }), function (v) {
                                        return v >= 0;
                                    }));

                                    endIndex = +endIndex;

                                    var middleTexts = _.filter(commonParent.contents(), function (el, index) {
                                        return index > startIndex && index < endIndex;
                                    });

                                    _.each(middleTexts, function (node) {
                                        $(node).wrap($("<span></span>").attr({
                                            'class': command
                                        }))

                                        if ($(node).is('SPAN')) {
                                            $(node).contents().unwrap();
                                        }
                                    })

                                }
                            }
                        }
                    }
                }


                switch (command) {
                    case 'removeFormat':
                        _remove_format.call(this);
                        selection && selection.removeAllRanges()
                        break;
                    case 'indent':
                    case 'outdent':
                        commandType = 'indent';
                    default:
                        _set_effect.call(this);
                        break;
                }

                return true;

            },
            handleSetStyle: function f1249(param) {
                var _selection = this.document.getSelection();

                if (_selection.type === 'None') return;

                var _selected_node = _selection.anchorNode;
                var _range = _selection.getRangeAt(0);

                var _is_multiple_selection = function f1250() {
                    return !_range.startContainer.parentNode.isSameNode(_range.endContainer.parentNode) &&
                            _range.startContainer.parentNode.nodeName === 'DIV' &&
                            _range.endContainer.parentNode.nodeName === 'DIV'
                };

                var self = this;

                var helpers = {
                    'DIV': function f1251(element, className) {
                        if (element && element.length) {
                            var toRemove = _.without(this.styles, className).join(' ');
                            element.removeClass(toRemove);
                            if (element.hasClass(className)) {
                                element.removeClass(className).addClass('normal');
                                element.attr('customStyle', 'normal')
                            } else {
                                element.addClass(className);
                                element.attr('customStyle', className);
                            }
                        }
                    }
                };

                if (_is_multiple_selection()) {
                    $(_range.commonAncestorContainer).contents().each(function f1252() {
                        if (this.nodeName === "DIV" &&
                            $(this).index() >= $(_range.startContainer.parentNode).index() ||
                            $(this).index() <= $(_range.endContainer.parentNode).index()) {
                            helpers[this.nodeName].call(self, $(this), param.style);
                        }
                    });
                } else {
                    if (_selected_node.parentNode.nodeName === 'DIV') {
                        helpers[_selected_node.parentNode.nodeName].call(this, $(_selected_node.parentNode), param.style);
                    } else if (_selected_node.parentNode.nodeName !== 'BODY') {
                        helpers['DIV'].call(this, $(_selected_node.parentNode).closest('div'), param.style);
                    }
                 }
            },
            handlePasteFunction: function f1253(e) {
                var _content,
                    _paragraphs;

                var _first_paragraph;

                var self = this;
                var selection = this.document.getSelection();

                if (selection && selection.type === 'None') return true;

                var _focus_node = selection.anchorNode.nodeName === "#text" ? selection.anchorNode.parentNode : selection.anchorNode;

                var _html_paragraph;

                var range = selection.getRangeAt(0);

                if(range.startContainer.tagName == "BODY"){
                    selection.removeAllRanges();
                    var node = $(this.document).find("div.cgs")[0];
                    range = this.document.createRange();
                    range.setStart(node, 0);
                }
                _clone_offset = {
                    startOffset: range.startOffset,
                    endOffset: range.endOffset
                };

                var _paragraph_wrapper;

                var _editable_tags = ['DIV', 'SPAN', 'LI'];
                var _is_external_paste = false;

                var _end_of_text_range = document.createRange();
                var _end_of_text_range_content;

                var _endContainer;


                var _common_ancestor = range.commonAncestorContainer;



                try {
                    //search for content in CGS
                    _content = _.filter($(e.originalEvent.clipboardData.getData('text/html')), function f1254(item) {
                        return item.nodeName !== "#text" &&
                            item.nodeName !== "#comment" &&
                            $(item).hasClass('cgs');
                    });

                    if (_content.length) {
                        //_is_external_paste = true;
                        _content = _.map(_content, function f1255(item) {
                            return $(item).text();
                        }).join('\n');
                    } else {
                        _content = e && e.originalEvent.clipboardData && e.originalEvent.clipboardData.getData('text/plain');

                        if (!_content.length) {
                            selection.removeAllRanges();

                            return e.preventDefault();
                        }

                    }
                } catch (err) {
                    return e.preventDefault();
                }

                function handleRangePaste() {
                   // if (_common_ancestor.nodeName === "UL") {
                        var _selected_items = $(_common_ancestor).contents().filter(function f1256() {
                            return this.nodeName !== "#text" && $(this).index() >= $(range.startContainer.parentNode).index() &&
                                    $(this).index() < $(range.endContainer.parentNode).index();
                        });


                        var _start_range = document.createRange(),
                            _end_range = document.createRange();

                        var _end_paregraph;

                        if (_selected_items.length) {
                            _start_range.selectNodeContents(_selected_items[0]);
                            _end_range.selectNodeContents(_selected_items[_selected_items.length - 1]);

                            _start_range.setStart(range.startContainer, range.startOffset);
                            _start_range.setEnd(range.startContainer, _selected_items[0].textContent.length);

                            _end_range.setStart(range.endContainer, 0);
                            _end_range.setEnd(range.endContainer, range.endOffset);


                            delete _selected_items[0];

                            _selected_items = _.compact(_selected_items);
                        } else {
                            _start_range = range;
                            _end_range = null;
                        }

                        _start_range.deleteContents();

                        _paragraphs = _content.split("\n");

                        _first_paragraph = _paragraphs[0];
                        _first_paragraph = document.createTextNode(_first_paragraph);

                        _start_range.insertNode(_first_paragraph);


                        delete _paragraphs[0];

                        _paragraphs = _.compact(_paragraphs);


                        if (_paragraphs.length) {


                            if (_end_range) {
                                _end_paregraph = _paragraphs[_paragraphs.length - 1];
                                _end_paregraph = document.createTextNode(_end_paregraph);

                                _end_range.deleteContents();
                                _end_range.insertNode(_end_paregraph);

                                delete _paragraphs[_paragraphs.length - 1];

                                _paragraphs = _.compact(_paragraphs);
                            }

                            if (_paragraphs.length) {
                                if (_selected_items.length) {
                                    var _p_itreator = 0;

                                    _.each(_selected_items, function f1257(item, k) {
                                        $(item).contents().replaceWith(_paragraphs[_p_itreator]);
                                        ++_p_itreator;
                                    });
                                } else {
                                    _.each(_paragraphs, function f1258(item) {
                                        _html_paragraph = $(_first_paragraph).parent().clone().empty();
                                        _html_paragraph.attr({
                                            contenteditable: true
                                        }).text(item);

                                        _html_paragraph.insertAfter($(_first_paragraph).parent());

                                        _focus_node = _html_paragraph;
                                    }, this);
                                }
                            }
                        }

                   // }

                    return true;
                };

                function handleFirstParagraph() {
                    _paragraphs = _content.split("\n");

                    _first_paragraph = _paragraphs[0];
                    _first_paragraph = document.createTextNode(_first_paragraph);

                    range.insertNode(_first_paragraph, range.endOffset);

                    delete _paragraphs[0];

                    _paragraphs = _.compact(_paragraphs);
                    _focus_node = $(_first_paragraph);
                };

                function extractAfterCaretContent() {
                    var _text_nodes = $(range.endContainer.nodeName === "#text" ? range.endContainer.parentNode : range.endContainer).contents().filter(function f1259() {
                        return this.nodeName === "#text"
                    });

                    var _has_more_text = [];
                    var _next = _first_paragraph.nextSibling;

                    while (_next) {
                        _has_more_text.push(_next);
                        _next = _next.nextSibling;
                    }

                    var _offset;
                    var _focus_text_node;

                    if (!_has_more_text.length) {
                        _focus_node = $(_first_paragraph).parent();
                    } else {
                        _offset = _clone_offset.startOffset + _first_paragraph.length;
                        _focus_node = this.reformat_element_content($(_first_paragraph).parent());

                        _focus_text_node = _focus_node.contents().filter(function f1260() {
                            return this.nodeType === 3
                        });

                        if (_focus_text_node.length > 1) {

                        } else {
                            _end_of_text_range.selectNodeContents(_focus_text_node.get(0));

                            _end_of_text_range.setStart(_focus_text_node.get(0), _offset);
                            _end_of_text_range.setEnd(_focus_text_node.get(0), _focus_text_node.get(0).length);

                            _end_of_text_range_content = _end_of_text_range.extractContents();
                        }

                    }
                };

                function insertPartialParagraph() {
                    _.each(_paragraphs, function f1261(item) {
                        if (_paragraph_wrapper) {
                            _html_paragraph = $(_paragraph_wrapper).clone().empty();
                            _html_paragraph.attr({
                                contenteditable: true
                            }).text(item);

                            _html_paragraph.insertAfter(_focus_node);
                        } else {
                            _html_paragraph = $(document.createTextNode(item));
                            _html_paragraph.insertAfter(_focus_node);
                        }
                        _focus_node = _html_paragraph;
                    }, this);

                    if (_end_of_text_range_content) {
                        _focus_node.append(_end_of_text_range_content);
                    }
                }


                if (selection.type === 'Range') {
                    handleRangePaste.call(this);
                    this.setIframeHeight();
                } else {
                    var _focus_node_name;

                    if (~_editable_tags.indexOf(_focus_node.nodeName)) {
                        handleFirstParagraph.call(this);
						//continue pasting data if the TVE mode is not single line
                        if (_paragraphs.length && ! this.controller.record.data.singleLineMode) {

                            if (_paragraphs.length > 0) {
                                _focus_node_name = _focus_node.get(0).nodeName === "#text" ? _focus_node.parent().get(0).nodeName : _focus_node.get(0).nodeName;

                                if (_focus_node_name !== "SPAN") {
                                    extractAfterCaretContent.call(this);
                                } else {
                                    _paragraphs = ["\n" + _paragraphs.join("\n")];
                                }
                            }

                            if (_focus_node.get(0).nodeName === "DIV") {
                                _paragraph_wrapper = this._default_paragraph_html;
                            } else if (_focus_node.get(0).nodeName === "LI") {
                                _paragraph_wrapper = _focus_node.clone().empty().get(0);
                            } else {
                                _paragraph_wrapper = null;
                            }

                            insertPartialParagraph.call(this);
                            this.setIframeHeight();

                            this.body.children('div').each(function f1262() {
                                self.reformat_element_content($(this));
                            });
                        }
                    } else {
                        return e.preventDefault();
                    }
                }




                this.setCaretPositionEnd(_focus_node, selection);

                return e.preventDefault();
            },
            handlePaste: function f23(e) {
                this.handlePasteFunction(e);
				//after paste chack if the data pasted dont exceed the max char property
                this.checkTextSize();
            },
            checkTextSize: function() {
                function checkText(elem, maxLength) {
                    if(maxLength <=0 && elem.text().length){
                        elem.replaceWith("");
                        return maxLength;
                    }
                    if (maxLength <= 0 || !elem.text().length) return maxLength;

                    elem.contents().each(function() {
                        if (this.nodeType == 1) {
                            maxLength = checkText($(this), maxLength);
                        }
                        if (this.nodeType == 3) {
                            if ($(this).text().length > maxLength) {
                                $(this).replaceWith($(this).text().substr(0, maxLength));
                                maxLength = 0;
                            }
                            else {
                                maxLength -= $(this).text().length;
                            }
                        }
                    });

                    return maxLength;
                }

                if (this.body.text().length > this.controller.record.data.MaxChars) {
                    checkText(this.body, this.controller.record.data.MaxChars);
                }

                if (this.controller.record.data.isNoncheckable){
					//function in answerfield type text
                    this.setNoncheckableWidth();
                }
            },

            getNextMathfieldIndex: function f1263() {
                var mathfields = $(this.document).find('mathfieldTag'),
                    maxIdx = 0,
                    currIndex;
                _.each(mathfields, function f1264(mathfield) {
                    currIndex = parseInt($(mathfield).attr('idx'));
                    if (currIndex > maxIdx) {
                        maxIdx = currIndex;
                    }
                });
                return (++maxIdx);
            },

            //insert or remove an info baloon hyperlink
            insertInlineElement: function f1265(parentNode, elemType) {

                //disable adding more than one info baloon on the same element
                if ($(parentNode).hasClass('infoBaloon') || $(parentNode).hasClass('hyperlink')) {
                    return;
                }

                var _selection = this.document.getSelection(),
                    _range = _selection.getRangeAt(0),
                    contents;

                try {
                    contents = $("<temp></temp>").append(_range.cloneContents());
                    if (contents.find('mathfieldtag, img, latex').length) {
                        return false
                    }
                } catch (e) {
                    return false;
                }

                if (!_range) return;
                if (_selection && _selection.anchorNode) {
                    if ($(_selection.anchorNode).parents("answerfield").length) {
                        return false;
                    }
                }


                //check for inline components and prevent the info baloon ( inline img, inline sound, inline narration and mathfield )
                var firstUnwantedTag = _.find(_range.commonAncestorContainer.childNodes, function f1266(item) {
                    return (item.nodeName == "IMG" || item.nodeName == "MATHFIELDTAG" || $(item).parents('mathfieldtag').length);
                });
                if (firstUnwantedTag) {
                    return;
                }

                var canProceed = true,
                    fullDivs = 0;

                contents.children().each(function() {
                    if (this.tagName == 'DIV') {
                        if ($(this).contents().length) {
                            if (!fullDivs) {
                                fullDivs++;
                            }
                            else {
                                canProceed = false;
                            }
                        }
                    }
                });

                if (!canProceed) return;

                if (fullDivs) {
                    var div = _range.startContainer;

                    while (div && div.tagName != 'DIV') {
                        div = div.parentNode;
                    }

                    if (!div) return;

                    _range = this.document.createRange();
                    _range.selectNodeContents(div);

                    _selection.removeAllRanges();
                    _selection.addRange(_range);
                }

                repo.startTransaction();

                var elemId = this.controller.createItem({
                        "type": elemType,
                        "parentId": this.controller.config.id
                    }),
                    inlineElement = this.wrapElement(_range, _selection, "<a></a>", {
                        id: elemId,
                        target: '_self',
                        'class': elemType,
                        type: elemType
                    });

                if (!inlineElement.get(0).nextSibling || (inlineElement.get(0).nextSibling.nodeName === "#text" && inlineElement.get(0).nextSibling.length === 0)) {
                    inlineElement.after("&nbsp;");
                }

                if (!inlineElement.get(0).previousSibling || (inlineElement.get(0).previousSibling.nodeName === "#text" && inlineElement.get(0).previousSibling.length === 0)) {
                    inlineElement.before("&nbsp;");
                }

                this.saveData(true);

                repo.endTransaction();

                var editFunction = this._handleInlineEvent(inlineElement, elemType);
                //call edit function right after adding the element- so we can add it immideatlly
				editFunction(null,inlineElement.attr('id'));

                events.fire('setMenuButtonState', 'menu-button-insert-af', 'disable');

            },



            _handleInlineElementsEvents: function f1267(elements) {
                if (!elements.length) return;


                var self = this;

                elements.each(function f1268() {
                    self._handleInlineEvent($(this), $(this).attr('type'));
                });
            },
            _handleInlineEvent: function f1269(element, elemType) {
                var self = this;
                var buttonsClass = elemType + 'Buttons';

                var inlineElementClick = function f1270(e, id) {
                    var _id;
					// the user clicked on the edit button
                    if(e){
                        _id = $(e.target).parents('a.' + elemType).attr('id');
                    }else{
					// the user added a new IB/Link and we automaticly entered to edit mode
                        _id = id;
                    }
                    if (elemType == 'infoBaloon') {
                        if(e){
                            clearInlineElementActions.call(this, e);
                        }
                        self.saveData(true); // save data without removing the empty mathfields
                        self.controller.router.load(_id);
                    }
                    else if (elemType == 'hyperlink') {
                        var link = repo.get(_id),
                            dialogConfig = {
                                closeOutside: false,
                                title: "dialogs.hyperlink.title",
                                content: {
                                    currentUrl: link.data.url
                                },
                                buttons: {
                                    yes: {label: 'OK'},
                                    cancel: {label: 'Cancel'}
                                }
                            };

                        events.once('onHyperlinkConfirm', function(res) {
                            if (_.isObject(res)) {
                                repo.updateProperty(_id, 'url', res.url);
                            }
                        });

                        dialogs.create('hyperlink', dialogConfig, 'onHyperlinkConfirm');
                    }
                };

                var clearInlineElementActions = function f1271(e) { // on mouseout remove IB buttons

                    if (e.type === 'click' &&
                        ($(e.currentTarget).hasClass('remove') || $(e.currentTarget).hasClass('edit'))) {
                         $(this).find('.' + buttonsClass).remove();
                    } else if ($(e.toElement).parents('.' + buttonsClass).length === 0 && !$(e.toElement).hasClass(elemType) && !$(e.toElement).hasClass(buttonsClass)) {

                        $(this).find('.' + buttonsClass).remove();
                    }
                }

                var _actions_css = {};
                var get_elements = function f1272() {
                    return {
                        remove: $("<button>").attr({
                            "class": 'remove btn btn-small',
                            "contenteditable": 'false'
                        }).append("<span class='icon-trash base-icon'>"),
                        edit: $("<button>").attr({
                            "class": 'edit btn btn-small',
                            "contenteditable": 'false'
                        }).append("<span class='icon-cog base-icon'>"),
                        group: $("<div></div>").attr({
                            "class": buttonsClass
                        })
                    }
                };


                element.on('mouseover', function f1273() {

                    //mouse over info-baloon button elements: means we dont need to add them again
                    if ($(this).find('.remove, .edit, .' + buttonsClass).length) {
                        return $(this).off('mouseout').one('mouseout', clearInlineElementActions);
                    }

                    self.body.find('.infoBaloon, .hyperlink').each(function f1274() {
                        var node = element instanceof Node ? element : element[0];
                        if (!this.isSameNode(node)) {
                            $(this).find('.' + buttonsClass).remove();
                        }
                    });

                   var action_elements = get_elements();

                    //create div container of the two buttons
                    action_elements.group.
                                    append(action_elements.edit).
                                    append(action_elements.remove);


                    action_elements.edit.on('click.inlineElementClick', inlineElementClick.bind(this));
                    _actions_css.top = $(this).offset().top;

                    //check if position of IB on right is out of the iframe borders,if so- put it on the left side
                    if($(this).offset().left + $(this).outerWidth(true)+45 > self.iframe.width() ){
                        _actions_css.left = ($(this).offset().left - 45 < 0 ? 0 : $(this).offset().left - 45);

                        action_elements.group.css({
                            'top': _actions_css.top,
                            'left': _actions_css.left
                        });
                    } else { // put buttons on the right side of the IB
                        _actions_css.left = $(this).offset().left + $(this).outerWidth(true)

                        action_elements.group.css({
                            'top': _actions_css.top,
                            'left': _actions_css.left
                        });
                    }

                    //remove IB 'a' wrap and IB buttons
                    action_elements.remove.click(function f1275() {
                        $(this).parents('.infoBaloon, .hyperlink').contents().unwrap();
                        $(this).parents('.' + buttonsClass).remove();
                    });


                    $(this).one('mouseout', clearInlineElementActions);
                    $(this).append(action_elements.group);

                }).one('mouseout', clearInlineElementActions);
				//return the edit function , to call it right afert creating a new element
                return inlineElementClick;

            },

            //set all the task events to the iframe
            bubbleUpWrapperEvents: function f1276(val) {

                var $wrapper = this.iframe.parents('.element_preview_wrapper').eq(0);

                var native_events = ['click', 'mouseover', 'mouseout'];


                _.each(native_events, _.bind(function f1277(eventName) {

                    if (val) {
                        this.body.bind(eventName, (function f1278(eventName) {
                            return function f1279(e) {
                                $wrapper.trigger(eventName);


                            }
                        })(eventName));

                    } else {
                        this.body.unbind(eventName);
                    }

                }, this));


            },

            startEditing: function f1281(event) {
                if (this.isStartEditing)  return false;

                logger.debug(logger.category.EDITOR, 'Turning text viewer (id: ' + this.controller.record.id + ') stage into edit Mode');

                this.isStartEditing = true;

                var onIframeLoaded = function() {
                    this.setIframeWidth();

                    this.setSelectionMode(true);

                    this.body.children('[contenteditable]').each(function f1282() {
                        $(this).attr("contenteditable", true);
                    });

                    this.body.find('li[contenteditable]').each(function f1283() {
                        $(this).attr("contenteditable", true);
                    });

                    this.setCaretPositionEnd(this.body.children().first().get(0), this.document.getSelection());

                    this.controller.setInternalEvents();
                    this.setExternalIframeEvents();


                    this.registerEvents();
                    this.bubbleUpWrapperEvents(false);


                    _.each(this.mathfieldArr, function f1284(item) {
                        item.setEnabled(true);
                    });

                    _.defer(function() {
                        events.bind('openSubMenu', this.controller.setMenu, this.controller);
                        this.body.focus();
                    }.bind(this));
                }.bind(this);

                // Set iframe if doesn't exist
                if (!this.$('iframe').length) {
                    $('<iframe id="textViewerEditor_' + this.controller.record.id + '" class="textViewerEditor" />').insertBefore(this.$('img.textViewer-placeholder'));
                    this.$('img.textViewer-placeholder').remove();
                    this.setIframe(null, null, function() {
                        onIframeLoaded();
                    }.bind(this));
                }
                else {
                    onIframeLoaded();
                }


            },
            setSelectionMode: function (flag) {
                if (flag) {
                    this.body.css('-webkit-user-select', 'auto');
                    this.body.find('div').css('-webkit-user-select', 'auto');
                } else {
                    this.body.css('-webkit-user-select', 'none');
                    this.body.find('div').css('-webkit-user-select', 'none');
                }
            },
            endEditing: function f1285(dontRenderPlaceHolder) {
                if (!this.isStartEditing) return;

                this.resetDocumentProperties();

                if (!this.document) return;

                this.isStartEditing = false;

                events.unbind('openSubMenu', this.controller.setMenu, this.controller);

                this.body.unbind("mousedown.select_mathfield");

                _.each(this.body.find("mathfieldtag"), function f1286() {
                    $(this).off("mouseenter");
                    $(this).off("mouseout");
                    $(this).off("mouseup")

                });

                this.endMathfieldEdit(false);

                $(document).off('mouseup.endMathfieldEdit');

                this.body.children("[contenteditable]").each(function f1287() {
                    $(this).attr("contenteditable", false);
                });

                this.body.find("li[contenteditable]").each(function f1288() {
                    $(this).attr("contenteditable", false);
                });

                this.controller.unbindTextViewerEvents();

                this.unregisterEvents();
                this.bubbleUpWrapperEvents(true);

                this._handle_remove_active_element(true);

                this.saveData();

                this.setSelectionMode(false);
                this.body.css('background-color', 'transparent');

                // Create placeholder image, if needed
                require('userModel').configuration.enableTVEAsImage &&
                !dontRenderPlaceHolder &&
                this.renderPlaceholder();

                _.each(this.mathfieldArr, function f1289(item) {
                    item.view.setEnabled(false);
                });

                var childConfig = this.controller.record.childConfig;
                if ( !! childConfig && !! childConfig.tvEndEditingCallback) {
                    childConfig.tvEndEditingCallback();
                }
            },

            renderPlaceholder: function(ignore) {

                // Create clone of iframe
                var tvClone = $('<iframe class="tvClone">')
                                .width(this.iframe.width())
                                .height(this.iframe.height())
                                .css({
                                    'position': 'absolute',
                                    'top': '-1000px',
                                    'left': '-1000px',
                                    'visibility': 'hidden'
                                })
                                .addClass(this.iframe.attr('class'))
                                .appendTo($('body'));

                if (tvClone[0].contentDocument && this.body && this.body.length) {
                    repo.startTransaction(ignore ? { ignore: true } : { appendToPrevious: true });
                    repo.deleteProperty(this.controller.elementId, 'tvPlaceholder', false, true);

                    $(tvClone[0].contentDocument.head).append(this.head.children().clone())
                    tvClone[0].contentDocument.body = this.body.clone()[0];

                     /*set direction on the body, because that arabic font require this css property,
                    in order to render correctly the image with html2canvas*/
                    $(tvClone[0].contentDocument.body).css('text-align', localeModel.getConfig('direction') == 'rtl' ?'right' : 'left');

                    var renderImage = function() {
                            _.delay( function(){
                                html2canvas( tvClone[0].contentDocument.body, {
                                    logging: true,
                                    doc: tvClone[0].contentDocument,
                                    onrendered: function(canvas) {
                                        tvClone.remove();
                                        canvas.toBlob(function f1173(blob) {
                                            var fr = new FileReader;
                                            // Load blob as base64 and save
                                            fr.onload = function(ev) {
                                                repo.updateProperty(this.controller.elementId, 'tvPlaceholder', ev.target.result, false, true);
                                                repo.endTransaction();

                                                var tvc = require('repo_controllers').get(this.controller.elementId);
                                                if (tvc && tvc.stage_view && !tvc.stage_view.isStartEditing) {
                                                    tvc.renderChildren({ bindEvents: !tvc.config.previewMode });
                                                }
                                            }.bind(this);
                                            fr.readAsDataURL(blob);
                                        }.bind(this));
                                    }.bind(this),
                                    background: undefined
                                });
                            }.bind(this), 150); // use delay to wait fot the fonts to load
                        }.bind(this);

                    var preArrangeText = function(){

                        //change ul/li lists to divs. because that the html to canvas is not rendering the css list style property
                        var lists = $('ul', tvClone[0].contentDocument.body)
                        lists.each(function(){
                            var ulPaddingStart =  parseFloat($(this).css('-webkit-padding-start')),
                                listItems = $(this).children('li'),
                                isOrderedList = $(this).hasClass('orderedList');

                            listItems.each(function(index){
                                var liDiv = $('<div/>'),
                                    listIcon = $('<div/>').css({'position':'absolute'}).html(isOrderedList ? ((index + 1) +".&nbsp;&nbsp;") : '&bull;&nbsp;&nbsp;'),
                                    listContent = $("<div/>").css('display','inline-block').html($(this).html());

                                liDiv.append(listIcon).append(listContent);
                                $(this).replaceWith(liDiv);

                                /*  after rendering the list icon ( number/bullet) add him it's position
                                    according to the original ul padding
                                    position the number in the middle of the ul padding.
                                    do this after adding to the DOM in order to have the width of the number*/
                                listIconPadding = (ulPaddingStart - (((ulPaddingStart - listIcon.width())/2) > 0 ?((ulPaddingStart - listIcon.width())/2) : 0));
                                var cssStyle = {};
                                cssStyle[localeModel.getConfig('direction') == 'rtl'? 'margin-right': 'margin-left'] = "-" +listIconPadding + "px";
                                listIcon.css(cssStyle);
                            });
                        });
                        renderImage();
                    }
                    /*  check if there are mathfield elements in the TVE.
                        if so, add the link to css file in order to have the css loaded before calling the html2canvas function*/
                    var mathfieldElements = $("mathfieldTag", tvClone[0].contentDocument.body);
                    if(mathfieldElements.length){
                        var head  = tvClone[0].contentDocument.head;
                        var link  = $('<link/>').attr({
                            "type" : 'text/css',
                            "href" : 'js/components/mathfield/internal/_mathfield.css',
                            "rel"  : 'stylesheet'
                        });
                        $(head).append(link);
                    }

                    // ignore images inside mathfield editor, inline sound and narration will be handeled differently
                    var images = $("img", tvClone[0].contentDocument.body).not( "[type='inlineSound'], [type='inlineNarration'], mathfieldtag img"),
                    styles = $('link', tvClone[0].contentDocument.head),
                    inlineElements = $("img[type='inlineNarration'], img[type='inlineSound']", tvClone[0].contentDocument.body),
                    totalLoads = images.length + styles.length + inlineElements.length;

                    if (!totalLoads) {
                        preArrangeText();
                    }

                    /*put the styles links in an image and wait to the 'on error' callback.
                    (because that the type dont match an error will oucour)
                    this way we know that the link has ended loading*/
                    styles.each(function(){

                        var image = new Image;
                        image.src = this.href;
                        image.onerror = function() {

                            totalLoads--;
                            if (!totalLoads) {
                                preArrangeText();
                            }
                        };
                    });

                    // Load images and replace it's src with base64
                    images.each(function() {
                        var req = new XMLHttpRequest,
                            img = this;

                        req.open('GET', this.src);
                        req.responseType = 'blob';
                        req.onload = function(e) {
                            var fr = new FileReader;
                            fr.onload = function(ev) {
                                img.src = ev.target.result;
                                totalLoads--;
                                if (!totalLoads) {
                                    preArrangeText();
                                }
                            };
                            fr.readAsDataURL(e.target.response);
                        }
                        req.send();
                    });

                   //load the inline sound + inline narration images. because currenly its in the css,
                   //and the html2canvas dont support background image
                    inlineElements.each(function(){

                        var img = $(this),
                            filename = $(this).attr('type') + "_" + ($(this).attr('state')||true) + ".png",
                            url = location.origin + location.pathname,
                            url = [url.substr(0, url.lastIndexOf('/')), 'media', filename].join('/');

                        var req = new XMLHttpRequest;
                        req.open('GET', url);
                        req.responseType = 'blob';
                        req.onload = function(e) {
                            var fr = new FileReader;
                            fr.onload = function(ev) {
                                img.attr('src' , ev.target.result);
                                totalLoads--;
                                if (!totalLoads) {
                                    preArrangeText();
                                }
                            };
                            fr.readAsDataURL(e.target.response);
                        }
                        req.send();
                    });
                }
                else {
                    tvClone.remove();
                }
            },

            saveData: function f1290(dontRemoveEmptyMathfield) {
                this.resetDocumentProperties();
                //check if there is an element in repo (can happen after delete of textviewer)
                if (!repo.get(this.controller.elementId)) {
                    return;
                }
                repo.startTransaction();
                repo.updateProperty(this.controller.elementId, 'textEditorStyle', this.body.attr('class'));

                //save the text viewer and his childs to repo
                //remove all previous children, to prevent unupdated data, except from the infoBaloon children
                repo.removeChildren(this.controller.elementId, ['infoBaloon', 'hyperlink']);

                // Remove deleted infoBalloons
                var ibIds = $('a.infoBaloon, a.hyperlink', this.body).map(function() {
                    return $(this).attr('id')
                }).toArray();
                _.each(this.controller.record.children, function(child) {
                    if (ibIds.indexOf(child) == -1) {
                        repo.remove(child);
                    }
                });

                var clonedHtml = $(this.body).clone();

                var onMathfieldEmpty = function f1291(mathfieldObject, clonedHtml) {
                    if (this.onMathfieldRemove) {
                        this.onMathfieldRemove.call(this, mathfieldObject);
                    }

                    this.body.find('#' + mathfieldObject.attr('id')).replaceWith("");
                    clonedHtml.find('#' + mathfieldObject.attr('id')).replaceWith("");

                    if (markupArr[mathfieldObject.attr('id')]) {
                        delete markupArr[mathfieldObject.attr('id')];
                    }

                    if (this.mathfieldArr[mathfieldObject.attr('id')]) {
                        this.mathfieldArr[mathfieldObject.attr('id')].view.keyboard &&
                            this.mathfieldArr[mathfieldObject.attr('id')].view.keyboard.hide()

                        delete this.mathfieldArr[mathfieldObject.attr('id')];
                    }
                    this.update_text_viewer_dimensions();
                }.bind(this);

                //replace the .component elements (inline img, sound, narration), with a <component> tag, and save it like this in repo.
                _.each($(clonedHtml).find('.component'), _.bind(function f1292(item) {
                    var itemType = $(item).attr('type');

                    switch (itemType) {
                        case 'inlineNarration':
                            var narrations = JSON.parse($(item).attr('narrations'));
                            var itemConfig = {
                                parentId: this.controller.elementId,
                                type: 'inlineNarration',
                                data: {
                                    'narrations': _.mapValues(narrations, function(val) { return val.component_src; }),
                                    'class': $(item).attr('class'),
                                    'naturalHeight':$(item).attr('naturalHeight') ? $(item).attr('naturalHeight') : null,
                                    'naturalWidth':$(item).attr('naturalWidth') ? $(item).attr('naturalWidth') : null
                                }
                            };

                            itemConfig.data.assetManager = [];

                            _.each(narrations, function (narrationItem) {
                                itemConfig.data.assetManager.push({
                                    'srcAttr': 'narrations',
                                    'assetId': narrationItem.assetId ? narrationItem.assetId : null,
                                    'state': _.isBoolean(narrationItem.state) ? narrationItem.state : (narrationItem.state != 'false'),
                                    'isNarration': true,
                                    'asIs': _.isBoolean(narrationItem.asIs) ? narrationItem.asIs : (narrationItem.asIs == 'true'),
                                    'locale': narrationItem.locale,
                                    'narrationText': narrationItem.narrationText ? narrationItem.narrationText : null,
                                    'origin': narrationItem.origin,
                                    'allowFiles': FileUpload.params.audio.allowFiles,
                                    'fileMymType': FileUpload.params.audio.fileMymType,
                                    "notes": narrationItem.notes
                                })
                            });

                            break;
                        default:
                            var itemConfig = {
                                parentId: this.controller.elementId,
                                type: $(item).attr('type'),
                                data: {
                                    'component_src': $(item).attr('component_src'),
                                    'class': $(item).attr('class'),
                                    'naturalHeight': $(item).attr('naturalHeight') ? $(item).attr('naturalHeight') : null,
                                    'naturalWidth': $(item).attr('naturalWidth') ? $(item).attr('naturalWidth') : null
                                }
                            };

                            // If it's inline asset - add asset manager data to item
                            if (['inlineImage', 'inlineSound'].indexOf(itemConfig.type) >= 0) {
                                itemConfig.data.assetManager = [{
                                    'srcAttr': 'component_src',
                                    'assetId': $(item).attr('assetId') ? $(item).attr('assetId') : null,
                                    'state': $(item).attr('state') ? $(item).attr('state') == 'true' : true,
                                    'isNarration': itemConfig.type == 'inlineNarration',
                                    'asIs': $(item).attr('asIs') == 'true',
                                    'narrationText': $(item).attr('narrationText') ? $(item).attr('narrationText') : null,
                                    'origin': $(item).attr('origin'),
                                    'allowFiles': itemConfig.type == 'inlineImage' ? FileUpload.params.image.allowFiles : FileUpload.params.audio.allowFiles,
                                    'fileMymType': itemConfig.type == 'inlineImage' ? FileUpload.params.image.fileMymType : FileUpload.params.audio.fileMymType,
                                    "notes": $(item).attr('notes')
                                }];
                            }

                            if (itemConfig.type === "latex" || itemConfig.type === "MathML") {
                                itemConfig.data.markup = $(item).attr('markup');
                            }
                        break;
                    }

                    var id = this.controller.createItem(itemConfig);
                    $(item).replaceWith('<component id="' + id + '"/>');

                }, this));

                //save all mathfield's markup in an array
                var markupArr = {};

                _.each(this.mathfieldArr, _.bind(function f1293(mathfieldObject, id) {
                     var markup = mathfieldObject.view.getMarkUpValue();
                    var widthEM = mathfieldObject.view.getWidthEM();

                    markupArr[id] = {
                        markup: markup,
                        maxHeight: mathfieldObject.cfg.data.attr("maxHeight"),
                        widthEM : widthEM
                    };
                }, this));
                //replace each .mathfield with the mathfield markup

                var markupMathfieldTags = $(clonedHtml).find('mathfieldtag');

                function setMathfieldMarkup(item) {
                    //clone the html to check free text inside mathfield tag
                    var cloneMathfieldDom = item.clone();

                    //check if the element has a mathfield inside it
                    if (cloneMathfieldDom.find('.mathField').length > 0) {
                        //remove the mathfield to find a data written inside the tag
                        _.each(cloneMathfieldDom.find('.mathField'), function f1295(x) {
                            $(x).remove();
                        });
                        //insert the text inside the mathfield tag
                        if (cloneMathfieldDom.text().trim() !== "") {
                            item.replaceWith($('<mathField>').attr({
                                id: item.attr('id'),
                                idx: item.attr('idx')
                            }).after(cloneMathfieldDom.text().trim()));
                        } else {
                            item.replaceWith($('<mathField>').attr({
                                id: item.attr('id'),
                                idx: item.attr('idx')
                            }));
                        }
                    }
                }

                markupMathfieldTags.each(function () {
                    var mathfieldsHasBreakLines =$(this).html() === "<br>" ? true : false;
                    var markupObject = markupArr && markupArr[$(this).attr('id')] || false;

                    //in case the mathfield was deleted (its content but the div wasnt deleted)
                    if (!markupObject || markupObject.markup === "" || mathfieldsHasBreakLines) {
                        if (!$(this).parent().is('ANSWERFIELD') && !dontRemoveEmptyMathfield) {
                            onMathfieldEmpty.call(this, $(this), clonedHtml);
                        } else {
                            setMathfieldMarkup($(this));
                        }
                    } else {
                        setMathfieldMarkup($(this));
                    }
                });

                repo.updateProperty(this.controller.elementId, 'title', clonedHtml.html());
                repo.updateProperty(this.controller.elementId, 'mathfieldArray', markupArr);
                repo.endTransaction();

            },

            render: function f1296(val) {
                if (this.formatter) {
                    return false;
                }

                this._super(val);

                //mark this stage as not deletable
                this.$el[this.controller.record.data.stageReadOnlyMode ? 'addClass' : 'removeClass']('notSelectable');

                // setIframe if iframe exists (not rendered with placeholder image)
                if (this.$('iframe:visible').length ) {
                    this.setIframe(undefined, undefined, function() {
                        // Create placeholder image  for textviewer
                        if (    require('userModel').configuration.enableTVEAsImage &&
                                !this.controller.record.data.isNoncheckable &&
                                this.controller.record.type != 'cloze_text_viewer') {
                            this.renderPlaceholder(true);
                        }
                    }.bind(this));
                    this.bubbleUpWrapperEvents(true);
                }
                else {
                    if (this.controller.record.data.autoWidth) {
                        this.$el.find("." + this.controller.elementType + "_content").css('width', !! this.controller.record.data.width ? this.controller.record.data.width : "100%");
                    }
                }
            },
            setMenuItemsState: function f1297(v) {

                switch (this.controller.record.data.mode) {
                    case 'bankStyle':
                        events.fire('setMenuButtonState', 'menu-button-insert-mf', v);
                    break;
                    case 'noInfoBaloon':
                        events.fire('setMenuButtonState', 'menu-button-insert-ib', 'disable');
                        events.fire('setMenuButtonState', 'menu-button-insert-link', 'disable');
                    break;
                    default:
                        events.fire('setMenuButtonState', 'menu-button-insert-sb', v);
                        events.fire('setMenuButtonState', 'menu-button-insert-img', v);
                        events.fire('setMenuButtonState', 'menu-button-paragraph-decrease-indent', v);
                        events.fire('setMenuButtonState', 'menu-button-paragraph-increase-indent', v);
                        events.fire('setMenuButtonState', 'menu-button-paragraph-bullet_number', v);
                        events.fire('setMenuButtonState', 'menu-button-paragraph-math', v);
                        events.fire('setMenuButtonState', 'menu-button-insert-mf', v);
                        events.fire('setMenuButtonState', 'menu-button-insert-latex', v);
                        events.fire('setMenuButtonState', 'menu-button-insert-mathml', v);
                        events.fire('setMenuButtonState', 'menu-button-font-upper', v);
                        events.fire('setMenuButtonState', 'menu-button-font-lower', v);
                        events.fire('setMenuButtonState', 'menu-button-text-effects', v);
                        events.fire('setMenuButtonState', 'menu-button-text-style', v);
                    break;
                }
            },
            isContentEditableSelected: function f1298() {
                if (!this.document) return false;

                var selection = this.document.getSelection();
                var selectedNode = selection && selection.focusNode && selection.focusNode.parentNode || false;
                var validEditableNodes = ['DIV', 'LI'];

                if (selectedNode && validEditableNodes.indexOf(selectedNode.nodeName) !== -1) {
                    return true;
                }

                return false;
            },
            styleShorcuts: function f1299(element) {
                var self = this;
                var isCtrlDown = false;

                $(element).bind('keydown', function f1300(e) {
                    //dont allow writing more than max chars defined
                    // 8, 46 is delete key and backspace
                    if([8,46].indexOf(e.keyCode)==-1 &&
                        //check the max char property , but not on cloze text viewer
                        (   self.controller.record.type !== "cloze_text_viewer" &&
                            this.body.innerText.length >= self.controller.record.data.MaxChars)){
                        return false;
                    }
                    if (self.isContentEditableSelected()) {
                        if (e.keyCode === 17) isCtrlDown = true;
                        else {
                            if (isCtrlDown && [66, 73, 85].indexOf(e.keyCode) !== -1) {
                                e.preventDefault();
                                return false;
                            }
                        }
                    }

                    return true;
                });

                $(element).bind('keyup', function f1301(e) {
                    if (self.isContentEditableSelected()) {
                        if (e.keyCode === 17) isCtrlDown = false;
                        else {
                            if (isCtrlDown && [66, 73, 85].indexOf(e.keyCode) !== -1) {
                                e.preventDefault();
                                return false;
                            }
                        }
                    }

                    return true;
                })
            },
            keyDownHelpers: {},
            hasDesignMode: function f1302() {
                var selection = this.document && this.document.getSelection();

                return (selection && true) || false;
            },
            writeToIframe: function f1303(content) {
                try {
                    this.document.open();
                    this.document.write(content);
                    this.document.close();
                } catch (e) {
                    throw 'Error write content to iframe';
                }
            },
            setDocument: function f1304() {
                if (this.iframe.length) {
                    this.iframe = $("#" + this.iframe.get(0).id);
                    this.document = this.iframe.contents().get(0);
                }
            },
            setHead: function f1305() {
                this.head = this.iframe.contents().find('head');
            },
            setBody: function f1306() {
                this.body = this.iframe.contents().find('body');
            },
            setCaretEvent: function f1307() {

            },
            endMathfieldEdit: function f1308(dispose) {
                _.each(this.mathfieldArr, function f1309(mf) {
                    if (dispose) {
                        mf.dispose();
                    } else {
                        mf.view.endEdit();
                    }
                });
            },
            setExternalIframeEvents: function f1310() {
                $(document).on("mouseup.endMathfieldEdit", function f1311(e) {
                    if ($(e.target).parents(".screen-header").length || $(e.target).parents(".keyboard").length) return;

                   this.endMathfieldEdit();
                }.bind(this));

                $(this.body).on("mouseup.innerEndMathfieldEdit", function f1311(e) {
                    if ($(e.target).parents(".screen-header").length || $(e.target).parents(".keyboard").length) return;

                   this.endMathfieldEdit();
                }.bind(this));

               $(this.body).children('DIV').each(function () {
                    $(this).get(0).ondragstart = function (e) {
                        return e.preventDefault();
                    }
               })



                 $(this.document).off("keydown.handleBackspace").on("keydown.handleBackspace", function f1313(e) {
                    var selection = this.document.getSelection();
                    if (!this.isStartEditing || (selection && selection.type === 'None' && !this.isMathfieldSelected)) {
                        return e.preventDefault();
                    }
                }.bind(this));

                 $(this.body).on('focus', function () {
                    events.exists("closeSubMenu") && events.fire('closeSubMenu');

                    if (this.isStartEditing) {
                        this.setSelectionMode(true);
                    }

                }.bind(this));

            },
            setInternalIframeEvents: function f1314() {
                var isTabDown = false;
                var isDblClick;
                var isMousedown;

                function handleSubElementDelete(e) {
                    var selector = this.getValidSelector(this.document.getSelection()),
                        _focus;

                    var selection = this.document.getSelection();

                    if (selection.anchorNode && selection.anchorNode.nodeName === 'BODY') return e.preventDefault();

                    if (selector && selector.nodeName === 'A' && selector.textContent.length === 1) {
                        _focus = selector.previousSibling.nodeName === "#text" ? selector.previousSibling.parentNode : selector.previousSibling;

                        $(selector).remove();
                    }
                };




                function handleKeyEvent(e) {
                    function handleDeleteKey(e) {

                        this.body.children().children('br').remove();

                        var _new_paragraph = $(this._default_paragraph_html).empty();
                        _new_paragraph.attr('contenteditable', true);

                        if (this.body.children().first().is('br') || !this.body.children().length) {
                            this.body.children('br').after(_new_paragraph.clone());
                            this.body.children('br').remove();
                            if (!this.body.children().length) {
                                this.body.append(_new_paragraph.clone());
                            }
                        }

                        var sel = this.document.getSelection();
                        if (sel && sel.anchorNode && sel.anchorNode.tagName == 'BODY') {
                            this.setCaretPositionStart(this.body.children().first().get(0), this.document.getSelection());
                        }

                        // if (this.body.children().first().is('BR') || !this.body.children().length) {
                        //     e.preventDefault();

                        //     var _new_paragraph = $(this._default_paragraph_html).empty();
                        //     _new_paragraph.attr('contenteditable', true);
                        //     this.body.html(_new_paragraph);

                        //     this.setCaretPositionEnd(this.body.children().first().get(0), this.document.getSelection());
                        // }

                        //all elements wihtout class attribute, unwrap the span tag
                        this.body.children('span:not([class])').contents().unwrap();

                        this.update_text_viewer_dimensions();
                    };

                    function handleThinMode(e) {
                        if (!~[38, 40].indexOf(e.keyCode)) {
                            this.update_text_viewer_dimensions();
                        }
                    }

                    function handleEnterKey(e) {
                        var selection = this.document.getSelection();
                        var anchorNode = $(selection.anchorNode);
                        var range = selection.getRangeAt(0);


                        if (anchorNode.children().first().is('BR')) {
                            range.setEndBefore(anchorNode.find('br')[0]);
                        }
                    }



                    var specific_keys_handlers = {
                        27: function f1315(e) {
                            this.endEditing();
                        },
                        46: handleDeleteKey,
                        8: handleDeleteKey,
                        13: handleEnterKey
                    }

                    if (specific_keys_handlers[e.keyCode]) {
                        try {
                            specific_keys_handlers[e.keyCode].call(this, e);
                        } catch (err) {

                        }
                    } else {
                        if (this.controller.record.data.mode === 'thin') {
                            handleThinMode.call(this, e);
                        } else {
                            return this.handleKeyEvent.call(this, e, this.keyEventHelpers, "keyup");
                        }
                    }

                };

                function handleDocumentClick(e) {
                    if (e.target.nodeName !== 'ANSWERFIELD') {
                        _.delay(this.setMenuFromSelection.bind(this, 50));

                    }

                    isDblClick = false;
                    
                    _.delay(function () {
                        if (!isDblClick && !isMousedown) {
                            var selection = this.document.getSelection();

                            if (selection && selection.type === "Range") {
                                this.document.getSelection().removeAllRanges();
                            }
                        }
                    }.bind(this), 500)
                };

                function handleAnswerField(e) {
                    if ([37, 38, 39, 40].indexOf(e.keyCode) !== -1) {

                        return;
                    }

                    return this.handleAnswerField.call(this, e, this.keyEventHelpers, "keydown");
                };

                function handleList(e) {
                    return this.handleKeyEvent.call(this, e, this.keyEventHelpers, "keydown");
                }

                function isComponentSelection() {
                    try {
                        var selection = this.document.getSelection();
                        var range = selection.getRangeAt(0);
                        var contents = range.cloneContents();
                            contents = $("<temp></temp>").append($(contents));

                        if (contents.find('img, mathfieldtag, latex, answerfield, .infoBaloon, .hyperlink').length) {
                            return true;
                        }

                        if (selection.anchorNode && $(selection.anchorNode).parents("answerfield, .infoBaloon").length) {
                            return true;
                        }
                    } catch (e) {
                        return true;
                    }

                    return false;
                }

                function changeCaretFocus(el) {
                    var r = this.document.createRange();
                    var sel = this.document.getSelection();

                    r.selectNodeContents(el);
                    r.collapse(false);

                    sel.removeAllRanges();
                    sel.addRange(r);
                }

                function handleEnterKeyOnKeyDown(e) {
                    if (e.keyCode !== 13) return;
                    /*in single line mode we prevent the user from clicking the enter key*/
                    if (this.controller.record.data.singleLineMode) {
                        e.preventDefault();
                        return;
                    }

                    var selection = this.document.getSelection();
                    var anchorNode = $(selection.anchorNode);

                    if (anchorNode.get(0) && anchorNode.get(0).nodeName && anchorNode.get(0).nodeName === "#text") pNode = anchorNode.parent();
                    else pNode = anchorNode;

                    if (!pNode.is('DIV') && !pNode.is('LI')) {
                        paragraphNode = pNode.parents('DIV');

                        if (paragraphNode.contents().last().length && (paragraphNode.contents().last().get(0).nodeName !== "#text" || paragraphNode.contents().last().get(0).length === 0)) {
                            paragraphNode.append("&nbsp;")
                            changeCaretFocus(paragraphNode.get(0));
                        }
                    } else {
                        return;
                    }
                }

                $(this.document).off('dblclick.select_text mousedown.keep_select_text mouseup.select_text_done click.handle_document_click mouseup.handle_document_mouseup')

                $(this.document).on('dblclick.select_text', function (e) {
                    isDblClick = true;
                });

                $(this.document).on('mousedown.keep_select_text', function (e) {
                    isMousedown = true;
                })

                $(this.document).on('mouseup.select_text_done', function (e) {
                    if (this.document.getSelection() && this.document.getSelection().type !== "Range") {
                        isMousedown = false;
                    }

                    if (isComponentSelection.call(this)) {
                        events.fire('setMenuButtonState', 'menu-button-insert-af', 'disable');
                        events.fire('setMenuButtonState', 'menu-button-insert-ib', 'disable');
                        events.fire('setMenuButtonState', 'menu-button-insert-link', 'disable');
                    }
                }.bind(this))

                $(this.document).on("click.handle_document_click", handleDocumentClick.bind(this));
                $(this.document).on("mouseup.handle_document_mouseup", function (e) {
                    _.delay(this.setMenuFromSelection.bind(this), 50)
                }.bind(this));

                this.body.bind('keydown.handleSubElementDelete', handleSubElementDelete.bind(this));
                this.body.bind('keyup.handleKeyEvent', handleKeyEvent.bind(this));
                this.body.bind('keydown.handleEnterKeyOnKeyDown', handleEnterKeyOnKeyDown.bind(this));

                if (this.controller.record.data.mode !== "thin") {

                    this.body.bind('keydown.handleAnswerField', handleAnswerField.bind(this));
                    this.body.bind('keydown.handleList', handleList.bind(this));

                    this.body.bind('keyup.handleTabEvent', _.bind(function f1316(e) {
                       if (e.keyCode === 9 && isTabDown) {
                            this.handleTabEvent(e);
                            isTabDown = false;
                        } else {

                            this.setIframeHeight();
                        }

                        return true;
                    }, this));

                    this.body.bind('keydown.handleTabEvent', _.bind(function f1317(e) {
                        if (e.keyCode === 9 && !isTabDown) {
                            isTabDown = true;
                            return e.preventDefault();
                        }
                    }, this));
                }

            },
            handleTabEvent: function f1318(e) {
                var selection = this.document.getSelection();
                var selector;

                if (!selection || !selection.anchorNode) return false;

                if (selection.anchorNode.nodeName === "#text") {
                    selector = selection.anchorNode.parentNode;
                } else {
                    selector = selection.anchorNode;
                }

                if (selector.nodeName === "LI" && $(selector).parent().children().length > 1) {
                    var itemContent = selector.innerHTML;
                    var innerUl = $("<ul></ul>");
                    var cloneLi = $(selector).clone();

                    innerUl.attr('class', $(selector).parent().attr('class'));
                    innerUl.append(cloneLi.html(itemContent));

                    $(selector).css('list-style-type', 'none');

                    var newLi = cloneLi.clone();

                    $(selector).replaceWith(innerUl.appendTo(newLi))


                    this.setCaretPositionEnd(cloneLi.get(0), selection);
                }
            },
            setIframeUnselectable: function f1319() {
                this.body.css('-webkit-user-select', 'none');
            },

	        insertCssLinks: function() {
		        if(this.head && this.head.length) {
			        this.head.append(localeModel.getCSSLinks());
		        }
	        },

            getHTMLAsFragment: function f1321(_iframe, text, mathfieldArray) {
                var floatDirection = {
                    'rtl': 'right',
                    'ltr': 'left'
                };

                var initHTML = '<!DOCTYPE html>';
                    initHTML += '<html style="overflow: hidden;">';
                    initHTML += '<head>';
                        initHTML += "<style>.mathField_button{position:absolute;top:200px;left:10px}.mathField_button_value{position:absolute;top:170px;left:10px}.mathField_button_correctness{position:absolute;top:140px;left:10px}.mathField_button_reduction{position:absolute;top:110px;left:10px}@font-face{font-family:'MF_T2K_US-Regular';src:local(\"MF_T2K_US-Regular\"),url(\"js/components/mathfield/assets/fonts/MF_T2K_US-Regular.ttf\") format(\"truetype\")}@font-face{font-family:'MF_T2K_US-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_US-Bold.ttf\") format(\"truetype\");font-weight:bold}@font-face{font-family:'MF_T2K_US-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_US-Bold-Italic.ttf\") format(\"truetype\");font-style:italic;font-weight:bold}@font-face{font-family:'MF_T2K_US-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_US-Italic.ttf\") format(\"truetype\");font-style:italic}@font-face{font-family:'MF_T2K_HE-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_HE-Regular.ttf\") format(\"truetype\")}@font-face{font-family:'MF_T2K_HE-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_HE-Bold.ttf\") format(\"truetype\");font-weight:bold}@font-face{font-family:'MF_T2K_HE-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_HE-Bold-Italic.ttf\") format(\"truetype\");font-style:italic;font-weight:bold}@font-face{font-family:'MF_T2K_HE-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_HE-Italic.ttf\") format(\"truetype\");font-style:italic}@font-face{font-family:'MF_T2K_FR-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_FR-Regular.ttf\") format(\"truetype\")}@font-face{font-family:'MF_T2K_FR-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_FR-Bold.ttf\") format(\"truetype\");font-weight:bold}@font-face{font-family:'MF_T2K_FR-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_FR-Bold-Italic.ttf\") format(\"truetype\");font-style:italic;font-weight:bold}@font-face{font-family:'MF_T2K_FR-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_FR-Italic.ttf\") format(\"truetype\");font-style:italic}@font-face{font-family:'MF_T2K_NL-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_NL-Regular.ttf\") format(\"truetype\")}@font-face{font-family:'MF_T2K_NL-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_NL-Regular.ttf\") format(\"truetype\");font-weight:bold}@font-face{font-family:'MF_T2K_NL-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_NL-Regular.ttf\") format(\"truetype\");font-style:italic;font-weight:bold}@font-face{font-family:'MF_T2K_NL-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_NL-Regular.ttf\") format(\"truetype\")}@font-face{font-family:'MF_T2K_NL-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_NL-Bold.ttf\") format(\"truetype\");font-weight:bold}@font-face{font-family:'MF_T2K_NL-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_NL-Italic.ttf\") format(\"truetype\");font-style:italic}@font-face{font-family:'MF_T2K_NL-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_NL-Bold-Italic.ttf\") format(\"truetype\");font-weight:bold;font-style:italic}.mathField.italicVariables .letter{font-style:italic}.mathField.colorShapes .shape{color:red}.mathField .blowup{position:absolute;z-index:60;display:none;overflow:hidden}.mathField.blowup .blowup{display:block;border:1px solid #b3b3b3;cursor:pointer}.mathField.blowup .blowup:hover{border:1px solid #2ed5ff}.mathField.blowup .blowup .blowupZoom{width:22px;height:22px;position:absolute;top:0;right:0;background:transparent url(js/components/mathfield/assets/images/imageViewer/sprite_ImageContainer.png) 0 -312px no-repeat}.mathField.blowup .blowup:hover .blowupZoom{background-position:0 -334px}.blowupContainer,.task>.blowupContainer,.mathField .blowupContainer{position:fixed;padding:10px;padding-top:21px;border:1px solid #BBB;background-color:#FFF;box-shadow:0 3px 8px 2px rgba(119,118,118,0.7);z-index:80;margin:0;overflow:auto}.mathField .blowupContainer{display:none}.hide{position:absolute !important;top:-9999px !important;left:-9999px !important}.blowupContainer .x,.task>.blowupContainer .x,.mathField .blowupContainer .x{width:40px;height:22px;position:absolute;top:0;cursor:pointer;background:transparent url(js/components/mathfield/assets/images/imageViewer/sprite_ImageContainer.png) 0 -156px no-repeat}.blowupContainer .x:hover,.task>.blowupContainer .x:hover,.mathField .blowupContainer .x:hover{background-position:0 -182px}.mathField .masc{position:absolute;background-color:white;opacity:.01;z-index:40}.completion.structure.placeholder{padding:2px;border:1px solid #ccc;color:#ccc;width:1.4em;height:1.4em;font-size:.6em;display:inline-block;text-align:center;position:relative;top:-0.2em;margin:0 1px}.divider .completion.structure.placeholder{top:.1em;left:.1em}.divided .completion.structure.placeholder{top:.1em}.numerator .completion.structure.placeholder{top:-0.2em}.denominator .completion.structure.placeholder{top:-0.3em}.power .completion.structure.placeholder{top:-0.3em}.absolute .completion.structure.placeholder{top:-0.1em}.completion.structure.placeholder .remainder{top:-0.2em}.mathField.completion.focus .frame{outline:#fff7c2 solid 2px !important;outline-offset:0;background:rgba(255,247,194,0.8)}.mathField .frame{outline-offset:1px;position:absolute;top:0;min-height:1em}.mathField.blowup .frame{outline:none !important}.mathField.blur .frame{outline:1px solid #b3b3b3;background:rgba(255,255,255,0.2)}.mathField.blur.readOnly .frame{background:0}.mathField.blowup.blur .frame{outline:1px solid #b3b3b3;background:rgba(255,255,255,0.2)}.mathField.focus .frame{outline:1px solid #f93;background:rgba(255,255,255,0.2)}.mathField.focus{line-height:normal;vertical-align:baseline}.mathField .frame.not_valid{background:rgba(255,255,255,0.2);outline:solid 1px #d6424c}.mathField.completion .frame.not_valid{border:0;outline:#fee2de solid 2px;outline-offset:0;background:rgba(254,226,222,0.8)}.mathField,.mathField.usa,.mathField.us{font-family:MF_T2K_US-Regular}.mathField.il{font-family:MF_T2K_HE-Regular}.mathField.fr{font-family:MF_T2K_FR-Regular}.mathField.nl{font-family:MF_T2K_NL-Regular}.mathField .symbol,.mathField .caret{display:inline-block;vertical-align:bottom;height:1.05em}.ie9 .mathField .symbol{height:.9em}.ie9 .longDivision .mathField .symbol{height:.9em}@-webkit-keyframes blink-caret{from,to{border-color:black}50%{border-color:transparent}}@keyframes blink-caret{from,to{border-color:black}50%{border-color:transparent}}.mathField .caret{-webkit-animation:blink-caret 1s step-end infinite;-ms-animation:blink-caret 1s step-end infinite;-moz-animation:blink-caret 1s step-end infinite;-o-animation:blink-caret 1s step-end infinite;animation:blink-caret 1s step-end infinite;text-decoration:blink;border-color:black;border-left:0;margin-left:0;border-right:.1em solid transparent;margin-right:-.1em;position:relative;top:1px;width:2px}.mathField{display:inline-block;position:relative;white-space:nowrap;cursor:text;min-height:1.2em;line-height:normal}.mathField .mathField_content .icon{width:auto}.mathField.readOnly{min-height:1em}.mathField .mathField_content{display:inline-block;vertical-align:bottom;min-width:1.3em;min-height:1.3em;position:relative;color:#444;line-height:normal;white-space:inherit !important}.mathField.readOnly .mathField_content,.mathField.empty .mathField_content{min-width:.5em}.mtqBank .mathField.readOnly .mathField_content{vertical-align:bottom}.texteditor .mathField.readOnly{margin:0}.subQuestion>div>.mathField,.subQuestion .subAnswer.mathfield .mathField{display:block}.texteditor .mathField .mathField_content{color:inherit}.mathField .selection{background-color:#9ec6f1}.mathField .not_valid{color:#d6424c}.mpsWrapper.show.not_valid{background-color:#fdaba2 !important;border:none !important}.mathField .mpsAnchor{display:inline-block;vertical-align:bottom;width:0;height:1em;background-color:transparent;position:relative;top:0;margin:0;padding:0}.mathField .fraction .mpsAnchor{width:0;background-color:transparent;margin-top:.5em}.mathField .fraction .numerator .mpsAnchor,.mathField .fraction .denominator .mpsAnchor{width:0;background-color:transparent;margin-top:0}.mathField.readOnly .fraction .numerator .mpsAnchor,.mathField.readOnly .fraction .denominator .mpsAnchor{margin-top:-0.5em}.mathField .mpsLasso{height:1em;width:0;background-color:transparent;display:inline-block;vertical-align:bottom}.mathField .mpsContent{white-space:nowrap !important;height:1.1em;min-width:.5em;left:0;max-width:100%;-webkit-transform-style:preserve-3d}.mathField .power{font-size:.75em;top:-0.6em;padding-top:.6em;line-height:normal}.mathField .power .power{font-size:1em;top:-0.4em;padding-top:.4em}.mathField .symbol{position:relative;min-width:.4em;text-align:left}.mathField .symbol[validationgroup=\"thousandsComma\"],.mathField .symbol[validationgroup=\"decimalPoint\"]{min-width:.2em}.displayInlineBlock,.mathField .mpsContent,.mathField .power,.mathField .fraction,.mathField .longDivision,.mathField .longDivision .divided,.mathField .longDivision .divider,.mathField .root,.mathField .root .radicand,.mathField .root .degree,.mathField .repeatingDecimal,.mathField .repeatingDecimal.fr .icon,.mathField .repeatingDecimal.nl .icon,.mathField .geometry,.mathField .remainder,.mathField .remainder .icon,.mathField .absolute,.mathField .absolute .icon,.mathField .completion{display:inline-block;vertical-align:bottom;position:relative}.mathField .fraction{min-width:1em}.mathField .fraction>.mpsContent{text-align:center}.mathField .fraction .numerator,.mathField .fraction .denominator{min-width:20px;min-height:.9em;font-size:.9em;line-height:100%;display:block;position:relative;padding:0}.mathField .fraction .numerator .symbol,.mathField .fraction .denominator .symbol{max-height:.9em;vertical-align:baseline}.mathField .fraction .fractionBar{width:100%;height:1px;min-height:1px;line-height:100%;background:black;display:block;font-size:.8em;margin-bottom:1px}.mpsMinWidth0_8em,.mathField .longDivision .divided,.mathField .longDivision .divider,.mathField .root .radicand{min-width:.8em;min-height:.9em;line-height:100%;text-align:center}.mpsAnchorWidth0,.mathField .longDivision .mpsAnchor,.mathField .root .mpsAnchor{top:.1em;width:0;background-color:transparent}.ie9 .mathField .longDivision .mpsAnchor{top:.1em}.mpsAnchorNoFloat,.mathField .longDivision .divided .mpsAnchor,.mathField .longDivision .divider .mpsAnchor,.mathField .root .radicand .mpsAnchor,.mathField .root .degree .mpsAnchor{float:none;width:0;background-color:transparent;margin-top:0}.mathField .longDivision.il .divided{top:0}.mathField .longDivision.il .divider{border-top:2px solid #444;top:0}.mathField .longDivision.il .divider :first-child{padding-right:2px}.mathField .longDivision.fr .divided{border-bottom:.1em solid #444;top:0;left:-5px}.mathField .longDivision.fr .divider{top:0;left:-5px}.mathField .longDivision.fr .divided>div{top:2px}.mathField .longDivision.us .divider,.mathField .longDivision.sg .divider{border-top:2px solid #444;top:0}.mathField .longDivision .icon{height:1.1em;width:6px}.mathField .longDivision .icon svg{position:absolute;top:0;height:1.1em}.mathField .longDivision.sg .icon{left:1.4em}.mathField .longDivision.il .icon svg{top:-1px}.mathField .longDivision.fr .icon svg{top:1px}.mathField .root .icon{display:inline-block;position:relative;vertical-align:baseline;width:.65em;height:.95em}.mathField .root .icon .radical_sign{width:100%;height:100%;position:absolute;left:0;top:0;z-index:-1}.mathField .root .icon .radical_sign>img.stretch{height:100%;width:56%}.mathField .root .icon .radical_sign>img{width:44%}.mathField .root .radicand .top_line{border-top:1px solid #444;margin:0;position:relative;width:100%;z-index:-1;height:1px}.mathField .root .degree{vertical-align:top;font-size:.7em;min-width:.75em;min-height:.75em;bottom:.4em}.mathField .root .degree .mpsContent{min-width:.75em;min-height:.75em}.mathField .root .degree .mpsContent div.symbol{height:1em}.mathField .repeatingDecimal{white-space:nowrap}.mathField .repeatingDecimal.us .icon,.mathField .repeatingDecimal.il .icon{position:absolute;font-size:1.2em;top:2px;left:0;background-color:#444;height:2px;width:100%}.mathField .repeatingDecimal.fr .icon,.mathField .repeatingDecimal.nl .icon{line-height:100%;margin:0 0 0 .1em;padding:0;top:.1em;font-family:inherit}.mathField .fraction .repeatingDecimal .icon{top:-2px}.mathField .geometry{line-height:110%;text-align:center}.mathField .geometry .icon{position:absolute;font-size:1.2em;top:-0.08em;left:0}.ie9 .mathField .geometry .icon{top:.05em}.mathField .geometry>.mpsContent{min-width:.9em;left:.1em}.mathField .geometry .symbol{position:relative;font-size:.77em;top:-0.2em}.mathField .remainder{white-space:nowrap;overflow:visible}.mathField .remainder .icon{line-height:100%;margin:0 0 0 .2em;padding:0;top:0;font-family:inherit;max-width:1em}.nl_NL .mathField .remainder .icon{max-width:2.1em}.ie9 .mathField .remainder .icon{top:3px}.mathField .absolute{min-width:1em;text-align:center}.mathField .absolute.not_valid{color:inherit}.mathField .absolute.not_valid .icon.left{color:#d6424c}.mathField .absolute .icon{line-height:1em}.mathField .absolute .icon.right{margin-left:.1em}.mathField .absolute .icon.left{margin-right:.1em}.ie9 .mathField .absolute .icon{line-height:.5em}.mathField .completion{padding:.09em .136em;min-width:1em;line-height:1em}.mathField .completion .operator{margin:0 2px 0 2px}.mathField .completion .mpsContent{text-align:center;line-height:100%}.mathField .completion .mpsContent .mpsContent{height:1em}.mathField .completion .square_root .icon,.mathField .completion .root .icon{left:.05em}.mathField .completion>.mpsContent{min-width:.7em}.mathField .completion .mpsWrapper.show.not_valid{background-color:#fdd985 !important;border:none !important}.mathField .mpsWrapper{position:absolute}.mathField .mpsWrapper.show{background-color:#fdd985;z-index:-1}.mathField.readOnly .mpsWrapper.show{background-color:transparent;border:1px solid #c3c3c3}.mathField.completion.blur .mpsWrapper.show{background-color:#fff !important;border:solid 1px #b3b3b3 !important}.mathField.completion.blur .mpsWrapper.show.not_valid{background-color:#fff !important;border:solid 1px #d6424c !important}.mathField.completion.focus .mpsWrapper.show{background-color:#fff !important;border:solid 1px #f93 !important}.mathField .mathField_content{z-index:20}.mathField.empty{max-height:1.2em;min-height:1em}.mathField.empty.blur{min-width:2rem}.mathField.empty.blur .frame{min-width:2rem}.mathField.empty.blur .mathField_content{max-width:1em}.texteditor .mathField.empty .mathField_content{min-width:1em}.mathField.empty .mf_icon{font-style:italic;font-family:Arial;font-size:.9rem;line-height:.9em;letter-spacing:.1rem;position:absolute;top:-0.15rem;right:0;color:#b3b3b3}.mathField .mf_icon,.clozeArea .subAnswer_content.full .mathField .mf_icon,.mathField.empty.focus .mf_icon{display:none !important}.mathField.empty.blur .mf_icon{display:block !important}.mathField .mathField_input{opacity:.01;width:1px;height:0;padding:0;margin:0;border:0;font-size:0;display:none}.mathField.keyboard{font-size:0;position:absolute;z-index:1000;padding:.71rem 0;margin:0 !important;-moz-user-select:none;-khtml-user-select:none;-webkit-user-select:none;user-select:none}.mathField.keyboard .keyboard_content{background:#efefef;border:1px solid #cacaca;box-shadow:0 2px 8px 0 rgba(0,0,0,0.2);padding:.71rem}.mathField.keyboard.mini{padding:2.429rem .286rem .286rem .286rem}.mathField.keyboard.mini ul.tabs-nav{display:none}.mathField.keyboard.usa,.mathField.keyboard.us{font-family:MF_T2K_US-Regular}.mathField.keyboard.il{font-family:MF_T2K_HE-Regular}.mathField.keyboard ul.tabs-nav ~ .close{background:url(js/components/mathfield/assets/images/imageViewer/sprite_ImageContainer.png) 24px 281px;width:15px;height:15px;position:absolute;top:18px;right:8px;cursor:pointer}.mathField.keyboard ul.tabs-nav.rtl ~ .close{left:8px}.mathField.keyboard ul.tabs-nav{padding:0 0 .71rem 0;line-height:1.214rem}.mathField.keyboard ul.tabs-nav li.tabs-nav-item{font-size:1.28rem;color:#3f97df;cursor:pointer;display:inline-block;border-right:1px solid #cacaca;padding:0 .71rem;text-align:center}.mathField.keyboard ul.tabs-nav li.tabs-nav-item:first-child{padding:0 .71rem 0 0}.mathField.keyboard ul.tabs-nav li.tabs-nav-item:last-child{border-right:0;padding-right:0}.mathField.keyboard ul.tabs-nav.rtl li.tabs-nav-item{border-left:1px solid #cacaca;border-right:0}.mathField.keyboard ul.tabs-nav.rtl li.tabs-nav-item:first-child{padding:0 0 0 .71rem}.mathField.keyboard ul.tabs-nav.rtl li.tabs-nav-item:last-child{border-left:0;padding-left:0}.mathField.keyboard ul.tabs-nav li.tabs-nav-item:hover{color:#4cc4ff}.mathField.keyboard ul.tabs-nav li.tabs-nav-item.selected{color:#f93;font-weight:bold;cursor:default}.mathField.keyboard .tab{display:none;white-space:nowrap}.mathField.keyboard .tab.selected{display:block}.mathField.keyboard .box{display:inline-block;padding-right:.71rem;vertical-align:top}.mathField.keyboard .box:last-child{padding-right:0rem}.mathField.keyboard .line.center{text-align:center}.mathField.keyboard .key{display:inline-block;width:3rem;height:3rem;line-height:3rem;text-align:center;color:#3f97df;background:-webkit-linear-gradient(top,#fff,#f0f0f0);background:-o-linear-gradient(top,#fff,#f0f0f0);background:-moz-linear-gradient(top,#fff,#f0f0f0);background:-ms-linear-gradient(top,#fff 0,#f0f0f0 100%);background:linear-gradient(to top,#fff 0,#f0f0f0 100%);border:1px solid #cacaca;margin:0 -1px -1px 0;cursor:pointer;font-size:1.571rem}.mathField.keyboard .key.literal{font-size:13px;background:#73b1e4;color:white;text-align:left;padding-left:8px;height:29px;line-height:normal;padding-top:9px;font-family:Arial;border:0;margin-bottom:1px}.mathField.keyboard .key.literal .keyboard_emphasis{font-weight:bold;font-size:16px;width:1.2rem;text-align:center;display:inline-block}.mathField.keyboard .key.literal .word{margin-left:3px}.mathField.keyboard .key.literal:not(.disabled):hover{background:#7dd1fa;color:white}.mathField.keyboard .key.literal:active{background:#73b1e4;color:white}.mathField.keyboard .key.literal.disabled{outline:1px solid}.mathField.keyboard .key.over{color:#4cc4ff}.mathField.keyboard .key.pressed{color:#fff;background:#5a88ad}.mathField.keyboard .key.selected{color:#f93;background:#fff7c2}.mathField.keyboard .key.pressed.selected{color:#ffb833;background:#fff7c2}.mathField.keyboard .key.disabled{color:#ccc;background:#efefef}.mathField.keyboard .key.none{visibility:hidden}.textViewer .mathFieldWrapper{min-height:1.17em;max-width:100%;display:inline-block;line-height:100%}.textViewer .mathFieldWrapper .mathField{white-space:nowrap;text-indent:0}.mtqArea .subAnswer .mathFieldWrapper,.inDragMtq .mathFieldWrapper,.inDrag .mathFieldWrapper{height:auto}.textViewer .mathField.blur .frame,.mathField.readOnly .frame,.subAnswer.mathfield .mathField.readOnly .frame{outline:0;outline-offset:0}.textViewer .mathField.blur.empty .frame{outline:1px solid #b3b3b3}.clozeArea .textViewer .subAnswer.mathfield .mathField{vertical-align:baseline;min-height:1em;white-space:nowrap}.clozeArea .subAnswer.mathfield .mathField.completion{vertical-align:middle;display:inline-block}.bank .subAnswer.mathfield .mathField .frame,.inDragMtq .mathField .frame,.bank_readonly .subAnswer.mathfield .mathField .frame,.inDragMtq .mathField .frame,.player .task.mtq .definition .mathField .frame,.inDrag .mathField .frame{outline:none !important;outline-offset:0 !important}.subAnswer.mathfield .mathField .frame{outline:1px solid #cfcfcf;outline-offset:-1px}.subAnswer.mathfield .mathField.completion .frame{outline:none !important}.clozeArea .subAnswer.mathfield.disabled.correct .mathField .frame,.clozeArea .subAnswer.mathfield.disabled.wrong .mathField .frame,.clozeArea .subAnswer.mathfield.disabled.system_correct .mathField .frame,.clozeArea .subAnswer.mathfield.disabled.partlyCorrect .mathField .frame{outline:none !important;outline-offset:0 !important}.question .textViewer .mathField.readOnly .mpsContent{vertical-align:baseline}.subAnswer.mathfield.disabled .mathField .frame.not_valid{background-color:transparent}.bank .subAnswer.disabled .mathField .mathField_content{color:#8a8a8a !important}.mtqBank .subAnswer.mathfield .mathField .frame,.mtqArea .subAnswer .mathField .frame{outline:none !important}.mtqBank .subAnswer.mathfield .subAnswer_content,.inDragMtq .mathField{padding:.3rem}.mtqArea .subAnswer .textViewer .mathFieldWrapper .mathField,.inDragMtq .textViewer .mathFieldWrapper .mathField{padding:0}.definition .mathField.readOnly,.intersection .mathField.readOnly{margin:0 0 .5rem 0 !important}.mtqArea .subAnswer_content.draggable.full:hover .mathField .mathField_content,.mtqArea .subAnswer_content.draggable.full:hover .mathField .mathField_content{position:relative;top:1px;left:1px}.mathField .mf_icon{display:none}.clozeArea .mathField.empty .mf_icon{font-size:.9rem;line-height:.9em;position:absolute;top:2px;right:2px;display:block}.clozeArea .subAnswer.disabled .mathField .mpsWrapper.show{background-color:#fff !important;border:solid 1px #b3b3b3 !important}.table .cell .subAnswer .mathField.readOnly .frame{outline:none !important}.table .cell .mathField.readOnly .frame{outline:none !important;outline-offset:0 !important}.table .cell .mathField.readOnly{padding-top:.1em}.texteditor .mathField{display:inline-block;user-modify:read-only;-moz-user-modify:read-only;-webkit-user-modify:read-only;margin-right:4px;margin-left:4px;font-weight:normal !important;font-size:22px;background-color:transparent !important;font-style:normal !important;-moz-user-select:none;-khtml-user-select:none;-webkit-user-select:none;-o-user-select:none}#body_texteditor .mathField.focus .frame{outline:0;background:rgba(255,247,194,0.8)}#body_texteditor .mathField.blur .frame{outline:0}#body_texteditor .mathField.empty .frame{outline:1px solid #b3b3b3}.readwrite{user-modify:read-write !important;-moz-user-modify:read-write !important;-webkit-user-modify:read-write !important}.rtl .task_content .mathField{text-align:left}</style>";
                        initHTML += '<link rel="stylesheet" type="text/css" href="css/TextViewerEditor_internalIframe.css"/>';
                        initHTML += localeModel.getCSSLinks();
                        initHTML += this.options.additionalHeadData || '';
                    initHTML += '</head>';
                    initHTML += '<body spellcheck="' + require('userModel').getAccount().enableFullSpellChecker + '" style="-webkit-user-select: none;" class="texteditor cgs">';

                    initHTML += '</body>';
                    initHTML += '</html>';


                var _document = _iframe.contents().get(0);

                _document.open();
                _document.write(initHTML);


                var _body = $(_document.body);

                _body.append(text);



                //replace component tag with real img tag.
                _.each(_body.find('component'), _.bind(function f1336(component) {
                    var obj = repo.get(component.id),
                        // get asset data of the component
                        asset = (obj.data.assetManager instanceof Array ? obj.data.assetManager[0] : null),
                        img = $('<img />'),
                        _components_mapping = {
                            'latex': function f1337() {
                                return {
                                    'class': 'component',
                                    'src': assets.serverPath(obj.data.component_src),
                                    'type': obj.type,
                                    'markup': obj.data.markup,
                                    'component_src': obj.data.component_src,
                                    'naturalHeight': obj.data.naturalHeight,
                                    'naturalWidth': obj.data.naturalWidth
                                }
                            },
                            'MathML': function() {
                                return {
                                    'class': 'component',
                                    'src': assets.serverPath(obj.data.component_src),
                                    'type': obj.type,
                                    'markup': obj.data.markup,
                                    'component_src': obj.data.component_src,
                                    'naturalHeight': obj.data.naturalHeight,
                                    'naturalWidth': obj.data.naturalWidth
                                }
                            },
                            'inlineImage': function f1338() {
                                return {
                                    'class': 'component',
                                    'height': '32px',
                                    'src': assets.serverPath(obj.data.component_src),
                                    'naturalHeight': obj.data.naturalHeight,
                                    'naturalWidth': obj.data.naturalWidth,
                                    'type': obj.type,
                                    'component_src': obj.data.component_src,
                                    'assetId': asset && asset.assetId,
                                    'notes': asset && asset.notes,
                                    'state': asset && asset.state,
                                    'isNarration': false,
                                    'asIs': asset && asset.asIs,
                                    'narrationText': asset && asset.narrationText
                                }
                            },
                            'inlineSound': function f1339() {
                               return {
                                    'class': obj.data.class,
                                    'type': obj.type,
                                    'component_src': obj.data.component_src,
                                    'assetId': asset && asset.assetId,
                                    'notes': asset && asset.notes,
                                    'state': asset && asset.state,
                                    'isNarration': false,
                                    'asIs': asset && asset.asIs,
                                    'narrationText': asset && asset.narrationText
                                }
                            },
                            'inlineNarration': function f1340() {
                               return {
                                    'class': obj.data.class,
                                    'type': obj.type,
                                    'narrations': JSON.stringify(_.mapValues(obj.data.narrations, function(val, key) {
                                        var am = require('cgsUtil').cloneObject(_.where(obj.data.assetManager, { locale: key })[0]);
                                        return _.extend(am, { 'component_src': val });
                                    }))
                                }
                            }
                        }

                    img.attr(_components_mapping[obj.type]()).on('dragstart', function f1341(e) {
                        return e.preventDefault();
                    });

                    img.one('load', function f1342() {
                        this.setIframeHeight();
                    }.bind(this));

                    $(component).replaceWith(img);
                }, this));

                $(this.body).find("img[type=latex]").each(function f1329() {
                    $(this).on('click', function f1330(e) {
                        if (!self.isStartEditing) return false;
                        self.updateLatexItem($(this));
                    });
                });

                $(this.body).find("img[type=MathML]").each(function() {
                    $(this).on('click', function(e) {
                        if (!self.isStartEditing) return false;
                        self.updateMathMLItem($(this));
                    });
                });

                _.each(_body.find('mathfieldtag, mathfield'), _.bind(function f1331(mathfield) {
                    var _mathfield_controller = this.controller,
                        mf_data = mathfieldArray[mathfield.id];

                    var mathFieldId = mathfield.id;
                    $(mathfield).replaceWith('<mathfieldTag id="' + mathFieldId + '" idx="' + $(mathfield).attr('idx') + '" class="mathfieldItem"></mathfieldTag>');
                    var attributes = {
                        keyboardPreset: 'contentEditorMathField',
                        editMode: 'off',
                        fontLocale: require("localeModel").getConfig("mfConfig").fontLocale,
                        autoComma: 'false',
                        validate: 'false',
                        devMode: 'false',
                        maxHeight: mf_data.maxHeight,
                        italicVariables: 'true',
                        _document: _document
                    };


                    var mf = this.initMathField(mathFieldId, attributes, mf_data.markup);

                    if (mf && this.mathfieldArr && this.mathfieldArr[mathFieldId]) {
                        this.mathfieldArr[mathFieldId] = mf;
                    }

                }, this));

                _body.find(".x-button").remove();

                _body.find('narration .actionsGroup').remove();

                var _result = _document.documentElement.outerHTML;

                _iframe.remove();

                return _result;
            },
            setIframe: function f1332(iframe, clear, callback) {
                this.mathfieldArr = {};
                var prefix = "textViewerEditor_";
                var self = this;

                this.iframe = iframe || this.$('#' + prefix + this.controller.record.id);


                this.iframe.one("load", _.bind(function f1333() {
                    //if the iframe is reloaded, (currently happening in drag& drop).
                    //re render the iframe and its events
                    this.iframe.load(_.bind(function f1334(e) {
                        //$(e.currentTarget).unbind('load');
                        // this.setIframe($(e.currentTarget));
                        this.bubbleUpWrapperEvents(true);
                    }, this));
                }, this));


                this.setDocument();


                var initHTML = '<!DOCTYPE html>';
                initHTML += '<html style="overflow: hidden;">';
                initHTML += '<head>';
                initHTML += "<style>.mathField_button{position:absolute;top:200px;left:10px}.mathField_button_value{position:absolute;top:170px;left:10px}.mathField_button_correctness{position:absolute;top:140px;left:10px}.mathField_button_reduction{position:absolute;top:110px;left:10px}@font-face{font-family:'MF_T2K_US-Regular';src:local(\"MF_T2K_US-Regular\"),url(\"js/components/mathfield/assets/fonts/MF_T2K_US-Regular.ttf\") format(\"truetype\")}@font-face{font-family:'MF_T2K_US-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_US-Bold.ttf\") format(\"truetype\");font-weight:bold}@font-face{font-family:'MF_T2K_US-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_US-Bold-Italic.ttf\") format(\"truetype\");font-style:italic;font-weight:bold}@font-face{font-family:'MF_T2K_US-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_US-Italic.ttf\") format(\"truetype\");font-style:italic}@font-face{font-family:'MF_T2K_HE-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_HE-Regular.ttf\") format(\"truetype\")}@font-face{font-family:'MF_T2K_HE-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_HE-Bold.ttf\") format(\"truetype\");font-weight:bold}@font-face{font-family:'MF_T2K_HE-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_HE-Bold-Italic.ttf\") format(\"truetype\");font-style:italic;font-weight:bold}@font-face{font-family:'MF_T2K_HE-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_HE-Italic.ttf\") format(\"truetype\");font-style:italic}@font-face{font-family:'MF_T2K_FR-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_FR-Regular.ttf\") format(\"truetype\")}@font-face{font-family:'MF_T2K_FR-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_FR-Bold.ttf\") format(\"truetype\");font-weight:bold}@font-face{font-family:'MF_T2K_FR-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_FR-Bold-Italic.ttf\") format(\"truetype\");font-style:italic;font-weight:bold}@font-face{font-family:'MF_T2K_FR-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_FR-Italic.ttf\") format(\"truetype\");font-style:italic}@font-face{font-family:'MF_T2K_NL-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_NL-Regular.ttf\") format(\"truetype\")}@font-face{font-family:'MF_T2K_NL-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_NL-Regular.ttf\") format(\"truetype\");font-weight:bold}@font-face{font-family:'MF_T2K_NL-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_NL-Regular.ttf\") format(\"truetype\");font-style:italic;font-weight:bold}@font-face{font-family:'MF_T2K_NL-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_NL-Regular.ttf\") format(\"truetype\")}@font-face{font-family:'MF_T2K_NL-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_NL-Bold.ttf\") format(\"truetype\");font-weight:bold}@font-face{font-family:'MF_T2K_NL-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_NL-Italic.ttf\") format(\"truetype\");font-style:italic}@font-face{font-family:'MF_T2K_NL-Regular';src:url(\"js/components/mathfield/assets/fonts/MF_T2K_NL-Bold-Italic.ttf\") format(\"truetype\");font-weight:bold;font-style:italic}.mathField.italicVariables .letter{font-style:italic}.mathField.colorShapes .shape{color:red}.mathField .blowup{position:absolute;z-index:60;display:none;overflow:hidden}.mathField.blowup .blowup{display:block;border:1px solid #b3b3b3;cursor:pointer}.mathField.blowup .blowup:hover{border:1px solid #2ed5ff}.mathField.blowup .blowup .blowupZoom{width:22px;height:22px;position:absolute;top:0;right:0;background:transparent url(js/components/mathfield/assets/images/imageViewer/sprite_ImageContainer.png) 0 -312px no-repeat}.mathField.blowup .blowup:hover .blowupZoom{background-position:0 -334px}.blowupContainer,.task>.blowupContainer,.mathField .blowupContainer{position:fixed;padding:10px;padding-top:21px;border:1px solid #BBB;background-color:#FFF;box-shadow:0 3px 8px 2px rgba(119,118,118,0.7);z-index:80;margin:0;overflow:auto}.mathField .blowupContainer{display:none}.hide{position:absolute !important;top:-9999px !important;left:-9999px !important}.blowupContainer .x,.task>.blowupContainer .x,.mathField .blowupContainer .x{width:40px;height:22px;position:absolute;top:0;cursor:pointer;background:transparent url(js/components/mathfield/assets/images/imageViewer/sprite_ImageContainer.png) 0 -156px no-repeat}.blowupContainer .x:hover,.task>.blowupContainer .x:hover,.mathField .blowupContainer .x:hover{background-position:0 -182px}.mathField .masc{position:absolute;background-color:white;opacity:.01;z-index:40}@-webkit-keyframes blink-caret{from,to{border-color:black}50%{border-color:transparent}}.completion.structure.placeholder{padding:2px;border:1px solid #ccc;color:#ccc;width:1.4em;height:1.4em;font-size:.6em;display:inline-block;text-align:center;position:relative;top:-0.2em;margin:0 1px}.divider .completion.structure.placeholder{top:.1em;left:.1em}.divided .completion.structure.placeholder{top:.1em}.numerator .completion.structure.placeholder{top:-0.2em}.denominator .completion.structure.placeholder{top:-0.3em}.power .completion.structure.placeholder{top:-0.3em}.absolute .completion.structure.placeholder{top:-0.1em}.completion.structure.placeholder .remainder{top:-0.2em}.mathField.completion.focus .frame{outline:#fff7c2 solid 2px !important;outline-offset:0;background:rgba(255,247,194,0.8)}.mathField .frame{outline-offset:1px;position:absolute;top:0;min-height:1em}.mathField.blowup .frame{outline:none !important}.mathField.blur .frame{outline:1px solid #b3b3b3;background:rgba(255,255,255,0.2)}.mathField.blur.readOnly .frame{background:0}.mathField.blowup.blur .frame{outline:1px solid #b3b3b3;background:rgba(255,255,255,0.2)}.mathField.focus .frame{outline:1px solid #f93;background:rgba(255,255,255,0.2)}.mathField.focus{line-height:normal;vertical-align:baseline}.mathField .frame.not_valid{background:rgba(255,255,255,0.2);outline:solid 1px #d6424c}.mathField.completion .frame.not_valid{border:0;outline:#fee2de solid 2px;outline-offset:0;background:rgba(254,226,222,0.8)}.mathField,.mathField.usa{font-family:MF_T2K_US-Regular}.mathField.il{font-family:MF_T2K_HE-Regular}.mathField.fr{font-family:MF_T2K_FR-Regular}.mathField.nl{font-family:MF_T2K_NL-Regular}.mathField .symbol,.mathField .caret{display:inline-block;vertical-align:bottom;height:1.05em}.ie9 .mathField .symbol{height:.9em}.ie9 .longDivision .mathField .symbol{height:.9em}.mathField .caret{-webkit-animation:blink-caret 1s step-end infinite;text-decoration:blink;border-color:black;border-left:0;margin-left:0;border-right:.1em solid transparent;margin-right:-.1em;position:relative;top:1px;width:2px}.ie9 .mathField .caret{background-color:black}.mathField{display:inline-block;position:relative;white-space:nowrap;cursor:text;min-height:1.2em;line-height:normal}.mathField .mathField_content .icon{width:auto}.mathField.readOnly{min-height:1em}.mathField .mathField_content{display:inline-block;vertical-align:bottom;min-width:1.3em;min-height:1.3em;position:relative;color:#444;line-height:normal;white-space:inherit !important}.mathField.readOnly .mathField_content,.mathField.empty .mathField_content{min-width:.5em}.mtqBank .mathField.readOnly .mathField_content{vertical-align:bottom}.texteditor .mathField.readOnly{margin:0}.subQuestion>div>.mathField,.subQuestion .subAnswer.mathfield .mathField{display:block}.texteditor .mathField .mathField_content{color:inherit}.mathField .selection{background-color:#9ec6f1}.mathField .not_valid{color:#d6424c}.mpsWrapper.show.not_valid{background-color:#fdaba2 !important;border:none !important}.mathField .mpsAnchor{display:inline-block;vertical-align:bottom;width:0;height:1em;background-color:transparent;position:relative;top:0;margin:0;padding:0}.mathField .fraction .mpsAnchor{width:0;background-color:transparent;margin-top:.5em}.mathField .fraction .numerator .mpsAnchor,.mathField .fraction .denominator .mpsAnchor{width:0;background-color:transparent;margin-top:0}.mathField.readOnly .fraction .numerator .mpsAnchor,.mathField.readOnly .fraction .denominator .mpsAnchor{margin-top:-0.5em}.mathField .mpsLasso{height:1em;width:0;background-color:transparent;display:inline-block;vertical-align:bottom}.mathField .mpsContent{white-space:nowrap !important;height:1.1em;min-width:.5em;left:0;max-width:100%;-webkit-transform-style:preserve-3d}.mathField .power{font-size:.75em;top:-0.6em;padding-top:.6em;line-height:normal}.mathField .power .power{font-size:1em;top:-0.4em;padding-top:.4em}.mathField .symbol{position:relative;min-width:.4em;text-align:left}.mathField .symbol[validationgroup=\"thousandsComma\"],.mathField .symbol[validationgroup=\"decimalPoint\"]{min-width:.2em}.mathField .fraction>.mpsContent{text-align:center}.mathField .fraction{min-width:1em}.mathField .fraction .numerator,.mathField .fraction .denominator{min-width:20px;min-height:.9em;font-size:.9em;line-height:.9em;display:block;position:relative;padding:0}.mathField .fraction .fractionBar{width:100%;height:1px;min-height:1px;line-height:100%;background:black;display:block;font-size:.8em;margin-bottom:1px}.displayInlineBlock,.mathField .mpsContent,.mathField .power,.mathField .fraction,.mathField .longDivision,.mathField .longDivision .divided,.mathField .longDivision .divider,.mathField .root,.mathField .root .radicand,.mathField .root .degree,.mathField .repeatingDecimal,.mathField .repeatingDecimal.fr .icon,.mathField .repeatingDecimal.nl .icon,.mathField .geometry,.mathField .remainder,.mathField .remainder .icon,.mathField .absolute,.mathField .absolute .icon,.mathField .completion{display:inline-block;vertical-align:bottom;position:relative}.mpsMinWidth0_8em,.mathField .longDivision .divided,.mathField .longDivision .divider,.mathField .root .radicand{min-width:.8em;min-height:.9em;line-height:.9em;text-align:center}.mpsAnchorWidth0,.mathField .longDivision .mpsAnchor,.mathField .root .mpsAnchor{top:.1em;width:0;background-color:transparent}.ie9 .mathField .longDivision .mpsAnchor{top:.1em}.mpsAnchorNoFloat,.mathField .longDivision .divided .mpsAnchor,.mathField .longDivision .divider .mpsAnchor,.mathField .root .radicand .mpsAnchor,.mathField .root .degree .mpsAnchor{float:none;width:0;background-color:transparent;margin-top:0}.mathField .longDivision.il .divided{top:0}.mathField .longDivision.il .divider{border-top:2px solid #444;top:0}.mathField .longDivision.il .divider :first-child{padding-right:2px}.mathField .longDivision.fr .divided{border-bottom:.1em solid #444;top:0;left:-5px}.mathField .longDivision.fr .divider{top:0;left:-5px}.mathField .longDivision.fr .divided>div{top:2px}.mathField .longDivision.us .divider,.mathField .longDivision.sg .divider{border-top:2px solid #444;top:0}.mathField .longDivision .icon{height:1.1em;width:6px}.mathField .longDivision .icon svg{position:absolute;top:0;height:1.1em}.mathField .longDivision.sg .icon{left:1.4em}.mathField .longDivision.il .icon svg{top:-1px}.mathField .longDivision.fr .icon svg{top:1px}.mathField .root .icon{display:inline-block;position:relative;vertical-align:baseline;width:.65em;height:.95em}.mathField .root .icon .radical_sign{width:100%;height:100%;position:absolute;left:0;top:0;z-index:-1}.mathField .root .icon .radical_sign>img.stretch{height:100%;width:56%}.mathField .root .icon .radical_sign>img{width:44%}.mathField .root .radicand .top_line{border-top:1px solid #444;margin:0;position:relative;width:100%;z-index:-1}.mathField .root .degree{vertical-align:top;font-size:.7em;min-width:.75em;min-height:.75em;bottom:.4em}.mathField .root .degree .mpsContent{min-width:.75em;min-height:.75em}.mathField .root .degree .mpsContent div.symbol{height:1em}.mathField .repeatingDecimal{white-space:nowrap}.mathField .repeatingDecimal.us .icon,.mathField .repeatingDecimal.il .icon{position:absolute;font-size:1.2em;top:2px;left:0;background-color:#444;height:2px;width:100%}.mathField .repeatingDecimal.fr .icon,.mathField .repeatingDecimal.nl .icon{line-height:100%;margin:0 0 0 .1em;padding:0;top:.1em;font-family:inherit}.mathField .fraction .repeatingDecimal .icon{top:-2px}.mathField .geometry{line-height:110%;text-align:center}.mathField .geometry .icon{position:absolute;font-size:1.2em;top:-0.08em;left:0}.ie9 .mathField .geometry .icon{top:.05em}.mathField .geometry>.mpsContent{min-width:.9em;left:.1em}.mathField .geometry .symbol{position:relative;font-size:.77em;top:-0.2em}.mathField .remainder{white-space:nowrap;overflow:visible}.mathField .remainder .icon{line-height:100%;margin:0 0 0 .2em;padding:0;top:0;font-family:inherit;max-width:1em}.nl_NL .mathField .remainder .icon{max-width:2.1em}.ie9 .mathField .remainder .icon{top:3px}.mathField .absolute{min-width:1em;text-align:center}.mathField .absolute.not_valid{color:inherit}.mathField .absolute.not_valid .icon.left{color:#d6424c}.mathField .absolute .icon{line-height:1em}.mathField .absolute .icon.right{margin-left:.1em}.mathField .absolute .icon.left{margin-right:.1em}.ie9 .mathField .absolute .icon{line-height:.5em}.mathField .completion{padding:.09em .136em;min-width:1em;line-height:1em}.mathField .completion .operator{margin:0 2px 0 2px}.mathField .completion .mpsContent{text-align:center;line-height:100%}.mathField .completion .mpsContent .mpsContent{height:1em}.mathField .completion .square_root .icon,.mathField .completion .root .icon{left:.05em}.mathField .completion>.mpsContent{min-width:.7em}.mathField .completion .mpsWrapper.show.not_valid{background-color:#fdd985 !important;border:none !important}.mathField .mpsWrapper{position:absolute}.mathField .mpsWrapper.show{background-color:#fdd985;z-index:-1}.mathField.readOnly .mpsWrapper.show{background-color:initial;border:1px solid #c3c3c3}.mathField.completion.blur .mpsWrapper.show{background-color:#fff !important;border:solid 1px #b3b3b3 !important}.mathField.completion.blur .mpsWrapper.show.not_valid{background-color:#fff !important;border:solid 1px #d6424c !important}.mathField.completion.focus .mpsWrapper.show{background-color:#fff !important;border:solid 1px #f93 !important}.mathField .mathField_content{z-index:20}.mathField.empty{max-height:1.2em;min-height:1em}.mathField.empty.blur{min-width:2rem}.mathField.empty.blur .frame{min-width:2rem}.mathField.empty.blur .mathField_content{max-width:1em}.texteditor .mathField.empty .mathField_content{min-width:1em}.mathField.empty .mf_icon{font-style:italic;font-family:Arial;font-size:.9rem;line-height:.9em;letter-spacing:.1rem;position:absolute;top:-0.15rem;right:0;color:#b3b3b3}.mathField .mf_icon,.clozeArea .subAnswer_content.full .mathField .mf_icon,.mathField.empty.focus .mf_icon{display:none !important}.mathField.empty.blur .mf_icon{display:block !important}.mathField .mathField_input{opacity:.01;width:1px;height:0;padding:0;margin:0;border:0}.mathField.keyboard{font-size:0;position:absolute;z-index:1000;padding:.71rem 0;margin:0 !important;-moz-user-select:none;-khtml-user-select:none;-webkit-user-select:none;user-select:none}.mathField.keyboard .keyboard_content{background:#efefef;border:1px solid #cacaca;box-shadow:0 2px 8px 0 rgba(0,0,0,0.2);padding:.71rem}.mathField.keyboard.mini{padding:2.429rem .286rem .286rem .286rem}.mathField.keyboard.mini ul.tabs-nav{display:none}.mathField.keyboard.usa{font-family:MF_T2K_US-Regular}.mathField.keyboard.il{font-family:MF_T2K_HE-Regular}.mathField.keyboard ul.tabs-nav ~ .close{background:url(js/components/mathfield/assets/images/imageViewer/sprite_ImageContainer.png) 24px 281px;width:15px;height:15px;position:absolute;top:18px;right:8px;cursor:pointer}.mathField.keyboard ul.tabs-nav.rtl ~ .close{left:8px}.mathField.keyboard ul.tabs-nav{padding:0 0 .71rem 0;line-height:1.214rem}.mathField.keyboard ul.tabs-nav li.tabs-nav-item{font-size:1.28rem;color:#3f97df;cursor:pointer;display:inline-block;border-right:1px solid #cacaca;padding:0 .71rem;text-align:center}.mathField.keyboard ul.tabs-nav li.tabs-nav-item:first-child{padding:0 .71rem 0 0}.mathField.keyboard ul.tabs-nav li.tabs-nav-item:last-child{border-right:0;padding-right:0}.mathField.keyboard ul.tabs-nav.rtl li.tabs-nav-item{border-left:1px solid #cacaca;border-right:0}.mathField.keyboard ul.tabs-nav.rtl li.tabs-nav-item:first-child{padding:0 0 0 .71rem}.mathField.keyboard ul.tabs-nav.rtl li.tabs-nav-item:last-child{border-left:0;padding-left:0}.mathField.keyboard ul.tabs-nav li.tabs-nav-item:hover{color:#4cc4ff}.mathField.keyboard ul.tabs-nav li.tabs-nav-item.selected{color:#f93;font-weight:bold;cursor:default}.mathField.keyboard .tab{display:none;white-space:nowrap}.mathField.keyboard .tab.selected{display:block}.mathField.keyboard .box{display:inline-block;padding-right:.71rem;vertical-align:top}.mathField.keyboard .box:last-child{padding-right:0rem}.mathField.keyboard .line.center{text-align:center}.mathField.keyboard .key{display:inline-block;width:3rem;height:3rem;line-height:3rem;text-align:center;color:#3f97df;background:-webkit-linear-gradient(top,white,#f0f0f0);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr = '#ffffff',endColorstr = '#f0f0f0');border:1px solid #cacaca;margin:0 -1px -1px 0;cursor:pointer;font-size:1.571rem}.mathField.keyboard .key.literal{font-size:13px;background:#73b1e4;color:white;text-align:left;padding-left:8px;height:29px;line-height:initial;padding-top:9px;font-family:Arial;border:0;margin-bottom:1px}.mathField.keyboard .key.literal .keyboard_emphasis{font-weight:bold;font-size:16px;width:1.2rem;text-align:center;display:inline-block}.mathField.keyboard .key.literal .word{margin-left:3px}.mathField.keyboard .key.literal:not(.disabled):hover{background:#7dd1fa;color:white}.mathField.keyboard .key.literal:active{background:#73b1e4;color:white}.mathField.keyboard .key.literal.disabled{outline:1px solid}.mathField.keyboard .key.over{color:#4cc4ff}.mathField.keyboard .key.pressed{color:#fff;background:#5a88ad}.mathField.keyboard .key.selected{color:#f93;background:#fff7c2}.mathField.keyboard .key.pressed.selected{color:#ffb833;background:#fff7c2}.mathField.keyboard .key.disabled{color:#ccc;background:#efefef}.mathField.keyboard .key.none{visibility:hidden}.textViewer .mathFieldWrapper{min-height:1.17em;max-width:100%;display:inline-block;line-height:100%}.textViewer .mathFieldWrapper .mathField{white-space:nowrap;text-indent:0}.mtqArea .subAnswer .mathFieldWrapper,.inDragMtq .mathFieldWrapper,.inDrag .mathFieldWrapper{height:auto}.textViewer .mathField.blur .frame,.mathField.readOnly .frame,.subAnswer.mathfield .mathField.readOnly .frame{outline:0;outline-offset:0}.textViewer .mathField.blur.empty .frame{outline:1px solid #b3b3b3}.clozeArea .textViewer .subAnswer.mathfield .mathField{vertical-align:baseline;min-height:1em;white-space:nowrap}.clozeArea .subAnswer.mathfield .mathField.completion{vertical-align:middle;display:inline-block}.bank .subAnswer.mathfield .mathField .frame,.inDragMtq .mathField .frame,.bank_readonly .subAnswer.mathfield .mathField .frame,.inDragMtq .mathField .frame,.player .task.mtq .definition .mathField .frame,.inDrag .mathField .frame{outline:none !important;outline-offset:0 !important}.subAnswer.mathfield .mathField .frame{outline:1px solid #cfcfcf;outline-offset:-1px}.subAnswer.mathfield .mathField.completion .frame{outline:none !important}.clozeArea .subAnswer.mathfield.disabled.correct .mathField .frame,.clozeArea .subAnswer.mathfield.disabled.wrong .mathField .frame,.clozeArea .subAnswer.mathfield.disabled.system_correct .mathField .frame,.clozeArea .subAnswer.mathfield.disabled.partlyCorrect .mathField .frame{outline:none !important;outline-offset:0 !important}.question .textViewer .mathField.readOnly .mpsContent{vertical-align:baseline}.subAnswer.mathfield.disabled .mathField .frame.not_valid{background-color:transparent}.bank .subAnswer.disabled .mathField .mathField_content{color:#8a8a8a !important}.mtqBank .subAnswer.mathfield .mathField .frame,.mtqArea .subAnswer .mathField .frame{outline:none !important}.mtqBank .subAnswer.mathfield .subAnswer_content,.inDragMtq .mathField{padding:.3rem}.mtqArea .subAnswer .textViewer .mathFieldWrapper .mathField,.inDragMtq .textViewer .mathFieldWrapper .mathField{padding:0}.definition .mathField.readOnly,.intersection .mathField.readOnly{margin:0 0 .5rem 0 !important}.inDragMtq .mathField{vertical-align:bottom}.inDragMtq .mathField .mathField_content{font-size:1em;font-weight:normal !important;top:50%}.mtqArea .subAnswer_content.draggable.full:hover .mathField .mathField_content,.mtqArea .subAnswer_content.draggable.full:hover .mathField .mathField_content{position:relative;top:1px;left:1px}.mathField .mf_icon{display:none}.clozeArea .mathField.empty .mf_icon{font-size:.9rem;line-height:.9em;position:absolute;top:2px;right:2px;display:block}.clozeArea .subAnswer.disabled .mathField .mpsWrapper.show{background-color:#fff !important;border:solid 1px #b3b3b3 !important}.table .cell .subAnswer .mathField.readOnly .frame{outline:none !important}.table .cell .mathField.readOnly .frame{outline:none !important;outline-offset:0 !important}.table .cell .mathField.readOnly{padding-top:.1em}.texteditor .mathField{display:inline-block;user-modify:read-only;-moz-user-modify:read-only;-webkit-user-modify:read-only;margin-right:4px;margin-left:4px;font-weight:normal !important;font-size:22px;background-color:transparent !important;font-style:normal !important;-moz-user-select:none;-khtml-user-select:none;-webkit-user-select:none;-o-user-select:none}#body_texteditor .mathField.focus .frame{outline:0;background:rgba(255,247,194,0.8)}#body_texteditor .mathField.blur .frame{outline:0}#body_texteditor .mathField.empty .frame{outline:1px solid #b3b3b3}.readwrite{user-modify:read-write !important;-moz-user-modify:read-write !important;-webkit-user-modify:read-write !important}.rtl .task_content .mathField{text-align:left}</style>";

                initHTML += this.options.additionalHeadData || '';
                initHTML += '</head>';
                initHTML += '<body spellcheck="' + require('userModel').getAccount().enableFullSpellChecker + '" style="-webkit-user-select: none;" class="texteditor cgs">';

                var mode = this.controller.record.data.mode;
                var tempCssStr = '';

                this.extraCss = {};

                if (mode !== "thin") {
                    this.extraCss.width = '100%';
                } else {
                    this.extraCss['max-width'] = this.controller.record.data.maxWidth ? this.controller.record.data.maxWidth : '100%';
                }

                _.each(this.extraCss, function f1335(v, k) {
                    tempCssStr += k + ':' + v + ';';
                })

                var floatDirection = {
                    'rtl': 'right',
                    'ltr': 'left'
                }

                var paragraphStyle = this.controller.record.data.styleOverride || 'normal';
                var margin = localeModel.getConfig('direction') == "rtl" ? "0px 0px 0px 10px" : "0px 10px 0px 0px"

                this._default_paragraph_html = '<div class="cgs ' + paragraphStyle + '" style="' + tempCssStr + 'min-width: 28px;min-height: 28px;margin: '+margin+';padding: 0;outline: none;white-space:pre-wrap;float:' + floatDirection[localeModel.getConfig('direction')] + ';clear:both; -webkit-user-select: auto" contenteditable="false" customStyle="' + paragraphStyle + '"></div>'

                if (this.controller.record.data.title === "") {
                    initHTML += this._default_paragraph_html;
                }

                initHTML += '</body>';
                initHTML += '</html>';

                // inject html to the iframe
                this.writeToIframe(initHTML);

                this.setBody();
	            this.setHead();
                this.setInternalIframeEvents();
                this.setExternalIframeEvents();
                this.setSelectionMode(false);

	            if(window.customizationPackLoading) {
		            events.once('customizationPack-done-loading', this.insertCssLinks.bind(this));
	            } else {
		            this.insertCssLinks();
	            }

                var textViewerInnerText = this.controller.record.data.title;
                if (textViewerInnerText !== "" && !clear) {
                    paragraphStyle = this.controller.record.data.styleOverride || '';
                    textViewerInnerText = this.getInnerTextWrrapedWithDiv(textViewerInnerText, paragraphStyle);

                    this.body.append(textViewerInnerText);

                }


                this.styleShorcuts(this.document);

                // add ["data-placeholder"] to body for matching difinition
                if (this.controller.record.data["data-placeholder"]) {
                    this.body.attr('data-placeholder', i18n.tran(this.controller.record.data["data-placeholder"]));
                    var tmpDiv = this.body.children('div').first();
                    if (tmpDiv.length) {
                        tmpDiv.attr('data-placeholder', i18n.tran(this.controller.record.data["data-placeholder"]));
                    }
                }


                if (this.controller.record.data.stageReadOnlyMode)
                    this.body.addClass('unselect');

                this.defer = _.defer(function() {
                    //replace component tag with real img tag.
                    _.each($(this.body).find('component'), _.bind(function f1336(component) {
                        var obj = repo.get(component.id),
                            // get asset data of the component
                            asset = (obj.data.assetManager instanceof Array ? obj.data.assetManager[0] : null),
                            img = $('<img />'),
                            _components_mapping = {
                                'latex': function f1337() {
                                    return {
                                        'class': 'component',
                                        'src': assets.serverPath(obj.data.component_src),
                                        'type': obj.type,
                                        'markup': obj.data.markup,
                                        'component_src': obj.data.component_src,
                                        'naturalHeight': obj.data.naturalHeight,
                                        'naturalWidth': obj.data.naturalWidth
                                    }
                                },
                                'MathML': function() {
                                    return {
                                        'class': 'component',
                                        'src': assets.serverPath(obj.data.component_src),
                                        'type': obj.type,
                                        'markup': obj.data.markup,
                                        'component_src': obj.data.component_src,
                                        'naturalHeight': obj.data.naturalHeight,
                                        'naturalWidth': obj.data.naturalWidth
                                    }
                                },
                                'inlineImage': function f1338() {
                                    return {
                                        'class': 'component',
                                        'height': '32px',
                                        'src': assets.serverPath(obj.data.component_src),
                                        'naturalHeight': obj.data.naturalHeight,
                                        'naturalWidth': obj.data.naturalWidth,
                                        'type': obj.type,
                                        'component_src': obj.data.component_src,
                                        'assetId': asset && asset.assetId,
                                        'notes':  asset && asset.notes,
                                        'state': asset && asset.state,
                                        'isNarration': false,
                                        'asIs': asset && asset.asIs,
                                        'narrationText': asset && asset.narrationText
                                    }
                                },
                                'inlineSound': function f1339() {
                                   return {
                                        'class': obj.data.class,
                                        'type': obj.type,
                                        'component_src': obj.data.component_src,
                                        'assetId': asset && asset.assetId,
                                        'notes':  asset && asset.notes,
                                        'state': asset && asset.state,
                                        'isNarration': false,
                                        'asIs': asset && asset.asIs,
                                        'narrationText': asset && asset.narrationText
                                    }
                                },
                                'inlineNarration': function f1340() {
                                   return {
                                        'class': obj.data.class,
                                        'type': obj.type,
                                        'narrations': JSON.stringify(_.mapValues(obj.data.narrations, function(val, key){
                                            var am = require('cgsUtil').cloneObject(_.where(obj.data.assetManager, { locale: key })[0]);
                                            return _.extend(am, { 'component_src': val });
                                        }))
                                    }
                                }
                            }

                        img.attr(_components_mapping[obj.type]()).on('dragstart', function f1341(e) {
                            return e.preventDefault();
                        });

                        img.one('load', function f1342() {
                            this.setIframeHeight();
                        }.bind(this));

                        $(component).replaceWith(img);
                    }, this));

                    $(this.body).find('narration').each(function () {
                        var p = $(this);

                        $(this).on('mouseover', function (e) {
                            if (!self.isStartEditing) return;
                            self.setNarrationActionsGroupLocation($(this).find('.actionsGroup'));
                            $(this).find('.actionsGroup').show();
                        }).on('mouseout', function (e) {
                            if (!self.isStartEditing) return;
                            if (!e.toElement || !$(e.toElement).parent('.actionsGroup').length) {
                                $(this).find('.actionsGroup').hide();
                            }
                        });

                        $(this).find('.remove-narration').on('click', function (e) {
                            $(this).find('.actionsGroup').hide();
                            var dialogConfig = {
                                closeOutside: false,
                                title: "Narration Button - Delete",
                                content: {
                                    text: "Are you sure you want to delete the Narration button?"
                                },
                                buttons: {
                                    yes: {label: 'OK'},
                                    cancel: {label: 'Cancel'}
                                }
                            };

                            dialogs.create('simple', dialogConfig, 'onDialogResponse');

                            events.once('onDialogResponse', function f1170(response) {

                                if (response === "yes") {
                                    p.remove();
                                }
                            });

                        }.bind(this));

                        $(this).find('.edit-narration').on('click', function (e) {
                            self.menuCmd('insertNarration', null, {
                                override: true,
                                el: p.find('img'),
                                dialogOptions: {
                                    editMode: true
                                }
                            });
                            $(e.target).parents('.actionsGroup').hide();
                        }.bind(this));
                    });

                    $(this.body).find("img[type=latex]").each(function f1343() {
                        $(this).on('click', function f1344(e) {
                            if (!self.isStartEditing) return false;
                            self.updateLatexItem($(this));
                        });
                    });

                    $(this.body).find("img[type=MathML]").each(function() {
                        $(this).on('click', function(e) {
                            if (!self.isStartEditing) return false;
                            self.updateMathMLItem($(this));
                        });
                    });

                    var iframeStyle = document.createElement( "link" );
                    iframeStyle.addEventListener( "load" , function(){


                        //init mathfield component , replace mathfield tag
                        _.each($(this.body).find('mathfieldtag'), _.bind(function f1345(mathfield) {
                            if (this.onMathfieldRemove && $(mathfield).parent().get(0).nodeName !== "ANSWERFIELD") {
                                this.onMathfieldRemove.call(this, $(mathfield));
                            }
                            if ($(mathfield).parent().get(0).nodeName !== "ANSWERFIELD") {
                                $(mathfield).remove();
                            }
                        }, this));

                        _.each($(this.body).find('mathfieldtag, mathfield'), _.bind(function f1346(mathfield) {
                            var markup = this.controller.record.data.mathfieldArray &&
                                this.controller.record.data.mathfieldArray[mathfield.id] &&
                                this.controller.record.data.mathfieldArray[mathfield.id].markup || "";

                            var maxHeight = this.controller.record.data.mathfieldArray &&
                                this.controller.record.data.mathfieldArray[mathfield.id] &&
                                this.controller.record.data.mathfieldArray[mathfield.id].maxHeight || "secondLevel";

                            var widthEM = this.controller.record.data.mathfieldArray &&
                                this.controller.record.data.mathfieldArray[mathfield.id] &&
                                this.controller.record.data.mathfieldArray[mathfield.id].widthEM || "";

                            var mathFieldId = mathfield.id;
                            var mathfieldtag = $('<mathfieldTag></mathfieldTag>');

                            mathfieldtag.attr({
                                 contenteditable: "false",
                                 id: mathFieldId,
                                 idx: $(mathfield).attr('idx'),
                                 'class': "mathfieldItem"
                            });

                            var mathfieldEl = $(mathfield).replaceWith(mathfieldtag);
                            var keyboardPreset = this.controller.getKeyboardPreset(mathfieldtag);
                            var attributes = this.getMathfieldConfiguration({
                               keyboardPreset: keyboardPreset,
                               parentContainer: this.isTableChild() ? $('body') : mathfieldtag.parents('div'),
                               fontLocale: require("localeModel").getConfig("mfConfig").fontLocale,
                               maxHeight: maxHeight,
                               widthEM : widthEM
                            });

                            if (keyboardPreset === 'contentEditorMathField_Completion') {
                                attributes.onChange = function () {
                                    var markup = this.getMathfieldMarkup(mathfieldtag);
                                    var widthEm = this.getMathfieldWidthEM(mathfieldtag);
                                    var answerMarkup = this.controller.record.data.answerMarkup || {};
                                    var defaultMarkup;

                                    if (!mf || !mf.view) return;

                                    answerMarkup[mathfieldtag.parent().attr('id')] = {
                                        markup: markup
                                    };

                                    repo.updateProperty(this.controller.record.id, 'answerMarkup', answerMarkup);

                                    if (this.controller.view && this.controller.view.growingMathfieldListComponent) {
                                        this.controller.view.growingMathfieldListComponent.setMathfieldState($("<state></state>").append($("<markup></markup>").append(markup)));
                                    }
                                    if (this.controller.record.data.mathfieldArray[mathfieldtag.attr('id')]) {
                                        var mfArrayMathfield = this.controller.record.data.mathfieldArray[mathfieldtag.attr('id')];

                                        mfArrayMathfield.markup = markup;
                                        mfArrayMathfield.widthEM = widthEm;

                                        defaultMarkup = markup;
                                    } else {
                                        defaultMarkup = mf && mf.view && mf.view.getMarkUpValue();
                                    }


                                    this.controller.view && this.controller.view.setAnswerFieldMathfield(answerMarkup[mathfieldtag.parent().attr('id')], function (correctAnswerMarkup, correctAnswerWidthEm) {
                                        answerMarkup[mathfieldtag.parent().attr('id')] = {
                                            markup: correctAnswerMarkup,
                                            widthEM: correctAnswerWidthEm
                                        };

                                        repo.updateProperty(this.controller.record.id, 'answerMarkup', answerMarkup);
                                    }.bind(this), defaultMarkup);
                                }.bind(this);
                            }

                            var mf = this.initMathField(mathFieldId, attributes, markup);
                            if (mf) {
                                this.mathfieldArr[mathFieldId] = mf;
                            }

                        }, this));

                    }.bind( this ) );

                    //Comment
                    iframeStyle.href = "css/TextViewerEditor_internalIframe.css";
                    iframeStyle.rel = "stylesheet";
                    iframeStyle.type = "text/css";

                    this.document.head.appendChild( iframeStyle );

                    if (this.controller.record.data.mode === "thin") {
                        this.iframe.addClass('thinTextViewerEditor');
                        if (this.controller.record.data.title == "") {
                            this.iframe.css('width', this.controller.record.data.minWidth ? this.controller.record.data.minWidth : 60);
                        } else {
                            this.iframe.css('width', this.measureTextWidth(this.controller.record.data.title));
                        }

                        this.iframe.css('min-width', this.controller.record.data.minWidth ? this.controller.record.data.minWidth : 60);
                        this.iframe.css('max-width', this.controller.record.data.maxWidth ? this.controller.record.data.maxWidth : '100%');
                        this.body.css('min-width', this.controller.record.data.minWidth ? this.controller.record.data.minWidth : 60);
                        this.body.css('max-width', this.controller.record.data.maxWidth ? this.controller.record.data.maxWidth : '100%');

                        if (this.controller.record.data.title == "") {
                            this.iframe.height(21);
                            $(this.document.documentElement).css('cursor', 'text');
                        }
                    } else {
                        if (this.controller.record.data.autoWidth) {
                            this.$el.find("." + this.controller.elementType + "_content").css('width', !! this.controller.record.data.width ? this.controller.record.data.width : "100%")
                        }
                        this.iframe.width( !! this.controller.record.data.width ? this.controller.record.data.width : "100%");
                    }


                    this.body.attr('contenteditable', true);

                   _.delay(function() {
                        this.update_text_viewer_dimensions();
                        if (typeof callback == 'function') {
                            callback();
                        }
                   }.bind(this), 300);

                }.bind(this));

            },
            isTableChild: function f1347() {
                var _rec;
                if (this.controller) {
                    _rec = repo.getAncestorRecordByType(this.controller.record.id, "tableCell");
                }

                return _rec ? true : false;
            },
            _handle_remove_active_element: function f1349(_dispose_events) {
                this.body.find('.infoBaloon, .hyperlink').each(function f1350() {
                    if (_dispose_events) {
                        $(this).unbind();
                    }
                    $(this).find('.infoBaloonButtons, .hyperlinkButtons').remove();
                });
            },
            getInnerTextWrrapedWithDiv: function f1353(text, overrideStyle) {
                var tmp = $(this._default_paragraph_html).empty().html(text);

                if (!tmp.children("div").length) {
                    return tmp;
                }

                if (overrideStyle) {
                    return $(text).attr('class', 'cgs ' + overrideStyle).attr('customstyle', overrideStyle);
                }
                return $(text);
            },

            //the start and end containers are the same paragraph
            isSingleParagraph: function (selection){
                    var range = selection.getRangeAt(0);
                    var start = $(range.startContainer).parents("div");
                    var end = $(range.endContainer).parents("div");
                    return start.get(0) && end.get(0) && start.get(0).isEqualNode(end.get(0));
            },

            setMenuFromSelection: function f1354(e) {
                if (!this.document) return;

                var selection = this.document.getSelection(),
                    node;

                if (!this.isStartEditing) return;

                if (selection.type == "None") {
                    this.setMenu("disableInsertInfoBaloon");
                    this.setMenu("disableInsertLink");
                    return;
                }

                node = selection.focusNode;
                //set the selected class to the menu button
                function setSelectionClasses(elementClasses, excludes) {
                    if (!elementClasses) return;

                    var classes = elementClasses.split(' ');

                    if (classes.length) {
                        _.each(classes, _.bind(function f1355(item) {
                            this.setMenu(item, excludes);
                        }, this));
                    }
                };


                function isComponentSelection() {
                    try {
                        var range = selection.getRangeAt(0);
                        var contents = range.cloneContents();
                            contents = $("<temp></temp>").append($(contents));

                        if (contents.find('img, mathfieldtag, latex, answerfield, .infoBaloon, .hyperlink').length) {
                            return true;
                        }

                        if (selection.anchorNode && $(selection.anchorNode).parents("answerfield, .infoBaloon").length) {
                            return true;
                        }
                    } catch (e) {
                        return true;
                    }

                    return false;
                };

                if(selection.type === "Range" &&
                    !isComponentSelection() &&
                    (!e || !~[8, 46, 13].indexOf(e.keyCode))&&
                    this.isSingleParagraph(selection)) {
                    if (!this.controller.record.data.disableInfoBalloon) {
                        this.setMenu("insertInfoBaloon");
                    }
                    else {
                        this.setMenu("disableInsertInfoBaloon");
                    }
                    this.setMenu("insertLink");
                } else {
                    this.setMenu("disableInsertInfoBaloon");
                    this.setMenu("disableInsertLink");
                }

                //check if the current node selected is just text (not real dom element)
                if (node.nodeName === "#text") {
                    node = node.parentNode;
                }

                var classes,
                    hasChildrenClasses = false;

                var excludes;
                //if we are span element so we are set the (emphasis/softEmphasis/superscript/etc... style buttons to active);
                if (["SPAN"].indexOf(node.nodeName) !== -1) {
                    classes = $(node).attr('class');

                    if (_.isEmpty(classes)) {
                        this.setMenu('default');
                    } else {
                        setSelectionClasses.call(this, classes);
                        hasChildrenClasses = true;
                        excludes = classes.split(' ');
                    }
                }

                if (node.nodeName === 'BODY') return;

                //search for the main parent element (for heading style buttons)
                while (node.nodeName !== "DIV") {
                    node = node.parentNode;

                    if (node.nodeName === "BODY") return;
                }

                classes = $(node).attr('class');

                if (_.isEmpty(classes) && !hasChildrenClasses) {
                    this.setMenu('default');
                } else {
                    setSelectionClasses.call(this, classes, excludes);
                }

            },
            setMenu: function f1356(action, excludes) {
                var commands = {
                    "emphasis": 'menu-button-effects-emphasis',
                    "softEmphasis": 'menu-button-effects-soft-emphasis',
                    "strongEmphasis": 'menu-button-effects-strong-emphasis',
                    "colorEmphasis": 'menu-button-effects-color-emphasis',
                    "strongColorEmphasis": 'menu-button-effects-strong-color-emphasis',
                    "redEmphasis": 'menu-button-effects-red-emphasis',
                    "redItalEmphasis": 'menu-button-effects-red-ital-emphasis',
                    "blueEmphasis": 'menu-button-effects-blue-emphasis',
                    "blueItalEmphasis": 'menu-button-effects-blue-ital-emphasis',
                    "greenEmphasis": 'menu-button-effects-green-emphasis',
                    "greenItalEmphasis": 'menu-button-effects-green-ital-emphasis',
                    "orangeEmphasis": 'menu-button-effects-orange-emphasis',
                    "turqoiseEmphasis": 'menu-button-effects-turqoise-emphasis',
                    "superscript": 'menu-button-font-upper',
                    "subscript": 'menu-button-font-lower',
                    "h1": "menu-button-style-h1",
                    "h2": "menu-button-style-h2",
                    "normal": "menu-button-style-normal",
                    "small": "menu-button-style-small",
                    "insertInfoBaloon": 'menu-button-insert-ib',
                    "disableInsertInfoBaloon": 'menu-button-insert-ib',
                    "insertLink": 'menu-button-insert-link',
                    "disableInsertLink": 'menu-button-insert-link',
                    "indent": "menu-button-paragraph-increase-indent",
                    "outdent": "menu-button-paragraph-decrease-indent",
                    "default": "default" //remove selection from all buttons
                }, method = null,
                    _filteredValues;

                if (commands[action]) {
                    switch (action) {
                    case "insertInfoBaloon":
                    case "insertLink":
					// we might not have the 'this.document', because the setMenu function is called in a delay, and we are opening the IB/Link to edit right after creating the element, and the IB is in a new screen with different document
                        if(this.document){

                            var selection = this.document.getSelection();
                            var contents = selection.getRangeAt(0);
                                contents = $("<temp></temp>").append($(contents.cloneContents()));

                            if (contents.find('mathfieldtag, answerfield, latex, img').length) {
                                method = "disable";
                            } else {

                                if (selection.type === "Range" && ($(selection.anchorNode).hasClass('mathField') || $(selection.anchorNode).parents('mathfieldtag, .infoBaloon, .hyperlink').length)) {
                                    method = "disable";
                                } else {

                                    method = selection.type === 'None' ? "disable" : ((this.isTableChild() &&action == 'insertInfoBaloon') ? "disable" : "enable");
                                }
                            }

                            if (method == 'disable') {
                                events.fire('setMenuButtonState', action == 'insertInfoBaloon' ? 'menu-button-insert-link' : 'menu-button-insert-ib', method);
                            }
                        }
                        break;
                    case "disableInsertInfoBaloon":
                    case "disableInsertLink":
                        method = "disable";
                        break;
                    case "default":
                        return _.each(commands, function f1357(item, key) {
                            if (key !== "default") {
                                method = ["insertInfoBaloon", "insertLink"].indexOf(key) > -1 ? "disable" : "unselect";
                                events.fire('setMenuButtonState', commands[key], method);
                            }
                        });
                        break;
                    default:
                        method = "select";
                        break;
                    }

                    events.fire('setMenuButtonState', commands[action], method);

                    _filteredValues = _.filter(commands, function f1358(item, key) {
                        if (key !== action && key !== "default") {
                            if (excludes && excludes.length) {
                                if (excludes.indexOf(key) === -1) {
                                    return item;
                                } else {
                                    return false
                                }
                            } else {
                                return item;
                            }
                        }
                    });

                    _.each(_filteredValues, function f1359(item) {
                        events.fire('setMenuButtonState', item, ["insertInfoBaloon", "insertLink"].indexOf(item) > -1 ? "disable" : "unselect");
                    });
                }
            },
            onSubtreeModified: function () {
                this.update_text_viewer_dimensions();
            },
            //init the math field inside the text editor
            initMathField: function f1360(mathFieldId, attributes, markup) {

                _.extend(attributes, localeModel.getConfig('mfConfig'));

                // If mathfield is inside text viewer editor inside a table cell
                this.isTableChild() && this.body.addClass('mathfieldInsideTextViewerEditorInsideTableCell');

                var mfData = $('<mathField/>').attr(attributes);
                var onMathfieldEndEdit = function f1361() {
                    if (!this.currentAnswerId) {
                        this.setMenuItemsState('enable');
                    }

                    events.fire('setMenuButtonState', 'menu-button-insert-af', 'disable');

                    delete this.selectedMathfield;
                    this.isMathfieldSelected = false;

                    this.document && this.document.removeEventListener('DOMSubtreeModified', this.onSubtreeModified.bind(this))
                };


                if (markup) {
                    mfData.append(markup);
                }

                if (attributes.keyboardPreset === 'contentEditorMathField_Completion') {
                    attributes.editMode = 'completion';
                }


                var mf = new MathFieldView({
                    data: mfData,
                    parent: $(attributes._document || this.document).find("#" + mathFieldId),
                    container: attributes.parentContainer || $("body"),
                    iframeDoc: attributes._document || this.document,
                    onStartEdit: _.bind(function f1362() {
                        var mode = this.controller.getMode && this.controller.getMode();
                        //fire event to disable the  menu button
                        events.fire('setMenuButtonState', 'menu-button-insert-mf', 'disable');
                        this.body.trigger('keyup');

                        //saves current selected mathfield object  and set that mathfield is selected
                        this.selectedMathfield = $(this.document).find("#" + mathFieldId);
                        this.isMathfieldSelected = true;

                        if (this.selectedMathfield.parents('ANSWERFIELD').length) {
                            events.fire('setMenuButtonState', 'menu-button-insert-af', 'disable');
                            //need to load answer field props, if they are not loaded yet
                            if ((!this.currentAnswerId) || (this.currentAnswerId && this.currentAnswerId !== this.selectedMathfield.parents('ANSWERFIELD').attr('id'))) {
                                this.loadPropsView({'target':this.selectedMathfield.parents('ANSWERFIELD')});
                            }
                        } else {
                            // if there's answer mode meaning that this is a cloze text viewer so
                            // a check whether the answer field button is required
                            if (mode) {
                                if (mode != "single") {
                                    events.fire('setMenuButtonState', 'menu-button-insert-af', 'enable');
                                }
                                if ((mode === "single") && _.size(this.controller.record.data.answerFields) === 0) {
                                    events.fire('setMenuButtonState', 'menu-button-insert-af', 'enable');
                                }
                            }
                        }

                        this.setMenuItemsState('disable');
                        _.delay(function f1363() {
                            this.document.getSelection().removeAllRanges();
                        }.bind(this), 200)

                        this.document.addEventListener('DOMSubtreeModified', this.onSubtreeModified.bind(this))
                    }, this),
                    onEndEdit: _.debounce(onMathfieldEndEdit.bind(this), 100, {
                      'leading': true,
                      'trailing': false
                    }),
                    onChange: attributes.onChange
                });

                if (mf.mathField) {
                    mf.mathField.view._view.parent().attr('contenteditable', false);
                }


                return mf.mathField;
            },

            insertNewItem: function f1364(continueCallback, command, type, dialogName, onDialogResponse, dialogCfg, dialogExtendedOptions) {
                // Type restriction for file to upload
                var inlineType = command == 'insertInlineImage' ? inlineTypes['image'] : inlineTypes['audio'],
                    currentParagraph = this.document.getSelection() &&
                                        this.document.getSelection().anchorNode;

                if (currentParagraph && (currentParagraph.nodeType != 1 || currentParagraph.tagName != 'DIV')) {
                    currentParagraph = currentParagraph.parentNode;
                }

                var narrOptions = {
                        'insertNarration': {
                            isNarration: (this.controller.enableTextToSpeach || this.controller.enableNarrationAdditionalLanguages),
                            asIs: true,
                            narrationText: require('cgsUtil').getTextViewerText(currentParagraph && currentParagraph.outerHTML),
                            recordId: this.controller.record.id
                        }
                    };

                var dialogConfig = dialogCfg || {
                    title: "Upload " + type,
                    content: {
                        text: "Choose file to upload"
                    },
                    buttons: {
                        yes: {
                            label: 'OK'
                        },
                        cancel: {
                            label: 'Cancel'
                        }
                    }
                },
                    _dialog_type = dialogName || "fileupload";
                    _onDialogResponse = onDialogResponse || this.onUploadResponse;

                if (!dialogName) {
                    dialogConfig = _.extend(dialogConfig, {
                        fileMymType: inlineType.fileMymType,
                        allowFiles: inlineType.allowFiles
                    }, narrOptions[command]);
                }

                if (dialogExtendedOptions) {
                    dialogConfig = _.extend(dialogConfig, dialogExtendedOptions);
                }

                events.register('onDialogResponse', function f1365(response) {
                    events.unbind('onDialogResponse');
                   _onDialogResponse.call(this, response, continueCallback, type);
                }, this);

                return dialogs.create(_dialog_type, _.extend(dialogConfig, narrOptions[command]), 'onDialogResponse');
            },
            insertAtCursor: function (node, selection, range) {
                if (!selection) selection = this.document.getSelection();
                
                var length = node.innerText.length
                if (!range) range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(node);
                range.setStartAfter(node);
                range.setEndAfter(node); 
                selection.removeAllRanges();
                selection.addRange(range);
            },

            checkImgPath: function f1366(response) {
                var chars = response.split("/");
                return ((chars[0] === "media" || chars[1] === "media") && chars.length > 3);
            },

            onUploadResponse: function f1367(response, continueCallback, type) {
                if (response && response !== "cancel") {
                    // If there is asset id or valid asset path - continue
                    if (_.isObject(response) || this.checkImgPath(response)) {
                        continueCallback.call(this, response);
                    }
                }
            },

            /**
             * return the current div.contenteditable node that catched the selection
             * @param range
             * @returns {Node}
             */
            get_parent: function f1368(range) {
                var node = range.startContainer;

                while (node.nodeName != "DIV" && node.nodeName != "BODY") {
                    node = node.parentNode;
                }

                if (node.parentNode.nodeName !== "BODY") {
                    return false;
                }
                return node;
            },

            unregisterEvents: function f1369() {
                this.body.unbind('paste');
            },

            dispose: function f1370() {
                this.isStartEditing = false;
                clearTimeout(this.defer);
                this.controller.unbindEvents();

                events.unbind('openSubMenu', this.controller.setMenu, this.controller);

                if (this.body) {
                    this.body.find('*').unbind().off();
                    this.body.unbind().off();
                }

                if (this.document) {
                    $(this.document).unbind().off();
                }

                //remove open mathfield keyboards from screen ( happens when keyboard is open and than TVE is deleted)
                this.endMathfieldEdit(true);

                $(document).off('mouseup.endMathfieldEdit');

                if (this.head) {
                    this.head.remove();
                }
                if (this.body) {
                    this.body.remove();
                }

                if (this.iframe) {
                    this.iframe.remove();
                }


                this._super();

                delete this.head;
                delete this.body;
                delete this.document;
                delete this.iframe;
            },
            //seach by type to support also cloze text viewer
            insertInvalidSign : function(){
                require('validate').insertInvalidSign(this.$('.'+this.controller.record.type+ '_content') , false, this.controller.record.type,
                    require('validate').getInvalidReportString(this.controller.record.data.invalidMessage));
            },

            removeInvalidSign : function(){
                this.$('.'+this.controller.record.type+ '_content .validTip').remove();
            },

            saveAndValidate: function() {
                this.saveData();
                require('validate').isEditorContentValid(this.controller.record.id);
                this.body.focus();
            }


        }, {
            type: 'TextViewerStageView'
        });

        return TextViewerStageView;

    });