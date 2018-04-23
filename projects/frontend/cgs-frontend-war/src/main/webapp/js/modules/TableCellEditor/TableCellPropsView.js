define(['jquery', 'mustache', 'BasePropertiesView', 'text!modules/TableCellEditor/templates/TableCellProps.html'],
function($, Mustache, BasePropertiesView, template) {


	var TableCellPropsView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}
		
	}, {type: 'TableCellPropsView'});

	return TableCellPropsView;

});
