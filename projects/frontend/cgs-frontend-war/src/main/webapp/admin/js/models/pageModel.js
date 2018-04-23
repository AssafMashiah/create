define([
  'jquery',  
  'underscore',
  'models/abstractModel'
], function ($, _, AbstractModel) {


	var PageModel = AbstractModel.extend({
	    
	    initialize : function (name , route) {
	    	this.set( {
	    		route: route,
	    		name: name
	    	});
	    },

	    getRoute : function () {
	    	return this.get("route");
	    },

	    getName : function () {
	    	return this.get("name");
	    },

	    activate : function() {}

	});

	return PageModel;
});
