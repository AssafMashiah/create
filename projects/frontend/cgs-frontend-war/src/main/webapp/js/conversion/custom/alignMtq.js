define( [ "require", "jquery", "mustache", "lodash"],
function( require, $, mustache, _ ) {
    function alignTask(data, json) {
		var mtqAnswer, answerType;
		data.mode = json[data.id].type;
		data.entityType="mtq";
		answerType = data.mode == "sorting"? "sortingAnswer": (data.mode == "matching"? "matchingAnswer": "sequencingAnswer");

		mtqAnswer = json[_.find(json[data.id].children, function(child) { return json[child].type == answerType })];
		if (!mtqAnswer) {
			mtqAnswer = json[_.find(json[data.id].children, function(child) { return json[child].type == 'linking' })];
			data.entityType = 'linking';
			data.isMtq = false;
			data.mode = false;
		}

		data.placeholders = mtqAnswer.data.placeHolder;
		data.useBank = mtqAnswer.data.useBank != null? mtqAnswer.data.useBank : false;
		data.bankRandom = mtqAnswer.data.random != null ? mtqAnswer.data.random :false;
		data.bankMode = mtqAnswer.data.mtqMode == "one_to_many" ? 'dragAndCopy': 'dragAndDisable' ;
		data.mistakeFactor = data.mode == "sorting" ? 1 : 0; //mistake factor = 1 only in sorting

		// copy answers to bank area
		if(data.useBank){
			var bank, mtqArea, mtqSubAnswer= [];
			_.each(mtqAnswer.children, function(item, idx){
				if(json[item].type == 'mtqBank'){
					bank = json[item];
				}
				if(json[item].type == 'mtqArea'){
					mtqArea = json[item];
					_.each( mtqArea.children, function(mtqSubQuestion, index){
						_.each(json[mtqSubQuestion].children, function(subQuestionChild, indx){
							if(json[subQuestionChild].type == 'mtqSubAnswer'){
								mtqSubAnswer.push(json[subQuestionChild]);
							}else{
								if(json[subQuestionChild].type == 'mtqMultiSubAnswer'){
									_.each(json[subQuestionChild].children, function(subAns, idx){
										mtqSubAnswer.push(json[subAns]);
									});
								}
							}
						});
					});
				}
			});
			_.each(mtqSubAnswer, function(subAnswer, idx){
				
				if( bank&& bank.children.indexOf(idx) == -1){

					//duplicate subanswer
					var newSubAnswer ={};
					$.extend(true, newSubAnswer ,json[subAnswer.id]);
					newSubAnswer.id = idx;
					newSubAnswer.parent = bank.id;
					json[newSubAnswer.id] = newSubAnswer;
					subAnswer.data.correct = idx;
					bank.children.push(newSubAnswer.id);
				}
			});
		}
	}
    return alignTask;
});