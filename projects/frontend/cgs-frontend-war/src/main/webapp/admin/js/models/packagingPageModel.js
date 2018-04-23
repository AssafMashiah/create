define([
    'jquery',
    'underscore',
    'backbone',
    'bootstrap',
    'models/pageModel',
    'models/packageModel',
    'services/packagingService',
    'utils/dialogManager'
], function ($, _, Backbone, Bootstrap, PageModel, PackageModel, PackagingService, DialogManager) {

    var PackagingPageModel = PageModel.extend({
        initialize : function (name , route) {
            //call super
            PackagingPageModel.__super__.initialize.call(this, name, route);

            this.set( {
                "sortBy": null,
                "isAscending": true
            }, {silent: true});
        },

        setPackages : function (packages) {
            var i;
            var newPackages = [];

            for (i = 0; i < packages.length; i++) {
                var package = new PackageModel(packages[i]);
                newPackages.push(package);
            }

            this.set({"packages" : newPackages});
            this.notifyUpdate(PackagingPageModel.PACKAGES_UPDATED);
        },

        sortBy : function (fieldName, isAscending) {
            this.set({"sortBy" : fieldName, "isAscending": isAscending});
            this.notifyUpdate(PackagingPageModel.PACKAGES_UPDATED);
        },

        clearSort : function () {
            this.set({"sortBy" : null});
            this.notifyUpdate(PackagingPageModel.PACKAGES_UPDATED);
        },

        getSortBy : function () {
            return this.get("sortBy");
        },

        isAscending : function () {
            return this.get("isAscending");
        },

        getPackages : function () {
            var sortedPackages = this.get("packages").slice();
            var _this = this;

            if(_this.getSortBy() !== null){
                sortedPackages.sort(function(a,b){
                    var aValue = a.attributes[_this.getSortBy()];
                    var bValue = b.attributes[_this.getSortBy()];

                    if(aValue === null && bValue === null) { return 0; }
                    if(aValue === null) { return -1; }
                    if(bValue === null) { return 1; }
                    if(aValue === bValue) { return 0; }
                    if(aValue > bValue) { return 1; }
                    if(aValue < bValue) { return -1; }
                });

                if(!_this.isAscending()){
                    sortedPackages.reverse();
                }
            }

            return sortedPackages;
        },


        removePackage : function (packageId) {
            var i;
            for (i = 0; i < this.get("packages").length; i++) {
                if(this.get("packages")[i].getPackId() === packageId)
                {

                    this.get("packages").splice(i,1);
                    return;
                }
            }
        },


        cancelPackage : function (packageId) {
            var _this = this;

            PackagingService.cancelPackage(packageId, function (data, returnType){

                console.log("Cancel Package returned:" + returnType);

                if(returnType === "success"){
                    _this.removePackage(packageId);
                    _this.notifyUpdate(PackagingPageModel.PACKAGES_UPDATED);
                } else {

                    //TODO - move dilog to the controller
                    DialogManager.showErrorDialog("Failed canceling package");
                    _this.refreshPackages();
                }

            });
        },

        activate : function () {
            this.refreshPackages();
        },

        refreshPackages : function () {
            var _this = this;

            //TODO - move packages service to the controller
            PackagingService.getPackages(function (data, returnType) {
                if(returnType === "success"){
                    var packages = data;
                    _this.setPackages(packages);
                } else {
                    //TODO - move dilog to the controller
                    DialogManager.showErrorDialog("Failed getting packages");
                }

            });

        }


    });

    PackagingPageModel.PACKAGES_UPDATED = "packagesUpdated";

    return PackagingPageModel;
});
