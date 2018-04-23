define( [ "require", "jquery", "mustache", "lodash"],
function( require, $, mustache, _ ) {
    function alignTask(data, json) {
		var progress, progressType, mtq = json[data.parent];
		_.each(mtq.children, function(child, idx){
			if(json[child].type == "progress"){
				progress = json[child];
			}
		});
		if(progress){
			data.checkingMode = progress.data.feedback_type;
			data.hasCheckingMode =true;
		}
	}
    return alignTask;
});