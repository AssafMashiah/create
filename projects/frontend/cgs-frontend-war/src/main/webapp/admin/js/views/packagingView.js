define([
  'jquery',
  'underscore',
  'backbone',
  'views/abstractView',  
  'models/packagingPageModel',
  'text!templates/packaging.html'
], function ($, _, Backbone, AbstractView, PackagingPageModel, packagingTemplate) {
  var PackagingView = AbstractView.extend({

    //initilize view
    initialize: function(){
      //call init on abstract View - TODO must find a better way to do this
      PackagingView.__super__.initialize.call(this, $("#viewContainer") , packagingTemplate);
    },

    update: function(packagingPageModel, updateType) {

      if(updateType === PackagingPageModel.PACKAGES_UPDATED){

        console.log("Drawing packaging view");

        // call super
        PackagingView.__super__.update.call(this, packagingPageModel);

          //attach listeneres to menu items
          var _this = this;
          $("#viewContainer #table_body a").click(function (event) {
              event.preventDefault();

              _this.trigger(PackagingView.CANCEL_PACKAGE_CLICKED,$(this).attr("packageId"));
          });

          $("#viewContainer #table_header a").click(function (event) {
              event.preventDefault();

              _this.trigger(PackagingView.SORT_COLUMN_CLICKED,$(this).attr("columnName"));
          });
      }
    }

  });

  //Static consts
    PackagingView.CANCEL_PACKAGE_CLICKED = "cancelPackageClicked";
    PackagingView.SORT_COLUMN_CLICKED = "sortColumnClicked";

  // Returning instantiated views can be quite useful for having "state"
  return PackagingView;
});
