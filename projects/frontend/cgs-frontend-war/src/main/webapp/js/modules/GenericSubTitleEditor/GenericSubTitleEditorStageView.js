define(['jquery', 'BaseNormalStageContentView', 'text!modules/GenericSubTitleEditor/templates/GenericSubTitleEditorStage.html'],
function($, BaseNormalStageContentView, template) {

	var GenericSubTitleEditorStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}
			

	}, {type: 'GenericSubTitleEditorStageView'});

	return GenericSubTitleEditorStageView;

});
