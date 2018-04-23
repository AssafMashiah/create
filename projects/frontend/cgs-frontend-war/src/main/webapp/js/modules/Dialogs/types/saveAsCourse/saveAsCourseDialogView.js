define(['lodash','jquery', 'BaseView', 'mustache', 'events', 'modules/Dialogs/BaseDialogView',
    'text!modules/Dialogs/types/saveAsCourse/saveAsCourseDialog.html'],
function(_, $, BaseView, Mustache, events, BaseDialogView, template) {

	var SaveAsCourseDialogView = BaseDialogView.extend({

		tagName : 'div',
		className : 'css-dialog',

		
		initialize: function(options) {
			this.customTemplate = template;
			this._super(options);

		},
        beforeTermination: function(event) {
        	if(event.target.id !== "cancel"){
	            if ($("#new-course-name").val().trim() == '') {
	                $(".new-name-error").text("Please enter a non empty name");
	                return "cancel_terminate";
	            }
	            this.controller.setReturnValue('save', $("#new-course-name").val());
        	}
            return true;
        },
		render: function( $parent ) {
			this._super($parent, this.customTemplate);
            $("#new-course-name").val(this.options.config.data);
		}

	}, {type: 'SaveAsCourseDialogView'});

	return SaveAsCourseDialogView;

});
