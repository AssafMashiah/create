define(['jquery', 'BaseStageContentView', 'text!modules/TitleEditor/templates/TitleEditorSmallStage.html'],
function($, BaseStageContentView, template) {

	var TitleEditorSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}
			

	}, {type: 'TitleEditorSmallStageView'});

	return TitleEditorSmallStageView;

});
