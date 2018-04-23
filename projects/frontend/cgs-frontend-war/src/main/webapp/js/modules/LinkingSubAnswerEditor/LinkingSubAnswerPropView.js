define(['BasePropertiesView', 'text!modules/LinkingSubAnswerEditor/templates/LinkingSubAnswerPropsView.html'],
function(BasePropertiesView, template) {

	var LinkingSubAnswerPropView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'LinkingSubAnswerPropView'});

	return LinkingSubAnswerPropView;

});
