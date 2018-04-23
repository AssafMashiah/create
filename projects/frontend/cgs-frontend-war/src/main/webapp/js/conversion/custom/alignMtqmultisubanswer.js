define( [ "require", "jquery", "mustache", "lodash"],
function( require, $, mustache, _ ) {
    function alignTask(data, json) {
		var mtqQuestion = json[json[json[data.parent].parent].parent],
			useBank = mtqQuestion.data.useBank,
			placeHolder = mtqQuestion.data.placeHolder,
			multiSubAnswer = json[data.id];

		data.displayContent = (placeHolder || (!useBank && !placeHolder)) ;
		data.correctSet = "";
		_.each(multiSubAnswer.children, _.bind(function (subanswerId, index) {
			var correct = json[subanswerId].data.correct;
			if(correct === undefined){
				data.correctSet += subanswerId +',';
			}else{
				data.correctSet += correct +',';
			}
		}, this));
		data.correctSet = data.correctSet.substring(0, data.correctSet.length-1);
	}
    return alignTask;
});