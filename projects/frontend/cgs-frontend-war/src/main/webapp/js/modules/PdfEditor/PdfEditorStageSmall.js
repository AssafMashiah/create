define(['jquery', 'BaseStageContentView', 'events', 'mustache',
	'text!modules/PdfEditor/templates/PdfEditorStageSmall.html'],
function($, BaseStageContentView, events, Mustache, template) {

	var PdfEditorStageSmall = BaseStageContentView.extend({

		initialize: function(options) {
			this._super(options);
			this.template = template;
		}
			

	}, {type: 'PdfEditorStageSmall'});

	return PdfEditorStageSmall;

});
