define([
  'jquery',
  'underscore',
  'backbone',
  'views/abstractView',
  'models/siteModel',
  'text!templates/pageTitle.html'
], function ($, _, Backbone, AbstractView, SiteModel, titleTemplate) {
  var PageTitleView = AbstractView.extend({

    //initilize view
    initialize: function(){
      //call init on abstract View - TODO must find a better way to do this
      PageTitleView.__super__.initialize.call(this, $("#titleContainer") , titleTemplate);
    },

    update: function(siteModel, updateType) {

      if(updateType === SiteModel.PAGE_UPDATED){

        console.log("Drawing page title view");

        // call super
        PageTitleView.__super__.update.call(this, siteModel.getCurrentPage());
      }
    }

  });

  //Static consts

  // Returning instantiated views can be quite useful for having "state"
  return PageTitleView;
});
