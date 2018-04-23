define( [ "require", "jquery", "mustache", "lodash"],
function( require, $, mustache, _ ) {

	function isFirstRow(row_elem, table_elem) {
		return table_elem.children.indexOf(row_elem.id) == 0;
	}

	function isLastRow(row_elem, table_elem) {
		return table_elem.children.indexOf(row_elem.id) == table_elem.children.length - 1;
	}

	function isFirstColumn(cell_elem, row_elem) {
		return row_elem.children.indexOf(cell_elem.id) == 0;
	}

	function isLastColumn(cell_elem, row_elem) {
		return row_elem.children.indexOf(cell_elem.id) == row_elem.children.length - 1;
	}

    function alignTableCell(data, json) {
	    var row_elem = json[data.parent],
	    	table_elem = json[row_elem.parent];
	    
	    if (table_elem.data.summary_row && isLastRow(row_elem, table_elem) ||
	    	table_elem.data.summary_column && isLastColumn(data, row_elem)) {
	    	data.type = "summary";
	    }
	    if (table_elem.data.row_header && isFirstRow(row_elem, table_elem) ||
	    	table_elem.data.column_header && isFirstColumn(data, row_elem)) {
			data.type = "definition";
	    }
	    if (table_elem.data.row_header && isFirstRow(row_elem, table_elem) &&
	    	table_elem.data.column_header && isFirstColumn(data, row_elem)) {
			data.type = "intersection";
	    }

		return data;
	}

    return alignTableCell;
});