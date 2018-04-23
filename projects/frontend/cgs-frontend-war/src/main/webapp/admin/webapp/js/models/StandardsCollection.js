define(['lodash', 'backbone_super','standard_model'], function (_, Backbone, StandardModel) {
	var StandardsCollection = Backbone.Collection.extend({
		url: "/cgs/rest/standards",
		model: StandardModel,

		get: function (arrayOfNameAndSubjectArea) {
	        filtered = this.filter(function (standard) {
	            return standard.get("name") === arrayOfNameAndSubjectArea[0] && standard.get("subjectArea") === arrayOfNameAndSubjectArea[1];
	        });
	        
	        return new StandardModel(filtered[0]);
    	}
	});	

	return StandardsCollection;
});