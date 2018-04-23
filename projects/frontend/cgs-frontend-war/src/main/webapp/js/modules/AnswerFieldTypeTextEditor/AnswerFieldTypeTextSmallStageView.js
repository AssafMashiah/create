define(['jquery', 'modules/TextViewerEditor/TextViewerSmallStageView', 'rivets', 'mustache', 'events', 'repo', 'assets',
		'text!modules/TextViewerEditor/templates/TextViewerSmallStagePreview.html'],
		function f22($, TextViewerSmallStageView, rivets, Mustache, events, repo, assets, template) {

var AnswerFieldTypeTextSmallStageView = TextViewerSmallStageView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		},

		render: function(val) {
			this._super(val);

			var height = 0;
			this.body && this.body.children('div')
				.css({'width': 'initial', 'padding': '' })
				.addClass('AnswerField')
				.each(function() {
					height += $(this).outerHeight();
				});

			this.iframe && this.iframe.height(Math.max(this.iframe.height(), height));
		}

	}, {type: 'AnswerFieldTypeTextSmallStageView'});

	return AnswerFieldTypeTextSmallStageView;

});
