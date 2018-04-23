define(['BaseContentEditor', './config', 'repo', 'repo_controllers', 'events', './TaskTemplate', './repoTemplate', './TableStageView', './TableSmallStageView',
    './TaskTemplate', './TableEditorPropsView'],
    function (BaseContentEditor, config, repo, repoControllers, events, tableTemplate, repoTemplate, TableStageView, TableSmallStageView, taskTemplate, TableEditorPropsView) {

        var TableEditor = BaseContentEditor.extend({

            initialize: function (configOverrides) {

                this.setStageViews({
                    small: TableSmallStageView,
                    normal: TableStageView
                });

                this._super(config, configOverrides);

                if (this.record.children.length == 0) {
                    repo.startTransaction({ appendToPrevious: true });
                    logger.debug(logger.category.EDITOR, 'Add default table content');
                    repo.addTemplate({parentId: this.record.id, template: tableTemplate.template});
                    repo.endTransaction();
                }
            },

            startEditing: function (event) {
                this._super(event);
                this.stage_view.handleMenu();
                events.exists( "selectionChanged" ) && events.fire( "selectionChanged" , { type : this.getCellsSelectionType( "all" ) , cells : this.getAllCellsIds() , answersChecked: this.getAnswerFieldIsTrue( "all" ) } );
            },

            registerEvents: function () {
                var changes = {
                    table_title: this.propagateChanges(this.record, 'table_title', true),
                    row_header: this.propagateChanges(this.record, 'row_header', true),
                    column_header: this.propagateChanges(this.record, 'column_header', true),
                    summary_row: this.propagateChanges(this.record, 'summary_row', true),
                    summary_column: this.propagateChanges(this.record, 'summary_column', true),
                    txtTableCopyrights: this.propagateChanges(this.record, 'txtTableCopyrights', true),
                    showTitle: this.propagateChanges(this.record, 'showTitle', true),
                    showCopyrights: this.propagateChanges(this.record, 'showCopyrights', true)
                };

                var model = this.screen.components.props.startEditing(this.record, changes);

                this.view.toggleInputFields( model );

                //events.fire('setMenuButtonState', 'table-button-delete', 'disable');

                //register to menu events
                this.bindEvents({
                    'selectionChanged': {'type':'register', 'func': this.view.onCellsSelectionChanged, 'ctx': this.view, 'unbind':'endEditing'},
                    'insertRow': {'type': 'register', 'func': this.stage_view.calculateRowAdding, 'ctx': this.stage_view, 'unbind': 'endEditing'},
                    'insertColumn': {'type': 'register', 'func': this.stage_view.calculateColumnAdding, 'ctx': this.stage_view, 'unbind': 'endEditing'},
                    'deleteTableItem': {'type': 'register', 'func': this.stage_view.calculateWhatNeedToDelete, 'ctx': this.stage_view, 'unbind': 'endEditing'}
                });

                //props copyrights and title (show/no show)
                model.on('change:showCopyrights change:showTitle', function () {
                    //this.startPropsEditing();

                    this.view.toggleInputFields( model );

                    this.registerEvents();

                    this.stage_view.render();
                    this.renderChildren();
                    this.startPropsEditing();
                }, this);

                //props copyrights and title (value changed)
                model.on('change:table_title change:txtTableCopyrights change:row_header change:column_header change:summary_row change:summary_column', function () {
                    this.setTextViewersStyle();
                    this.stage_view.render();
                    this.renderChildren();
                    this.startPropsEditing();
                }, this);
            },

            setSelectedCellsContentType: function( type , cells ){

                if( !cells ) cells = this.getAllCellsIds();

                _.each( cells , function( cellId ){

                    repo.updateProperty( cellId , "childType" , type.capitalize() );
                    require( "repo_controllers" ).get( cellId ).setChildType();

                } );

                this.startEditing();

            },

            getAllCellsIds: function(){

                var cells = [];

                if( !cells.length ){

                    _.each( this.stage_view.$( ".tableRow_content td" ) , function( item ){
                        item.hasAttribute( "data-elementid" ) && cells.push( item.getAttribute( "data-elementid" ) );
                    } );
                }

                return cells;

            },

            getAnswerFieldIsTrue: function( cells ){

                cells = cells == "all" || (cells instanceof Array && !cells.length) ? this.getAllCellsIds() : _.compact( cells );

                var answers = _.every( cells , function( cellId ){
                    return repo.get( cellId ).data.isAnswerField;
                } );

                return answers;

            },

            getCellsSelectionType: function( cells ){

                cells = cells == "all" || (cells instanceof Array && !cells.length) ? this.getAllCellsIds() : _.compact( cells );

                var types = _.chain( cells )
                    .map( function( cellId ){
                        return repo.get( cellId );
                    })
                    .groupBy( function( record ){
                        return record.data.childType;
                    } )
                    .value();

                var keys = _.keys( types );

                if( keys.length > 1) return "mixed";
                else if ( keys.length == 1){

                    if( keys[ 0 ] == "undefined" ) keys[ 0 ] = "text";

                    keys[ 0 ] = keys[ 0 ].toLowerCase();

                    if( keys[ 0 ] == "mathfield" ) keys[ 0 ] = "mathField";

                    return keys[ 0 ];

                }
                else return "none";

                if( _.size( types ) > 1 ) return "mixed";

            },

            getSelectedCells: function(){

                return this.stage_view.getSelectedCells();

            },

            markAnswerFields: function( val , cells ){

                if( !cells ) cells = this.getAllCellsIds();

                _.each( cells , function( cellId ){

                    //require( "repo_controllers" ).get( cellId ).model.set( "isAnswerField" , val );
                    repo.updateProperty( cellId , "isAnswerField" , val );
                    require( "repo_controllers" ).get( cellId ).onAnswerFieldChange();

                } );

                this.startEditing();

            } ,

            setTextViewersStyle: function () {
                repo.startTransaction({ appendToPrevious: true });
                _.each(repo.getChildrenByTypeRecursive(this.record.id, 'textViewer'), function (tv) {
                    repo.deleteProperty(tv.id, 'styleOverride', false, true);
                });

                function cleanStyle(item, style) {
                    if (!item.data.styleOverride) {
                        var newTitle = $('<div>')
                                        .html(item.data.title)
                                        .find('.' + style)
                                        .removeClass(style)
                                        .addClass('normal')
                                        .removeAttr('customstyle')
                                        .end()
                                        .html();

                        repo.updateProperty(item.id, 'title', newTitle, false, true);
                    }
                }

                // Set summary column style
                _.each(this.record.children, function (rowId) {
                    var row = repo.get(rowId);
                    var lastCell = repo.get(row.children[row.children.length - 1]);
                    if (lastCell) {
                        var child = repo.get(lastCell.children[0]);
                        if (child && child.type == 'textViewer') {
                            repo.updateProperty(child.id, 'styleOverride', this.record.data.summary_column ? 'tableSummary' : '', false, true);
                            cleanStyle(child, 'tableSummary');
                        }
                    }
                }, this);

                // Set summary row style
                var lastRow = repo.get(this.record.children[this.record.children.length - 1]);
                _.each(lastRow && lastRow.children, function (cellId, index) {
                    var cell = repo.get(cellId);
                    if (cell) {
                        var child = repo.get(cell.children[0]);
                        if (child && child.type == 'textViewer') {
                            if (index == lastRow.children.length - 1) {
                                repo.updateProperty(child.id, 'styleOverride', this.record.data.summary_row ? 'tableSummary' : child.data.styleOverride, false, true);
                            }
                            else {
                                repo.updateProperty(child.id, 'styleOverride', this.record.data.summary_row ? 'tableSummary' : '', false, true);
                            }
                            cleanStyle(child, 'tableSummary');
                        }
                    }
                }, this);

                // Set header row style
                var firstRow = repo.get(this.record.children[0]);
                _.each(firstRow && firstRow.children, function (cellId) {
                    var cell = repo.get(cellId);
                    if (cell) {
                        var child = repo.get(cell.children[0]);
                        if (child && child.type == 'textViewer') {
                            repo.updateProperty(child.id, 'styleOverride', this.record.data.row_header ? 'tableHeader' : (child.data.styleOverride != 'tableHeader' ? child.data.styleOverride : ''), false, true);
                            cleanStyle(child, 'tableHeader');
                        }
                    }
                }, this);

                // Set header column style
                _.each(this.record.children, function (rowId, index) {
                    var row = repo.get(rowId);
                    if (row) {
                        var firstCell = repo.get(row.children[0]);
                        if (firstCell) {
                            var child = repo.get(firstCell.children[0]);
                            if (child && child.type == 'textViewer') {
                                if (!index) {
                                    repo.updateProperty(child.id, 'styleOverride', this.record.data.row_header ^ this.record.data.column_header ? 'tableHeader' : '', false, true);
                                }
                                else {
                                    repo.updateProperty(child.id, 'styleOverride', this.record.data.column_header ? 'tableHeader' : (child.data.styleOverride != 'tableHeader' ? child.data.styleOverride : ''), false, true);
                                }
                                cleanStyle(child, 'tableHeader');
                            }
                        }
                    }
                }, this);

                repo.endTransaction();
            },

            startPropsEditing: function () {
                this._super();
                this.view = new TableEditorPropsView({controller: this});
                this.registerEvents();
                ( events.exists( "selectionChanged" ) && events.fire( "selectionChanged" , { type : this.getCellsSelectionType( "all" ) , cells : this.getAllCellsIds() , answersChecked: this.getAnswerFieldIsTrue( "all" ) } ) );
            },

            //params: option type object
            //option.position - the position where the row should be create, if null the last one
            //option.rowCount - the number row to insert
            addRow: function (option) {
                //create new item row
                //seeking how many cell we have
                var templateConfig, newRowId,
                    rowSize, newChildOrderEnd, newRowsIds = [],
                    firstRowId = this.record.children.length ? this.record.children[0] : 0,
                    rowRepoObj = repo.get(firstRowId);
                if (rowRepoObj) {
                    rowSize = rowRepoObj.children.length;

                    repo.startTransaction();

                    logger.debug(logger.category.EDITOR, 'Add ' + option.rowCount + ' new rows to table ' + this.record.id);

                    //create row objet
                    for (var i = 0; i < option.rowCount; i++) {
                        templateConfig = {"parentId": this.record.id, "template": repoTemplate.rowTemplate };
                        newRowId = repo.addTemplate(templateConfig);
                        newRowsIds.push(newRowId);

                        //prepering template
                        templateConfig.parentId = newRowId;
                        templateConfig.template = repoTemplate.cellTemplate;

                        //create cell objects
                        for (var j = 0; j < rowSize; j++) {
                            repo.addTemplate(templateConfig);
                        }
                    }

                    //reorder the record children if position not the last
                    if (option.position >= 0) {
                        newChildOrder = this.record.children.slice(0, option.position);

                        var newRowPo = this.record.children.length - newRowsIds.length;
                        newChildOrderEnd = this.record.children.slice(option.position, newRowPo);
                        //conbain all array into one
                        newChildOrder = newChildOrder.concat(newRowsIds);
                        newChildOrder = newChildOrder.concat(newChildOrderEnd);

                        //changing repo
                        repo.updateProperty(this.record.id, "children", newChildOrder, true);
                    }

                    this.setTextViewersStyle();
                    repo.endTransaction();

                    //need to do render again
                    this.stage_view.render();
                    this.renderChildren();
                    this.startPropsEditing();
                }
            },

            //params: option type object
            //option.position - if null the added in last
            //option.columnNumber - the number of columns to be added
            addColumn: function (option) {
                //running on each child and fire the addCellColumn function
                if (option && option.columnNumber) {
                    var currentRow, childrenArr, i = 0, optionObj = {};

                    repo.startTransaction();
                    //find all the rowObject in repo_controllers and active the add cell method
                    for (i; i < this.record.children.length; i++) {
                        currentRow = repoControllers.get(this.record.children[i]);
                        optionObj.numOfCells = option.columnNumber;
                        optionObj.position = option.position;
                        currentRow.addCells(optionObj);
                    }

                    this.setTextViewersStyle();
                    repo.endTransaction();

                    //need to do render again
                    this.stage_view.render();
                    this.renderChildren();
                    this.startPropsEditing();
                }
            },
            needToDeleteTable: function f1114() {
                var deleteTable = !this.record.children.length;

                _.each(this.record.children, function f1115(item) {
                    var child = repo.get(item);

                    if (!child.children.length) {
                        deleteTable = true;
                    } else {
                        deleteTable = false;
                    }
                });

                if (deleteTable) {
                    events.fire('deleteItem',this.record.id, true );
                }
            },
            //params: option type object
            //option.position - can't be null the number of row where we start to delete
            //option.rowCount - number of row to be delete, if null only one
            deleteRow: function (option) {
                if (option && option.position >= 0) {
                    repo.startTransaction();
                    var i = 0;
                    for (i = 0; i < option.rowCount; i++) {
                        //determin item to be remove from repo, and sending it to repo for delete
                        //we don't need to change the position
                        repo.remove(this.record.children[option.position]);
                    }
                    this.setTextViewersStyle();
                    this.stage_view.render();
                    this.renderChildren();
                    this.needToDeleteTable();
                    repo.endTransaction();
                }
            },

            //param:option type object
            //option.position - can't be null, the position of the first column
            //option.columnCount - number of roww to be delete, if null only one
            deleteColumn: function (option) {
                if (option && option.position >= 0) {
                    repo.startTransaction();
                    var i = 0, rowItem, optionObj = {};
                    //going to repo_controles for each row delete the right child
                    for (i = 0; i < this.record.children.length; i++) {
                        rowItem = repoControllers.get(this.record.children[i]);
                        optionObj.position = option.position;
                        optionObj.numOfCells = option.columnCount;

                        rowItem.removeCells(optionObj);
                    }

                    this.setTextViewersStyle();
                    this.stage_view.render();
                    this.renderChildren();
                    this.needToDeleteTable();
                    repo.endTransaction();
                }
            }

        }, {
            type: 'TableEditor',

            valid: function f1116(elem_repo) {
                var ret = { valid: true, report: [] };

                //a valid object is atlist one row and one cell with child
                if (!elem_repo.children.length) { // Empty table without rows
                    ret = {
                        valid: false,
                        report: [require('validate').setReportRecord(elem_repo, 'Table without rows is not valid')]
                    };
                }
                else {
                    var rowCells = _.chain(elem_repo.children)
                        .map(function (rowId) {
                            var row = repo.get(rowId);
                            return row ? row.children.length : 0;
                        })
                        .unique()
                        .value();

                    if (rowCells.length > 1) { // Rows with different amount of cells
                        ret = {
                            valid: false,
                            report: [require('validate').setReportRecord(elem_repo, 'Rows with different amount of cells is not valid')]
                        };
                    }
                }

                return ret;
            },
            postValid: function (elem_repo) {
                //cloze table validation
                if (elem_repo.data.clozeTable) {
                    var answerFields = (repo.getChildrenByTypeRecursive(elem_repo.id, 'AnswerFieldTypeText')).concat(
                        repo.getChildrenByTypeRecursive(elem_repo.id, 'answerFieldTypeMathfield'));
                    if (!answerFields.length) {
                        return {
                            valid: false,
                            report: [require('validate').setReportRecord(elem_repo, "The table must contain at least one answer field.")],
                            bubbleUp: true
                        };
                    }
                }
                return  { valid: true, report: [] };

            }
        });

        return TableEditor;

    });
