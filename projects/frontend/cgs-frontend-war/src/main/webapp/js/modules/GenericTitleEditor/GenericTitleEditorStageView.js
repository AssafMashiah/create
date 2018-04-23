define(['jquery', 'BaseNormalStageContentView', 'text!modules/GenericTitleEditor/templates/GenericTitleEditorStage.html'],
function($, BaseNormalStageContentView, template) {

	var GenericTitleEditorStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}
			

	}, {type: 'GenericTitleEditorStageView'});

	return GenericTitleEditorStageView;

});
