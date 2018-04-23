define(['modules/LivePageElementEditor/LivePageElementEditor', 'repo', 'assets', './config', './LivePageVideoPlayerPropsView', 'validate'],
function(LivePageElementEditor, repo, assets, config, LivePageVideoPlayerPropsView, validate) {

	var LivePageVideoPlayerEditor = LivePageElementEditor.extend({

		initialize: function(configOverrides) {
			this._super(configOverrides);

			repo.startTransaction({ ignore: true });
			repo.updateProperty(this.record.id, 'videoImgClass', this.record.data.video ? '' : 'disabled', false, true);
            repo.updateProperty(this.record.id, 'showAutoPlay', !!repo.getAncestorRecordByType(this.record.id,"narrative"), false, true);
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

			_.extend(changes, this.getGlobalEvents());

			this.model = this.screen.components.props.startEditing(this.record, changes);

			this.model.on('change:videoTitle', function(){
				repo.startTransaction({ appendToPrevious: true });
				repo.updateProperty(this.config.id, 'videoDispalyTitle',this.record.data.videoTitle.length>20? this.record.data.videoTitle.substring(0,17)+"...":this.record.data.videoTitle);
				repo.endTransaction();
				this.stage_view.render(this.stage_view);
			}, this);
			this.model.on('change:copyrights', this.stage_view.render, this.stage_view);
						
			this.model.on('change:showTitle', function(){
				repo.startTransaction({ appendToPrevious: true });
				this.setVideoHeaderClass();
				repo.endTransaction();
				this.startPropsEditing();
				this.stage_view.render(this.stage_view);
			}, this);

			this.model.on('change:showCopyrights', function(){
				repo.startTransaction({ appendToPrevious: true });
				this.setVideoHeaderClass();
				repo.endTransaction();
				this.startPropsEditing();
				this.stage_view.render(this.stage_view);
			}, this);

			this.attachGlobalEvents();
		},
		
		startPropsEditing: function(){
			this._super(null, LivePageVideoPlayerPropsView);
			this.registerEvents();
		},
		onVideoFileUpload: function(response){
			if(response){
				var videoElem = document.createElement('video');
				videoElem.src = require('assets').serverPath(response);
				videoElem.onloadedmetadata = function(e) {
					repo.updateProperty(this.config.id, 'videoWidth', e.target.videoWidth);
					repo.updateProperty(this.config.id, 'videoHeight', e.target.videoHeight);
				}.bind(this);
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
		type: 'LivePageVideoPlayerEditor',

		icons: {
			'icon1': 'media/icons/video_01.png',
			'icon2': 'media/icons/video_02.png',
		},
		
		/**
		 * video without src is not valid
		 * @param  {[type]} elem_repo [description]
		 * @return {[type]}           [description]
		 */
		valid:function (elem_repo) {

			var valid_obj = this.__super__.constructor.valid(elem_repo);
			
			if (!elem_repo.data.video) {
				validate.uploadInvalidImg(elem_repo.id, 'media/not_valid_VP.jpg', {width: 329, height:256});

				if (valid_obj.valid) {
					valid_obj = { 
						valid:false,
						report: [validate.setReportRecord(elem_repo,'Video player without a source is not valid')],
					};
				}
				else {
					valid_obj.report.push(validate.setReportRecord(elem_repo,'Video player without a source is not valid'));
				}
			}

			return valid_obj;
		}
	});

	return LivePageVideoPlayerEditor;

});
