define(['lodash', 'BaseController', 'repo', 'appletModel', 'files',
	    './EBooksInUseComponentView', './EBooksInUseTableRowView', './config', 'assets', 'editMode', 'busyIndicator'],
function(_, BaseController, repo, appletModel, files,
		 EBooksInUseComponentView, TableRowView, config, assets, editMode, busy) {

	var EBooksInUseComponent = BaseController.extend({

		subViews: {},

		initialize: function(configOverrides) {
            //Fixme: it's calling twice
			this.subViews = {}; //TEMP workaround because subview weren't cleared.
			this._super(config, configOverrides);
			this.view = new EBooksInUseComponentView({controller: this});
			this.registerEvents();
			this.refreshTable();
		},

		refreshTable: function() {
            var eBookIds = require("courseModel").getEBooksIds();
            var self = this;
            if (eBookIds && eBookIds.length) {
                var daoConfig = {
                    path: require("restDictionary").paths.GET_RECENT_EBOOKS,
                    pathParams: {
                        publisherId: require('userModel').getPublisherId(),
                        courseId: require('courseModel').getCourseId()
                    }
                };
                //daoConfig.pathParams.additionalEBooks = eBookIds.join(',');
                require("dao").remote(daoConfig, function(remoteEbooks){
                	var courseEBooks = _.filter(remoteEbooks, function(remoteEbook){
                		return _.find(eBookIds, function(repoEbookId){
                			return remoteEbook.eBookId == repoEbookId;
                		});
                	});
                    self.load(courseEBooks);
                }, function(error) {
                    console.warn("get Ebooks basic info error", error)
                });
            } else {
                this.load([]);
            }
		},

		checkForUpdates: function(catalog) {

		},

		registerEvents: function() {
			
		},

		dispose: function f35() {
			_.invoke(this.subViews, 'dispose');
			this._super();
			delete this.subViews;
		},

		load: function (eBooks) {
            var publisher = require('userModel').getAccount().accountId;
            var basePath = require("configModel").configuration.cmsBasePath;
            this.basePath = basePath + '/publishers/' + publisher + '/';
			if (!this.view) return;
			this.view.clearEbooks();
			_.invoke(this.subViews, 'dispose');
			this.subViews = {};
			_.chain(eBooks)
 			.sortBy(function(eBook) { return eBook.title; })
			.each(function (eBook) {
				this.subViews[eBook.eBookId] = new TableRowView({
					controller: this,
					obj: {
                        thumbnail: this.basePath + eBook.coverImage,
                        eBookId: eBook.eBookId,
                        title: eBook.title,
                        sha1: eBook.sha1,
                        lastModified: eBook.lastModified ? moment(eBook.lastModified ).format("MMM DD, YYYY, h:mm:ss a") : "",
                        updatedEBookId: eBook.updatedEBookId ? eBook.updatedEBookId : null
                    }
				});
			}, this);
		},

		updateEbook: function(eBookId) {

		},

		updateAll: function() {

		}

	}, {type: 'EBooksInUseComponent'});

	return EBooksInUseComponent;

});