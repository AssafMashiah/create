define(['BaseView', 'text!./templates/customMetadataPackagesRow.html'],
	function (BaseView, template) {

	var customMetadataPackagesRow = BaseView.extend({

		events: {
			'click .remove_row' : 'removeMetadataPackageRow'
		},

		initialize: function (options) {
            this.template = template;
            this._super(options);
        },

        render: function(){
			this._super(template);
		},

		//remove row event handler
        removeMetadataPackageRow: function(){
			this.model.remove();
		},

		//remove the view
		remove: function(){
			this.$el.remove();
		}

	});
	return customMetadataPackagesRow;
});
