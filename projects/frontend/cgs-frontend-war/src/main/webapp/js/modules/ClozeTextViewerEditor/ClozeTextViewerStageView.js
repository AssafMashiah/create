define(['jquery', 'modules/TextViewerEditor/TextViewerStageView', 'rivets', 'events', 'repo', 'repo_controllers', 'editMode', 'dialogs', 'assets', 'keyboard',
    'text!modules/ClozeTextViewerEditor/templates/ClozeTextViewerStagePreview.html'
  ],
  function ($, TextViewerStageView, rivets, events, repo, repo_controllers, editMode, dialogs, assets, keyboard, previewTemplate) {

    var ClozeTextViewerStageView = TextViewerStageView.extend({

      update_mode: function f137(mode) {
        if (mode === "single" && _.size(this.controller.record.data.answerFields) === 1) {
          this.isSingleMode = true;
        } else {
          this.isSingleMode = false;
        }
      },
      is_valid_selection: function f138(selection, type) {
        /**
         * if mathfield is not selected do a check whether
         * the normal text selection as not been marked as
         * answer field before
         */
        if (!this.isMathfieldSelected) {
          var selectedNode = selection.anchorNode;

          if (selectedNode.nodeName === "#text") {
            selectedNode = selectedNode.parentNode;
          }

          //check for answerfield tag inside of selection
          var range = selection.getRangeAt(0),
            isAnswerFieldInsideSelection = false;
          var content = range.cloneContents();
          var arrAnswersFields = _.where(content.childNodes, {
            nodeName: "ANSWERFIELD"
          });

          if (arrAnswersFields.length) {
            isAnswerFieldInsideSelection = true;
          }

          if ($(selectedNode)
            .parents("answerfield")
            .length > 0 || isAnswerFieldInsideSelection) {
            return false;
          }

          if (selectedNode.nodeName === "ANSWERFIELD") {
            return false;
          }

          // Allow insertion when selection is Caret
          // if (type === "text" && selection.type === "Caret") return false;

          if (content.childElementCount > 0) { // selection contains an html tag, probably a style\effect from the effects toolbar.
            // we don't want to enable the user choose this as an answer field
            return false;
          }

          if (this.isImageSelected(selection)) { // an image is not a valid selection for an answer field
            return false;
          }

          if (this.isMultiParagraphSelected(selection)) { // selection of multiple paragraphs is not valid for an answer field
            return false;
          }

        }

        return true;
      },
      onAnswerFieldFocusEvents: function f139(el) {
        var self = this;

        el.on('click', ".answerfieldSpan", function f140() {
          self.onFocusAnswerField('disable');
        });

        self.onFocusAnswerField('disable');
      },
      isOutOfFocus: function (e) {
        var isNotAnswerFieldChild = e.toElement && !($(e.toElement)
          .parents('ANSWERFIELD')
          .length);
        var isNotSameAnswerField = !$(e.delegateTarget)[0].isSameNode(e.toElement);
        var isNotMathfieldTag = !($(e.toElement)
          .is('MATHFIELDTAG') && $(e.toElement)
          .parents('ANSWERFIELD')
          .length);
        var isNotChildOfMathfield = !$(e.toElement)
          .parents('MATHFIELDTAG')
          .length;
        var isNotDifferentAnswerField = !$(e.toElement)
          .is('ANSWERFIELD');
        var isNotTextChildOfAnswerField = !$(e.toElement)
          .is('span.answerfieldSpan');

        return this.isStartEditing &&
          isNotAnswerFieldChild &&
          isNotSameAnswerField &&
          isNotDifferentAnswerField &&
          isNotMathfieldTag &&
          isNotChildOfMathfield &&
          isNotDifferentAnswerField &&
          isNotTextChildOfAnswerField &&
          this.disposeAnswerFieldProperties(e);
      },
      disposeAnswerFieldProperties: function (e) {
        if (!this.isNewCreated && !$(e.target)
          .parents(".props_editor")
          .length &&
          !$(e.target)
          .parents(".growinglist-component")
          .length &&
          !$(e.target)
          .parents(".growinglist-row")
          .length &&
          !$(e.target)
          .parents('.screen-header')
          .length &&
          !$(e.target)
          .is('ANSWERFIELD') &&
          !$(e.target)
          .parents('ANSWERFIELD')
          .length &&
          !$(e.target)
          .parents('#dialog')
          .length &&
          (!$(e.target)
            .parents('.mathField.keyboard')
            .length && !$(e.target)
            .hasClass('mathField keyboard'))) {
          delete this.activeMathfield;
          this.body.trigger('LoadClozeTaskProperties');
        }
        delete this.isNewCreated;
      },
      registerAnswerFieldEvents: function f142(wrapElement) {

        wrapElement.find(".x-button")
          .attr({
            contenteditable: false
          });

        $('body')
          .off('click.disposeAnswerFieldProperties')
          .on('click.disposeAnswerFieldProperties', this.isOutOfFocus.bind(this));
        this.body.off('click.disposeAnswerFieldProperties')
          .on('click.disposeAnswerFieldProperties', this.isOutOfFocus.bind(this));
        this.clickBind = true;

        var self = this;

        wrapElement.on('click', '.x-button', function f143() {
          if (self.controller.view && ["AnswerFieldTypeMathfieldEditor", "AnswerFieldTypeTextEditor"].indexOf(self.controller.view.constructor.type) !== -1) {
            self.controller.view.remove();
          }

          var delete_node = this;
          var peregraph = wrapElement.closest('div')
            .get(0);

          self.controller.removeElement($(this)
            .parent()
            .attr('id'));

          if ($(this)
            .parent()
            .attr('isnoncheckable') == 'true') {
            $(this)
              .parent()
              .remove();
          } else {
            $(this)
              .parent()
              .contents()
              .each(function f144() {
                if (this.nodeName !== "#text" && !this.isSameNode(delete_node) && this.nodeName !== 'MATHFIELDTAG') {
                  $(this)
                    .contents()
                    .unwrap();
                } else if (this.isSameNode(delete_node)) {
                  var mf = $(delete_node)
                    .parent()
                    .find('mathfieldtag');


                  $(delete_node)
                    .parent()
                    .contents()
                    .unwrap();
                  $(delete_node)
                    .remove();

                  if (mf.length) {
                    var mfId = mf.attr('id');

                    if (~self.controller.record.data.mathfieldArray[mfId].markup.indexOf('completion')) {
                      self.mathfieldArr[mfId].setState($("<state></state>"));
                    }
                  }
                }
              });
          }

          self.setIframeHeight();
          self.saveData();
        });



        wrapElement.on('mouseover', function f145() {
            if (self.isStartEditing) {
              $(this)
                .find('.x-button')
                .show();
            }
          })
          .on('mouseout', function f146() {
            if (self.isStartEditing) {
              $(this)
                .find('.x-button')
                .hide();
            }
          });
      },
      initialize: function (options) {

        options = _.extend(options, {
          additionalHeadData: '<link rel="stylesheet" type="text/css" href="css/ClozeTextViewer.css"/>'
        });

        this._super(options);
        this.template = previewTemplate;

        var self = this;

        this.isSingleMode = this.controller.getMode() === "single" ? true : false;


        _.extend(this.methods, {
          'insertAnswerField': {
            callback: function f147(initType) {
              var mode = this.controller.getMode(),
                selection = this.document.getSelection(),
                type = this.selectedMathfield ? "mathfield" : "text",
                wrapElement,
                lastIndex = 0,
                elementId,
                xButton;

              this.saveData(true);

              delete this.currentAnswerId;

              this.isNewCreated = true;

              this.update_mode(mode);

              // The task is in single answer mode and the answer is already exists
              if (this.isSingleMode) return false;

              // Find last existing index
              _.each(this.controller.record.data.answerFields, function f148(item, key) {
                var splitId = key.split("_");

                lastIndex = Math.max(lastIndex, parseInt(splitId[splitId.length - 1]));
              });
              elementId = "answerfield_" + this.controller.record.id + "_" + (lastIndex + 1);

              // Answer field delete button
              var xButton = $("<div></div>")
                .attr('contenteditable', false)
                .addClass('x-button')
                .text('x');

              if (!initType) {
                if (!this.is_valid_selection(selection, type)) return false;

                if (type === "text") {
                  var range = selection.getRangeAt(0);
                  var answerFieldTag = $("<answerField></answerField");

                  var selectedMathfields = _.filter($(range.cloneContents())
                    .contents(),
                    function f149(item) {
                      return item.nodeName && item.nodeName === 'MATHFIELDTAG';
                    });

                  if (selectedMathfields.length) return false;

                  answerFieldTag.attr({
                    'class': 'AnswerField',
                    'type': type,
                    'contenteditable': false
                  });


                  answerFieldTag.css({
                    '-webkit-user-select': 'none'
                  })

                  wrapElement = this.wrapElement(range.cloneRange(), selection, "<span class='answerfieldSpan'></span>", {
                    'id': elementId,
                    'type': type,
                    'contenteditable': true
                  });

                  // Add padding to span so that is clickable
                  // when there is an empty gap
                  wrapElement.css({
                    padding: '0 5px',
                  });

                  wrapElement.keydown(function f150(e) {
                    var _selection = this.document.getSelection();

                    if (e.keyCode === 8 && _selection.anchorOffset === 0) {
                      return e.preventDefault();
                    }
                  }.bind(this));

                  wrapElement.css({
                    '-webkit-user-select': 'initial'
                  })

                  wrapElement.wrap(answerFieldTag);

                  wrapElement = wrapElement.parent();
                } else {
                  if (this.selectedMathfield.get(0)
                    .parentElement.nodeName == "ANSWERFIELD") {
                    return false;
                  }

                  var answerFieldTag = $("<answerField></answerField");


                  answerFieldTag.attr({
                    'class': 'AnswerField',
                    'type': type,
                    'id': elementId,
                    'contenteditable': false
                  });



                  wrapElement = this.selectedMathfield.wrap(answerFieldTag);
                  wrapElement = this.selectedMathfield.parent();

                  this.clearSelection.call(this)

                  events.fire('setMenuButtonState', 'menu-button-insert-af', 'disable');
                }
              }
              // Non-checkable task
              else {
                var range = selection.getRangeAt(0);
                var answerFieldTag = $("<answerField></answerField");

                var selectedMathfields = _.filter($(range.cloneContents())
                  .contents(),
                  function f149(item) {
                    return item.nodeName && item.nodeName === 'MATHFIELDTAG';
                  });

                if (selectedMathfields.length) return false;

                answerFieldTag.attr({
                  'class': 'AnswerField non-checkable',
                  'type': initType,
                  'isNoncheckable': true,
                  'contenteditable': false
                });

                range.deleteContents();

                var props = {
                  'id': elementId,
                  'type': initType,
                  'isNoncheckable': true,
                  'contenteditable': false
                }

                if (initType == 'text') {
                  _.extend(props, {
                    'displayFieldSize': true,
                    'allowedSizes': JSON.stringify([{
                      'value': 'Letter',
                      'text': 'Letter'
                    }, {
                      'value': 'Word',
                      'text': 'Word'
                    }, {
                      'value': 'Line',
                      'text': 'Line'
                    }, {
                      'value': 'Custom',
                      'text': 'Custom'
                    }]),
                    'answer_size': 'Word',
                    'disabledMaxChars': false,
                    'MaxChars': 15
                  });
                } else {
                  answerFieldTag.attr({
                    'fieldWidth': '1'
                  });

                  _.extend(props, {
                    'fieldWidth': '1',
                    'allowedWidths': JSON.stringify([{
                      'value': '1',
                      'text': '1 Digit or Operator'
                    }, {
                      'value': '4',
                      'text': '3-4 Digits or Operators'
                    }, {
                      'value': '7',
                      'text': '6-7 Digits or Operators'
                    }, {
                      'value': '11',
                      'text': '10-11 Digits or Operators'
                    }, {
                      'value': '16',
                      'text': '13-16 Digits or Operators'
                    }, {
                      'value': 'halfLine',
                      'text': 'Half Line'
                    }, {
                      'value': 'line',
                      'text': 'Full Line'
                    }])
                  });
                }



                wrapElement = this.wrapElement(range.cloneRange(), selection, "<span class='answerfieldSpan'></span>", props);

                wrapElement.text(require('translate')
                  .tran(initType == 'text' ? 'task.fill_in_gaps.answer_type_text.non_checkable_text' : 'task.fill_in_gaps.answer_type_mathfield.non_checkable_text'));

                wrapElement.keydown(function f150(e) {
                  var _selection = this.document.getSelection();

                  if (e.keyCode === 8 && _selection.anchorOffset === 0) {
                    return e.preventDefault();
                  }
                }.bind(this));

                wrapElement.css({
                  '-webkit-user-select': 'initial'
                });

                wrapElement.wrap(answerFieldTag);

                wrapElement = wrapElement.parent();
              }

              xButton.appendTo(wrapElement);

              this.registerAnswerFieldEvents(wrapElement);

              var hasRightText = wrapElement.parent()
                .contents()
                .filter(function f151() {
                  return $(this)
                    .index() > wrapElement.index() && this.nodeName === "#text" && this.textContent.length;
                })
                .length,
                hasLeftText = wrapElement.parent()
                .contents()
                .filter(function f152() {
                  return $(this)
                    .index() < wrapElement.index() && this.nodeName === "#text" && this.textContent.length;
                })
                .length;

              if (!hasRightText) {
                wrapElement.parent()
                  .append("&nbsp;");
              }

              if (!hasLeftText) {
                wrapElement.parent()
                  .prepend("&nbsp;");
              }

              // Attach click event to answer field
              wrapElement.on('click', _.debounce(this.loadPropsView.bind(self), 100, {
                'leading': true,
                'trailing': false
              }));

              this.body.find('mathfieldtag')
                .each(function f155() {
                  $(this)
                    .removeClass('selected');
                });

              repo.startTransaction();

              if (!initType) {
                if (type === "text") {
                  this.setCaretPositionEnd(wrapElement.find('span')
                    .get(0), selection);
                } else {
                  this.setCaretPositionEnd(wrapElement.get(0), selection);
                }
              } else {
                this.setCaretPositionStart(wrapElement, document.getSelection());
                delete this.isNewCreated;
              }

              this.setIframeHeight();
              this.controller.update_field(elementId);

              this.loadPropsView({
                target: wrapElement,
                preventDefault: $.noop
              })

              if (mode === "single") this.isSingleMode = true;

              this.onAnswerFieldFocusEvents($(wrapElement));

              repo.endTransaction();

            },
            type: "normal"
          }
        })

        this.resetDocumentProperties();
      },
      getElement: function f156(id) {
        return this.body.find('#' + id);
      },
      onFocusAnswerField: function f157(v) {
        events.fire('setMenuButtonState', 'menu-button-insert-sb', v);
        events.fire('setMenuButtonState', 'menu-button-insert-img', v);
        //events.fire('setMenuButtonState', 'menu-button-insert-mf', v);
        //events.fire('setMenuButtonState', 'menu-button-insert-latex', v);
        events.fire('setMenuButtonState', 'menu-button-paragraph-decrease-indent', v);
        events.fire('setMenuButtonState', 'menu-button-paragraph-increase-indent', v);
        events.fire('setMenuButtonState', 'menu-button-paragraph-bullet_number', v);
        events.fire('setMenuButtonState', 'menu-button-paragraph-math', v);
        events.fire('setMenuButtonState', 'menu-button-font-upper', v);
        events.fire('setMenuButtonState', 'menu-button-font-lower', v);
        events.fire('setMenuButtonState', 'menu-button-text-effects', v);
        events.fire('setMenuButtonState', 'menu-button-text-style', v);

        events.fire('setMenuButtonState', 'menu-button-insert-af-uncheckable', v);

        var selection = this.document.getSelection();
        if (v == 'enable' && selection && selection.type == 'Range') {
          events.fire('setMenuButtonState', 'menu-button-insert-ib', v);
          events.fire('setMenuButtonState', 'menu-button-insert-link', v);
        } else {
          events.fire('setMenuButtonState', 'menu-button-insert-ib', 'disable');
          events.fire('setMenuButtonState', 'menu-button-insert-link', 'disable');
        }
      },
      loadPropsView: function f158(e) {
        if (!this.isStartEditing) {
          this.iframe.parents('.element_preview_wrapper')
            .eq(0)
            .trigger('dblclick')
        }

        var target = $(e.target);
        var type = target.attr("type");
        var uncheckable = target.attr('isNoncheckable') == 'true';
        var validTypes = ['text', 'mathfield'];

        if (target.prop('tagName') == 'ANSWERFIELD' && (type !== 'mathfield' || uncheckable)) {
          target = target.children('span')
            .first();
        }

        if (this.currentAnswerId && target.attr('id') === this.currentAnswerId) {
          if (type === 'mathfield') {
            this.setMathfieldEnabled(target.find('mathfieldtag')
              .attr('id'));
          }
          return true;
        }

        this.currentAnswerId = target.attr('id');

        if (type && validTypes.indexOf(type) !== -1) {
          setTimeout(function (self) {
            self.controller['create_properties_' + type].call(self.controller, target);
          }, 1, this);
        }

        if (type === "text") {
          this.onFocusAnswerField('disable');
          target.focus();
        }

        events.fire('setMenuButtonState', 'menu-button-insert-af', 'disable');

      },
      clearSelection: function f159() {
        this.body.find('mathfieldtag')
          .each(function f160() {
            $(this)
              .find('.frame')
              .removeClass('selected_mathfield');
          });
      },

      onKeyUp: function (e) {
        var selection = this.document.getSelection();
        if (selection && $(selection.anchorNode)
          .parents('answerfield')
          .length) {
          this.onFocusAnswerField('disable');
        } else if (selection.anchorNode && $(selection.anchorNode)
          .parent()
          .addBack()
          .is('div')) {
          this.onFocusAnswerField('enable');
        }
        this.setMenuFromSelection(e);
      },

      onMathfieldRemove: function f161(el) {
        var parent_el = el.parent();

        if (parent_el.length && parent_el.get(0)
          .nodeName === "ANSWERFIELD") {
          var elementId = parent_el.attr('id');

          this.controller.removeElement(elementId);

          this.body.find("#" + elementId)
            .remove();
        }
      },
      startEditing: function f162() {
        this._super();

        var mode = this.controller.getMode();

        if (mode !== "single") {
          this.isSingleMode = false;
        }
        //events.fire('setMenuButtonState', 'menu-button-insert-af', 'disable');
        this.setMenuFromSelection();

        this.onKeyUpHandler = this.onKeyUp.bind(this);

        this.body.on('keyup', this.onKeyUpHandler);

        if (!this.clickBind) {
          $('body')
            .off('click.disposeAnswerFieldProperties')
            .on('click.disposeAnswerFieldProperties', this.isOutOfFocus.bind(this));
          this.body.off('click.disposeAnswerFieldProperties')
            .on('click.disposeAnswerFieldProperties', this.isOutOfFocus.bind(this));
          this.clickBind = true;
        }

        $(this.document.body)
          .find('answerfield:not([isnoncheckable="true"]) span[contenteditable]')
          .attr('contenteditable', true);
      },
      endEditing: function f163() {
        this._super(true);

        if (this.document) {
          this.clearSelection.call(this);
          $(this.document.body)
            .find('answerfield span[contenteditable]')
            .attr('contenteditable', false);
        }

        this.body && this.body.off('keyup', this.onKeyUpHandler);

        $('body')
          .off('click.disposeAnswerFieldProperties');
        this.body && this.body.off('click.disposeAnswerFieldProperties');
        this.clickBind = false;

        delete this.currentAnswerId;
      },
      //ovverride function and set mathfield height as a property
      initMathField: function (mathFieldId, attributes, markup) {
        var maxHeight = require("repo")
          .get(this.controller.record.parent)
          .data.maxHeight;
        attributes.maxHeight = maxHeight;

        return this._super(mathFieldId, attributes, markup);
      },

      render: function f165($parent) {
        this._super($parent);

        var data = this.controller.record.data;
        var self = this;

        if (data.title !== "" && this.body) {
          var searchAnswerFieldTag = this.body.find('answerField');

          if (searchAnswerFieldTag.length) {
            searchAnswerFieldTag.each(function f166() {
              $(this)
                .find("span[contenteditable]")
                .keydown(function f167(e) {
                  var _selection = this.document.getSelection();

                  if (e.keyCode === 8 && _selection.anchorOffset === 0) {
                    return e.preventDefault();
                  }
                }.bind(self));

              if (!self.isStartEditing) {
                $(this)
                  .find('span[contenteditable]')
                  .attr('contenteditable', false);
              }

              self.registerAnswerFieldEvents($(this));

              $(this)
                .on('click', _.debounce(self.loadPropsView.bind(self), 100, {
                  'leading': true,
                  'trailing': false
                }));

              self.onAnswerFieldFocusEvents($(this));
            });
          }
        }

      },
      setInternalIframeEvents: function f168() {
        this._super();
      },
      setExternalIframeEvents: function () {
        this._super();

        this.body.off("LoadClozeTaskProperties")
          .on('LoadClozeTaskProperties', function (e) {
            if (!this.activeMathfield && this.controller.record.type === "cloze_text_viewer") {
              if (this.controller.view && this.controller.view.constructor &&
                this.controller.view.constructor.type !== "ClozeTextViewerPropsView") {

                this.controller.startPropsEditing();
              }
            }

            this.setMenuItemsState('enable');

            delete this.currentAnswerId;
          }.bind(this));
      },
      setMathfieldEnabled: function (_mathfield_id) {
        if (editMode.readOnlyMode) return false;

        var _mathfield_obj = this.mathfieldArr[_mathfield_id];

        if (_mathfield_obj) {
          _mathfield_obj.view.startEdit();
          _mathfield_obj.view.setEnabled(true);
          _mathfield_obj.view.placeCaretAtEnd()

          this.activeMathfield = _mathfield_obj;
        }
      },
      updateAnswerfieldsInRepo: function f169() {
        var self = this;

        _.each(this.controller.record.data.answerFields, function (value, key) {
          if (!$(this.body)
            .find("#" + key)
            .length) {
            delete this.controller.record.data.answerFields[key];
          }
        }, this);

        $(this.body)
          .find('ANSWERFIELD')
          .each(function () {
            var type = $(this)
              .attr('type');
            var id = null;

            switch (type) {
            case 'text':
              id = $(this)
                .find('.answerfieldSpan')
                .attr('id');
              break;
            case 'mathfield':
              id = $(this)
                .attr('id');
              break;
            }

            if (id) {
              var answer_id = id.split("_")[0];
              var answer_idx = id.split("_")[1];

              if (!self.controller.record.data.answerFields[id]) {

                if (answer_idx == 0) {
                  _.each(_.keys(self.controller.record.data.answerFields), function (id) {
                    var parse_id = id.split("_");

                    answer_idx = Math.max(parseInt(answer_idx), parseInt(parse_id[1]));

                  });

                  while ($(this.body)
                    .find('#' + answer_id + "_" + (answer_idx + 1))
                    .length) {
                    answer_idx++;
                  }

                  id = answer_id + "_" + (answer_idx + 1);

                }

                $(this)
                  .attr('id', id);

                self.controller.record.data.answerFields[id] = self.controller.getElementAsJSON($(this)
                  .get(0));

              }
            }

          })
      },
      setMenuItemsState: function (v) {
        this._super(v);

        events.fire('setMenuButtonState', 'menu-button-insert-af-uncheckable', v);
      },
      isImageSelected: function (selection) {
        var range = selection.getRangeAt(0);
        var _contents = $(range.cloneContents());

        if (_contents.children('IMG')
          .length || _contents.children()
          .find('img')
          .length) return true;

        return false;
      },
      isMultiParagraphSelected: function (selection) {
        var range = selection.getRangeAt(0);
        var endContainerPar = range && $(range.endContainer)
          .parents('div')
          .get(0);
        var startContainerPar = range && $(range.startContainer)
          .parents('div')
          .get(0);


        if (endContainerPar && endContainerPar.isSameNode(startContainerPar)) {
          return false;
        }

        return true;
      },
      setMenuFromSelection: function f170(e) {
        this._super(e);

        if (!this.document) return;

        var selection = this.document.getSelection(),
          mode = this.controller.getMode();
        var type = this.selectedMathfield ? "mathfield" : "text";




        this.updateAnswerfieldsInRepo();

        if (e && ~[8, 46].indexOf(e.keyCode)) {
          events.fire('setMenuButtonState', 'menu-button-insert-af', 'disable');
          return false;
        }
        if (selection.type == "Range") {
          try {
            var range = selection.getRangeAt(0);
            var contents = range.cloneContents();

            contents = $("<temp></temp>")
              .append($(contents));

            contents.find('mathfieldtag')
              .each(function () {
                if (!$(this)
                  .children()
                  .length) $(this)
                  .remove();
              });

            if (contents.text()
              .length === 0 ||
              contents.find('img, answerfield, latex, mathfieldtag, .infoBaloon')
              .length ||
              (selection.anchorNode && $(selection.anchorNode)
                .parents('.infoBaloon')
                .length)) {
              events.fire('setMenuButtonState', 'menu-button-insert-af', 'disable');
              return;
            }
          } catch (err) {
            events.fire('setMenuButtonState', 'menu-button-insert-af', 'disable');
            return;
          }

          if ($(selection.anchorNode)
            .parents('ANSWERFIELD')
            .length)
            return;
          if (!this.is_valid_selection(selection, type)) { // if the selected area is not valid for FITG answer field - we disable the button
            events.fire('setMenuButtonState', 'menu-button-insert-af', 'disable');
          } else if (mode != "single") {
            events.fire('setMenuButtonState', 'menu-button-insert-af', 'enable');
          } else if ((mode === "single") && _.size(this.controller.record.data.answerFields) === 0) {
            events.fire('setMenuButtonState', 'menu-button-insert-af', 'enable');
          } else {
            events.fire('setMenuButtonState', 'menu-button-insert-af', 'disable');
          }
        } else {
          // enable adding fill in boxes on caret position
          if (selection.type === 'Caret') {
            events.fire('setMenuButtonState', 'menu-button-insert-af', 'enable');
          } else {
            if (!this.isMathfieldSelected) {
              events.fire('setMenuButtonState', 'menu-button-insert-af', 'disable');
            }
          }
        }

      },
      //override text viewer function, because currently in fill in the gaps we dont need to have max text length (maxChars)
      checkTextSize: function () {
        return true;
      },

      dispose: function () {
        this.body && this.body.off('click.disposeAnswerFieldProperties');
        $('body')
          .off('click.disposeAnswerFieldProperties');
        this.clickBind = false;
        this._super();
      }


    }, {
      type: 'ClozeTextViewerStageView'
    });

    return ClozeTextViewerStageView;

  });
