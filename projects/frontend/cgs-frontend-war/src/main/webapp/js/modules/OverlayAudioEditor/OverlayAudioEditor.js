define(['modules/OverlayElementEditor/OverlayElementEditor', 'repo', 'assets', './config', 'validate',
	'./OverlayAudioPropsView'],
function(OverlayElementEditor, repo, assets, config, validate, OverlayAudioPropsView) {

	var OverlayAudioEditor = OverlayElementEditor.extend({
		registerEvents: function() {
			var changes = {
				overlaySrc: this.propagateChanges(this.record, 'overlaySrc', true)
			};

			this.model = this.screen.components.props.startEditing(this.record, changes);
		},
		
		startPropsEditing: function(){
			this._super(null, OverlayAudioPropsView);
			this.registerEvents();
		},
			
		onAudioFileUpload: function(response){
			if(response){
				repo.updateProperty(this.config.id, 'overlaySrc', response);
				require('validate').isEditorContentValid(this.record.id);
				this.updateOverlay();
				this.refresh();
			}
		},

		isOrdered : function(){
            return _.where(this.record.data.assetManager, {state : false}).length;
        }

	}, {

		type : 'OverlayAudioEditor',

		/**
		 * audio without src is not valid
		 * @param  {[type]} elem_repo [description]
		 * @return {[type]}           [description]
		 */
		valid:function (elem_repo) {

			var valid_obj = {};

			if (!elem_repo.data.overlaySrc) {
				valid_obj = {
					valid: false,
					report: [validate.setReportRecord(elem_repo, 'Audio source missing')]
				};

			}

			return valid_obj;
		}
		
	});

	return OverlayAudioEditor;

});
