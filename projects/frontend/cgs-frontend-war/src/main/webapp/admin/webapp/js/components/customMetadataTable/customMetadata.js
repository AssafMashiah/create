define(['backbone','common/utils', 'components/customMetadataTable/customMetadataRowModel', 'components/customMetadataTable/customMetadataView'],
	function (Backbone, utils, customMetadataRowModel, customMetadataView ) {


	var customMetaDataController = Backbone.Router.extend({
		
		/**
		* initialize
		* @param cfg: el: $, data: {}, updateCallback: fnc()
		*/
		initialize: function(cfg){

			this.updateCallback = cfg.updateCallback;
			
			this.view = new customMetadataView({
				el: cfg.el,
				data: cfg.data,
				controller : this
			});
			
			this.collection = new Backbone.Collection([], {model: customMetadataRowModel});
			
			this.setModels(cfg.data);
		},

		setModels: function(data){
			_.each(data, this.setModel, this);
		},

		//add new custom meta data row model
		setModel: function(data) {
			var id= data.id ? data.id : utils.genId(),
				$newRow = this.view.allocNewRow(id),
			
			rowModel = new customMetadataRowModel(_.extend({
				id : id,
				el: $newRow,
				onRemoveModel: _.bind(function(model){
					this.collection.remove(model);
					this.updateCallback(this.collection.toJSON());
				}, this)
			}, data));
			
			this.collection.add(rowModel);

			rowModel.on('change', _.bind(function(model, change){
				this.updateCallback(this.collection.toJSON());
			},this));
		},

		//add new row model
		add_new_row : function(){
			this.setModel({type: 'text'});
			this.updateCallback(this.collection.toJSON());
		}
	
	});
	return customMetaDataController;

});