define(['BaseContentEditor', './config', './CompareSmallStageView'],
function(BaseContentEditor, config, CompareSmallStageView) {

	var CompareEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {
			this.setStageViews({
				small: CompareSmallStageView,
				normal: CompareSmallStageView
			});
		
			this._super(config, configOverrides);
		}
	
	}, {type: 'CompareEditor'});

	return CompareEditor;

});
