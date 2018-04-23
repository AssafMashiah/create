define(['BaseContentEditor','./config','./LinkingPairStageView','./LinkingPairSmallStageView', './LinkingPairPropertiesView'],
function(BaseContentEditor, config,  LinkingPairStageView, LinkingPairSmallStageView, LinkingPairPropertiesView) {

	var LinkingPairEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {

			this.setStageViews({
				small: LinkingPairSmallStageView,
				normal: LinkingPairStageView
			});

			this._super(config, configOverrides);
		},
		startStageEditing: function(){
			this.showStagePreview($('#stage_base'), {bindEvents:true});
		},
		startEditing: function(cfg){
			this._super();
			var config = _.extend({controller: this}, cfg ? cfg : null);
			this.view = new LinkingPairPropertiesView(config);
		}

	},{	
		type: 'LinkingPairEditor'
	});

	return LinkingPairEditor;

});
