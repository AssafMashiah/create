define(['jquery', 'BaseNormalStageContentView', 'mustache', 'translate', 'repo', 'events', 
	'text!modules/TableCellEditor/templates/TableCellStage.html'],
function($, BaseNormalStageContentView, Mustache, i18n, repo, events, template) {

	var TableCellStageView = BaseNormalStageContentView.extend({
		
		tagName : 'td',

		initialize: function(options) {
			this.template = template;
			this._super(options);
			this.disableBr = true;
		},

		render: function($parent) {
			this._super($parent);
		},

		showStagePreview: function($parent, previewConfig) {
			this._super($parent, previewConfig);
			//this.$el.find('div.br').remove();

			//this.$el.hide().css('display','table-cell');
		}

	}, {type: 'TableCellStageView'});

	return TableCellStageView;

});