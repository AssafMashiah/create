define([
  'jquery',
  'underscore',
  'backbone',
  'views/abstractView',  
  'models/siteModel',
  'text!templates/menu.html'
], function ($, _, Backbone, AbstractView, SiteModel, menuTemplate) {
  var MenuView = AbstractView.extend({

    //initilize view
    initialize: function(){
      //call init on abstract View - TODO must find a better way to do this
      MenuView.__super__.initialize.call(this, $("#menuContainer") , menuTemplate);
    },

    update: function(siteModel, updateType) {

      if(updateType === SiteModel.PAGE_UPDATED){

        console.log("Drawing menu");

        // call super
        MenuView.__super__.update.call(this, siteModel);

        //attach listeneres to menu items
        var _this = this;
        $("#menuContainer a").click(function (event) {
            event.preventDefault();
            _this.trigger(MenuView.MENU_ITEM_CLIKED,$(this).attr("itemIndex"));
        });

      }
    }

  });

  //Static consts
  MenuView.MENU_ITEM_CLIKED = "menuItemClicked";

  // Returning instantiated views can be quite useful for having "state"
  return MenuView;
});
