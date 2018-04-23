define(['jquery', 'BasePropertiesView','text!modules/LinkingPairEditor/templates/LinkingPairPropertiesView.html'],
function($, BasePropertiesView, template) {

	var LinkingPairPropertiesView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this._super(options);
		}

	}, {type: 'LinkingPairPropertiesView'});

	return LinkingPairPropertiesView;

});
