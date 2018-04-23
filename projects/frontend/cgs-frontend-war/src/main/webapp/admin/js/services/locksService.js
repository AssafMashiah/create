define([
  'jquery',  
  'underscore',
  'backbone',
  'models/lockModel'
], function ($, _, Backbone, LockModel) {

	var GET_LOCKS_REST =   "/publishers/{publisherId}/locks";
	var RELEASE_LOCK_URL = "/publishers/{publisherId}/locks/{entityType}/{entityId}";

	var initialize = function (restBasePath, publisherId) {
		this.restBasePath = restBasePath;
		this.publisherId = publisherId;
	};

	/**
	 * Encode URL params into the url string
	 * 
	 * @param  String url    url with encoded parameters
	 * @param  Hash params   the parameters to be places into the url
	 * @return String        a url with the parameters encoded
	 */
	var encodeURL = function (url, params) {
		return _.template(url,params,{interpolate : /\{(\S+?)\}/g});
	};

	var getLocks = function (callback) {
		var actionURL = encodeURL(this.restBasePath + GET_LOCKS_REST, {
			publisherId: this.publisherId
		});

		//DEBUG LOG
		console.log("getLocks fetching URL: " + actionURL);

		$.ajax({
		    type: "GET",
		    url: actionURL,
		    //cache: false,
		    success: callback,
		    error: callback
	    });
	};

	var releaseLockById = function (entityType, entityId, callback) {
		var actionURL = encodeURL(this.restBasePath + RELEASE_LOCK_URL, {
			publisherId: this.publisherId,
			entityType: entityType,
			entityId: entityId
		});

		//DEBUG LOG
		console.log("Releasing lock URL: " + actionURL);

		$.ajax({
		    type: "DELETE",
		    url: actionURL,
			//cache: false
			success: callback,
			error: callback
	    });
	};

	return {
		initialize : initialize ,
		getLocks : getLocks, 
		releaseLockById : releaseLockById
	};
});
