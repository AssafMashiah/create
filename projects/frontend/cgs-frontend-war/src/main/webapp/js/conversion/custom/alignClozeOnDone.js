define( [ "jquery"], function($) {

	function getTextVeiwerText(tvElem) {
		var clone = tvElem.clone();
		clone.find('mathfield').replaceWith(function() {
			return $('<tmp>').text($(this).html()).html();
		});
		return clone.text().trim();
	}

	function findAnswerMatches(elem, answers) {
		switch (elem.children()[0].tagName.toLowerCase()) {
			case 'textviewer':
				return answers.filter(function() {
					var elemTV = elem.children('textviewer'),
						thisTV = $(this).children('textviewer');

					if (!thisTV.length) return false;
					
					return $(this).attr('answerid') != $(elem).attr('answerid') && 
						getTextVeiwerText(thisTV) == getTextVeiwerText(elemTV);
				});
				break;
			case 'mathfield':
				return answers.filter(function(){
					//search for a mathfield the is the direct child of "this" to prevent finding a mathfield inside a text viewer
					return $(this).children('mathfield').html() == $(elem).children('mathfield').html() &&
							$(this).attr('answerid') != $(elem).attr('answerid');
				});
				break;
		}
	}

    function alignClozeOnDone(data, renderedXML, json) {
	    
	    var xml = $(renderedXML),
	    	clozearea = xml.find('clozearea'),
	    	bank = xml.find('bank'),
	    	answer = json[_.find(json[data.id].children, function(child) { return json[child] && json[child].type == 'cloze_answer' })];


	    if (answer.data.reuseItems) {

	    	if (answer.data.interaction == 'dd') {
		    	bank.children().each(function() {

		    		if (!$(this).attr('deleteme')) {

		    			var toDelete = findAnswerMatches($(this), bank.children()),
		    				sourceAnswerId = $(this).attr('answerid');

		    			toDelete.each(function() {
		    				$(this).attr('deleteme', 'true');

		    				var toDeleteAnswerId = $(this).attr('answerid');
		    				
		    				clozearea.find('subanswer').each(function() {
		    					if ($(this).find('correct ans_option').text() == toDeleteAnswerId) {
	    							$(this).find('correct ans_option').text(sourceAnswerId);
		    					}
		    				});
		    			});
		    		}
		    	});

		    	bank.children('[deleteme=true]').remove();
	    	}
	    	else {
	    		var elems = _.uniq($(bank).children(), function(item) {
	    			if ($(item).children('textviewer').length) {
	    				return getTextVeiwerText($(item).children('textviewer'));
	    			}
	    			else if ($(item).children('mathfield').length) {
	    				return $(item).children('mathfield').html().trim();
	    			}
	    		});

	    		bank.empty().append(elems);
	    	}

	    }

	    //mathfield in bank sholud always be editmode=off, and not completion
	    bank.children().each(function() {
	    	if($(this).find('mathfield').attr('editmode') == 'completion'){
	    		$(this).find('mathfield').attr('editmode', 'off');
	    	}
	    })
	    
		return xml[0].outerHTML;
	}

    return alignClozeOnDone;
});