define(['events', 'editMode'], 
    function(events, editMode) {

        function getUndoPackage(oldRecord, newRecord) {
            return {
                from: require('cgsUtil').cloneObject(oldRecord),
                to: require('cgsUtil').cloneObject(newRecord)
            }
        }

        function getUndoChanges(changes) {
            return _.map(changes, function(change) {
                return { 
                    id: change.id,
                    record: require('cgsUtil').cloneObject(change.from)
                };
            }).reverse();
        }

        function getRedoChanges(changes) {
            return _.map(changes, function(change) {
                return {
                    id: change.id,
                    record: require('cgsUtil').cloneObject(change.to)
                };
            });
        }

        function isEqual(rec1, rec2) {
            var typesEqual = {
                textViewer: function(rec1, rec2) {
                    if (_.isEqual(rec1, rec2)) {
                        return true;
                    }
                    var title1 = $('<div/>').html(rec1.data.title),
                        title2 = $('<div/>').html(rec2.data.title),
                        mathArray1 = rec1.data.mathfieldArray,
                        mathArray2 = rec2.data.mathfieldArray,
                        isEqual = true;

                    rec1 = require('cgsUtil').cloneObject(rec1);
                    rec2 = require('cgsUtil').cloneObject(rec2);

                    delete rec1.data.title;
                    delete rec2.data.title;
                    delete rec1.data.mathfieldArray;
                    delete rec2.data.mathfieldArray;
                    delete rec1.data.textEditorStyle;
                    delete rec2.data.textEditorStyle;
                    if (!_.isEqual(rec1, rec2)) {
                        return false;
                    }

                    // Compare text viewer title
                    if (!title1.children().length || !title2.children().length) {
                        if (title1.html() != title2.children().map(function() { return $(this).html() }).toArray().join('') &&
                            title2.html() != title1.children().map(function() { return $(this).html() }).toArray().join('')) {
                            isEqual = title1.html() == title2.html();
                        }
                        else {
                            isEqual = false;
                        }
                    }
                    else if (title1.children().length != title2.children().length) {
                        return false;
                    }
                    else {
                        title1 = title1.children();
                        title2 = title2.children();
                        title1.add(title2).find('*').removeAttr('style contenteditable');

                        title1.each(function(ind) {
                            isEqual = isEqual &&
                                    ($(this).html() == title2.eq(ind).html()) &&
                                    ($(this).attr('class') == title2.eq(ind).attr('class'));
                        });
                    }

                    // Compare text viewer mathfields array
                    if (_.size(mathArray1) > 0 || _.size(mathArray2) > 0) {
                        isEqual = isEqual && _.isEqual(mathArray1, mathArray2);
                    }

                    return isEqual;
                },
                cloze_text_viewer: function(rec1, rec2) {
                    return this.textViewer(rec1, rec2);
                },
                AnswerFieldTypeText: function(rec1, rec2) {
                    return this.textViewer(rec1, rec2);
                }
            }

            if (rec1 == rec2) return true;

            if (!rec1 || !rec2) return false;

            rec1 = JSON.parse(JSON.stringify(rec1));
            rec2 = JSON.parse(JSON.stringify(rec2));

            if (rec1.type == rec2.type) {
                if (typesEqual[rec1.type]) {
                    return typesEqual[rec1.type](rec1, rec2);
                }
                return _.isEqual(rec1, rec2);
            }
            return false;
        }

        function UndoRedo() {
            this.reset();
        }

        function getBasicStoreData() {
            var router = require('router');
            return {
                urlId: router._static_data.id,
                urlTab: router._static_data.tab,
                treeScroll: parseInt($('#tree_base').scrollTop()),
                stageScroll: parseInt($('#stage_base').scrollTop()),
                propsScroll: parseInt($('#props_base').scrollTop()),
                activePropsTab: $('#props_base .nav-tabs .active a').attr('href'),
                activeEditorId: router.activeScreen && router.activeScreen.editor && router.activeScreen.editor.record.id,
                changes: []
            }
        }

        _.extend(UndoRedo.prototype, {

            // Store new record
            store: function(id, oldRecord, newRecord) {
                if (this._ignoreNext) {
                    this._ignoreNext = false;
                    return;
                }
                
                if (this._ignoreStore || !id || !oldRecord && !newRecord) return;
                
                if (isEqual(oldRecord, newRecord)) return;

                var obj = getUndoPackage(oldRecord, newRecord);

                if (this._isTransaction && this._data.length) {
                    if (this._cursor) {
                        this.resetRedo();
                        if (!this._appendToPrevious) {
                            this._data.push(getBasicStoreData());
                        }
                    }
                }
                else {
                    this.resetRedo();
                    this._data.push(getBasicStoreData());
                }
                this._data[this._data.length - 1].changes.push(_.extend(obj, { id: id }));

                this.setMenuButtons();
            },

            ignoreNext: function() {
                this._ignoreNext = true;
            },

            revert: function() {
                // this.resetRedo();
                this._data.pop();
                this.setMenuButtons();
            },

            filterData: function() {
                this._data = _.reject(this._data, function(action) { return !action.changes.length });
            },

            canUndo: function() {
                var totalActions = _.filter(this._data, function(action) { return action.changes.length });
                return !!totalActions.length &&
                        this._cursor < totalActions.length;
            },

            // Perform undo action
            undo: function() {
                if (!this.canUndo()) return;

                this.endTransaction(true);

                if (this._cursor >= this._data.length)
                    this._cursor = this._data.length - 1;

                var router = require('router'),
                    undoObject = this._data[this._data.length - 1 - this._cursor];

                undoObject.redoData = {
                    urlId: router._static_data.id,
                    urlTab: router._static_data.tab,
                    treeScroll: parseInt($('#tree_base').scrollTop()),
                    stageScroll: parseInt($('#stage_base').scrollTop()),
                    propsScroll: parseInt($('#props_base').scrollTop()),
                    activePropsTab: $('#props_base .nav-tabs .active a').attr('href'),
                    activeEditorId: router.activeScreen && router.activeScreen.editor && router.activeScreen.editor.record.id
                }

                var undoData = _.extend(_.omit(undoObject, ['changes', 'redoData']), {
                                    changes: getUndoChanges(undoObject.changes)
                                });

                this._cursor++;

                this.setMenuButtons();

                return undoData;
            },

            canRedo: function() {
                return !!this._data.length && this._cursor > 0;
            },

            // Perform redo action
            redo: function() {
                if (!this.canRedo()) return;

                this.endTransaction(true);

                if (this._cursor > 0)
                    this._cursor--;

                this.setMenuButtons();

                var redoObject = this._data[this._data.length - 1 - this._cursor];

                return _.extend(redoObject.redoData, {
                    changes: getRedoChanges(redoObject.changes)
                });
            },

            // Reset undo/redo
            reset: function() {
                this._maxUndo = 20;
                this._cursor = 0;
                this._isTransaction = false;
                this._transactionDepth = 0;
                this._data = [];
                this._ignoreStore = false;
                this._ignoreNext = false;
                this._appendToPrevious = false;
                this.setMenuButtons();
            },

            // Reset undo cursor - remove all stored redo actions
            resetRedo: function() {
                this.filterData();
                while (this._cursor > 0) {
                    this._data.pop();
                    this._cursor--;
                }
                while(this._data.length >= this._maxUndo) {
                    this._data.shift();
                }
                this._cursor = 0;
            },

            // Start store transaction
            startTransaction: function(options) {
                if (!this._transactionDepth) {
                    this._ignoreStore = options && options.ignore;
                    this._appendToPrevious = options && options.appendToPrevious;
                    if (!this._ignoreStore) {
                        this._isTransaction = true;
                        // this.resetRedo();
                        if (!options || !options.appendToPrevious || !this._data.length) {
                            var router = require('router');
                            this._data.push(_.extend(getBasicStoreData(), { changes: [] }));
                        }
                    }
                }
                this._transactionDepth++;
            },

            // End store transaction
            endTransaction: function(all) {
                this._transactionDepth--;
                if (all || this._transactionDepth <= 0) {
                    this._transactionDepth = 0;
                    this._isTransaction = false;
                    this._ignoreStore = false;
                    this._appendToPrevious = false;

                    this.filterData();
                }
            },

            setMenuButtons: function() {
                if (events.exists('setMenuButtonState')) {
                    events.fire('setMenuButtonState', 'menu-button-undo', this.canUndo() && !editMode.readOnlyMode ? 'enable' : 'disable');
                    events.fire('setMenuButtonState', 'menu-button-redo', this.canRedo() && !editMode.readOnlyMode ? 'enable' : 'disable');
                }
            }
        });

        return new UndoRedo();
    }
);