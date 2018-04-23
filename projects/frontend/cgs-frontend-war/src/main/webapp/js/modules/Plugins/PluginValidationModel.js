define(['Class', 'validate', 'repo', 'repo_controllers'],
	function (Class, validate, repo, repo_controllers) {

	var PluginValidationModel = Class.extend({
		initialize: function () {
		},
		/*
		options:
			stirng: id- id of element to validate
			boolean: valid- status of item validation
			array: validationMessage - array of strings to descride message to the user about the invalidness of the item
			boolean: overrideDefaultValidation - defines if to use the default validation of the item in addition to the custom validation, or use only the custom validation
		*/
		setValidation : function(options){
			var childItem = repo.get(options.id),
			validation ={};

			if(childItem){
				var itemValidation = validate.convertValidationMessage(options);

				//use only the recieved validation from plugin parent
				if(options.overrideDefaultValidation){
					validation = itemValidation;
				}else{
					//merge validation from plugin parent, and from regualar validation
					selfValidation = validate.isEditorContentValid(childItem.id);

					validation.valid = selfValidation.valid && itemValidation.valid;
					validation.report = selfValidation.report.concat(itemValidation.report);
				}

				repo.startTransaction({ ignore: true });
				
				//update the child record properties
				repo.updateProperty(options.id, 'isValid', validation.valid, false, true);
				repo.updateProperty(options.id, 'invalidMessage', validation, false, true);

				repo.endTransaction();

				// get editor's controller
				var editorController = repo_controllers.get(options.id);

				//if editor controller contains markValidation, call this function with the validation conclusion
				if (!!editorController && editorController.markValidation) {
					editorController.markValidation(validation.valid);
				}
			}
		}
	});

	return new PluginValidationModel;
});