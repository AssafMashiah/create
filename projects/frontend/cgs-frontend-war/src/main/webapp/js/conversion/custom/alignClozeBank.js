define( [ "require", "jquery", "mustache", "lodash", "conversion/custom/alignTextViewerData",
	'conversion/custom/utils'],
function( require, $, mustache, _ , alignTextViewerData, utils) {

    function alignClozeBank(data, json) {

			_.each(json[data.id].children, _.bind(function(bankItemId){

				//check if we need to wrap - only if parent is not an answer field

				
				if(['AnswerFieldTypeText', 'AnswerFieldTypeMathfield'].indexOf(json[bankItemId].type) == -1){
					//wrap each bank child with a sub item wrapper
					var wrapper = {type: 'clozeBankSubItem', data: {'subItemId':bankItemId, originalId: json[bankItemId].data.originalId}};
					utils.wrapAndPush(wrapper, bankItemId, data.id, json);
				}

			},this));
    }
     return alignClozeBank;
});