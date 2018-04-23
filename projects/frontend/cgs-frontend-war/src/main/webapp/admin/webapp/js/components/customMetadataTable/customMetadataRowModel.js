define(['common/utils', 'components/customMetadataTable/customMetadataRowView', 'components/customMetadataTable/templateMap'],
	function (utils, customMetadataRowView, templateMap) {

		var customMetadataRow = Backbone.Model.extend({

		initialize: function(config){

			this.onRemoveModel = config.onRemoveModel;
			this.view = new customMetadataRowView(_.extend(config, {model: this}));

			this.registerChangeEvents();
		},
		
		registerChangeEvents : function(){
			this.on('change:type', _.bind(function(model, change){
			
				// reset model values + set model default data from templateMap( default data by type)
				model.set(_.extend({
					id: utils.genId(),
					value: null,
					value_from: null,
					value_to: null,
					value_format: null,
					value_includeSeconds: null
				}, templateMap[change].defaultData));

				model.view.render(model.toJSON());
			},this));
			
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
	return customMetadataRow;
});