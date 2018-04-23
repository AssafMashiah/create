define(['lodash', 'jquery', 'BaseView', 'mustache', 'events', 'translate', 'modules/Dialogs/BaseDialogView',
    'text!modules/Dialogs/types/diffLevels/diffLevelsDialog.html',
    'text!modules/Dialogs/types/diffLevels/diffLevelsRow.html',
    'repo'],
    function f591(_, $, BaseView, Mustache, events, i18n ,BaseDialogView, template, diffLevelsRowTemplate, repo) {
        //differentiation levels dialog
        var diffLevelsDialogView = BaseDialogView.extend({

            tagName: 'div',
            className: 'css-dialog',

            initialize: function f592(options) {
                this.customTemplate = template;
                this._super(options);
            },
            setAddDiffBtnState: function () {
                var courseRepo = repo.get(repo._courseId);
                var lessons = repo.getChildrenByTypeRecursive(repo._courseId, "lesson");

                // When there are lessons we prevent adding diff levels
                lessons && lessons.length && this.$el.find(".remove-diff").attr('disabled', true).unbind('click');

                var enable = !lessons || !lessons.length;

                this.enableAddDiffBtn(enable);
            },

            enableAddDiffBtn: function (enable) {
                var disabled = 'disabled';

                if (enable) {
                    this.$addDiffLevelBtn
                        .unbind("click")
                        .click(_.bind(this._onAddDiffLevel, this))
                        .removeAttr(disabled)
                        .removeClass(disabled);
                } else { // disable
                    this.$addDiffLevelBtn
                        .unbind("click")
                        .attr(disabled, disabled)
                        .addClass(disabled);
                }
            },

            /**
             * function returns true if there is less than 2 differentiation levels
             * false otherwise
             *
             * @returns {boolean}
             * @private
             */
            _verifyRowsNum: function f593() {
                if ($(this.$el).find("tr.diffData").length < 2) {
                    this.showErrorMessage("at least 2 differentiation levels are needed");
                    return false;
                }
                return true;
            },
            /**
             * the function returns true if there's a default differentiation
             * level selected false otherwise
             * @returns {boolean}
             * @private
             */
            _verifyDefaultDiffLevel: function f594() {
                if (!$('td.default input[type=radio]:checked').length) {
                    this.showErrorMessage("Please select a default differentiation level");
                    return false;
                }
                return true;
            },
            /**
             * function is called before the the differentiation levels
             * dialog is closed to verify the text entered is valid
             * @param e
             * @returns {*}
             */
            beforeTermination: function f595(e) {
                var diffLevels = [],
                    invalidInput = false,
                    that = this;
                //if the cancel button was pushed continue with closing the dialog
                if ($(e.target).attr("id") === "Cancel") return true;

                //check if there are at least 2 differentiation level rows and
                //that a default level is selected
                if (this._verifyRowsNum() && this._verifyDefaultDiffLevel()) {
                    $(this.$el).find("tr.diffData").each(function f596(index, value) {
                        var name = $(this).find("td.name input").val().trim(),
                            acronym = $(this).find("td.acronym input").val().trim();
                        //check that there is text is name and acronym for each row
                        if (!name || !acronym) {
                            invalidInput = true;
                            that.showErrorMessage("Please fill in all the fields");
                        }
                        //add the row to the result array
                        diffLevels.push({
                            id: parseInt($(this).find("td.diffId").text()),
                            name: name,
                            acronym: acronym,
                            isDefault: $(this).find("td.default input[type=radio]:checked").val()? true: false
                        });
                    });
                     //if one of the differentiation level rows and invalid input cancel dialog close
                    if (invalidInput) return "cancel_terminate";

                    //return differentiation levels rows
                    this.controller.setReturnValue('ok', diffLevels);
                    return true;
                }
                return "cancel_terminate";

            },
            showErrorMessage: function(errorMsg) {
                $("#diffLevel_error").text(i18n.tran(errorMsg));
            },
            /**
             * function is called when a delete differentiation level
             * button is pressed, the function removes the differentiation
             * level from the table and updates each id in the table
             * according to the id which was removed
             * @private
             */
            _onRemoveDiffLevel: function f597(context) {
                var removedRow = $(this).parent().parent(),
                    deletedId = parseInt($(removedRow).find("td.diffId").text().trim()),
                    nextIdCols = $(removedRow).nextAll().find("td.diffId");

                $(nextIdCols).each(function f598(index, value) {
                    $(value).text(deletedId);
                    deletedId++;
                });
                $(removedRow).remove();
                context.enableAddDiffBtn(true);
            },

            /**
             * adds events to a new differentiation row in the table
             * @param diffRow
             * @private
             */
            _addDiffRowEvents: function f599(diffRow) {
                var that = this;

                //click event on remove icon of a differentiation row removes it from table
                $(diffRow).find(".remove-diff").click(function f600() {
                    that._onRemoveDiffLevel.call(this, that);
                });

                //hover event on differentiation row shows the remove icon if there are more
                // than 2 differentiation rows
                $(diffRow).hover(function f601() {
                    if ($("#diff-level-table tr.diffData").length > 2) {
                        $(this).find(".remove-diff").css("visibility", "visible");
                    }
                }, function f602() {
                    $(this).find(".remove-diff").css("visibility", "hidden");
                });
            },
            /**
             * function is called when the + button is pressed and a differentiation
             * level is added to the table
             * @private
             */
            _onAddDiffLevel: function f603() {
                //generate new id for the added differentiation level
                var newDiffLevel = parseInt($("td.diffId").last().text().trim()) ?
                        parseInt($("td.diffId").last().text().trim()) + 1 : 1, diffRow;
                if (newDiffLevel < 7) {
                    //render a new differentation level if there are less than 7 (max:6)
                    diffRow = $(Mustache.render(diffLevelsRowTemplate, {id: newDiffLevel, name: "", acronym: "",
                        isDefault: (newDiffLevel == 1) ? true : false}))
                        .appendTo($(this.$el).find("tbody"));
                    //add click and hover events to the differentiation level
                    this._addDiffRowEvents(diffRow);
                    //scroll to the bottom of the table where new differentiation level is added
                    var objDiv = document.getElementById("diff-level-container");
                    objDiv.scrollTop = objDiv.scrollHeight;
                    if (newDiffLevel == 6) {
                        this.enableAddDiffBtn(false);
                    }
                }

            },

            render: function f604($parent) {
                var that = this,
                    missingDiffRows;
                this._super($parent, this.customTemplate);

                this.$addDiffLevelBtn = this.$el.find('#button_add_diffLevel');

                //remove diff-row on remove icon click
                $(".remove-diff").click(function f605() {
                    that._onRemoveDiffLevel.call(this, that);
                });

                //show remove icon on hover if there are more than 2 diff-rows
                $("#diff-level-table tr.diffData").hover(function f606() {
                    if ($("#diff-level-table tr.diffData").length > 2) {
                        $(this).find(".remove-diff").css("visibility", "visible");
                    }
                }, function f607() {
                    $(this).find(".remove-diff").css("visibility", "hidden");
                });

               missingDiffRows = $("#diff-level-table tr.diffData").length - 2;
                while (missingDiffRows < 0) {
                    this._onAddDiffLevel();
                    missingDiffRows++;
                }

                this.setAddDiffBtnState();
            }

        }, {type: 'diffLevelsDialogView'});

        return diffLevelsDialogView;

    });