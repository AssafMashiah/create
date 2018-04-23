define( [ "require", "jquery", 'mustache', "conversion/custom/alignClozeTextViewer", "lodash"],
	function( require, $, mustache, alignClozeTextViewer, _ ) {

		function alignAnswerFieldTypeMathfield(data, json) {
			data.correctAnswers = [];

			data.subAnswerId = data.id;

			if (data.isNoncheckable) {
				data.widthEM = data.fieldWidth;
			}

			var cloze_answer = json[data.parent];
			while(cloze_answer && cloze_answer.type != 'cloze_answer') {
				cloze_answer = json[cloze_answer.parent];
			}

			if(typeof data.dragAndDrop === "undefined") {
				if (cloze_answer) {
					data.dragAndDrop = cloze_answer.data.interaction == "dd";
				}
				else {
					data.dragAndDrop = false;
				}
			}

			if(!data.completionType) {
				data.completionType = "A";
			}

			if (data.completionType === 'C') {
				data.editMode = 'completion';
				data.isCompletionType = true;
				data.widthEM = data.answerMarkup && data.answerMarkup.widthEM;
				data.answerMarkup = data.answerMarkup.markup;
			}

			if (!data.isNoncheckable) {
				if (data.dragAndDrop) {
					//in bank with drag&drop the correct answer is the index in the bank
					data.correctAnswers.push({item: data.correct});
				} else {
					switch(data.checkingType) {
						case "condition":
							data.checkType = "rule";
							data.correctAnswers.push({item:alignClozeTextViewer.parseConditionRule(data.conditionsData)});
							break;

						case "exactMatch":
							data.checkType = "markupValue";
							data.correctAnswers = alignClozeTextViewer.parseExactMatchRule(data.answerMarkup || data.markup, data.additionalExactMatch);
							break;

						case "mathCorrectness":
							data.checkType = "correctness";
							data.correctAnswers.push({item:true});
							break;
					}
				}
			}

			return data;
		}
		return alignAnswerFieldTypeMathfield;
	}
);