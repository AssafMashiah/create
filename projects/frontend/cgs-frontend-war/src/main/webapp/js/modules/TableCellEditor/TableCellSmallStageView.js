define(['jquery', 'BaseStageContentView', 'repo', 'events',
	'text!modules/TableCellEditor/templates/TableCellSmallStage.html'],
function($, BaseStageContentView, repo, events, template) {

	var TableCellSmallStageView = BaseStageContentView.extend({
		
		tagName : 'td',

		initialize: function(options) {

			this.template = template;
			this._super(options);
			this.disableBr = true;
		},

		showStagePreview: function($parent, previewConfig) {
			this.render($parent);
		}


	}, {type: 'TableCellSmallStageView'});

	return TableCellSmallStageView;

});
