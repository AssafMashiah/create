define(['jquery', 'files', 'courseModel', 'userModel', 'BasePropertiesView', 
	'text!modules/FreeWritingAnswerEditor/templates/FreeWritingAnswerProps.html'],
function($, files, courseModel, userModel, BasePropertiesView, template) {
	var FreeWritingAnswerPropsView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this.mode = options.mode;
			this._super(options);
		},
		// TODO: set mode as a member from 'options'
		mode: 'SingleAnswerMode'

	}, {type: 'FreeWritingAnswerPropsView'});

	return FreeWritingAnswerPropsView;

});
