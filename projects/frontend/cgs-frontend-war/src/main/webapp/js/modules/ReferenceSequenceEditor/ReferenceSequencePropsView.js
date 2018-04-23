define(['jquery', 'BasePropertiesView', 'repo',	'text!modules/ReferenceSequenceEditor/templates/ReferenceSequenceProps.html'],
function($, BasePropertiesView, repo, template) {

	var ReferenceSequenceView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},

		render: function() {
            this._super();
			$('#changeSequence').click(_.bind(function(){
				var changeReference = _.bind(function(response){
					repo.updateProperty(this.controller.record.id, 'referencedSequenceId' , response.referencedSequenceId);
					repo.updateProperty(this.controller.record.id, 'referencedLessonId' , response.referencedLessonId);
					repo.updateProperty(this.controller.record.id, 'breadcrumbs' , response.breadcrumbs);
					this.controller.onReferencedSequenceChange();
				},this);

				this.controller.screen.referenceToSequence(changeReference);
			},this));
        }

	}, {type: 'ReferenceSequenceView'});

	return ReferenceSequenceView;

});
