define(['jquery', 'BaseStageContentView', 'text!modules/TableEditor/templates/TableSmallStage.html'],
function($, BaseStageContentView, template) {

	var TableSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		},

		render: function($parent) {
			this.prop_classes ="";
			this.controller.record.data.row_header && (this.prop_classes += "row-header ");
			this.controller.record.data.column_header && (this.prop_classes += "column-header ");
			this.controller.record.data.summary_row && (this.prop_classes += "row_summery ");
			this.controller.record.data.summary_column && (this.prop_classes += "column_summery ");

			this._super($parent);
		},

		showStagePreview: function($parent, previewConfig) {
			this._super($parent, previewConfig);
			this.$el.find('div.br').not('.tableCell_content div.br').remove();
		}
		
	}, {type: 'TableSmallStageView'});

	return TableSmallStageView;

});
