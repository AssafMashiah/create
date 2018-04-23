define([
  'jquery',
  'underscore',
  'backbone'
], function ($, _, Backbone) {
  var AbstractView = Backbone.View.extend({
    
    //initilize view
    initialize: function (el, template){
      this.el = el;
      this.template = template;
    },

    //define update to listern to model changes
    update : function (observed, updateType) {
      var compiledTemplate = _.template( this.template, { model:  observed} );
      this.el.html(compiledTemplate);
    },

  });

  // Returning instantiated views can be quite useful for having "state"
  return AbstractView;
});
