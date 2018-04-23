define(['backbone', 'BaseView',  'text!./templates/customMetadataTable.html',  'text!./templates/customMetadataRow.html' ],
	function (Backbone, BaseView ,template, rowtemplate) {

		var customMetadataView = BaseView.extend({

		events: {
			"click .add-new-metadata-row" : "add_new_row"
		},

		render: function(){
			this._super(template);
		},

		//add a new row to the view
		allocNewRow : function(id){
			
			var	newRow = $('<tr>');
			
			this.$el.find('tbody').append(newRow);
			return this.$el.find(newRow);

		},

		//add new row event handler
		add_new_row: function(){
			this.controller.add_new_row();
		}
	});
	return customMetadataView;
});