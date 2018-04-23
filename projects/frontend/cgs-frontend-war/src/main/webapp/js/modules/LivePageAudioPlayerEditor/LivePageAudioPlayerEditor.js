define(['modules/LivePageElementEditor/LivePageElementEditor', 'repo', 'assets', './config', 'validate',
	'./LivePageAudioPlayerPropsView'],
function(LivePageElementEditor, repo, assets, config, validate,
	LivePageAudioPlayerPropsView) {

	var LivePageAudioPlayerEditor = LivePageElementEditor.extend({

		initialize: function(configOverrides) {
			this._super(configOverrides);

			repo.startTransaction({ ignore: true });
			repo.updateProperty(this.record.id, 'audioImgClass', this.record.data.audio ? '' : 'disabled', false, true);
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

			_.extend(changes, this.getGlobalEvents());

			this.model = this.screen.components.props.startEditing(this.record, changes);

			this.model.on('change:audioTitle', function(){
				repo.startTransaction({ appendToPrevious: true });
				repo.updateProperty(this.config.id, 'audioDispalyTitle',this.record.data.audioTitle.length>20? this.record.data.audioTitle.substring(0,17)+"...":this.record.data.audioTitle);
				repo.endTransaction();
				this.stage_view.render();
			}, this);
			this.model.on('change:copyrights', this.stage_view.render, this.stage_view);
						
			this.model.on('change:showTitle', function(){
				repo.startTransaction({ appendToPrevious: true });
				this.setAudioHeaderClass();
				repo.endTransaction();
				this.startPropsEditing();
				this.stage_view.render();
			}, this);

			this.model.on('change:showCopyrights', function(){
				repo.startTransaction({ appendToPrevious: true });
				this.setAudioHeaderClass();
				repo.endTransaction();
				this.startPropsEditing();
				this.stage_view.render();
			}, this);

			this.attachGlobalEvents();
		},
		
		startPropsEditing: function(){
			this._super(null, LivePageAudioPlayerPropsView);
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
		
		setAudioHeaderClass: function() {
			if(this.record.data.showTitle || this.record.data.showCopyrights){
				repo.updateProperty(this.record.id, 'displayAudioHeader', 'displayHeader', false, true);
			}
			else {
				repo.updateProperty(this.record.id, 'displayAudioHeader', '', false, true);
			}
		},

		isOrdered : function(){
            return _.where(this.record.data.assetManager, {state : false}).length;
        }

	}, {

		type : 'LivePageAudioPlayerEditor',

		icons: {
			'icon1': 'media/icons/audio_01.png',
			'icon2': 'media/icons/audio_02.png',
		},

		/**
		 * audio without src is not valid
		 * @param  {[type]} elem_repo [description]
		 * @return {[type]}           [description]
		 */
		valid:function (elem_repo) {

			var valid_obj = this.__super__.constructor.valid(elem_repo);

			if (!elem_repo.data.audio) {
				validate.uploadInvalidImg(elem_repo.id, 'media/not_valid_AP.jpg', {width:294,height:141});
				
				if (valid_obj.valid) {
					valid_obj = {
						valid:false,
						report : [validate.setReportRecord(elem_repo,'Audio player without a source is not valid')]
					};
				}
				else {
					valid_obj.report.push(validate.setReportRecord(elem_repo,'Audio player without a source is not valid'));
				}
			}

			return valid_obj;
		}
		
	});

	return LivePageAudioPlayerEditor;

});
