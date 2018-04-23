define( [ "require", "jquery", "mustache", "lodash"],
	function( require, $, mustache, _ ) {
		function alignAnswer(data, json) {
			data.checkable = false;

			var tmpArr, progressId, shortAnswerTask = json[data.parent];

			tmpArr = _.filter(shortAnswerTask.children, function (child) {
				return json[child].type == "advancedProgress";
			});

			progressId = tmpArr.length ? tmpArr[0] : null;

			if (progressId) {
				data.checkable = (json[progressId].data.checking_enabled == true);

				if(!data.checkable) { //remove progress num_of_attempts and feedback_type from json array
					json[progressId].data.num_of_attempts = 0;
					json[progressId].data.feedback_type = 'local';
				}
			}

		}

		return alignAnswer;
	});