define(['BaseContentEditor', 'repo', 'assets', './config', './SoundButtonPropsView', 'validate',
	'./SoundButtonStageView', './SoundButtonSmallStageView'],
function(BaseContentEditor, repo, assets, config, SoundButtonPropsView, validate,
	SoundButtonStageView, SoundButtonSmallStageView) {

	var SoundButtonEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {
		
			this.setStageViews({
				small: SoundButtonSmallStageView,
				normal: SoundButtonStageView
			});
		
			this._super(config, configOverrides);
		},
		
		startPropsEditing: function(){
			this._super();
			this.view = new SoundButtonPropsView({controller:this});
		},
	
		onSoundFileUpload: function(response){
			if(response){
				this.stage_view.render();
				require('validate').isEditorContentValid(this.record.id);
			}
		},
		isOrdered : function(){
            return _.where(this.record.data.assetManager, {state : false}).length;
        }

	}, {
		type: 'SoundButtonEditor',
		
		/**
		 * sound without src is not valid
		 * @param  {[type]} elem_repo [description]
		 * @return {[type]}           [description]
		 */
		valid:function f1094(elem_repo) {
			
			if (!!elem_repo.data.sound) {
				return  { valid:true, report:[] };
			} else {
				validate.uploadInvalidImg(elem_repo.id, 'media/not_valid_SB.jpg', {width:126, height:92});
				return { 
						valid:false, 
						report : [validate.setReportRecord(elem_repo,'Sound button without a source is not valid')]
				};
			}
		}
	});

	return SoundButtonEditor;

});
