define( [ "require", "jquery", "mustache", "lodash"],
function( require, $, mustache, _ ) {
    function alignTask(data, json) {

	    var clozeAnswer = _.find(_.map(json[data.id].children, function(child) {return json[child]}), {'type' : 'cloze_answer'}),
		    clozeBank = _.find(_.map(json[clozeAnswer.id].children, function(child) {return json[child]}), {'type' : 'clozeBank'}),
		    progress = _.find(_.map(json[data.id].children, function(child) {return json[child]}), {'type' : 'advancedProgress'});

	    data.mode = (clozeAnswer.data.interaction == "dd") ? (clozeAnswer.data.reuseItems ? "dragAndCopy" : "dragAndDisable") : clozeAnswer.data.interaction; //write / dragAndDisable / dragAndCopy

	    data.fieldsSize = (clozeAnswer.data.fieldsWidth === 'each') ? 'manual' : '';

	    data.useBank = (clozeAnswer.data.useBank != null) ? clozeAnswer.data.useBank : false;

		// copy answers to bank area
		if(data.useBank && progress.data.checking_enabled){
			this.json = json;
			var clozeSubAnswer = [], subTree = getSubtreeRecursive(data.id);

			clozeSubAnswer = _.union(clozeSubAnswer, _.where(subTree, {'type' : 'AnswerFieldTypeText'}));
			clozeSubAnswer = _.union(clozeSubAnswer, _.where(subTree, {'type' : 'answerFieldTypeMathfield'}));

			_.each(clozeSubAnswer, function (subAnswer, idx) {


				if (clozeBank && clozeBank.children.indexOf(idx) == -1) {
					var newSubAnswer = {};
					//duplicate subanswer
					var newSubAnswer = {};
					if(subAnswer.type =="AnswerFieldTypeText"){
						newSubAnswer.type = "textViewer";
						newSubAnswer.data = {};
						newSubAnswer.data.title = subAnswer.data.title;
						newSubAnswer.data.styleOverride = clozeAnswer.data.interaction == 'write' ? 'bankReadOnly' : '';
					}else{
						newSubAnswer.type = "mathfield";
						newSubAnswer.data = {};
						newSubAnswer.data.markup = (data.mode === 'write' && subAnswer.data.completionType === 'C') ? subAnswer.data.answerMarkup.markup : subAnswer.data.markup
						newSubAnswer.data.isCompletionType = !!(data.mode === 'write' && subAnswer.data.completionType === 'C')
						newSubAnswer.data.maxHeight = subAnswer.data.maxHeight;
						newSubAnswer.data.widthEM = subAnswer.data.widthEM;							

					}
					newSubAnswer.id = idx;
					newSubAnswer.parent = clozeBank.id;
					subAnswer.data.originalId = idx;
					json[newSubAnswer.id] = newSubAnswer;


					if (data.mode != 'write') {
						subAnswer.data.correct = idx;
						subAnswer.data.dragAndDrop = true;
						if(!subAnswer.data.correctAnswers){
							subAnswer.data.correctAnswers = [];
						} 
						subAnswer.data.correctAnswers.push({item:idx});
					}					

					clozeBank.children.push(newSubAnswer.id);
					}
				//}
			});
		}
	}

	function getSubtreeRecursive (id) {
		var rec = this.json[id], retval = [rec];

		if (rec.children && rec.children.length) {
			retval = _.union.apply(_, _.map(rec.children, getSubtreeRecursive, this));
			retval.unshift(rec);
		}

		return retval;
	}

    return alignTask;
});