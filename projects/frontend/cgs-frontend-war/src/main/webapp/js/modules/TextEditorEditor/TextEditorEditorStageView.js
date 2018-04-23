define(['jquery', 'BaseNormalStageContentView', 'rivets', 'mustache', 'events','repo', 'dialogs',
	'text!modules/TextEditorEditor/templates/TextEditorEditorStagePreview.html'],
function($, BaseNormalStageContentView, rivets, Mustache, events, repo, dialogs, previewTemplate) {

	var TextEditorEditorStageView = BaseNormalStageContentView.extend({

		initialize: function(options) {
			this.template = previewTemplate;
			this._super(options);
        }

	}, {type: 'TextEditorEditorStageView'});

	return TextEditorEditorStageView;

});
