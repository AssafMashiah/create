define(['jquery', 'files', 'courseModel', 'userModel', 'BasePropertiesView','assets', 'text!modules/URLSequenceEditor/templates/URLSequenceEditor.html'],
function($, files, courseModel, userModel, BasePropertiesView, assets, template) {

	var URLSequencePropsView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},

		render: function() {
			this._super();
			this.$el.unbind();
		}


	}, {type: 'URLSequencePropsView'});

	return URLSequencePropsView;

});
