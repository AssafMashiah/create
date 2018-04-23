define(['BaseContentEditor', './config', './GenericTitleEditorStageView', './GenericTitleEditorSmallStageView'],
function(BaseContentEditor,  config,  GenericTitleEditorStageView, GenericTitleEditorSmallStageView) {

	var GenericTitleEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {
			
			this.setStageViews({
				small: GenericTitleEditorSmallStageView,
				normal: GenericTitleEditorStageView
			});

			this._super(config, configOverrides);
		}	
		

	}, {type: 'GenericTitleEditor',
		stageReadOnlyMode: true,
		
		valid: function(elem_repo){
			var result = {valid : true , report : [],dontAllowChildren : false};
			if(elem_repo.data.hide){
				result.dontAllowChildren = true;
			}
			return result;
		},

		postValid: function(elem_repo){
			if(_.filter(elem_repo.children, function(child){
					var childelem = require('repo').get(child)
					return !elem_repo.data.hide && !childelem.data.isValid ;
				}, this).length){
				return {
					valid: false,
					report : []
				};
			}
			return {valid : true , report :[]};

		}});

	return GenericTitleEditor;

});