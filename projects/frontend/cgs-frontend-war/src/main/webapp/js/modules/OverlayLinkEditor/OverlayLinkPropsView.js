define(['../OverlayElementEditor/OverlayElementPropsView', 'text!modules/OverlayLinkEditor/templates/OverlayLinkPropsView.html'],
function(OverlayElementPropsView, template) {

	var OverlayLinkPropsView = OverlayElementPropsView.extend({

		render: function() {
			this.template = template;
			this._super();
		}

	}, {type: 'OverlayLinkPropsView'});
	return OverlayLinkPropsView;

});