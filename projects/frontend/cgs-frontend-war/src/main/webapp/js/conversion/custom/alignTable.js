define( [ "require", "jquery", "mustache", "lodash"],
function( require, $, mustache, _ ) {

	function alignTable(data, json) {
		data.tableContainer = data.clozeTable ? "answer" : (json[data.parent].type == 'question' ? 'question' : '');

		return data;
	}

    return alignTable;
});