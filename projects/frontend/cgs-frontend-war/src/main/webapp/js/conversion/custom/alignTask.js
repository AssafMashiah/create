define( [ "require", "jquery", "mustache", "lodash"],
function( require, $, mustache, _ ) {
    function alignTask(data, json) {
    var parent_elem = json[data.parent], exposureId = 1, sequence_elem = parent_elem;
    
    if(parent_elem.type == "compare"){
		sequence_elem = json[parent_elem.parent];
		if(sequence_elem.data.exposure != "all_exposed") {
			exposureId = sequence_elem.children.indexOf(parent_elem.id);
		}

    }else{
		if(parent_elem.data.exposure != "all_exposed") {
			exposureId = parent_elem.children.indexOf(data.id);
		}
	}

	data.exposureId = exposureId;

	return data;

}
    return alignTask;
});