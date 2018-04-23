define(['backbone', 'userModel', 'components/customCourseMetadata/customCourseMetadataComponentModel',
'components/customCourseMetadata/customCourseMetadataComponentsView' ],
	function f1414(Backbone, userModel, customCourseMetadataComponentModel, customCourseMetadataComponentsView ) {


	var customCourseMetadataComponentsController = Backbone.Router.extend({
		
		/**
		* initialize
		* @param cfg: parent: $, data: {}, updateCallback: fnc()
		*/
		initialize: function(cfg){

			this.updateCallback = cfg.updateCallback;

			this.view = new customCourseMetadataComponentsView({
                el: cfg.parent,
                customMetadataPackages: userModel.account.customMetadataPackages
            });
			
			this.collection = new Backbone.Collection([], {model: customCourseMetadataComponentModel});

			this.setData(cfg.data);
		},

		setData: function(metadataList){
			_.each(metadataList, this.setComponent, this);
		},

		setComponent: function(data){
			var $parent = this.view.createContainer(data.id),
			
			customCourseMetadataComponent = new customCourseMetadataComponentModel(_.extend({
				el: $parent
			}, data));

			this.collection.add(customCourseMetadataComponent);
						
			customCourseMetadataComponent.on('change', _.bind(function(model, change){
				this.updateCallback(this.collection.toJSON());
			},this));

			// the model has changed while initializing the view (changed by code, not by user). will need to save the new data
			if(!_.isEmpty(customCourseMetadataComponent.changed)){
				this.updateCallback(this.collection.toJSON());

			}
		}
		
	});
	return customCourseMetadataComponentsController;
});