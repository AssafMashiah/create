define(['jquery', 'BaseStageContentView', 'text!modules/GenericSubTitleEditor/templates/GenericSubTitleEditorSmallStage.html'],
function($, BaseStageContentView, template) {

	var GenericSubTitleEditorSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}
			

	}, {type: 'GenericSubTitleEditorSmallStageView'});

	return GenericSubTitleEditorSmallStageView;

});
