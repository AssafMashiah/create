define([
  'jquery',  
  'underscore',
  'backbone'
], function ($, _, Backbone) {

	var AbstractModel = Backbone.Model.extend({

	    initialize : function () {
	    },

	    observers : [],

	    addObserver : function (observer) {
	    	if(typeof observer.update == "undefined") {
	    		throw "Observer must have an update method";
	    	}

	    	this.observers.push(observer);
	    },

	    removeObserver : function (observer) {
	    	var i;

	    	for (i = 0; i < this.observers.length; i++) {
	    		if ( this.observers[i] === observer ){
	    			this.observers.splice(i,1);
	    			break;
	    		}
	    	}
	    },

        getFormattedDate : function(wantedDate) {
            var date = new Date(wantedDate);
            return (date.getDate()  + "." +
                (date.getMonth()+1) + "." +
                date.getFullYear() + " " +
                date.getHours()+ ":" +
                date.getMinutes()+ ":" +
                date.getSeconds());
        },

	    notifyUpdate : function (updateType) {
	    	var i;
	    	for (i = 0; i < this.observers.length; i++) {
	    		this.observers[i].update(this,updateType);
	    	}
	    }

	});

	return AbstractModel;
});
