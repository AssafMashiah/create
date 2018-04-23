define(['modules/LivePageElementEditor/LivePageElementEditor', 'repo', 'assets', './config', './LivePageSoundButtonPropsView', 'validate'],
function(LivePageElementEditor, repo, assets, config, LivePageSoundButtonPropsView, validate) {

	var LivePageSoundButtonEditor = LivePageElementEditor.extend({

		initialize: function(configOverrides) {
			this._super(configOverrides);
		},

		registerEvents: function() {
			var changes = {};

			_.extend(changes, this.getGlobalEvents());

			this.model = this.screen.components.props.startEditing(this.record, changes);

			this.attachGlobalEvents();
		},
		
		startPropsEditing: function(){
			this._super(null, LivePageSoundButtonPropsView);
			this.registerEvents();
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
		type: 'LivePageSoundButtonEditor',

		icons: {
			'icon1': 'media/icons/sound_01.png',
			'icon2': 'media/icons/sound_02.png'
		},
		
		/**
		 * sound without src is not valid
		 * @param  {[type]} elem_repo [description]
		 * @return {[type]}           [description]
		 */
		valid:function (elem_repo) {

			var valid_obj = this.__super__.constructor.valid(elem_repo);
			
			if (!elem_repo.data.sound) {
				validate.uploadInvalidImg(elem_repo.id, 'media/not_valid_SB.jpg', {width:126, height:92});
				
				if (valid_obj.valid) {
					valid_obj = { 
							valid:false, 
							report : [validate.setReportRecord(elem_repo,'Sound button without a source is not valid')]
					};
				}
				else {
					valid_obj.report.push(validate.setReportRecord(elem_repo,'Sound button without a source is not valid'));
				}
			}

			return valid_obj;
		}
	});

	return LivePageSoundButtonEditor;

});
