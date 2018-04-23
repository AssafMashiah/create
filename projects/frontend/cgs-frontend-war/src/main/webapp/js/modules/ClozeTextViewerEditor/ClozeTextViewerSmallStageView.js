define(['jquery', 
	'modules/TextViewerEditor/TextViewerSmallStageView', 
	'rivets', 
	'mustache', 
	'events',
	'repo',
	'assets',
	'text!modules/ClozeTextViewerEditor/templates/ClozeTextViewerSmallStagePreview.html'],
function($, TextViewerSmallStageView, rivets, Mustache, events, repo,assets, template) {

	var ClozeTextViewerSmallStageView = TextViewerSmallStageView.extend({

		initialize: function(options) {

			options = _.extend(options, {
				additionalHeadData: '<link rel="stylesheet" type="text/css" href="css/ClozeTextViewer.css"/>'
			});

			this._super(options);
			this.template = template;
		},
		//ovverride function and set mathfield height as a property
		initMathField:function(mathFieldId, attributes, markup){
			var maxHeight = require("repo").get(this.controller.record.parent).data.maxHeight;
			attributes.maxHeight = maxHeight;

			return this._super(mathFieldId, attributes, markup);
		},

		render: function(val){
			this._super(val);
		},

	}, {type: 'ClozeTextViewerSmallStageView'});

	return ClozeTextViewerSmallStageView;

});
