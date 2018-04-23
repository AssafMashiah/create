define([
    'jquery',
    'underscore',
    'backbone',
    'views/packagingView',
    'controllers/abstractController',
    'utils/dialogManager'
], function ($, _, Backbone,PackagingView, AbstractController, DialogManager) {

    var PackagingController = AbstractController.extend({

        initialize : function (packagingPageModel, packagingView) {


            this.packagingPageModel = packagingPageModel;
            this.packagingView = packagingView;

            packagingView.on(PackagingView.CANCEL_PACKAGE_CLICKED, this.handleCancelPackage, this);
            packagingView.on(PackagingView.SORT_COLUMN_CLICKED, this.handleSortColumn, this);

        },

        handleCancelPackage : function (packageId) {

            var _this = this;
            DialogManager.showQuestionDialog("Question", "Are you sure you want to cancel the package?", function () {
                _this.packagingPageModel.cancelPackage(packageId);
            });

        },

        handleSortColumn : function (columnName) {
            if(this.packagingPageModel.getSortBy() === columnName) {
                this.packagingPageModel.sortBy(columnName, !this.packagingPageModel.isAscending());
            } else {
                this.packagingPageModel.sortBy(columnName, true);
            }
        }

    });

    return PackagingController;
});
