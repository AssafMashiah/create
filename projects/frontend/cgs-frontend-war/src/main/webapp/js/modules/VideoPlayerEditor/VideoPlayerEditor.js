define(['BaseContentEditor', 'repo', 'assets', './config', './VideoPlayerPropsView', 'validate',
 './VideoPlayerStageView', './VideoPlayerSmallStageView' ],
function(BaseContentEditor, repo, assets, config, VideoPlayerPropsView, validate,
 VideoPlayerStageView, VideoPlayerSmallStageView) {

	var VideoPlayerEditor = BaseContentEditor.extend({

		initialize: function(configOverrides) {
			this.setStageViews({
				small: VideoPlayerSmallStageView,
				normal: VideoPlayerStageView
			});
		
			this._super(config, configOverrides);

			repo.startTransaction({ ignore: true });
			
			repo.updateProperty(this.record.id, 'videoImgClass', this.record.data.video ? '' : 'disabled', false, true);

            //assessment's overview/ending sequences don't have narrative auto play option
            var sequence = repo.getAncestorRecordByType(this.record.id,"sequence");
            if (sequence && sequence.data.sq_type) {
            	repo.updateProperty(this.record.id, 'showAutoPlay', false, false, true);
            }  else {
                // only narrative show have autoplay
                repo.updateProperty(this.record.id, 'showAutoPlay', !!repo.getAncestorRecordByType(this.record.id,"narrative"), false, true);
            }

            this.setVideoHeaderClass();

            repo.endTransaction();
		},
		registerEvents: function() {

			var changes = {
				autoPlay: this.propagateChanges(this.record, 'autoPlay', true),
				showTitle: this.propagateChanges(this.record, 'showTitle', true),
				videoTitle: this.propagateChanges(this.record, 'videoTitle', true),
				showCopyrights: this.propagateChanges(this.record, 'showCopyrights', true),
				copyrights: this.propagateChanges(this.record, 'copyrights', true)
			};

			var model = this.screen.components.props.startEditing(this.record, changes);

			model.on('change:videoTitle', function(){
				repo.startTransaction({ appendToPrevious: true });
				repo.updateProperty(this.config.id, 'videoDispalyTitle',this.record.data.videoTitle.length>20? this.record.data.videoTitle.substring(0,17)+"...":this.record.data.videoTitle);
				repo.endTransaction();
				
				this.stage_view.render(this.stage_view);
			}, this);
			model.on('change:copyrights', this.stage_view.render, this.stage_view);
						
			model.on('change:showTitle', function(){
				repo.startTransaction({ appendToPrevious: true });
				this.setVideoHeaderClass();
				repo.endTransaction();

				this.stage_view.render(this.stage_view);
				this.startPropsEditing();
			}, this);

			model.on('change:showCopyrights', function(){
				repo.startTransaction({ appendToPrevious: true });
				this.setVideoHeaderClass();
				repo.endTransaction();

				this.stage_view.render(this.stage_view);
				this.startPropsEditing();
			}, this);
		},
		
		startPropsEditing: function(){
			this._super();
			this.view = new VideoPlayerPropsView({controller:this});
			this.registerEvents();
		},
		onVideoFileUpload: function(response){
			if(response){
				repo.updateProperty(this.config.id, 'videoImgClass', '');
				this.stage_view.render();
				require('validate').isEditorContentValid(this.record.id);
			}
		},
		setVideoHeaderClass: function(){
			if(this.record.data.showTitle || this.record.data.showCopyrights){
				repo.updateProperty(this.record.id, 'displayVideoHeader', 'displayHeader', false, true);
			}
			else {
				repo.updateProperty(this.record.id, 'displayVideoHeader', '', false, true);
			}
		},
		isOrdered : function(){
            return _.where(this.record.data.assetManager, {state : false}).length;
        }

	}, {
		type: 'VideoPlayerEditor',
		
		/**
		 * video without src is not valid
		 * @param  {[type]} elem_repo [description]
		 * @return {[type]}           [description]
		 */
		valid:function f1402(elem_repo) {
			var errorMsg;

			if (!elem_repo.data.video) {
				errorMsg = 'Video player without a source is not valid';
			}
			else if (elem_repo.data.video.substr(elem_repo.data.video.lastIndexOf('.') + 1).toLowerCase() != 'mp4') {
				errorMsg = 'Only mp4 files are supported in video player';
			}
			
			if (!errorMsg) {
				return  { valid:true, report:[] };
			} else {

				validate.uploadInvalidImg(elem_repo.id, 'media/not_valid_VP.jpg', {width: 329, height:256});

				return { 
					valid:false,
					report: [validate.setReportRecord(elem_repo, errorMsg)],
				};
			}
		}
	});

	return VideoPlayerEditor;

});
