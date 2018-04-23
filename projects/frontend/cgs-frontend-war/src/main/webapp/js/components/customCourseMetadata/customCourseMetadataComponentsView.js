define([ 'backbone'],
	function( Backbone ){

        var customMetadataComponentsView = Backbone.View.extend({
		
			createContainer: function(id){

				var componentContainer =$('<div>').attr({'id': id});
				this.$el.append(componentContainer);
				
				return componentContainer;
			},

			dispose: function() {
				this.remove();
			}
	});

        return customMetadataComponentsView;
});