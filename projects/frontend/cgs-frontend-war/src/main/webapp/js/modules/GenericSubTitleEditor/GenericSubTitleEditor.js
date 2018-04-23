define(['BaseContentEditor', './config', './GenericSubTitleEditorStageView', './GenericSubTitleEditorSmallStageView'],
function(BaseContentEditor,  config, GenericSubTitleEditorStageView, GenericSubTitleEditorSmallStageView) {

	var GenericSubTitleEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {
			
			this.setStageViews({
				small: GenericSubTitleEditorSmallStageView,
				normal: GenericSubTitleEditorStageView
			});

			this._super(config, configOverrides);
		}	


	}, {type: 'GenericSubTitleEditor',
		stageReadOnlyMode: true,
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

		},
		valid: function(elem_repo){
			var result = {valid : true , report : [],dontAllowChildren : false};
			if(elem_repo.data.hide){
				result.dontAllowChildren = true;
			}
			return result;
		}

	});

	return GenericSubTitleEditor;

});