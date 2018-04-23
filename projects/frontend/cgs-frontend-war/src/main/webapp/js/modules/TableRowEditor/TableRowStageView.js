define(['jquery', 'BaseNormalStageContentView', 'mustache', 'translate', 'repo', 'text!modules/TableRowEditor/templates/TableRowStage.html'],
function($, BaseNormalStageContentView, Mustache, i18n, repo, template) {

	var TableRowStageView = BaseNormalStageContentView.extend({

		tagName : 'tr',

		initialize: function(options) {
			this.template = template;
			this._super(options);
			//this.disableInternalContent = true;
			this.disableBr = true;
		},

		showStagePreview: function($parent, previewConfig) {
			this.$el.addClass('tableRow_content');
			this._super($parent, previewConfig);
		},

        // Overriding element insertion into <tr>
        insertInvalidSign : function(){}

	}, {type: 'TableRowStageView'});

	return TableRowStageView;

});