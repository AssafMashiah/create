define([ "require", "jquery", "mustache", "lodash", "text!conversion/custom/clozeAnswerTemplate.html"],
function (require, $, mustache, _, clozeAnswerTemplate) {

    /**
     * Converts <strong> to &lt;strong&gt; etc :)
     * @param  {String} str [description]
     * @return {String}     [description]
     */
    function encodeHTMLEntities(str) {
      var tagsToReplace = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;'
      };

      function replaceTag(tag) {
          return tagsToReplace[tag] || tag;
      }

      return str.replace(/[&<>]/g, replaceTag);;
    };

		function alignClozeTextViewer() {

		}

		alignClozeTextViewer.prototype = {

			alignData:function (data, json) {

				var parsedAnswers = {}, cloze_answer = json[data.parent], self = this;

				var wrapedTextViewerMarkup = $("<wrapper>" + data.title + "</wrapper>");

				//find bank element
				if (cloze_answer.data.useBank) {
					var bank;

					for (var i = 0; i < cloze_answer.children.length; i++) {
						if (json[cloze_answer.children[i]].type == "clozeBank") {
							bank = json[cloze_answer.children[i]];

							break;
						}
					}
				}
				//loop over answer fields and change to xml tag
				_.each($(wrapedTextViewerMarkup).find('answerfield'), function (answerTag, index) {

					var sourceAnswerTag = answerTag,
						isNoncheckable = $(answerTag).attr('isnoncheckable') == 'true';

					if (($(answerTag).attr('type') === 'text' || isNoncheckable) && !$(answerTag).attr('id')) {
						answerTag = $(answerTag).find('span').get(0);
					}

					var tagId = $(answerTag).attr('id'), correctAnswer = "",
						attributes = data.answerFields[tagId],
						//clear data at each iteration
						mustacheData = [];

					mustacheData.dragAndDrop = cloze_answer.data.interaction == "dd";
					mustacheData.subAnswerId = tagId;
					mustacheData.isNoncheckable = isNoncheckable;

					mustacheData.hint = (typeof attributes.hint != "undefined") ? attributes.hint.toString() : null;

					if ($(answerTag).attr('type') == "text") {

						mustacheData.isText = true;
						mustacheData.textEditorMode = isNoncheckable ? $(answerTag).attr('answer_size').toLowerCase() : "word";

						if (isNoncheckable) {
							mustacheData.maxChar = $(answerTag).attr('maxchars');
						}
						else {
							correctAnswer = $.trim(answerTag.childNodes.length ? answerTag.childNodes[0].textContent : answerTag.textContent);
              correctAnswer = encodeHTMLEntities(correctAnswer);

							if(cloze_answer.data.fieldsWidth != "longest") {
								var maxLength = correctAnswer.length,
									collections = [];

								if (attributes.showAdditionalCorrectAnswers) {
									collections = _.union(collections, attributes.AdditionalCorrectAnswers);
								}

								if (attributes.showPartiallyCorrectAnswers) {
									collections = _.union(collections, attributes.PartiallyCorrectAnswers);
								}

								if (attributes.ExpectedWrong) {
									collections = _.union(collections, attributes.ExpectedWrong);
								}

								_.each(collections, function(collItem) {
									if (typeof collItem.item == 'string') {
										maxLength = Math.max(maxLength, collItem.item.length);
									}
								});

								mustacheData.maxChar = maxLength;
							}
						}


						//correct answers
						mustacheData.correctAnswers = [];

						if (cloze_answer.data.useBank && !isNoncheckable) {

							//duplicate subanswer to bank
							var newSubAnswer = {};
							newSubAnswer.type = "textViewer";
							newSubAnswer.data = {};
							newSubAnswer.data.title = correctAnswer;
							newSubAnswer.data.textEditorStyle = data.textEditorStyle;
							newSubAnswer.data.styleOverride = cloze_answer.data.interaction == 'write' ? 'bankReadOnly' : '';

							newSubAnswer.id = index;
							newSubAnswer.parent = bank.id;
							mustacheData.originalId = index;
							json[newSubAnswer.id] = newSubAnswer;
							bank.children.push(newSubAnswer.id);

							if (mustacheData.dragAndDrop) {
								//in bank with drag&drop the correct answer is the index in the bank
								mustacheData.correctAnswers.push({item:index});
							}
						}
						if (!mustacheData.dragAndDrop) {

							//without bank, or bank read-only the correct answer is the text value
							mustacheData.correctAnswers.push({ item: correctAnswer });

							//additionl correct answers
							if (attributes.showAdditionalCorrectAnswers) {
								_.each(attributes.AdditionalCorrectAnswers, _.bind(function (addCorrectItem) {
									mustacheData.correctAnswers.push(addCorrectItem);
								}, this));
							}

							//partially correct answers
							if (attributes.showPartiallyCorrectAnswers) {
								mustacheData.partiallyCorrect = [];

								_.each(attributes.PartiallyCorrectAnswers, _.bind(function (partCorrectItem) {
									mustacheData.partiallyCorrect.push(partCorrectItem);
								}, this));
							}

							//expected wrong answers
							if (attributes.ExpectedWrong) {
								mustacheData.incorrectPredicted = [];

								_.each(attributes.ExpectedWrong, _.bind(function (ExpectedWrongItem) {
									mustacheData.incorrectPredicted.push(ExpectedWrongItem);
								}, this));
							}
						}
					}
					if ($(answerTag).attr('type') == "mathfield") {

						mustacheData.isText = false;
						mustacheData.maxHeight = cloze_answer.data.maxHeight;
						mustacheData.completionType = $(answerTag).attr('completionType');
						mustacheData.mathfield_completionType = $(answerTag).attr('completionType') || "A" ;
						mustacheData.widthEM = isNoncheckable ? $(answerTag).attr('fieldWidth') : (data.answerMarkup && data.answerMarkup[$(answerTag).attr('id')] && data.answerMarkup[$(answerTag).attr('id')].widthEM) || $(answerTag).find('mathfield').attr('widthem');
						mustacheData.mathfield_keyboardPreset = "fullMathField";
						mustacheData.mathfield_type = "singleLine";
						mustacheData.isCompletionType = $(answerTag).attr('completionType') === 'C';
						mustacheData.mathfield_editMode = mustacheData.isCompletionType ? 'completion' : "on";
                        mustacheData.autoComma = "true";
						//correct answers
						mustacheData.correctAnswers = [];

						if (cloze_answer.data.useBank && !isNoncheckable) {
							//duplicate subanswer to bank
							var newSubAnswer = {};
							newSubAnswer.type = "mathfield";
							newSubAnswer.data = {};
							newSubAnswer.data.isCompletionType = !!(attributes.completionType === 'C');

							newSubAnswer.data.markup = newSubAnswer.data.isCompletionType ? data.answerMarkup[ $(answerTag).attr('id') ] .markup: $(answerTag).find('mathfield').html();
							newSubAnswer.data.maxHeight = attributes.maxHeight;
							newSubAnswer.data.widthEM = $(answerTag).find('mathfield').attr('widthem');

							newSubAnswer.id = index;
							newSubAnswer.parent = bank.id;
							mustacheData.originalId = index;
							json[newSubAnswer.id] = newSubAnswer;
							bank.children.push(newSubAnswer.id);

							if (mustacheData.dragAndDrop) {
								//in bank (not read-only) the correct answer is the index in the bank
								mustacheData.correctAnswers.push({item:index});
							}
						}

						if (!mustacheData.dragAndDrop) {
							//show markup in the answer
							mustacheData.displayshowAnswer = true;
							mustacheData.answerMarkup = $(answerTag).find('mathfield').html();
							mustacheData.showAnswerMarkup = data.answerMarkup && data.answerMarkup[$(answerTag).attr('id')] && data.answerMarkup[$(answerTag).attr('id')].markup;

							switch (attributes.checkingType) {

								case "condition":
									mustacheData.checkType = "rule";
									mustacheData.correctAnswers.push({item: self.parseConditionRule(attributes.conditionsData)});
									break;

								case "exactMatch":
									mustacheData.checkType = "markupValue";
									mustacheData.correctAnswers = self.parseExactMatchRule(mustacheData.isCompletionType ? data.answerMarkup[$(answerTag).attr('id')].markup :  $(answerTag).find('mathfield').html(), attributes.additionalExactMatch);
									break;

								case "mathCorrectness":
									mustacheData.checkType = "correctness";
									mustacheData.correctAnswers.push({item:true});
									break;
							}
						}
					}

					$(sourceAnswerTag).replaceWith(mustache.render(clozeAnswerTemplate, mustacheData));

				});

				data.title = wrapedTextViewerMarkup.wrapInner('<p/>').html();

			},

			rulesMap: {
				"equal" :		"( value == {{value}} )",
				"notequal" :	"( value != {{value}} )",
				"bigger" :		"( value bigger {{value}} )",
				"smaller" :		"( value smaller {{value}} )",
				"divided" :		"( value % {{value}} == 0 )"
			},

			//parse the exact match list to rules im mathfield checking type = 'exeactMatch'
			parseExactMatchRule :function (answerMarkup, mathfieldMarkupRules){
				var parsedRulesArr = [],
					parsedRules = "(";
				//mathfield answer
				if(answerMarkup){
					parsedRulesArr.push({
						checkType :'markupValue',
						item: answerMarkup
					});
				}
				//additional mathfied answers
				if(mathfieldMarkupRules) {
					_.each(mathfieldMarkupRules, function(mathfield, index){
						parsedRulesArr.push({
							checkType :'markupValue',
							item: mathfield.markup,
							widthEM: mathfield.widthEM
						});
					});
				}

				//return only rules that contains content inside the completion .
				//in case of empty completion, the rule will not be sent
				var filteredRules = _.filter(parsedRulesArr, function(rule){
					var rulesCompletions = $("<div>" +rule.item + "</div>").find('completion');

					if(rulesCompletions.length){
						for (var i = 0; i < rulesCompletions.length; i++) {
							var completion = rulesCompletions[i];
							if(!completion.children.length){
								return false;
							}
						}
					}
					return true;
				});

				return filteredRules;

			},

			//parse conditions rule in mathfield checking type= condition

			parseConditionRule:function (ruleData) {
				if (ruleData) {

					var parsedRules = "";

					for (var j = 0; j < ruleData.length; j++) {

						var condition = ruleData[j].innerList;
						if (ruleData.length > 1) {
							parsedRules += " ( ";
						}

						for (var i = 0; i < condition.length; i++) {
							var operation = condition[i] ;
							var ruleTemplate = this.rulesMap[ operation.condition.toLowerCase() ] ;
							parsedRules += mustache.render(ruleTemplate, operation);
							if (condition.length > 1 && i < condition.length - 1) {
								parsedRules += " AND ";
							}
						}
						if (ruleData.length > 1) {
							parsedRules += " ) ";
							if (j < ruleData.length -1 ) {
								parsedRules += " OR ";
							}
						}
					}
				}
				return parsedRules;
			}
		};

     return new alignClozeTextViewer();
});
