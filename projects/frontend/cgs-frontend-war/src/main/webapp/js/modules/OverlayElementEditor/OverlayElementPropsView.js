define(['repo', 'editMode', 'BasePropertiesView','text!modules/OverlayElementEditor/templates/OverlayElementProps.html'],
function(repo, editMode, BasePropertiesView, template) {
	'use strict';
	var OverlayElementPropsView = BasePropertiesView.extend({

		initialize: function (options) {
			this.template = template;
			this._super(options);
		},

		isReadOnly: function () {
			return editMode.readOnlyMode;
		},

		showPreview: function () {
			return (this.controller && this.controller.record &&
			this.controller.record.data.displayType === 'ICON');
		},

		childOrder: function() {
			return  this.controller.record.data.overlayOrder ||
					repo.childOrderByType(this.controller.record.id);
		}

	}, {type: 'OverlayElementPropsView'});

	return OverlayElementPropsView;

});
