define( [ "require", "jquery", "mustache", "lodash"],
function( require, $, mustache, _ ) {
    function alignTask(data, json) {
  	  var useBank, mtqQuestionType,placeHolder,  mtqQuestion,  parent = json[data.parent], inBankArea = false;
		if(parent.type == "mtqMultiSubAnswer"){
			mtqQuestion = json[json[json[json[json[data.id].parent].parent].parent].parent];
		}else{
			mtqQuestion = json[json[json[json[data.id].parent].parent].parent];
		}
		useBank = mtqQuestion.data.useBank;
		mtqQuestionType = mtqQuestion.type;
		placeHolder = mtqQuestion.data.placeHolder;

		if(parent.type == "mtqBank"){
			inBankArea = true;
		}
		data.displayContent = (!useBank || (useBank && inBankArea));
		data.displayCorrect = (!useBank || (useBank && !inBankArea));

		if(mtqQuestionType == "matchingAnswer" && !useBank){
			data.correct = data.id;
		}else{
			if(mtqQuestionType == "sortingAnswer"){
				data.displayCorrect = false;
				if(!placeHolder){
					data.hideSubAnswer = (useBank && !inBankArea);
				}
			}else{
				if(mtqQuestionType == "sequencingAnswer"){
					data.displayCorrect = false;					
				}
			}
		}
	}
    return alignTask;
});