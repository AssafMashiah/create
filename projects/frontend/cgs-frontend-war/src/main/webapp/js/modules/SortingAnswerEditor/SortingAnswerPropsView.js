define(['jquery','BasePropertiesView', 'text!modules/SortingAnswerEditor/templates/SortingAnswerProps.html'],
function($, BasePropertiesView, template) {

	var SortingAnswerPropsView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},
		isOneToMany: function(){
			return this.controller.record.data.mtqMode == 'one_to_many';
		}

	}, {type: 'SortingAnswerPropsView'});

	return SortingAnswerPropsView;

});
