define(['backbone', 'components/customProperties/customPropertiesView'],
	function (Backbone, customPropertiesView ) {


	var customProperties = Backbone.Router.extend({
		
		/**
		* initialize
		* @param cfg: el: $, data: {}, updateCallback: fnc()
		*/
		initialize: function(cfg){

			this.updateCallback = cfg.updateCallback;
			
			this.view = new customPropertiesView({
				el: cfg.el,
				data: cfg.data,
				controller : this
			});
		}
	
	});
	return customProperties;

});