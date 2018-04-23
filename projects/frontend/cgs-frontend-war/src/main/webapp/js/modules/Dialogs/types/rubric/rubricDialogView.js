define(['lodash', 'jquery', 'BaseView', 'mustache', 'events', 'modules/Dialogs/BaseDialogView',
    'text!modules/Dialogs/types/rubric/rubricDialog.html', 'editMode', 'repo'],
    function f712(_, $, BaseView, Mustache, events, BaseDialogView, template, editMode, repo) {

        var rubricDialogView = BaseDialogView.extend({

            tagName: 'div',
            className: 'css-dialog',

            events:{
                'change #rubric-rows': 'updateTable',
                'change #rubric-cols': 'updateTable',
                'change input.row-score': 'setScore'
            },

            minRows: 1,
            maxRows: 10,
            minCols: 1,
            maxCols: 10,

            initialize: function f713(options) {
                this.customTemplate = template;
                this._super(options);

                this.data = require('cgsUtil').cloneObject(this.options.config.rubric) || this.getDefaultTable();
                this.rowsCount = this.data.rows.length;
                this.colsCount = this.data.columnsHeaders.length;
            },

            getDefaultTable: function() {
                return {
                    columnsHeaders: ['', ''],
                    rows: [
                        {
                            id: repo.genId(),
                            name: '',
                            totalScore: 0,
                            cells: [
                                {
                                    id: repo.genId(),
                                    explanation: ''
                                },
                                {
                                    id: repo.genId(),
                                    explanation: ''
                                }
                            ]
                        },
                        {
                            id: repo.genId(),
                            name: '',
                            totalScore: 0,
                            cells: [
                                {
                                    id: repo.genId(),
                                    explanation: ''
                                },
                                {
                                    id: repo.genId(),
                                    explanation: ''
                                }
                            ]
                        }
                    ]
                }
            },

            render: function f714($parent) {
                this._super($parent, this.customTemplate);

                if (editMode.readOnlyMode) {
                    this.$('input, textarea').attr('disabled', true);
                }
            },

            beforeTermination: function(event) {
                this.updateData()

                this.controller.setReturnValue('yes', this.data);

                if ($(event.target).hasClass('disabled'))
                    return 'cancel_terminate';
            },

            setScore: function(event) {
                var value = Math.abs(parseInt($(event.target).val()) || 0);
                $(event.target).val(value);
            },

            updateData: function() {

                this.data = this.data || {};

                this.data.columnsHeaders = _.map($('#rubric-dialog-table tr:first .row-name'), function(input) {
                    return $(input).val();
                });

                this.data.rows = _.map($('#rubric-dialog-table tr[rowid]'), function(row) {
                    return {
                        id: $(row).attr('rowid'),
                        name: $('.row-name', row).val(),
                        totalScore: $('.row-score', row).val(),
                        cells: _.map($('td[cellid]', row), function(cell) {
                            return {
                                id: $(cell).attr('cellid'),
                                explanation: $('.explanation', cell).val()
                            }
                        })
                    };
                });

            },

            updateTable: function() {
                var newRowsCount = parseInt($('#rubric-rows').val()),
                    newColsCount = parseInt($('#rubric-cols').val()),
                    self = this;

                this.updateData();

                // Validate new rows qty
                if (!newRowsCount || newRowsCount < this.minRows || newRowsCount > this.maxRows) {
                    newRowsCount = this.rowsCount;
                }

                // Validate new columns qty
                if (!newColsCount || newColsCount < this.minCols || newColsCount > this.maxCols) {
                    newColsCount = this.colsCount;
                }

                while (newRowsCount > this.data.rows.length) {
                    var newRow = {
                        id: repo.genId(),
                        name: '',
                        totalScore: 0,
                        cells: []
                    };

                    for (var i = 0; i < this.colsCount; i++) {
                        newRow.cells.push({
                            id: repo.genId(),
                            explanation: ''
                        });
                    }

                    this.data.rows.push(newRow);
                }

                while (newRowsCount < this.data.rows.length) {
                    this.data.rows.pop();
                }

                while (newColsCount > this.data.columnsHeaders.length) {
                    this.data.columnsHeaders.push('');
                    _.each(this.data.rows, function(row) {
                        row.cells.push({
                            id: repo.genId(),
                            explanation: ''
                        });
                    });
                }

                while (newColsCount < this.data.columnsHeaders.length) {
                    this.data.columnsHeaders.pop();
                    _.each(this.data.rows, function(row) {
                        row.cells.pop();
                    });
                }

                this.rowsCount = this.data.rows.length;
                this.colsCount = this.data.columnsHeaders.length;
                this.show(this);
            }

        }, {type: 'rubricDialogView'});

        return rubricDialogView;

    });