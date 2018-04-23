define([
  'underscore',
  'backbone'
], function (_, Backbone){

  return {

    getRestBasePath : function () {
      return initParams.configuration.basePath;
    },

    getLogoutPath : function () {
      return initParams.configuration.logoutPath;
    },

    getCGSVersion : function () {
      return initParams.configuration.cgsVersion;
    },

    getPublisherAccountId : function () {
      try {
        return location.href.split("?publisherId=")[1].split('#')[0];
      } catch(e){
         alert("need publisher id in querystring #courses?publisherId={{number}}");
      }
    }
      
  } 
});
