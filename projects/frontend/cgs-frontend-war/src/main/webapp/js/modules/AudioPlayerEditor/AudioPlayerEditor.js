define(['BaseContentEditor', 'repo', 'assets', './config', 'validate',
	'./AudioPlayerPropsView', './AudioPlayerStageView','./AudioPlayerSmallStageView' ],
function(BaseContentEditor, repo, assets, config, validate,
	AudioPlayerPropsView, AudioPlayerStageView, AudioPlayerSmallStageView) {

	var AudioPlayerEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {
			this.setStageViews({
				small: AudioPlayerSmallStageView,
				normal: AudioPlayerStageView
			});

			this._super(config, configOverrides);

			repo.startTransaction({ ignore: true });
			repo.updateProperty(this.record.id, 'audioImgClass', this.record.data.audio? '' : 'disabled', false, true);
			this.setAudioHeaderClass();
			repo.endTransaction();
		},
		
		registerEvents: function() {

			var changes = {
				autoPlay: this.propagateChanges(this.record, 'autoPlay', true),
				showTitle: this.propagateChanges(this.record, 'showTitle', true),
				audioTitle: this.propagateChanges(this.record, 'audioTitle', true),
				showCopyrights: this.propagateChanges(this.record, 'showCopyrights', true),
				copyrights: this.propagateChanges(this.record, 'copyrights', true)
			};

			var model = this.screen.components.props.startEditing(this.record, changes);

			model.on('change:audioTitle', function(){
				repo.startTransaction({ appendToPrevious: true });
				repo.updateProperty(this.config.id, 'audioDispalyTitle',this.record.data.audioTitle.length>20? this.record.data.audioTitle.substring(0,17)+"...":this.record.data.audioTitle);
				repo.endTransaction();
				this.stage_view.render(this.stage_view);
			}, this);
			model.on('change:copyrights', this.stage_view.render, this.stage_view);
						
			model.on('change:showTitle', function(){
				repo.startTransaction({ appendToPrevious: true });
				this.setAudioHeaderClass();
				repo.endTransaction();
				this.stage_view.render(this.stage_view);
				this.startPropsEditing();
			}, this);

			model.on('change:showCopyrights', function(){
				repo.startTransaction({ appendToPrevious: true });
				this.setAudioHeaderClass();
				repo.endTransaction();
				this.stage_view.render(this.stage_view);
				this.startPropsEditing();
			}, this);
		},
		
		startPropsEditing: function(){
			this._super();
			this.view = new AudioPlayerPropsView({controller:this});
			this.registerEvents();
		},
			
		onAudioFileUpload: function(response){
			if(response){
				//repo.updateProperty(this.config.id, 'audio', response);
				repo.updateProperty(this.config.id, 'audioImgClass', '');
				this.stage_view.render();
				require('validate').isEditorContentValid(this.record.id);
			}
		},
		
		setAudioHeaderClass: function(){
			repo.updateProperty(this.record.id, 'displayAudioHeader', '', false, true);
			if(this.record.data.showTitle || this.record.data.showCopyrights){
				repo.updateProperty(this.record.id, 'displayAudioHeader', 'displayHeader', false, true);
			}
		},
		isOrdered : function(){
            return _.where(this.record.data.assetManager, {state : false}).length;
        }

	}, {

		type : 'AudioPlayerEditor',

		/**
		 * audio without src is not valid
		 * @param  {[type]} elem_repo [description]
		 * @return {[type]}           [description]
		 */
		valid:function f53(elem_repo) {
			
			if ( !!elem_repo.data.audio) {
				return { valid:true, report:[] };
			} else {
				validate.uploadInvalidImg(elem_repo.id, 'media/not_valid_AP.jpg', {width:294,height:141});
				
				return {
					valid:false,
					report : [validate.setReportRecord(elem_repo,'Audio player without a source is not valid')]
				};
			}
		}
		
	});

	return AudioPlayerEditor;

});
