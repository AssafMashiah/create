define([
  'jquery',
  'underscore',
  'backbone',
  'views/abstractView',  
  'models/locksPageModel',
  'text!templates/locks.html'
], function ($, _, Backbone, AbstractView, LocksPageModel, locksTemplate) {
  var LocksView = AbstractView.extend({

    //initilize view
    initialize: function(){
      //call init on abstract View - TODO must find a better way to do this
      LocksView.__super__.initialize.call(this, $("#viewContainer") , locksTemplate);
    },

    update: function(locksPageModel, updateType) {

      if(updateType === LocksPageModel.LOCKS_UPDATED){

        console.log("Drawing locks view");

        // call super
        LocksView.__super__.update.call(this, locksPageModel);

        //attach listeneres to menu items
        var _this = this;
        $("#viewContainer #table_body a").click(function (event) {
            event.preventDefault();
            
            _this.trigger(LocksView.RELEASE_LOCK_CLIKED,$(this).attr("entityType"),$(this).attr("entityId"));
        });

        $("#viewContainer #table_header a").click(function (event) {
            event.preventDefault();
            
            _this.trigger(LocksView.SORT_COLUMN_CLIKED,$(this).attr("columnName"));
        });

      }
    }

  });

  //Static consts
  LocksView.RELEASE_LOCK_CLIKED = "releaseLockClicked";
  LocksView.SORT_COLUMN_CLIKED = "sortColumnClicked";

  // Returning instantiated views can be quite useful for having "state"
  return LocksView;
});
