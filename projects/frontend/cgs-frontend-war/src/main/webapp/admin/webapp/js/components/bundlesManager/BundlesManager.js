define(['bundlesCollection', 'bundleModel', './components/bundlesManager/BundlesManagerView'], function (BundlesCollection, BundlesModel, BundlesManagerView) {
	function showError(xhr) {
		var showMessage = require("showMessage");

		try {
			var error = JSON.parse(xhr.responseText);

			if (error.data.indexOf('ZipException') > -1) {
				showMessage.clientError.show({
					'title': 'Unsupported zip compression type',
					'message': 'Zip file compression type is not supported, please use deflate or stored compression methods.'
				});
			}
			else {
				error.data = [error.data];
				if (error) {
					showMessage.clientError.show(error);
				}
			}
		}
		catch(e) {
			showMessage.clientError.show({});
		}
	}

	var BundlesManager = function (publisherId) {
		this.accountId = publisherId;

		this.refresh();
		
	};

	BundlesManager.prototype.refresh = function () {
		BundlesCollection.url = BundlesCollection.getUrl(this.accountId) + "/getBundles";
        BundlesCollection.fetch({
	        success: function (model) {
	            this.view = new BundlesManagerView({
					controller: this,
					model: model.toJSON()
				});
	        }.bind(this),
	        error: showError,
	        converters: {
	            "text json": function (response) {
	                return response && response.length ? JSON.parse(response) : response;
	            }
	        }
	    });
	}

	BundlesManager.prototype.upload = function () {
		var formData = new FormData();

		formData.append("bundle-file", this.view.$("#bundle-file").prop("files")[0]);

	    $.ajax({
	        url: BundlesCollection.getUrl(this.accountId) + '/upload',  //Server script to process data
	        type: 'POST',
	        success: this.onUploadDone.bind(this),
	        error: this.onUploadFailed.bind(this),
	        // Form data
	        data: formData,
	        //Options to tell jQuery not to process data or worry about content-type.
	        cache: false,
	        contentType: false,
	        processData: false
	    });
	};

	BundlesManager.prototype.delete = function (id) {
		var model = BundlesCollection.get(id);

		if (model) {
			model.url = BundlesCollection.getUrl(this.accountId) + "/" + id + "/delete";
			model.destroy({
				success: function () {
					BundlesCollection.remove(model);

					this.refresh();
				}.bind(this),
		        converters: {
		            "text json": function (response) {
		                return response && response.length ? JSON.parse(response) : response;
		            }
		        }
			})
		}

	}

	BundlesManager.prototype.onUploadDone = function (response) {
		this.refresh();
	};

	BundlesManager.prototype.onUploadFailed = function () {
		return showError.apply(null, arguments);
	};

	return BundlesManager;
});