define(['jquery', 'BaseNormalStageContentView', 'text!modules/TitleEditor/templates/TitleEditorStage.html'],
function($, BaseNormalStageContentView, template) {

	var TitleEditorStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}
			

	}, {type: 'TitleEditorStageView'});

	return TitleEditorStageView;

});
