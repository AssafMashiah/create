define(['BaseContentEditor', './config', './LinkingSubAnswerStageView', './LinkingSubAnswerSmallStageView', './LinkingSubAnswerPropView'],
function(BaseContentEditor, config, LinkingSubAnswerStageView, LinkingSubAnswerSmallStageView, LinkingSubAnswerPropView) {

	var LinkingSubAnswerEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: LinkingSubAnswerSmallStageView,
				normal: LinkingSubAnswerStageView
			});

			this._super(config, configOverrides);
		},

		startStageEditing: function(){
			this.showStagePreview($('#stage_base'), {bindEvents:true});
		},
		startPropsEditing: function(cfg){
			this._super(cfg);
            var config = _.extend({controller: this}, cfg ? cfg : null);
            this.view = new LinkingSubAnswerPropView(config);
        }

	},{	type: 'LinkingSubAnswerEditor'});
	return LinkingSubAnswerEditor;

});
