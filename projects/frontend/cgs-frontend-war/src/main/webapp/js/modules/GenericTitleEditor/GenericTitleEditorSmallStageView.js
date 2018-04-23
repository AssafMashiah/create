define(['jquery', 'BaseStageContentView', 'text!modules/GenericTitleEditor/templates/GenericTitleEditorSmallStage.html'],
function($, BaseStageContentView, template) {

	var GenericTitleEditorSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}
			

	}, {type: 'GenericTitleEditorSmallStageView'});

	return GenericTitleEditorSmallStageView;

});
