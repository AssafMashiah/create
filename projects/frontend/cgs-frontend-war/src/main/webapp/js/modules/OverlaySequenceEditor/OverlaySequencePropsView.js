define(['../OverlayElementEditor/OverlayElementPropsView', 'repo', 'validate',
	'text!modules/OverlaySequenceEditor/templates/OverlaySequenceProps.html'],
function(OverlayElementPropsView, repo, validate, template) {

	var OverlaySequencePropsView = OverlayElementPropsView.extend({

		render: function() {
			this.template = template;

			validate.isEditorContentValid(this.controller.record.id);
			this.validationReport = validate.getInvalidReportSummery(this.controller.record.data.invalidMessage);

			this._super();
		},

		getTaskType: function(){
			var self = this;
			return function(text, render) {
				//get the overlay task type, in order to display it in the properties tab
				if(self.controller.record.children && self.controller.record.children.length){
					var sequence = repo.get( self.controller.record.children[0]);
					if(sequence && sequence.children.length){
						var task = repo.get(sequence.children[0]);
		      			return "props.taskType."+task.type;
					}
				}
		    }
		}

	}, {type: 'OverlaySequencePropsView'});
	return OverlaySequencePropsView;

});