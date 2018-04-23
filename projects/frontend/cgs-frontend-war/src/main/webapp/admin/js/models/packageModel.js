define([
    'underscore',
    'backbone',
    'models/abstractModel'
], function (_, Backbone, AbstractModel){
    var PackageModel = AbstractModel.extend({

        getCourseId : function () {
            return this.get("courseId");
        },

        getCourseName : function () {
            return this.get("courseTitle");
        },

        getUserName : function () {
            return this.get("userName");
        },

        getUserEmail : function () {
            return this.get("userEmail");
        },

        getPackId : function () {
            return this.get("packageId");
        },

        getPckStartDate : function () {
            return this.get("packStartDate");
        },

        getFormattedPckStartDate : function () {
            return this.getFormattedDate(this.getPckStartDate());
        },

        getPackagePhase : function () {
            return this.get("packagePhase");
        }

    });
    // Return the model for the module
    return PackageModel;
});
