define([
  'underscore',
  'backbone',
  'models/abstractModel'
], function (_, Backbone, AbstractModel){
  var LockModel = AbstractModel.extend({

      getEntityType : function () {
        return this.get("entityType");
      },

      getEntityId : function () {
        return this.get("entityId");
      },

      getUserName : function () {
        return this.get("userName");
      },

      getUserEmail : function () {
        return this.get("userEmail");
      },

      getAquireDate : function () {
        return this.get("aquireDate");
      },

      getFormattedAquireDate : function () {
          return this.getFormattedDate(this.getAquireDate());
      },

      getCourseName : function () {
        return this.get("courseName");
      },

      getLessonName : function () {
        return this.get("lessonName");
      },

      getEntityName: function() {
          return this.get("entityName");
      }

  });
  // Return the model for the module
  return LockModel;
});
