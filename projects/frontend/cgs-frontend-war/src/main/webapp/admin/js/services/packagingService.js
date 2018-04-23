define([
    'jquery',
    'underscore',
    'backbone',
    'models/packageModel'
], function ($, _, Backbone, packageModel) {

    var GET_PACKAGES_REST =   "/publishers/{publisherId}/packages";
    var CANCEL_PACKAGE_URL = "/publishers/{publisherId}/packages/{packageId}?action=cancel";
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

    var getPackages = function (callback) {
        var actionURL = encodeURL(this.restBasePath + GET_PACKAGES_REST, {
            publisherId: this.publisherId
        });

        //DEBUG LOG
        console.log("getPackages fetching URL: " + actionURL);

        $.ajax({
            type: "GET",
            url: actionURL,
            //cache: false,
            success: callback,
            error: callback
        });
    };


    var cancelPackage = function (packageId, callback) {
        var actionURL = encodeURL(this.restBasePath + CANCEL_PACKAGE_URL, {
            publisherId: this.publisherId,
            packageId: packageId
        });

        //DEBUG LOG
        console.log("Releasing lock URL: " + actionURL);

        $.ajax({
            type: "PUT",
            url: actionURL,
            //cache: false
            success: callback,
            error: callback
        });
    };

    return {
        initialize : initialize ,
        getPackages : getPackages ,
        cancelPackage : cancelPackage
    };
});
