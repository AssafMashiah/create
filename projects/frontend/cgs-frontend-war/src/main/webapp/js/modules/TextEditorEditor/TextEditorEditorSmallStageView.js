define(['jquery', 'BaseStageContentView', 'rivets', 'mustache', 'events','repo',
	'text!modules/TextEditorEditor/templates/TextEditorEditorSmallStagePreview.html'],
function($, BaseStageContentView, rivets, Mustache, events, repo, template) {

	var TextEditorEditorSmallStageView = BaseStageContentView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
        }
	}, {type: 'TextEditorEditorSmallStageView'});

	return TextEditorEditorSmallStageView;

});
