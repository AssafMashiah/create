define(['common/utils', 'components/customMetadataPackagesTable/customMetadataPackagesRowView'],
	function (utils, customMetadataPackagesRowView) {

		var customMetadataPackagesRow = Backbone.Model.extend({

		initialize: function(config){
			this.onRemoveModel = config.onRemoveModel;
			this.view = new customMetadataPackagesRowView(_.extend({
                el: config.el,
                data: config.data,
                model: this
            }, config));
		},
		
		//return all attributes except el, and func: onRemoveModel
		toJSON: function(){
			return _.omit(this.attributes , ['el', 'onRemoveModel']);
		},

		//remove from the collection and the view 
		remove: function(){
			this.view.remove();
			this.onRemoveModel(this);
		}

	});

	return customMetadataPackagesRow;
});