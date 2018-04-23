define([
  'jquery',  
  'underscore',
  'backbone',
  'text!templates/errorDialog.html',
  'text!templates/yesNoDialog.html'
], function ($, _, Backbone, errorDialogTemplate, yesNoDialogTemplate) {

	return {

		showErrorDialog : function (body) {

			var compiledTemplate = _.template( errorDialogTemplate, { 
				title:  "Error",
				body : body
			});

		    $("#modalDialog").html(compiledTemplate);

		    $("#modalDialog #dialog").modal('show');

			$("#modalDialog #dialog_ok").click(function(event){
				event.preventDefault();
				$("#modalDialog #dialog").modal('hide');
			});
		},

		showQuestionDialog : function (title, body, yesCallback) {
			var compiledTemplate = _.template( yesNoDialogTemplate, { 
				title:  title,
				body : body
			});

		    $("#modalDialog").html(compiledTemplate);

		    $("#modalDialog #dialog").modal('show');

			$("#modalDialog #dialog_yes").click(function(event){
				event.preventDefault();
				$("#modalDialog #dialog").modal('hide');
				yesCallback.call();
			});

			$("#modalDialog #dialog_no").click(function(event){
				event.preventDefault();
				$("#modalDialog #dialog").modal('hide');
			});
		} 

	};
});
