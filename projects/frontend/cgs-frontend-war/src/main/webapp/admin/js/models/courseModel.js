define([
  'underscore',
  'backbone',
  'models/abstractModel'
], function (_, Backbone, AbstractModel){
  var CourseModel = AbstractModel.extend({


      getCid : function () {
        return this.get("cid");
      },

      getAuthor : function () {
        return this.get("author");
      },

      getCgsVersion : function () {
        return this.get("cgsVersion");
      },

      getVersion : function () {
        return this.get("version");
      },

      getLastModified : function () {
            return this.get("header.last-modified");
      },

      getCourseName : function () {
        return this.get("title");
      }



  });
  // Return the model for the module
  return CourseModel;
});
