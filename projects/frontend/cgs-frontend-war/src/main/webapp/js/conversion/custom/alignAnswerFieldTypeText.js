define( [ "require", "jquery", "mustache", "lodash"],
	function( require, $, mustache, _ ) {
		function alignAnswerFieldTypeText(data, json) {

			//correctAnswers {Array}, partiallyCorrect {Array}, incorrectPredicted {Array}
			var correctAnswer = $(data.title).text().trim();

			//for answer field inside table inside cloze
            var cloze_answer = json[data.parent];
			while(cloze_answer && cloze_answer.type != 'cloze_answer') {
				cloze_answer = json[cloze_answer.parent];
			}
			
			if(!data.isNoncheckable && cloze_answer && cloze_answer.type == "cloze_answer" && cloze_answer.data.fieldsWidth != "longest") { //Answer fields width: Each field according to its answer
				data.maxChar = correctAnswer.length;
                data.mode = "word"
                data.showToolbar = false;
			}
            else{
                var mode = (data.answer_size ? data.answer_size.toLowerCase() : "word");
                if(mode == 'fulltext'){
                    mode = 'fullText';
                }

                data.mode = mode;
                data.maxChar = data.MaxChars;
            }

			if(typeof data.dragAndDrop === "undefined") {
				if (cloze_answer) {
					data.dragAndDrop = cloze_answer.data.interaction == "dd";
				}
				else {
					data.dragAndDrop = false;
				}
			}

			data.subAnswerId = data.id;
			data.correctAnswers=[];

			if(!data.isNoncheckable) {
				if (data.dragAndDrop) {
					//in bank with drag&drop the correct answer is the index in the bank
					data.correctAnswers.push({item: data.correct});
				} else {
					//correct answers
					data.correctAnswers.push({item: correctAnswer});

					if(data.showAdditionalCorrectAnswers){
						_.each(data.AdditionalCorrectAnswers, _.bind(function(addCorrectItem){
							data.correctAnswers.push(addCorrectItem);
						},this));
					}

					//partially correct answers
					if (data.showPartiallyCorrectAnswers) {
						data.partiallyCorrect = [];

						_.each(data.PartiallyCorrectAnswers, _.bind(function(partCorrectItem){
							data.partiallyCorrect.push(partCorrectItem);
						},this));
					}

					//expected wrong answers
					if (data.ExpectedWrong) {
						data.incorrectPredicted = [];

						_.each(data.ExpectedWrong, _.bind(function(ExpectedWrongItem){
							data.incorrectPredicted.push(ExpectedWrongItem);
						},this));
					}
				}
			}


			return data;
		}

		return alignAnswerFieldTypeText;
	}
);