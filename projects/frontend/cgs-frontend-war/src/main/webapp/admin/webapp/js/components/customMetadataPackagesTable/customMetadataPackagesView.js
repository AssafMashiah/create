define(['backbone', 'mustache', 'BaseView', 'text!./templates/customMetadataPackagesTable.html'],
	function (Backbone, Mustache, BaseView, template) {

		var customMetadataPackagesView = BaseView.extend({

            events: {
                "click #uploadMetadataPackage": "uploadMetadataPackage",
                "change #chooseMetadataPackageFile": "chooseMetadataPackageFile"
            },

            render: function () {
                this._super(template);

                this.$chooseMetadataPackageFile = $('#chooseMetadataPackageFile');
            },

            hideTable: function (hideOrShow) {
                $('#metadataPackagesTable').toggleClass('hidden', hideOrShow);
            },

            addMetadataPackageRow: function () {
                var newRow = $('<tr>');
                this.$el.find('tbody').append(newRow);
                return this.$el.find(newRow).last();
            },

            uploadMetadataPackage: function (e) {
                this.$chooseMetadataPackageFile.trigger('click');
            },

            chooseMetadataPackageFile: function () {
                var files = this.$chooseMetadataPackageFile[0].files;
                var file = files && files.length ? files[0] : null;
                if (file) {
                    this.controller.readPackageFile(file);
                }

                // Delete file list from file input
                this.$chooseMetadataPackageFile.val('');
            }
        });

	return customMetadataPackagesView;
});