define([
  'jquery',  
  'underscore',
  'models/abstractModel'
], function ($, _, AbstractModel) {

	var SiteModel = AbstractModel.extend({
		
		defaults : {
			pages: [],
			currentPageIndex : 0
		},

	    initialize : function () {

	    },

	    setCurrentPageByIndex : function (index) {
	    	this.set({currentPageIndex : index});
	    	this.get("pages")[index].activate();
	    	this.notifyUpdate(SiteModel.PAGE_UPDATED);
	    },

	    hasPageWithRoute : function (route) {
	    	var i;

	    	for (i = 0; i < this.attributes.pages.length; i++) {
	    		if(this.attributes.pages[i].getRoute() == route){
	    			return true;
	    		}
	    	}

	    	return false;
	    },

	    setCurrentPageByRoute : function (route) {
	    	var i;
	    	
	    	for (i = 0; i < this.attributes.pages.length; i++) {
	    		if(this.attributes.pages[i].getRoute() == route){
	    			this.setCurrentPageByIndex(i);
	    			break;
	    		}
	    	}
	    },

	    addPage : function (page) {
	    	this.attributes.pages.push(page);
	    	this.notifyUpdate(SiteModel.PAGE_UPDATED);
	    },

	    getDefaultPage : function () {
	    	return this.get("pages")[0];
	    },

	    getPages : function () {
	    	return this.get("pages");
	    },

	    getCurrentPageIndex: function () {
	    	return this.get("currentPageIndex");
	    },

	    getCurrentPage : function () {
	    	return this.get("pages")[this.getCurrentPageIndex()];
	    }

	});


	//Static consts
	SiteModel.PAGE_UPDATED = "pageUpdated";

	return SiteModel;
});
