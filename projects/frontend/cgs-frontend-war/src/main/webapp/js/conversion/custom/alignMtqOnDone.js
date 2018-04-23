define( [ "jquery", 'conversion/custom/utils'], function($, utils) {

	/*@elem- element to check its duplicates
	@answers- array from which to search for duplication 
	returns all answers that are the same as the elem parameter */
	function findAnswerMatches(elem, answers) {
		return answers.filter(function() {

			var elemTV = elem.children()[0],
				thisTV = $(this).children()[0];

			return ($(this).attr('answerid') != $(elem).attr('answerid') &&
				utils.getAnswerCompareKey($(elemTV)) == utils.getAnswerCompareKey($(thisTV)));
		});
	}

    function alignMtqOnDone(data, renderedXML, json) {

		var xml = $(renderedXML),
		mtqarea = xml.find('mtqarea'),
		mtqbank = xml.find('mtqbank'),
		specificFeedback = xml.find('specificfeedback'),
		isSorting = xml.find('mode').text() === 'sorting';


		if (xml.find('bankmode').text() == 'dragAndCopy') {

			mtqbank.children().each(function() {

				if (!$(this).attr('deleteme')) {

					var toDelete = findAnswerMatches($(this), mtqbank.children()),
						sourceAnswerId = $(this).attr('answerid');

					toDelete.each(function() {
						$(this).attr('deleteme', 'true');
						var toDeleteAnswerId = $(this).attr('answerid');
						//change the "correct" id from the one we wnat to delete to the updated one, in the specific feedback 
						specificFeedback.find('checkableElementValue').each(function(){
							if($(this).text() == toDeleteAnswerId){
								$(this).text(sourceAnswerId);
							}
						});

						if(isSorting){
							mtqarea.find('multisubanswer correct set').each(function() {
								var mappedAnswers =_.map($(this).text().split(','), function(ansId){
									if(ansId == toDeleteAnswerId){
										return sourceAnswerId;
									}else{
										return ansId;
									}
								});
								$(this).text(mappedAnswers.join(','));
							});

						}else{
							//IS MATCHING
							mtqarea.find('subanswer').each(function() {
								if ($(this).find('correct option').text() == toDeleteAnswerId) {
									$(this).find('correct option').text(sourceAnswerId);
								}
							});
						}
					});

				}

			});

			mtqbank.children('[deleteme=true]').remove();
			}

		return xml[0].outerHTML;
		}

    return alignMtqOnDone;
});