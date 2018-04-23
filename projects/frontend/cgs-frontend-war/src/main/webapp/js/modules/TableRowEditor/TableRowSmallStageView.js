define(['jquery', 'BaseStageContentView','text!modules/TableRowEditor/templates/TableRowSmallStage.html'],
function($, BaseStageContentView, template) {

	var TableRowSmallStageView = BaseStageContentView.extend({

		tagName : 'tr',

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},

		showStagePreview: function($parent, previewConfig) {
			this._super($parent, previewConfig);
			$parent.find('.tableRow_content > *').unwrap();
		}

	}, {type: 'TableRowSmallStageView'});

	return TableRowSmallStageView;

});
