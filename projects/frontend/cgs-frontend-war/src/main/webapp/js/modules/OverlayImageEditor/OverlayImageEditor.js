define(['modules/OverlayElementEditor/OverlayElementEditor', 'repo', 'repo_controllers', 'assets', './config',
	'./OverlayImagePropsView', 'validate'],
function(OverlayElementEditor, repo, repo_controllers, assets, config,
	OverlayImagePropsView, validate) {

	var OverlayImageEditor = OverlayElementEditor.extend({
		startPropsEditing: function(){
			this._super(null, OverlayImagePropsView);
			this.registerEvents();
		},

		registerEvents: function() {
			var changes = {
				overlaySrc: this.propagateChanges(this.record, 'overlaySrc', true)
			};

			this.model = this.screen.components.props.startEditing(this.record, changes);
		},

		onImageFileUpload:function (response) {
			if (response) {
				validate.validatePreviewRecursion(this.record.id);
				$('<img src="' + assets.serverPath(response) + '" />').load(function(event) {
					repo.updateProperty(this.record.id, 'width', event.target.naturalWidth, false, true);
					repo.updateProperty(this.record.id, 'height', event.target.naturalHeight, false, true);
					this.updateOverlay();
					this.refresh();
				}.bind(this));
			}
		}

	}, {
		
		type: 'OverlayImageEditor',
		
		valid:function (elem_repo) {

			var valid_obj = {};

			if (!elem_repo.data.overlaySrc) {
				valid_obj = {
					valid: false,
					report: [validate.setReportRecord(elem_repo, 'Image source missing')]
				};

			}

			return valid_obj;
		}
	});

	return OverlayImageEditor;

});
