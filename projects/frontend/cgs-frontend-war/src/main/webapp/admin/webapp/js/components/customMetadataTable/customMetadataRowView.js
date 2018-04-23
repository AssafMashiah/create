define([ 'BaseView', 'text!./templates/customMetadataRow.html', 'components/customMetadataTable/templateMap'],
	function (BaseView, template, templateMap) {

	var customMetadataRow = BaseView.extend({

		events: {
			'click .remove_row' : 'remove_row'
		},

		render: function(data){

			this.data = data ? data : this.options;

			this._super(template, null, {properties : templateMap[this.data.type].template});

			//bind rivets 
			this.rivetsView = require('rivets').bind(this.el, {'obj': this.model});
		},

		//remove row event handler
		remove_row: function(){
			this.model.remove();
		},

		//remove the view
		remove: function(){
			this.$el.remove();
		}

	});
	return customMetadataRow;
});
