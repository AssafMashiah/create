define(['backbone','components/customCourseMetadata/customCourseMetadataComponentView', ],
	function f1413(Backbone, customCourseMetadataComponentView ) {


	var customCourseMetadataComponentModel = Backbone.Model.extend({
		
		/**
		* initialize
		* @param cfg: parent: $, data: {}, updateCallback: fnc()
		*/
		initialize: function(cfg){
			this.view = new customCourseMetadataComponentView(_.extend({model: this}, cfg));
		},

		//return all attributes except el
		toJSON: function(){
			return _.omit(this.attributes , ['el']);
		}
		
	});
	
	return customCourseMetadataComponentModel;

});