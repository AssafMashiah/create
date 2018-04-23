define(['jquery', 'BaseNormalStageContentView','events', 'editMode',
	'text!modules/TableEditor/templates/TableNormalStage.html'],
function($, BaseNormalStageContentView, events, editMode, template) {

	var TableStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this.selection = {};
			this.template = template;
			this._super(options);
		},

		render:function($parent){
			//css for summery and header cell
			this.prop_classes ="";
			this.controller.record.data.row_header && (this.prop_classes += "row-header ");
			this.controller.record.data.column_header && (this.prop_classes += "column-header ");
			this.controller.record.data.summary_row && (this.prop_classes += "row_summery ");
			this.controller.record.data.summary_column && (this.prop_classes += "column_summery ");

			this._super($parent);

			this.$el.find('.virtualTable').mousedown(function(event) {
				if (($(this)[0].scrollWidth + 8 > $(this).width() && event.offsetY >= $(this).height() - 8) ||
					($(this)[0].scrollHeight + 8 > $(this).height() && event.offsetX >= $(this).width() - 8))
				{
					event.stopPropagation();
				}
			});

			// reset selection
			this.selection = {};
			this.handleMenu();
		},

		showStagePreview: function($parent, previewConfig) {
			this._super($parent, previewConfig);

			// Remove br divs from table content
			//this.$el.find('div.br').not('.tableCell_content div.br').remove();
			this.buildVirtualRowAndColumn();

			if (require('router').activeScreen.editor === this.controller){
				this.$el.find(".table_content").addClass("active-table");
				this.bindEvents();
			} else {
				this.unbindEvents();
			}
		},

		handleMenu: function(disableAll) {
			if (disableAll || editMode.readOnlyMode) {
				events.fire('setMenuButtonState', 'table-button-delete', 'disable');
				events.fire('setMenuButtonState', 'table-button-insert-row', 'disable');
				events.fire('setMenuButtonState', 'table-button-insert-column', 'disable');
			}
			else {
				// Set delete button state
				if(this.selection.indices && this.selection.indices.length >= 0) {
					events.fire('setMenuButtonState', 'table-button-delete', 'enable');
				}
				else {
					events.fire('setMenuButtonState', 'table-button-delete', 'disable');
				}

				events.fire('setMenuButtonState', 'table-button-insert-row', 'enable');
				events.fire('setMenuButtonState', 'table-button-insert-column', 'enable');
			}
		},

		columnSelected: function(e){
			// If rows were selected before - reset selection
			if(this.selection.type == 'row') {
				this.selection = {};
			}

			var elm = $(e.target);
			if(elm && elm.data() && elm.data().columnnumber >= 0){
				this.selection.type = 'column';
				// Ensure indices array exists
				this.selection.indices = this.selection.indices || [];

				// Get min and max selected columns index
				var min = _.min(this.selection.indices),
					max = _.max(this.selection.indices);

				// If selection is empty, select only clicked column
				if (!this.selection.indices.length) {
					this.selection.indices.push(elm.data().columnnumber);
				}
				// The clicked column is inside the current selection
				else if (this.selection.indices.indexOf(elm.data().columnnumber) >=0) {
					// The clicked column is on the edge of selection - remove it from selection
					if (elm.data().columnnumber == min || elm.data().columnnumber == max) {
						this.selection.indices = _.reject(this.selection.indices, function(ind) { return ind == elm.data().columnnumber; });
					}
					// Else - clear selection and select only clicked column
					else {
						this.selection.indices = [elm.data().columnnumber];
					}
				}
				// The clicked column is outside the current selection
				else {
					// The clicked column is close to selection - add it to selection
					if (elm.data().columnnumber == min - 1 || elm.data().columnnumber == max + 1) {
						this.selection.indices.push(elm.data().columnnumber);
					}
					// Else - clear selection and select only clicked column
					else {
						this.selection.indices = [elm.data().columnnumber];
					}
				}
			}

			this.drawSelection();
			this.handleMenu();
		},

		rowSelected: function(e){
			// If columns were selected before - reset selection
			if(this.selection.type == 'column') {
				this.selection = {};
			}

			var elm = $(e.target);
			if(elm && elm.data() && elm.data().rownumber >= 0){
				this.selection.type = 'row';
				// Ensure indices array exists
				this.selection.indices = this.selection.indices || [];

				// Get min and max selected rows index
				var min = _.min(this.selection.indices),
					max = _.max(this.selection.indices);

				// If selection is empty, select only clicked row
				if (!this.selection.indices.length) {
					this.selection.indices.push(elm.data().rownumber);
				}
				// The clicked row is inside the current selection
				else if (this.selection.indices.indexOf(elm.data().rownumber) >=0) {
					// The clicked row is on the edge of selection - remove it from selection
					if (elm.data().rownumber == min || elm.data().rownumber == max) {
						this.selection.indices = _.reject(this.selection.indices, function(ind) { return ind == elm.data().rownumber; });
					}
					// Else - clear selection and select only clicked row
					else {
						this.selection.indices = [elm.data().rownumber];
					}
				}
				// The clicked row is outside the current selection
				else {
					// The clicked row is close to selection - add it to selection
					if (elm.data().rownumber == min - 1 || elm.data().rownumber == max + 1) {
						this.selection.indices.push(elm.data().rownumber);
					}
					// Else - clear selection and select only clicked row
					else {
						this.selection.indices = [elm.data().rownumber];
					}
				}
			}

			this.handleMenu();
			this.drawSelection();
		},

        clearSelection: function(){
            // Remove previous selection
            this.$el.find(".columnSelected").removeClass("columnSelected");
            this.$el.find(".selectedBak").removeClass("selectedBak");
        },

		drawSelection: function() {

            this.clearSelection();

			var start =  parseInt(_.min(this.selection.indices)),
				end = parseInt(_.max(this.selection.indices)),
                i = 0;

			if (!isNaN(start) && !isNaN(end) && start >= 0 && this.selection.type) {
				// Rows selected
				if (this.selection.type == 'row') {
					// Set class for each selected row
					for (i = start; i <= end; i++) {
						this.$el.find('.table_content tr[class!="columnsHandlers"]').eq(i).addClass('selectedBak');

					}

				}
				// Columns selected
				else if (this.selection.type == 'column') {
					// Set class for each cell in selected columns
					for (i = start; i <= end; i++) {
						_.each(this.$el.find('.table_content tr'), function(elem) {
							$(elem).children().eq(i + 1).addClass('columnSelected');
						});
					}
				}

			}

            var cells = this.getSelectedCells();

            events.exists( "selectionChanged" ) && events.fire( "selectionChanged", { type: this.controller.getCellsSelectionType( cells ), cells: cells , answersChecked: this.controller.getAnswerFieldIsTrue( cells ) } );

		},

		// Bind selection events
		bindEvents : function(){
			this.unbindEvents();
			this.$el.find(".columnsHandlers").on("click", _.bind(this.columnSelected,this));
			this.$el.find(".virtualRowHandle").on("click", _.bind(this.rowSelected , this));
		},

		unbindEvents: function(){
			this.$el.find(".columnsHandlers").unbind("click");
			this.$el.find(".virtualRowHandle").unbind("click");
		},

		//the method define if a row or column should be delete limitation both can't be delete
		calculateWhatNeedToDelete :function(){
			if (this.selection.type == 'row') {
				this.deleteRows();
			}
			else if (this.selection.type == 'column') {
				this.deleteColumns();
			}
            require('router').startEditingActiveEditor();
		},

		// Delete selected columns
		deleteColumns :function() {
			var options = {},
				start = parseInt(_.min(this.selection.indices)),
				end = parseInt(_.max(this.selection.indices));

			if (!isNaN(start) && !isNaN(end) && start >= 0 && this.selection.type == 'column') {
				options.position = start;
				options.columnCount = end - start + 1;
				this.controller.deleteColumn(options);
			}
		},

		// Delete selected rows
		deleteRows : function(){
			var options = {},
				start = parseInt(_.min(this.selection.indices)),
				end = parseInt(_.max(this.selection.indices));

			if (!isNaN(start) && !isNaN(end) && start >= 0 && this.selection.type == 'row') {
				options.position = start;
				options.rowCount = end - start + 1;
				this.controller.deleteRow(options);
			}
		},

		// The method calculate how many row need to be adding and on which position to insert them
		calculateRowAdding: function() {
			var options = {
					position: -1,
					rowCount: 1
				},
				start = parseInt(_.min(this.selection.indices)),
				end = parseInt(_.max(this.selection.indices));

			if (!isNaN(start) && !isNaN(end) && start >= 0 && this.selection.type == 'row') {
				options.position = end + 1;
				options.rowCount = end - start + 1;
			}
			this.controller.addRow(options);
		},

		calculateColumnAdding: function() {
			var options = {
					position: -1,
					columnNumber: 1
				},
				start = parseInt(_.min(this.selection.indices)),
				end = parseInt(_.max(this.selection.indices));

			if (!isNaN(start) && !isNaN(end) && start >= 0 && this.selection.type == 'column') {
				options.position = end + 1;
				options.columnNumber = end - start + 1;
			}
			this.controller.addColumn(options);
		},

		//the method build all the visual cell for seleted
		buildVirtualRowAndColumn:function(){
			//first calculate all the row
			var virtualTemplate = "<td class='virtualRowHandle tableCell' data-rowNumber='XiX' >&nbsp;&nbsp;</td>",
				childRow = this.controller.record.children.length ,
				$divCellVirtual,i=0,tmpItem,rows = this.$el.find(".table_content tr");

			for(i = 0; i < childRow; i++){
				tmpItem = virtualTemplate.replace("XiX", i);
				$divCellVirtual = $(tmpItem);
				$(rows[i]).prepend($divCellVirtual);
			}

			// second calculate all the column
			var childcolumns = this.$el.find(".table_content tr:first  td").length - 1,
				virtualTemplate = "<td class='virtualColumnHandle tableCell' data-columnNumber='XiX' >&nbsp;</td>",
				//adding the virtual row to the table
				virtualRow = $('<tr class="columnsHandlers" ></tr>').prependTo(this.$el.find(".table_content"));

			// The first cell is for row selectors column
			virtualRow.append($(virtualTemplate.replace('XiX', '-1')));

			for(i = 0; i < childcolumns; i++) {
				tmpItem = virtualTemplate.replace("XiX", i);
				$divCellVirtual = $(tmpItem);
				$divCellVirtual.appendTo(virtualRow);
			}
		},

        getSelectedCells: function(){

            var cells = [];

            this.$el.find( ".selectedBak" ).children().each( function(){
                cells.push( $(this).attr( "data-elementid" ) );
            } );

            this.$el.find( ".columnSelected" ).each( function(){
                cells.push( $(this).attr( "data-elementid" ) );
            } );

            return _.compact( cells );

        },

		startEditing: function(){
			this.$el.find(".table_content").addClass("active-table");
			this.bindEvents();
		},

		endEditing: function(){
			// remove selection
			this.selection = {};
			this.clearSelection();
			this.handleMenu(true);
			// remove css issues
			this.$el.find(".table_content").removeClass("active-table");
			// remove all binging
			this.unbindEvents();

		}

	}, {type: 'TableStageView'});

	return TableStageView;

});
